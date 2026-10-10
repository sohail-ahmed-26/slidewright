import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.BACKEND_PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve outputs statically
const outputsDir = path.resolve(__dirname, '../../outputs');
app.use('/outputs', express.static(outputsDir));

import { prisma } from './db';

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', db: 'OK' });
  } catch (err) {
    res.json({ status: 'OK', db: 'ERROR' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
