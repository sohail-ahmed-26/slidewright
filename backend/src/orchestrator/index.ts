import { prisma } from '../db';
import { runWriter } from '../../../agents/writer/index';
import { runDesigner } from '../../../agents/designer/index';
import { runVisuals } from '../../../agents/visuals/index';
import { runCritic } from '../../../agents/critic/index';
import { callLLM } from '../../../agents/llm/openrouter';
import { getWriterSystemPrompt } from '../../../agents/writer/prompt';
import {
  WriterOutputSchema,
  DEFAULT_WRITER_PROMPT,
  DEFAULT_DESIGNER_PROMPT,
  DEFAULT_VISUAL_PROMPT,
  DEFAULT_CRITIC_PROMPT,
  getTopicVisual,
  getTopicTheme
} from '@slidewright/shared';
import { jobEvents } from '../api/index';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to emit and update job
async function emitJobUpdate(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { runs: true }
  });
  if (job) {
    jobEvents.emit(`job-${jobId}`, job);
  }
  return job;
}

// Helper to manage AgentRun lifecycle
async function withAgentRun<T>(jobId: string, agentName: string, input: any, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  let run = await prisma.agentRun.create({
    data: {
      jobId,
      agent: agentName,
      status: 'running',
      input: JSON.stringify(input)
    }
  });
  await emitJobUpdate(jobId);

  try {
    const result = await fn();
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'done',
        output: typeof result === 'object' ? JSON.stringify(result) : String(result),
        ms: Date.now() - start
      }
    });
    await emitJobUpdate(jobId);
    return result;
  } catch (err: any) {
    await prisma.agentRun.update({
      where: { id: run.id },
      data: {
        status: 'failed',
        error: err.message,
        ms: Date.now() - start
      }
    });
    await emitJobUpdate(jobId);
    throw err;
  }
}

async function reviseDeck(deck: any, feedback: any, customWriterPrompt?: string): Promise<any> {
  const issues = feedback.issues.filter((i: any) => i.type === 'content' || i.type === 'layout');
  if (issues.length === 0) return deck;

  const rewritePrompt = `The Critic Agent reviewed your deck and found the following issues:
${issues.map((i: any) => `- [${i.severity.toUpperCase()}] Slide ${i.slideId || 'Global'}: ${i.message} (Suggested Fix: ${i.suggestedFix || 'None'})`).join('\n')}

Please fix ONLY these issues and return the complete valid JSON deck again. DO NOT change unaffected slides. Maintain the exact language and tone of the original deck.

Original Deck:
${JSON.stringify(deck, null, 2)}`;

  const systemPrompt = getWriterSystemPrompt(customWriterPrompt);
  const jsonStr = await callLLM({
    model: process.env.MODEL_TEXT || 'openai/gpt-4o-mini',
    systemPrompt,
    userPrompt: rewritePrompt,
    mockMode: false
  });

  try {
    const raw = JSON.parse(jsonStr);
    const revised = WriterOutputSchema.parse(raw);
    return { ...deck, slides: revised.slides };
  } catch (e: any) {
    return deck;
  }
}

async function persistDeckSlides(deckId: string, deckData: any) {
  if (!deckData.slides || !Array.isArray(deckData.slides)) return;
  try {
    await prisma.slide.deleteMany({ where: { deckId } });
    await prisma.slide.createMany({
      data: deckData.slides.map((s: any, idx: number) => ({
        deckId,
        n: idx + 1,
        data: JSON.stringify(s)
      }))
    });
  } catch (err) {
    console.error('Failed to persist slides to prisma.slide:', err);
  }
}

