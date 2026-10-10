import { create } from 'zustand';

interface SettingsState {
  openRouterKeyStatus: 'valid' | 'missing' | 'loading';
  simulateFailure: boolean;
  defaultTextModel: string;
  defaultVisionModel: string;
  defaultImageModel: string;
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  
  setOpenRouterKeyStatus: (status: 'valid' | 'missing' | 'loading') => void;
  setSimulateFailure: (val: boolean) => void;
  setDefaultTextModel: (model: string) => void;
  setDefaultVisionModel: (model: string) => void;
  setDefaultImageModel: (model: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
  loadSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  openRouterKeyStatus: 'loading',
  simulateFailure: false,
  defaultTextModel: 'google/gemini-2.5-flash',
  defaultVisionModel: 'google/gemini-2.5-flash',
  defaultImageModel: 'dall-e-3',
  theme: 'system',
  density: 'comfortable',

  setOpenRouterKeyStatus: (openRouterKeyStatus) => set({ openRouterKeyStatus }),
  setSimulateFailure: (simulateFailure) => set({ simulateFailure }),
  setDefaultTextModel: (defaultTextModel) => set({ defaultTextModel }),
  setDefaultVisionModel: (defaultVisionModel) => set({ defaultVisionModel }),
  setDefaultImageModel: (defaultImageModel) => set({ defaultImageModel }),
  setTheme: (theme) => set({ theme }),
  setDensity: (density) => set({ density }),
  
  loadSettings: async () => {
    try {
      const { api } = await import('../lib/api');
      const settings = await api.getSettings();
      set((s) => ({
        ...s,
        ...settings,
      }));
    } catch (e) {
      console.error('Failed to load settings:', e);
    }
  }
}));
