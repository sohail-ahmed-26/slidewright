import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { apiRouter } from '../src/api';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

vi.mock('../src/db', () => ({
  prisma: {
    deck: {
      findMany: vi.fn().mockResolvedValue([{ id: 'd1', title: 'Deck 1' }]),
      create: vi.fn().mockResolvedValue({ id: 'd2', title: 'Deck 2' }),
      findUnique: vi.fn().mockResolvedValue({ id: 'd1', title: 'Deck 1' })
    },
    job: {
      create: vi.fn().mockResolvedValue({ id: 'j1' }),
      findUnique: vi.fn().mockResolvedValue({ id: 'j1', status: 'pending', currentStage: 'plan', deck: { id: 'deck1' } })
    }
  }
}));

describe('API Integration', () => {
  it('GET /api/decks returns decks', async () => {
    const res = await request(app).get('/api/decks');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'd1', title: 'Deck 1' }]);
  });

  it('POST /api/decks creates deck and starts job', async () => {
    const res = await request(app).post('/api/decks').send({ prompt: 'test prompt' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'd2', title: 'Deck 2' });
  });

  it('GET /api/decks/:id returns deck', async () => {
    const res = await request(app).get('/api/decks/d1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'd1', title: 'Deck 1' });
  });
});