export async function processJob(jobId: string, jobOptions?: any) {
  console.log('processJob started for', jobId, 'with options:', jobOptions);
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { deck: true }
  });
  if (!job) return;

  const deck = job.deck;
  const rootDir = process.cwd().endsWith('backend') ? path.join(process.cwd(), '..') : process.cwd();
  const outDir = path.resolve(rootDir, 'outputs/decks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const deckPath = path.join(outDir, `${deck.id}.json`);
  const pptxPath = path.join(outDir, `${deck.id}.pptx`);

  let currentDeckData: any = deck.data ? JSON.parse(deck.data) : { slides: [] };
  currentDeckData.title = deck.title;
  currentDeckData.prompt = deck.prompt;

  // Snapshot all 4 agent system prompts from DB at job start to freeze them for this generation job
  const configs = await prisma.agentConfig.findMany({
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });
  const configMap = new Map<string, string>();
  for (const c of configs) {
    const prompt = (c.customPrompt && c.customPrompt.trim())
      ? c.customPrompt
      : (c.versions?.[0]?.prompt || '');
    if (prompt) configMap.set(c.name, prompt);
  }

  const writerPrompt = configMap.get('writer') || DEFAULT_WRITER_PROMPT;
  const designerPrompt = configMap.get('designer') || DEFAULT_DESIGNER_PROMPT;
  const visualsPrompt = configMap.get('visuals') || configMap.get('visual') || DEFAULT_VISUAL_PROMPT;
  const criticPrompt = configMap.get('critic') || DEFAULT_CRITIC_PROMPT;

  const hash = (str: string) => crypto.createHash('sha256').update(str).digest('hex').substring(0, 8);
  const promptHashes = {
    writer: hash(writerPrompt),
    designer: hash(designerPrompt),
    visuals: hash(visualsPrompt),
    critic: hash(criticPrompt),
  };

  console.log(`[Orchestrator] Starting job ${jobId} with frozen prompt snapshots:`, {
    writer: `len=${writerPrompt.length}, hash=${promptHashes.writer}`,
    designer: `len=${designerPrompt.length}, hash=${promptHashes.designer}`,
    visuals: `len=${visualsPrompt.length}, hash=${promptHashes.visuals}`,
    critic: `len=${criticPrompt.length}, hash=${promptHashes.critic}`,
  });

  const topic = jobOptions?.topic || deck.prompt;
  const audience = jobOptions?.audience || 'General';
  const language = jobOptions?.language || 'en';
  const tone = jobOptions?.tone || 'professional';
  const slideCount = Number(jobOptions?.slides || jobOptions?.slideCount) || 8;

  try {
    // 1. PLAN STAGE (Writer & Designer)
    if (job.currentStage === 'plan' || !job.currentStage) {
      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'plan', status: 'running' } });
      await emitJobUpdate(job.id);

      const [writerResult, designerResult] = await Promise.all([
        withAgentRun(job.id, 'writer', { prompt: topic, slides: slideCount, tone, promptHash: promptHashes.writer }, () => runWriter({
          topic,
          audience,
          language,
          tone,
          slides: slideCount,
          customPrompt: writerPrompt,
          mockMode: false
        })),
        withAgentRun(job.id, 'designer', { prompt: topic, tone, promptHash: promptHashes.designer }, () => runDesigner({
          topic,
          audience,
          tone,
          customPrompt: designerPrompt,
          mockMode: false
        }))
      ]);

      // Derive topic-specific theme
      const topicTheme = getTopicTheme(topic);
      const mergedDesign = {
        ...designerResult,
        ...topicTheme,
        primary: topicTheme.primary,
        secondary: topicTheme.secondary,
        accent: topicTheme.accent,
        cardBg: topicTheme.cardBg,
        cardBorder: topicTheme.cardBorder,
        darkBg: topicTheme.darkBg,
        fontFamily: topicTheme.fontFamily || designerResult.fontBody || 'Calibri',
        fontHeading: topicTheme.fontHeading || designerResult.fontHeading || 'Calibri',
        moodName: topicTheme.moodName || designerResult.moodName
      };

      currentDeckData = { 
        ...writerResult, 
        title: deck.title || topic, 
        theme: mergedDesign,
        design: mergedDesign 
      };
      
      // Assign dynamic, topic-specific visuals to cover slide and visual layouts (Gamma style)
      const coverVisual = getTopicVisual(topic, currentDeckData.slides?.[0]?.title || '');
      currentDeckData.image = coverVisual.imageUrl;
      if (Array.isArray(currentDeckData.slides) && currentDeckData.slides.length > 0) {
        if (!currentDeckData.slides[0].image) {
          currentDeckData.slides[0].image = coverVisual.imageUrl;
        }
        currentDeckData.slides.forEach((s: any, idx: number) => {
          if ((s.layout === 'image_split' || s.layout === 'image_overlay') && !s.image) {
            const slideVisual = getTopicVisual(topic, s.title || s.heading || '', idx);
            s.image = slideVisual.imageUrl;
          }
        });
      }

      fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
      
      await prisma.deck.update({
        where: { id: deck.id },
        data: { 
          design: JSON.stringify(mergedDesign), 
          data: JSON.stringify(currentDeckData),
          status: 'running'
        }
      });
      await persistDeckSlides(deck.id, currentDeckData);

      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'visuals' } });
      job.currentStage = 'visuals';
      await emitJobUpdate(job.id);
    }

    // 2. VISUALS STAGE
    if (job.currentStage === 'visuals') {
      try {
        const visualsDeck = await withAgentRun(job.id, 'visuals', { deckId: deck.id, promptHash: promptHashes.visuals }, () => runVisuals({
          deckId: deck.id,
          customPrompt: visualsPrompt,
          mockMode: false
        }));
        if (visualsDeck && visualsDeck.slides) {
          currentDeckData = visualsDeck;
        }
      } catch (visErr: any) {
        console.warn('[Visuals] Warning in visuals run:', visErr.message);
      }

      fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
      await prisma.deck.update({ where: { id: deck.id }, data: { data: JSON.stringify(currentDeckData) } });
      await persistDeckSlides(deck.id, currentDeckData);

      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'critic' } });
      job.currentStage = 'critic';
      await emitJobUpdate(job.id);
    }

    // 3. CRITIC STAGE
    if (job.currentStage === 'critic') {
      let loops = 0;
      const maxLoops = 1;
      let approved = false;

      while (loops < maxLoops && !approved) {
        loops++;
        try {
          const criticResult = await withAgentRun(job.id, 'critic', { deckId: deck.id, loop: loops, promptHash: promptHashes.critic }, () => runCritic({
            deckId: deck.id,
            customPrompt: criticPrompt,
            mockMode: false
          }));
          if (criticResult?.approved) {
            approved = true;
            break;
          }
          if (loops < maxLoops && criticResult?.issues?.length > 0) {
            currentDeckData = await withAgentRun(job.id, 'writer', { deckId: deck.id, reason: 'revise', promptHash: promptHashes.writer }, () => reviseDeck(currentDeckData, criticResult, writerPrompt));
            fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
            await persistDeckSlides(deck.id, currentDeckData);
          }
        } catch (critErr: any) {
          console.warn('[Critic] Non-blocking warning in critic run:', critErr.message);
          approved = true;
        }
      }

      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'export' } });
      job.currentStage = 'export';
      await emitJobUpdate(job.id);
    }

    // 4. EXPORT STAGE (Pre-generate PPTX natively)
    if (job.currentStage === 'export') {
      const { exportDeckToPptx } = await import('../export/index');
      await withAgentRun(job.id, 'export', { deckId: deck.id }, async () => {
        return await exportDeckToPptx(currentDeckData, pptxPath);
      });

      await prisma.deck.update({ 
        where: { id: deck.id }, 
        data: { 
          data: JSON.stringify(currentDeckData), 
          status: 'ready' 
        } 
      });
      await persistDeckSlides(deck.id, currentDeckData);

      await prisma.job.update({ 
        where: { id: job.id }, 
        data: { currentStage: 'ready', status: 'done' } 
      });
      await emitJobUpdate(job.id);
      console.log(`[Orchestrator] Job ${jobId} successfully finished all 6 agent stages!`);
    }

  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error);
    await prisma.job.update({ where: { id: job.id }, data: { status: 'failed' } });
    await prisma.deck.update({ where: { id: deck.id }, data: { status: 'failed' } });
    await emitJobUpdate(job.id);
  }
}
