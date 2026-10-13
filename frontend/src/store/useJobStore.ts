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
  createJob: (settings: any, simulateFailure: boolean) => Promise<string>;
  cancelJob: (id: string) => void;
  retryJob: (id: string) => void;
  _processJob: (id: string) => void;
  _updateStep: (id: string, stepId: string, updates: Partial<JobStep>) => void;
  _addLog: (id: string, log: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  _setJobFromServer: (jobData: any) => void;
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

  _setJobFromServer: (serverJob) => {
    set(state => {
      // Map serverJob.runs to steps
      const existingJob = state.jobs[serverJob.id] || { 
        id: serverJob.id, steps: initialSteps(), logs: [], settings: {} 
      };
      
      const newSteps = { ...existingJob.steps };
      let progress = 0;
      
      if (serverJob.runs) {
        serverJob.runs.forEach((r: any) => {
           if (newSteps[r.agent]) {
             let parsedOutput = undefined;
             if (r.output) {
               try { parsedOutput = JSON.parse(r.output); } catch(e) { parsedOutput = r.output; }
             }
             newSteps[r.agent] = {
               ...newSteps[r.agent],
               status: r.status,
               elapsedMs: r.ms || 0,
               tokensIn: r.tokensIn || 0,
               tokensOut: r.tokensOut || 0,
               outputJson: parsedOutput
             };
           }
        });
      }

      // Ensure orchestrator and active stages reflect status correctly
      if (serverJob.status === 'done') {
        progress = 100;
        if (newSteps.orchestrator) newSteps.orchestrator.status = 'done';
        if (newSteps.export) newSteps.export.status = 'done';
      } else if (serverJob.status === 'running' || serverJob.currentStage) {
        if (newSteps.orchestrator) newSteps.orchestrator.status = 'done';
        if (serverJob.currentStage === 'plan') {
          progress = 25;
          if (newSteps.writer?.status !== 'done') newSteps.writer.status = 'running';
          if (newSteps.designer?.status !== 'done') newSteps.designer.status = 'running';
        } else if (serverJob.currentStage === 'visuals') {
          progress = 50;
          if (newSteps.writer) newSteps.writer.status = 'done';
          if (newSteps.designer) newSteps.designer.status = 'done';
          if (newSteps.visuals?.status !== 'done') newSteps.visuals.status = 'running';
        } else if (serverJob.currentStage === 'critic') {
          progress = 75;
          if (newSteps.writer) newSteps.writer.status = 'done';
          if (newSteps.designer) newSteps.designer.status = 'done';
          if (newSteps.visuals) newSteps.visuals.status = 'done';
          if (newSteps.critic?.status !== 'done') newSteps.critic.status = 'running';
        } else if (serverJob.currentStage === 'export') {
          progress = 90;
          if (newSteps.writer) newSteps.writer.status = 'done';
          if (newSteps.designer) newSteps.designer.status = 'done';
          if (newSteps.visuals) newSteps.visuals.status = 'done';
          if (newSteps.critic) newSteps.critic.status = 'done';
          if (newSteps.export?.status !== 'done') newSteps.export.status = 'running';
        } else if (serverJob.currentStage === 'ready') {
          progress = 100;
          Object.keys(newSteps).forEach(k => {
            if (newSteps[k].status !== 'failed') newSteps[k].status = 'done';
          });
        }
      }

      return {
        jobs: {
          ...state.jobs,
          [serverJob.id]: {
            ...existingJob,
            status: serverJob.status === 'done' ? 'completed' : serverJob.status,
            deckId: serverJob.deckId,
            currentStage: serverJob.currentStage,
            progress,
            steps: newSteps
          }
        }
      };
    });
  },

  createJob: async (settings, simulateFailure) => {
    const res = await api.createDeck(settings);
    set(state => ({
      jobs: {
        ...state.jobs,
        [res.jobId]: {
          id: res.jobId,
          status: 'pending',
          deckId: res.deck.id,
          startTime: Date.now(),
          progress: 0,
          simulateFailure,
          steps: initialSteps(),
          logs: [],
          settings
        }
      }
    }));
    return res.jobId;
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
