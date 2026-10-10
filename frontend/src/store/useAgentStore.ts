import { create } from 'zustand';

export interface AgentRunHistory {
  id: string;
  deckId: string;
  deckName: string;
  status: 'success' | 'failed';
  timeStr: string;
  durationMs: number;
  tokens: number;
  error?: string;
}

export interface Agent {
  id: string;
  name: string;
  type: 'code' | 'llm';
  description: string;
  model: string;
  enabled: boolean;
  canDisable: boolean;
  lastRunStatus: 'success' | 'failed' | 'pending';
  lastRunTime: string;
  avgTokens: number;
  temperature: number;
  maxTokens: number;
  retries: number;
  timeout: number;
  systemPrompt: string;
  defaultPrompt: string;
  history: AgentRunHistory[];
}

interface AgentState {
  agents: Record<string, Agent>;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  resetPrompt: (id: string) => void;
}

const DEFAULT_WRITER_PROMPT = `You are a professional presentation writer. Your task is to generate a slide deck outline and content based on user requirements.
Follow these rules strictly:
1. Return valid JSON only.
2. Ensure titles are concise.
3. Fit content to the provided layouts.`;

const DEFAULT_DESIGNER_PROMPT = `You are an expert presentation designer. Your task is to select appropriate layouts, color themes, and fonts for the given presentation draft.
Follow these rules strictly:
1. Ensure high contrast readability.
2. Select layouts that fit the text length.`;

const DEFAULT_VISUALS_PROMPT = `You are a visual asset creator. Your task is to generate image prompts or select appropriate lucide icons for slides.`;

const DEFAULT_CRITIC_PROMPT = `You are a strict presentation critic. Your task is to review the generated slides and provide a score from 0-100, along with concrete feedback for improvement.`;

export const useAgentStore = create<AgentState>((set) => ({
  agents: {
    orchestrator: {
      id: 'orchestrator',
      name: 'Orchestrator',
      type: 'code',
      description: 'Manages the overall pipeline execution, routing state between agents.',
      model: 'internal',
      enabled: true,
      canDisable: false,
      lastRunStatus: 'success',
      lastRunTime: '2 mins ago',
      avgTokens: 0,
      temperature: 0,
      maxTokens: 0,
      retries: 0,
      timeout: 0,
      systemPrompt: 'Code-based orchestrator node.',
      defaultPrompt: 'Code-based orchestrator node.',
      history: [
        { id: '1', deckId: 'deck-1', deckName: 'Q3 Sales Review', status: 'success', timeStr: '2 mins ago', durationMs: 800, tokens: 0 }
      ]
    },
    writer: {
      id: 'writer',
      name: 'Writer',
      type: 'llm',
      description: 'Drafts the complete slide content and structural outline.',
      model: 'gpt-4o',
      enabled: true,
      canDisable: false,
      lastRunStatus: 'success',
      lastRunTime: '2 mins ago',
      avgTokens: 4200,
      temperature: 0.7,
      maxTokens: 8192,
      retries: 2,
      timeout: 60000,
      systemPrompt: DEFAULT_WRITER_PROMPT,
      defaultPrompt: DEFAULT_WRITER_PROMPT,
      history: [
        { id: '1', deckId: 'deck-1', deckName: 'Q3 Sales Review', status: 'success', timeStr: '2 mins ago', durationMs: 4500, tokens: 3800 }
      ]
    },
    designer: {
      id: 'designer',
      name: 'Designer',
      type: 'llm',
      description: 'Maps raw content to specific structural slide layouts.',
      model: 'claude-3.5-sonnet',
      enabled: true,
      canDisable: true,
      lastRunStatus: 'success',
      lastRunTime: '1 min ago',
      avgTokens: 2100,
      temperature: 0.2,
      maxTokens: 4096,
      retries: 1,
      timeout: 30000,
      systemPrompt: DEFAULT_DESIGNER_PROMPT,
      defaultPrompt: DEFAULT_DESIGNER_PROMPT,
      history: [
        { id: '1', deckId: 'deck-1', deckName: 'Q3 Sales Review', status: 'success', timeStr: '1 min ago', durationMs: 2100, tokens: 1900 }
      ]
    },
    visuals: {
      id: 'visuals',
      name: 'Visuals',
      type: 'llm',
      description: 'Generates necessary imagery, diagrams, and selects icons.',
      model: 'dall-e-3',
      enabled: true,
      canDisable: true,
      lastRunStatus: 'pending',
      lastRunTime: 'Never',
      avgTokens: 500,
      temperature: 0.8,
      maxTokens: 1024,
      retries: 1,
      timeout: 120000,
      systemPrompt: DEFAULT_VISUALS_PROMPT,
      defaultPrompt: DEFAULT_VISUALS_PROMPT,
      history: []
    },
    critic: {
      id: 'critic',
      name: 'Critic',
      type: 'llm',
      description: 'Scores the draft deck on layout density, contrast, and messaging.',
      model: 'gpt-4o',
      enabled: true,
      canDisable: true,
      lastRunStatus: 'failed',
      lastRunTime: '5 mins ago',
      avgTokens: 1200,
      temperature: 0,
      maxTokens: 2048,
      retries: 1,
      timeout: 30000,
      systemPrompt: DEFAULT_CRITIC_PROMPT,
      defaultPrompt: DEFAULT_CRITIC_PROMPT,
      history: [
        { id: '1', deckId: 'deck-2', deckName: 'Startup Pitch', status: 'failed', timeStr: '5 mins ago', durationMs: 15000, tokens: 1100, error: 'Context window exceeded.' }
      ]
    },
    export: {
      id: 'export',
      name: 'Export',
      type: 'code',
      description: 'Generates the final .pptx file natively.',
      model: 'internal',
      enabled: true,
      canDisable: false,
      lastRunStatus: 'success',
      lastRunTime: '1 hr ago',
      avgTokens: 0,
      temperature: 0,
      maxTokens: 0,
      retries: 0,
      timeout: 0,
      systemPrompt: 'Code-based exporter node.',
      defaultPrompt: 'Code-based exporter node.',
      history: [
        { id: '1', deckId: 'deck-3', deckName: 'Weekly Sync', status: 'success', timeStr: '1 hr ago', durationMs: 250, tokens: 0 }
      ]
    }
  },

  updateAgent: (id, updates) => set(state => {
    const agent = state.agents[id];
    if (!agent) return state;
    return { agents: { ...state.agents, [id]: { ...agent, ...updates } } };
  }),

  resetPrompt: (id) => set(state => {
    const agent = state.agents[id];
    if (!agent) return state;
    return { agents: { ...state.agents, [id]: { ...agent, systemPrompt: agent.defaultPrompt } } };
  })
}));
