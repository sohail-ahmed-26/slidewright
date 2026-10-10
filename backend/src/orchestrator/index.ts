import { prisma } from '../db';
import { runWriter } from '../../../agents/writer/index';
import { runDesigner } from '../../../agents/designer/index';
import { runVisuals } from '../../../agents/visuals/index';
import { runCritic } from '../../../agents/critic/index';
import { callLLM } from '../../../agents/llm/openrouter';
import { getWriterSystemPrompt } from '../../../agents/writer/prompt';
import { WriterOutputSchema } from '@slidewright/shared';
import fs from 'fs';
import path from 'path';

async function reviseDeck(deck: any, feedback: any): Promise<any> {
  const issues = feedback.issues.filter((i: any) => i.type === 'content' || i.type === 'layout');
  if (issues.length === 0) return deck;

  const rewritePrompt = `The Critic Agent reviewed your deck and found the following issues:
${issues.map((i: any) => `- [${i.severity.toUpperCase()}] Slide ${i.slideId || 'Global'}: ${i.message} (Suggested Fix: ${i.suggestedFix || 'None'})`).join('\n')}

Please fix ONLY these issues and return the complete valid JSON deck again. DO NOT change unaffected slides.

Original Deck:
${JSON.stringify(deck, null, 2)}`;

  const systemPrompt = getWriterSystemPrompt();
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

export async function processJob(jobId: string) {
  console.log('processJob started for', jobId);
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { deck: true }
  });
  console.log('Found job:', job);
  if (!job) return;

  const deck = job.deck;
  const outDir = path.resolve(process.cwd(), '../outputs/decks');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const deckPath = path.join(outDir, `${deck.id}.json`);

  let currentDeckData: any = deck.data ? JSON.parse(deck.data) : { slides: [] };
  currentDeckData.title = deck.title;
  currentDeckData.prompt = deck.prompt;

  try {
    // 1. PLAN STAGE
    if (job.currentStage === 'plan' || !job.currentStage) {
      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'plan', status: 'running' } });

      const [writerResult, designerResult] = await Promise.all([
        runWriter({
          topic: deck.prompt,
          audience: 'General',
          language: 'en',
          tone: 'professional',
          slides: 8,
          mockMode: false
        }),
        runDesigner({
          topic: deck.prompt,
          audience: 'General',
          tone: 'professional',
          mockMode: false
        })
      ]);

      currentDeckData = { ...writerResult, title: deck.title || deck.prompt, design: designerResult };
      fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
      
      await prisma.deck.update({
        where: { id: deck.id },
        data: { design: JSON.stringify(designerResult), data: JSON.stringify(currentDeckData) }
      });
      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'visuals' } });
      job.currentStage = 'visuals';
    }

    // 2. VISUALS STAGE
    if (job.currentStage === 'visuals') {
      const visualsDeck = await runVisuals({ deckId: deck.id, mockMode: false });
      currentDeckData = visualsDeck;
      fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
      await prisma.deck.update({ where: { id: deck.id }, data: { data: JSON.stringify(currentDeckData) } });
      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'critic' } });
      job.currentStage = 'critic';
    }

    // 3. CRITIC STAGE
    if (job.currentStage === 'critic') {
      let loops = 0;
      const maxLoops = 2; // Read from options eventually
      let approved = false;

      while (loops < maxLoops && !approved) {
        loops++;
        const criticResult = await runCritic({ deckId: deck.id, mockMode: false });
        
        if (criticResult.approved) {
          approved = true;
          break;
        }

        if (loops < maxLoops) {
          currentDeckData = await reviseDeck(currentDeckData, criticResult);
          fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
          currentDeckData = await runVisuals({ deckId: deck.id, mockMode: false });
          fs.writeFileSync(deckPath, JSON.stringify(currentDeckData, null, 2));
        }
      }
      
      await prisma.deck.update({ where: { id: deck.id }, data: { data: JSON.stringify(currentDeckData), status: 'ready' } });
      await prisma.job.update({ where: { id: job.id }, data: { currentStage: 'ready', status: 'done' } });
    }

  } catch (error: any) {
    console.error(`Job ${jobId} failed:`, error);
    await prisma.job.update({ where: { id: job.id }, data: { status: 'failed' } });
    await prisma.deck.update({ where: { id: deck.id }, data: { status: 'failed' } });
  }
}
