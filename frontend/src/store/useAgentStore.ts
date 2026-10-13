import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import {
  DEFAULT_WRITER_PROMPT,
  DEFAULT_DESIGNER_PROMPT,
  DEFAULT_VISUAL_PROMPT,
  DEFAULT_CRITIC_PROMPT
} from '@slidewright/shared';

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
  saveAgentPrompt: (id: string, prompt: string) => Promise<void>;
  resetPrompt: (id: string) => Promise<string>;
  fetchPromptsFromServer: () => Promise<void>;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
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
          model: 'openai/gpt-4o-mini',
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
          model: 'openai/gpt-4o-mini',
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
          model: 'openai/gpt-4o-mini',
          enabled: true,
          canDisable: true,
          lastRunStatus: 'pending',
          lastRunTime: 'Never',
          avgTokens: 500,
          temperature: 0.8,
          maxTokens: 1024,
          retries: 1,
          timeout: 120000,
          systemPrompt: DEFAULT_VISUAL_PROMPT,
          defaultPrompt: DEFAULT_VISUAL_PROMPT,
          history: []
        },
        critic: {
          id: 'critic',
          name: 'Critic',
          type: 'llm',
          description: 'Scores the draft deck on layout density, contrast, and messaging.',
          model: 'openai/gpt-4o-mini',
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

      updateAgent: (id, updates) => {
        const key = id === 'visual' ? 'visuals' : id;
        set(state => {
          const agent = state.agents[key];
          if (!agent) return state;
          return { agents: { ...state.agents, [key]: { ...agent, ...updates } } };
        });
        if (updates.systemPrompt) {
          api.saveAgentPrompt(key, updates.systemPrompt).catch(console.error);
        }
        api.saveAgentConfig(key, updates).catch(console.error);
      },

      saveAgentPrompt: async (id: string, prompt: string) => {
        const key = id === 'visual' ? 'visuals' : id;
        await api.saveAgentPrompt(key, prompt);
        set(state => {
          const agent = state.agents[key];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [key]: { ...agent, systemPrompt: prompt }
            }
          };
        });
      },

      resetPrompt: async (id: string) => {
        const key = id === 'visual' ? 'visuals' : id;
        const res = await api.resetAgentPrompt(key);
        const defaultPrompt = res?.prompt || (
          key === 'writer' ? DEFAULT_WRITER_PROMPT :
          key === 'designer' ? DEFAULT_DESIGNER_PROMPT :
          key === 'visuals' || key === 'visual' ? DEFAULT_VISUAL_PROMPT :
          key === 'critic' ? DEFAULT_CRITIC_PROMPT : ''
        );
        set(state => {
          const agent = state.agents[key];
          if (!agent) return state;
          return {
            agents: {
              ...state.agents,
              [key]: { ...agent, systemPrompt: defaultPrompt, defaultPrompt }
            }
          };
        });
        return defaultPrompt;
      },

      fetchPromptsFromServer: async () => {
        try {
          const configs = await api.getAgentConfigs();
          if (Array.isArray(configs)) {
            set(state => {
              const newAgents = { ...state.agents };
              for (const cfg of configs) {
                const key = cfg.name === 'visual' ? 'visuals' : cfg.name;
                if (newAgents[key]) {
                  const defaultPrompt = key === 'writer' ? DEFAULT_WRITER_PROMPT :
                    key === 'designer' ? DEFAULT_DESIGNER_PROMPT :
                    key === 'visuals' || key === 'visual' ? DEFAULT_VISUAL_PROMPT :
                    key === 'critic' ? DEFAULT_CRITIC_PROMPT : newAgents[key].defaultPrompt;

                  const activePrompt = (cfg.customPrompt && cfg.customPrompt.trim())
                    ? cfg.customPrompt
                    : (cfg.versions?.[0]?.prompt || defaultPrompt);

                  newAgents[key] = {
                    ...newAgents[key],
                    defaultPrompt,
                    systemPrompt: activePrompt,
                    model: cfg.model || newAgents[key].model,
                    enabled: cfg.enabled !== undefined ? cfg.enabled : newAgents[key].enabled
                  };
                }
              }
              return { agents: newAgents };
            });
          }
        } catch (err) {
          console.error('[AgentStore] Failed to fetch prompts from server:', err);
        }
      }
    }),
    {
      name: 'slidewright_agent_config',
      migrate: (persistedState: any) => {
        if (!persistedState || !persistedState.agents) return persistedState;
        const agents = persistedState.agents;
        
        // Cleanse legacy old prompts in localStorage
        if (agents.writer) {
          agents.writer.defaultPrompt = DEFAULT_WRITER_PROMPT;
          if (!agents.writer.systemPrompt || agents.writer.systemPrompt.includes('Principal Presentation Architect')) {
            agents.writer.systemPrompt = DEFAULT_WRITER_PROMPT;
          }
        }
        if (agents.designer) {
          agents.designer.defaultPrompt = DEFAULT_DESIGNER_PROMPT;
          if (!agents.designer.systemPrompt || agents.designer.systemPrompt.includes('expert presentation designer')) {
            agents.designer.systemPrompt = DEFAULT_DESIGNER_PROMPT;
          }
        }
        if (agents.visuals) {
          agents.visuals.defaultPrompt = DEFAULT_VISUAL_PROMPT;
          if (!agents.visuals.systemPrompt || agents.visuals.systemPrompt.includes('visual asset creator')) {
            agents.visuals.systemPrompt = DEFAULT_VISUAL_PROMPT;
          }
        }
        if (agents.critic) {
          agents.critic.defaultPrompt = DEFAULT_CRITIC_PROMPT;
          if (!agents.critic.systemPrompt || agents.critic.systemPrompt.includes('strict presentation critic')) {
            agents.critic.systemPrompt = DEFAULT_CRITIC_PROMPT;
          }
        }
        return persistedState;
      }
    }
  )
);
