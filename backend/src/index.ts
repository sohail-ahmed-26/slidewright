import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve outputs statically
const outputsDir = path.resolve(import.meta.dirname, '../../outputs');
app.use('/outputs', express.static(outputsDir));

import { prisma } from './db';

import { apiRouter } from './api';
app.use('/api', apiRouter);

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', db: 'OK' });
  } catch (err) {
    res.json({ status: 'OK', db: 'ERROR' });
  }
});

import { initAgentPrompts } from './initPrompts';

app.listen(port, async () => {
  console.log(`Backend listening on http://localhost:${port}`);
  try {
    await initAgentPrompts();
    const agents = await prisma.agentConfig.findMany({
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    console.log('=== DB AGENTS CONFIG ===', JSON.stringify(agents.map(a => ({
      name: a.name,
      hasCustomPrompt: Boolean(a.customPrompt),
      promptSnippet: (a.customPrompt || a.versions[0]?.prompt || '').substring(0, 60) + '...'
    })), null, 2));
  } catch (err) {
    console.error('Failed to initialize agent prompts:', err);
  }
});


