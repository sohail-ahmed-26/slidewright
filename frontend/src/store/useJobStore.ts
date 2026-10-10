import { create } from 'zustand';
import { api } from '../lib/api';

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
  jobs: {},

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
    // This will be properly triggered via component, returning a mock ID temporarily 
    // until we wire up the full creation flow to the backend in the component.
    // The components will use api.createDeck() directly.
    return ''; 
  },

  cancelJob: async (id) => {
    await api.cancelRun(id);
  },

  retryJob: async (id) => {
    await api.retryStage(id);
  },

  _processJob: async (id) => {
    // No-op, managed by backend now
  }
}));
