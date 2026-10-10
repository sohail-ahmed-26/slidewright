import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processJob } from '../src/orchestrator';
import { prisma } from '../src/db';

vi.mock('../src/db', () => ({
  prisma: {
    job: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    deck: {
      update: vi.fn(),
    }
  }
}));

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}));

// Mock agents to return instantly without LLM
vi.mock('../../agents/writer/index', () => ({
  runWriter: vi.fn().mockResolvedValue({ slides: [] })
}));
vi.mock('../../agents/designer/index', () => ({
  runDesigner: vi.fn().mockResolvedValue({ hue: 200 })
}));
vi.mock('../../agents/visuals/index', () => ({
  runVisuals: vi.fn().mockImplementation((d) => d)
}));
vi.mock('../../agents/critic/index', () => ({
  runCritic: vi.fn().mockResolvedValue({ score: 10, feedback: 'Perfect', issues: [], approved: true })
}));

describe('Orchestrator State Machine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation((...args) => {
      console.log('TEST ERROR:', ...args);
    });
  });

  it('runs successfully end to end', async () => {
    (prisma.job.findUnique as any).mockResolvedValue({
      id: 'job1',
      currentStage: 'plan',
      deck: { id: 'deck1', prompt: 'test' }
    });

    await processJob('job1');

    expect(prisma.job.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'job1' },
      data: expect.objectContaining({ status: 'done', currentStage: 'ready' })
    }));
  });

  it('handles failure properly', async () => {
    (prisma.job.findUnique as any).mockResolvedValue({
      id: 'job2',
      currentStage: 'plan',
      deck: { id: 'deck2', prompt: 'test' }
    });

    const { runWriter } = await import('../../agents/writer/index');
    (runWriter as any).mockRejectedValueOnce(new Error('LLM Failure'));

    await processJob('job2');

    expect(prisma.job.update).toHaveBeenCalledWith({
      where: { id: 'job2' },
      data: { status: 'failed' }
    });
  });

  it('resumes from visuals stage', async () => {
    (prisma.job.findUnique as any).mockResolvedValue({
      id: 'job3',
      currentStage: 'visuals',
      deck: { id: 'deck3', prompt: 'test', data: '{"slides":[]}' }
    });

    await processJob('job3');

    const { runWriter } = await import('../../agents/writer/index');
    expect(runWriter).not.toHaveBeenCalled();

    const { runVisuals } = await import('../../agents/visuals/index');
    expect(runVisuals).toHaveBeenCalled();
  });
});
