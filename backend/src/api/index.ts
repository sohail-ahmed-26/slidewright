import { Router } from 'express';
import { prisma, parseJson, stringifyJson } from '../db';
import { processJob } from '../orchestrator';
import { exportDeckToPptx } from '../export';
import { EventEmitter } from 'events';
import path from 'path';
import fs from 'fs';
import {
  DEFAULT_WRITER_PROMPT,
  DEFAULT_DESIGNER_PROMPT,
  DEFAULT_VISUAL_PROMPT,
  DEFAULT_CRITIC_PROMPT,
  getTopicTheme
} from '@slidewright/shared';

export const apiRouter = Router();
export const jobEvents = new EventEmitter();

export function normalizeAgentName(name: string): string {
  const n = (name || '').toLowerCase().trim();
  if (n === 'visual' || n === 'visuals') return 'visuals';
  return n;
}

export function getMasterDefaultPrompt(name: string): string {
  const n = normalizeAgentName(name);
  if (n === 'writer') return DEFAULT_WRITER_PROMPT;
  if (n === 'designer') return DEFAULT_DESIGNER_PROMPT;
  if (n === 'visuals') return DEFAULT_VISUAL_PROMPT;
  if (n === 'critic') return DEFAULT_CRITIC_PROMPT;
  return '';
}

function getOutputsDir() {
  const rootDir = process.cwd().endsWith('backend') ? path.join(process.cwd(), '..') : process.cwd();
  const dir = path.resolve(rootDir, 'outputs/decks');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// --- DECKS ---
apiRouter.get('/decks', async (req, res) => {
  const decks = await prisma.deck.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { slides: { orderBy: { n: 'asc' } } }
  });
  const results = decks.map(deck => {
    let slides: any[] = [];
    if (deck.slides && deck.slides.length > 0) {
      slides = deck.slides.map(s => {
        let parsedData: any = {};
        try { parsedData = JSON.parse(s.data); } catch(e) {}
        return {
          id: s.id,
          layout: parsedData.layout || 'title_body',
          data: parsedData.data || {},
          design: parsedData.design
        };
      });
    } else if (deck.data) {
      try {
        const parsed = JSON.parse(deck.data);
        if (Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          slides = parsed.slides.map((s: any, idx: number) => ({
            id: s.id || `s_${idx + 1}`,
            layout: s.layout || 'title_body',
            data: s.data || {},
            design: s.design
          }));
        }
      } catch (e) {}
    }

    let theme: any = undefined;
    if (deck.design) {
      try { theme = JSON.parse(deck.design); } catch(e) {}
    }

    return {
      id: deck.id,
      title: deck.title,
      status: deck.status,
      createdAt: deck.createdAt,
      theme,
      slides
    };
  });
  res.json(results);
});

apiRouter.post('/decks', async (req, res) => {
  const { prompt, audience, language, slideCount, tone, ...restOptions } = req.body;
  const initialTitle = prompt && prompt.length > 25 ? `Draft: ${prompt.substring(0, 25)}...` : (prompt || 'New Presentation');
  const initialTheme = getTopicTheme(prompt || '');
  const deck = await prisma.deck.create({
    data: { 
      prompt: prompt || 'Untitled', 
      title: initialTitle,
      design: JSON.stringify(initialTheme),
      status: 'pending'
    }
  });
  const job = await prisma.job.create({
    data: { 
      deckId: deck.id, 
      status: 'pending', 
      currentStage: 'plan' 
    }
  });
  
  processJob(job.id, {
    topic: prompt,
    audience: audience || 'General',
    language: language || 'en',
    tone: tone || 'professional',
    slides: slideCount || 8,
    ...restOptions
  }).catch(console.error);

  res.json({ deck, jobId: job.id });
});

