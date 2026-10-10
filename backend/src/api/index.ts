import { Router } from 'express';
import { prisma, parseJson, stringifyJson } from '../db';
import { processJob } from '../orchestrator';
import { exportDeckToPptx } from '../export/pptx';
import { EventEmitter } from 'events';

export const apiRouter = Router();
export const jobEvents = new EventEmitter();

// --- DECKS ---
apiRouter.get('/decks', async (req, res) => {
  const decks = await prisma.deck.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(decks);
});

apiRouter.post('/decks', async (req, res) => {
  const { prompt } = req.body;
  const deck = await prisma.deck.create({
    data: { prompt, title: `Draft: ${prompt.substring(0, 20)}...` }
  });
  const job = await prisma.job.create({
    data: { deckId: deck.id, status: 'pending', currentStage: 'plan' }
  });
  
  processJob(job.id).catch(console.error);
  res.json(deck);
});

apiRouter.get('/decks/:id', async (req, res) => {
  const deck = await prisma.deck.findUnique({ where: { id: req.params.id } });
  if (!deck) return res.status(404).json({ error: 'Not found' });
  
  const result: any = { ...deck };
  if (deck.data) result.data = JSON.parse(deck.data);
  if (deck.design) result.design = JSON.parse(deck.design);
  res.json(result);
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
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
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

  const job = await prisma.job.findUnique({ where: { id } });
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
  const agents = await prisma.agentConfig.findMany();
  res.json(agents);
});

apiRouter.get('/agents/:name/prompt', async (req, res) => {
  const agent = await prisma.agentConfig.findUnique({
    where: { name: req.params.name },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
  });
  res.json({ prompt: agent?.versions?.[0]?.prompt || '' });
});

apiRouter.post('/agents/:name/prompt', async (req, res) => {
  const { prompt } = req.body;
  const agent = await prisma.agentConfig.findUnique({ where: { name: req.params.name } });
  if (agent) {
    await prisma.promptVersion.create({
      data: { agentId: agent.id, prompt }
    });
  }
  res.json({ success: true });
});

apiRouter.post('/agents/:name/reset', async (req, res) => {
  res.json({ success: true }); // Mocked
});

apiRouter.get('/models', async (req, res) => {
  res.json([{ id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' }, { id: 'openai/dall-e-3', name: 'DALL-E 3' }]);
});

apiRouter.post('/export/:id', async (req, res) => {
  try {
    const url = await exportDeckToPptx(req.params.id);
    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
