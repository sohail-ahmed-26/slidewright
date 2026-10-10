import { create } from 'zustand';

interface SettingsState {
  openRouterKeyStatus: 'set' | 'not_set';
  mockMode: boolean;
  simulateFailure: boolean;
  defaultTextModel: string;
  defaultVisionModel: string;
  defaultImageModel: string;
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  
  setOpenRouterKeyStatus: (status: 'set' | 'not_set') => void;
  setMockMode: (val: boolean) => void;
  setSimulateFailure: (val: boolean) => void;
  setDefaultTextModel: (model: string) => void;
  setDefaultVisionModel: (model: string) => void;
  setDefaultImageModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  openRouterKeyStatus: 'not_set',
  mockMode: true,
  simulateFailure: false,
  defaultTextModel: 'google/gemini-2.5-flash',
  defaultVisionModel: 'google/gemini-2.5-flash',
  defaultImageModel: 'dall-e-3',
  theme: 'system',
  density: 'comfortable',

  setOpenRouterKeyStatus: (openRouterKeyStatus) => set({ openRouterKeyStatus }),
  setMockMode: (mockMode) => set({ mockMode }),
  setSimulateFailure: (simulateFailure) => set({ simulateFailure }),
  setDefaultTextModel: (defaultTextModel) => set({ defaultTextModel }),
  setDefaultVisionModel: (defaultVisionModel) => set({ defaultVisionModel }),
  setDefaultImageModel: (defaultImageModel) => set({ defaultImageModel }),
  setTheme: (theme) => set({ theme }),
  setDensity: (density) => set({ density }),
}));