apiRouter.get('/decks/:id', async (req, res) => {
  const deck = await prisma.deck.findUnique({ 
    where: { id: req.params.id },
    include: { slides: { orderBy: { n: 'asc' } } }
  });
  if (!deck) return res.status(404).json({ error: 'Not found' });
  
  const result: any = { 
    id: deck.id,
    title: deck.title,
    status: deck.status,
    createdAt: deck.createdAt,
    slides: []
  };
  
  if (deck.data) {
    try { result.data = JSON.parse(deck.data); } catch(e) {}
  }
  if (deck.design) {
    try { result.theme = JSON.parse(deck.design); } catch(e) {}
  }
  
  let slides: any[] = [];
  if (deck.slides && deck.slides.length > 0) {
    slides = deck.slides.map(s => {
      let parsedData: any = {};
      try { parsedData = typeof s.data === 'string' ? JSON.parse(s.data) : s.data; } catch(e) {}
      return {
        id: s.id,
        layout: parsedData.layout || 'title_body',
        data: parsedData.data || {},
        design: parsedData.design
      };
    });
  } 
  
  if (slides.length === 0 && result.data && Array.isArray(result.data.slides) && result.data.slides.length > 0) {
    slides = result.data.slides.map((s: any, idx: number) => ({
      id: s.id || `s_${idx + 1}`,
      layout: s.layout || 'title_body',
      data: s.data || {},
      design: s.design
    }));
  }

  result.slides = slides;
  console.log(`[API] GET /decks/${deck.id} returned ${result.slides.length} slides (dbSlides=${deck.slides?.length || 0})`);
  
  res.json(result);
});

apiRouter.get('/decks/:id/job', async (req, res) => {
  const job = await prisma.job.findFirst({
    where: { deckId: req.params.id },
    include: { runs: true }
  });
  res.json(job);
});


apiRouter.delete('/decks/:id', async (req, res) => {
  await prisma.deck.delete({ where: { id: req.params.id } });
  res.sendStatus(204);
});

apiRouter.post('/decks/:id/duplicate', async (req, res) => {
  const deck = await prisma.deck.findUnique({ where: { id: req.params.id } });
  if (!deck) return res.status(404).json({ error: 'Not found' });
  const newDeck = await prisma.deck.create({
    data: {
      prompt: deck.prompt,
      title: `${deck.title} (Copy)`,
      design: deck.design,
      data: deck.data,
      status: deck.status
    }
  });
  res.json(newDeck);
});

apiRouter.patch('/decks/:id/rename', async (req, res) => {
  const { title } = req.body;
  const deck = await prisma.deck.update({
    where: { id: req.params.id },
    data: { title }
  });
  res.json(deck);
});

// --- JOBS & SSE ---
apiRouter.get('/jobs/:id', async (req, res) => {
  const job = await prisma.job.findUnique({ 
    where: { id: req.params.id },
    include: { runs: true, deck: true }
  });
  res.json(job);
});

apiRouter.get('/jobs/:id/events', async (req, res) => {
  const { id } = req.params;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const onUpdate = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  jobEvents.on(`job-${id}`, onUpdate);

  const job = await prisma.job.findUnique({ 
    where: { id },
    include: { runs: true, deck: true }
  });
  if (job) onUpdate(job);

  req.on('close', () => jobEvents.off(`job-${id}`, onUpdate));
});

// --- SETTINGS & AGENTS ---
apiRouter.get('/settings', async (req, res) => {
  const settings = await prisma.setting.findMany();
  const result: any = {
    openRouterKeyStatus: process.env.OPENROUTER_API_KEY ? 'valid' : 'missing'
  };
  for (const s of settings) {
    result[s.key] = parseJson(s.value);
  }
  res.json(result);
});

apiRouter.post('/settings', async (req, res) => {
  for (const [key, value] of Object.entries(req.body)) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: stringifyJson(value) || '' },
      create: { key, value: stringifyJson(value) || '' }
    });
  }
  res.json({ success: true });
});

