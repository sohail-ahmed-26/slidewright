import { create } from 'zustand';
import { useDeckStore } from './useDeckStore';
import { FIXTURES } from '@slidewright/shared/src/fixtures';

export type NodeStatus = 'pending' | 'running' | 'done' | 'failed' | 'skipped';

export interface LogEntry {
  id: string;
  timestamp: number;
  agent: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  data?: any;
}

export interface JobStep {
  id: string;
  name: string;
  status: NodeStatus;
  startTime?: number;
  endTime?: number;
  elapsedMs: number;
  tokensIn: number;
  tokensOut: number;
  model: string;
  promptSummary?: string;
  outputJson?: any;
}

export interface Job {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  deckId?: string;
  startTime: number;
  endTime?: number;
  progress: number;
  simulateFailure: boolean; // if true, fail randomly
  steps: Record<string, JobStep>;
  logs: LogEntry[];
  settings: any;
}

interface JobState {
  jobs: Record<string, Job>;
  createJob: (settings: any, simulateFailure: boolean) => string;
  cancelJob: (id: string) => void;
  retryJob: (id: string) => void;
  _processJob: (id: string) => void;
  _updateStep: (id: string, stepId: string, updates: Partial<JobStep>) => void;
  _addLog: (id: string, log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const initialSteps = (): Record<string, JobStep> => {
  const defaults = { status: 'pending' as NodeStatus, elapsedMs: 0, tokensIn: 0, tokensOut: 0, model: 'none' };
  return {
    orchestrator: { ...defaults, id: 'orchestrator', name: 'Orchestrator', model: 'internal' },
    writer: { ...defaults, id: 'writer', name: 'Writer', model: 'gpt-4o' },
    designer: { ...defaults, id: 'designer', name: 'Designer', model: 'claude-3.5-sonnet' },
    visuals: { ...defaults, id: 'visuals', name: 'Visuals', model: 'dall-e-3' },
    critic: { ...defaults, id: 'critic', name: 'Critic', model: 'gpt-4o' },
    export: { ...defaults, id: 'export', name: 'Export', model: 'python-pptx' },
  };
};

export const useJobStore = create<JobState>((set, get) => ({
  jobs: {
    'run-1': {
      id: 'run-1',
      status: 'running',
      startTime: Date.now(),
      progress: 50,
      simulateFailure: false,
      settings: { prompt: 'A pitch deck for a new SaaS product...' },
      steps: initialSteps(),
      logs: [
        { id: '1', timestamp: Date.now(), agent: 'System', level: 'info', message: 'Job started' },
        { id: '2', timestamp: Date.now(), agent: 'Orchestrator', level: 'info', message: 'Parsing requirements...' }
      ]
    }
  },

  _addLog: (id, log) => {
    set(state => {
      const job = state.jobs[id];
      if (!job) return state;
      return {
        jobs: {
          ...state.jobs,
          [id]: {
            ...job,
            logs: [...job.logs, { ...log, id: Math.random().toString(), timestamp: Date.now() }]
          }
        }
      };
    });
  },

  _updateStep: (id, stepId, updates) => {
    set(state => {
      const job = state.jobs[id];
      if (!job) return state;
      const step = job.steps[stepId];
      return {
        jobs: {
          ...state.jobs,
          [id]: {
            ...job,
            steps: { ...job.steps, [stepId]: { ...step, ...updates } }
          }
        }
      };
    });
  },

  createJob: (settings, simulateFailure) => {
    const id = `job_${Date.now()}`;
    set(state => ({
      jobs: {
        ...state.jobs,
        [id]: {
          id,
          status: 'running',
          startTime: Date.now(),
          progress: 0,
          simulateFailure,
          settings,
          steps: initialSteps(),
          logs: []
        }
      }
    }));
    get()._processJob(id);
    return id;
  },

  cancelJob: (id) => {
    set(state => {
      const job = state.jobs[id];
      if (!job || job.status !== 'running') return state;
      return {
        jobs: { ...state.jobs, [id]: { ...job, status: 'cancelled', endTime: Date.now() } }
      };
    });
    get()._addLog(id, { agent: 'System', level: 'warn', message: 'Job cancelled by user' });
  },

  retryJob: (id) => {
    set(state => {
      const job = state.jobs[id];
      if (!job || job.status === 'running') return state;
      
      // Reset failed/pending steps
      const newSteps = { ...job.steps };
      Object.values(newSteps).forEach(s => {
        if (s.status === 'failed' || s.status === 'pending') {
          newSteps[s.id] = { ...s, status: 'pending', elapsedMs: 0, tokensIn: 0, tokensOut: 0 };
        }
      });

      return {
        jobs: {
          ...state.jobs,
          [id]: { ...job, status: 'running', steps: newSteps, simulateFailure: false } // don't fail on retry
        }
      };
    });
    get()._addLog(id, { agent: 'System', level: 'info', message: 'Retrying failed steps...' });
    get()._processJob(id);
  },

  _processJob: async (id) => {
    const runStep = async (stepId: string, duration: number, logs: string[], shouldFail = false) => {
      const job = get().jobs[id];
      if (!job || job.status !== 'running' || job.steps[stepId].status === 'done') return true;

      get()._updateStep(id, stepId, { status: 'running', startTime: Date.now() });
      
      for (let i = 0; i < logs.length; i++) {
        if (get().jobs[id].status !== 'running') return false; // cancelled
        get()._addLog(id, { agent: job.steps[stepId].name, level: 'info', message: logs[i] });
        await sleep(duration / Object.keys(logs).length);
      }

      if (shouldFail && job.simulateFailure) {
        get()._updateStep(id, stepId, { status: 'failed', endTime: Date.now() });
        get()._addLog(id, { agent: job.steps[stepId].name, level: 'error', message: `Step ${stepId} encountered a fatal error.` });
        set(state => ({ jobs: { ...state.jobs, [id]: { ...state.jobs[id], status: 'failed', endTime: Date.now() } } }));
        return false;
      }

      get()._updateStep(id, stepId, { 
        status: 'done', 
        endTime: Date.now(), 
        elapsedMs: duration,
        tokensIn: Math.floor(Math.random() * 500) + 100,
        tokensOut: Math.floor(Math.random() * 800) + 200,
      });
      return true;
    };

    const updateProgress = (p: number) => set(s => ({ jobs: { ...s.jobs, [id]: { ...s.jobs[id], progress: p } } }));

    // Orchestrator
    if (!await runStep('orchestrator', 800, ['Initializing pipeline...', 'Parsing requirements...'])) return;
    updateProgress(10);

    // Create draft deck object
    const deckId = `deck_${Date.now()}`;
    const newDeck = {
      ...FIXTURES.decks[0],
      id: deckId,
      title: get().jobs[id].settings.prompt.slice(0, 30) + '...',
      status: 'running' as any,
      slides: []
    };
    useDeckStore.getState().addDeck(newDeck);
    set(state => ({ jobs: { ...state.jobs, [id]: { ...state.jobs[id], deckId } } }));

    // Parallel Writer & Designer
    const writerPromise = runStep('writer', 2500, ['Drafting outline...', 'Writing slide content...'], true); // This might fail if simulateFailure is true
    const designerPromise = runStep('designer', 2000, ['Analyzing tone...', 'Generating color palette...']);
    
    const [writerOk, designerOk] = await Promise.all([writerPromise, designerPromise]);
    if (!writerOk || !designerOk) return; // one failed
    
    // Add plain text slides
    useDeckStore.getState().updateDeck(deckId, { slides: FIXTURES.decks[0].slides.slice(0, get().jobs[id].settings.slideCount || 8) });
    updateProgress(50);

    // Visuals
    if (!await runStep('visuals', 3000, ['Generating images...', 'Placing icons...'])) return;
    updateProgress(75);

    // Critic
    if (!await runStep('critic', 1500, ['Reviewing contrast...', 'Checking word counts...'])) return;
    updateProgress(90);

    // Export
    if (!await runStep('export', 1000, ['Generating PPTX...'])) return;
    updateProgress(100);

    // Done
    useDeckStore.getState().updateDeck(deckId, { status: 'ready' });
    set(state => ({ jobs: { ...state.jobs, [id]: { ...state.jobs[id], status: 'completed', endTime: Date.now() } } }));
    get()._addLog(id, { agent: 'System', level: 'info', message: 'Pipeline completed successfully.' });
  }
}));