apiRouter.get('/agents', async (req, res) => {
  try {
    const agents = await prisma.agentConfig.findMany({
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    const mapped = agents.map(a => {
      const defaultPrompt = getMasterDefaultPrompt(a.name);
      const activePrompt = (a.customPrompt && a.customPrompt.trim())
        ? a.customPrompt
        : (a.versions?.[0]?.prompt || defaultPrompt);
      return {
        ...a,
        defaultPrompt,
        systemPrompt: activePrompt,
        isCustom: Boolean(a.customPrompt && a.customPrompt.trim() && a.customPrompt !== defaultPrompt)
      };
    });
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/agents/:name/prompt', async (req, res) => {
  try {
    const name = normalizeAgentName(req.params.name);
    const agent = await prisma.agentConfig.findUnique({
      where: { name },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    const defaultPrompt = getMasterDefaultPrompt(name);
    if (!agent) {
      return res.json({ prompt: defaultPrompt, defaultPrompt, isCustom: false });
    }
    const prompt = (agent.customPrompt && agent.customPrompt.trim())
      ? agent.customPrompt
      : (agent.versions?.[0]?.prompt || defaultPrompt);
    res.json({
      prompt,
      defaultPrompt,
      agentId: agent.id,
      isCustom: Boolean(agent.customPrompt && agent.customPrompt.trim() && agent.customPrompt !== defaultPrompt)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/agents/:name/prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt must be a string' });
    }
    const name = normalizeAgentName(req.params.name);
    let agent = await prisma.agentConfig.findUnique({ where: { name } });
    if (!agent) {
      agent = await prisma.agentConfig.create({
        data: {
          name,
          model: 'openai/gpt-4o-mini',
          enabled: true,
          customPrompt: prompt
        }
      });
    } else {
      agent = await prisma.agentConfig.update({
        where: { name },
        data: { customPrompt: prompt }
      });
    }
    const version = await prisma.promptVersion.create({
      data: { agentId: agent.id, prompt }
    });
    console.log(`[API] Saved custom system prompt for ${name} (versionId=${version.id}, length=${prompt.length})`);
    res.json({ success: true, prompt, versionId: version.id });
  } catch (err: any) {
    console.error(`[API] Failed to save prompt for ${req.params.name}:`, err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/agents/:name', async (req, res) => {
  try {
    const { enabled, model, systemPrompt, temperature, maxTokens } = req.body;
    const name = normalizeAgentName(req.params.name);
    let agent = await prisma.agentConfig.findUnique({ where: { name } });
    if (!agent) {
      agent = await prisma.agentConfig.create({
        data: {
          name,
          model: model || 'openai/gpt-4o-mini',
          enabled: enabled !== undefined ? enabled : true,
          customPrompt: systemPrompt || null,
          params: JSON.stringify({ temperature, maxTokens, model })
        }
      });
    } else {
      agent = await prisma.agentConfig.update({
        where: { name },
        data: {
          enabled: enabled !== undefined ? enabled : agent.enabled,
          model: model || agent.model,
          customPrompt: systemPrompt !== undefined ? systemPrompt : agent.customPrompt,
          params: JSON.stringify({ temperature, maxTokens, model })
        }
      });
    }
    if (systemPrompt && systemPrompt !== agent.customPrompt) {
      await prisma.promptVersion.create({
        data: { agentId: agent.id, prompt: systemPrompt }
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/agents/:name/reset', async (req, res) => {
  try {
    const name = normalizeAgentName(req.params.name);
    const defaultPrompt = getMasterDefaultPrompt(name);
    let agent = await prisma.agentConfig.findUnique({ where: { name } });
    if (!agent) {
      agent = await prisma.agentConfig.create({
        data: {
          name,
          model: 'openai/gpt-4o-mini',
          enabled: true,
          customPrompt: null
        }
      });
    } else {
      agent = await prisma.agentConfig.update({
        where: { name },
        data: { customPrompt: null }
      });
    }
    const version = await prisma.promptVersion.create({
      data: { agentId: agent.id, prompt: defaultPrompt }
    });
    console.log(`[API] Reset system prompt for ${name} to master default (versionId=${version.id})`);
    res.json({ success: true, prompt: defaultPrompt, versionId: version.id });
  } catch (err: any) {
    console.error(`[API] Failed to reset prompt for ${req.params.name}:`, err);
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/models', async (req, res) => {
  res.json([{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' }, { id: 'openai/dall-e-3', name: 'DALL-E 3' }]);
});

apiRouter.post('/tests/run', async (req, res) => {
  try {
    const { runEndToEndVerification } = await import('../runAllTests');
    const results = await runEndToEndVerification();
    res.json({ results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/export/:id', async (req, res) => {
  try {
    let parsedDeck: any = req.body?.deck;

    if (!parsedDeck) {
      const deckRecord = await prisma.deck.findUnique({ 
        where: { id: req.params.id },
        include: { slides: { orderBy: { n: 'asc' } } }
      });
      
      if (deckRecord) {
        if (deckRecord.data) {
          try { parsedDeck = JSON.parse(deckRecord.data); } catch(e) {}
        }
        if (!parsedDeck) {
          parsedDeck = { id: deckRecord.id, title: deckRecord.title, slides: [] };
        }
        if ((!parsedDeck.slides || parsedDeck.slides.length === 0) && deckRecord.slides && deckRecord.slides.length > 0) {
          parsedDeck.slides = deckRecord.slides.map(s => {
            let parsedData: any = {};
            try { parsedData = JSON.parse(s.data); } catch(e) {}
            return {
              id: s.id,
              layout: parsedData.layout || 'title_body',
              data: parsedData.data || {}
            };
          });
        }
        if (deckRecord.design) {
          try { parsedDeck.theme = JSON.parse(deckRecord.design).theme || JSON.parse(deckRecord.design); } catch(e) {}
        }
      }
    }

    if (!parsedDeck) {
      return res.status(404).json({ error: 'Deck or slide data not found' });
    }

    const outDir = getOutputsDir();
    const outputPath = path.join(outDir, `${req.params.id}.pptx`);
    
    await exportDeckToPptx(parsedDeck, outputPath);
    
    res.json({ url: `/api/export/${req.params.id}/download` });
  } catch (error: any) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/export/:id/download', async (req, res) => {
  try {
    const outDir = getOutputsDir();
    const outputPath = path.join(outDir, `${req.params.id}.pptx`);
    if (!fs.existsSync(outputPath)) {
      const deckRecord = await prisma.deck.findUnique({ 
        where: { id: req.params.id },
        include: { slides: { orderBy: { n: 'asc' } } }
      });
      if (!deckRecord) return res.status(404).send('Deck not found');
      
      let parsedDeck: any = null;
      if (deckRecord.data) {
        try { parsedDeck = JSON.parse(deckRecord.data); } catch(e) {}
      }
      if (!parsedDeck) {
        parsedDeck = { id: deckRecord.id, title: deckRecord.title, slides: [] };
      }
      if ((!parsedDeck.slides || parsedDeck.slides.length === 0) && deckRecord.slides && deckRecord.slides.length > 0) {
        parsedDeck.slides = deckRecord.slides.map(s => {
          let parsedData: any = {};
          try { parsedData = JSON.parse(s.data); } catch(e) {}
          return {
            id: s.id,
            layout: parsedData.layout || 'title_body',
            data: parsedData.data || {}
          };
        });
      }
      if (deckRecord.design) {
        try { parsedDeck.theme = JSON.parse(deckRecord.design).theme || JSON.parse(deckRecord.design); } catch(e) {}
      }
      await exportDeckToPptx(parsedDeck, outputPath);
    }
    res.download(outputPath);
  } catch (err: any) {
    console.error('Download PPTX error:', err);
    res.status(500).send('Failed to generate PPTX download: ' + err.message);
  }
});
