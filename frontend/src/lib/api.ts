import { FIXTURES } from '@slidewright/shared/src/fixtures';

export interface Api {
  listDecks(): Promise<any[]>;
  getDeck(id: string): Promise<any>;
  createDeck(prompt: string): Promise<any>;
  getRun(id: string): Promise<any>;
  subscribeRun(id: string, onUpdate: (data: any) => void): () => void;
  retryStage(runId: string): Promise<void>;
  cancelRun(runId: string): Promise<void>;
  regenerateSlide(deckId: string, slideId: string, prompt: string): Promise<any>;
  restyleDeck(deckId: string, instructions: string): Promise<any>;
  renameDeck(deckId: string, title: string): Promise<any>;
  duplicateDeck(deckId: string): Promise<any>;
  deleteDeck(deckId: string): Promise<void>;
  updateSlide(deckId: string, slideId: string, content: any): Promise<any>;
  exportPptx(deckId: string): Promise<string>;
  getAgentConfigs(): Promise<any[]>;
  saveAgentConfig(name: string, config: any): Promise<void>;
  getAgentPrompt(name: string): Promise<string>;
  saveAgentPrompt(name: string, prompt: string): Promise<void>;
  resetAgentPrompt(name: string): Promise<void>;
  runAgentTest(name: string, input: any): Promise<any>;
  listModels(): Promise<any[]>;
  getSettings(): Promise<any>;
  saveSettings(settings: any): Promise<void>;
}

class MockApi implements Api {
  async listDecks() {
    return FIXTURES.decks;
  }
  async getDeck(id: string) {
    return FIXTURES.decks.find(d => d.id === id) || null;
  }
  async createDeck(prompt: string) {
    const newDeck = {
      id: `deck-${Date.now()}`,
      title: `Generated from: ${prompt.substring(0, 20)}...`,
      createdAt: new Date().toISOString(),
      status: "pending"
    };
    FIXTURES.decks.unshift(newDeck);
    return newDeck;
  }
  async getRun(id: string) { return FIXTURES.runs[0]; }
  subscribeRun(id: string, onUpdate: (data: any) => void) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onUpdate({ ...FIXTURES.runs[0], progress: Math.min(progress, 100), status: progress >= 100 ? 'ready' : 'running' });
    }, 1000);
    return () => clearInterval(interval);
  }
  async retryStage(runId: string) {}
  async cancelRun(runId: string) {}
  async regenerateSlide(deckId: string, slideId: string, prompt: string) { return {}; }
  async restyleDeck(deckId: string, instructions: string) { return {}; }
  async renameDeck(deckId: string, title: string) { return {}; }
  async duplicateDeck(deckId: string) { return {}; }
  async deleteDeck(deckId: string) {}
  async updateSlide(deckId: string, slideId: string, content: any) { return {}; }
  async exportPptx(deckId: string) { return "/outputs/demo.pptx"; }
  async getAgentConfigs() { return []; }
  async saveAgentConfig(name: string, config: any) {}
  async getAgentPrompt(name: string) { return "Mock prompt"; }
  async saveAgentPrompt(name: string, prompt: string) {}
  async resetAgentPrompt(name: string) {}
  async runAgentTest(name: string, input: any) { return { result: "Mock success" }; }
  async listModels() { return [{ id: "mock-model", name: "Mock Model" }]; }
  async getSettings() { return { theme: "light" }; }
  async saveSettings(settings: any) {}
}

class HttpApi implements Api {
  // Stub for future HTTP calls
  async listDecks() { return []; }
  async getDeck(id: string) { return null; }
  async createDeck(prompt: string) { return null; }
  async getRun(id: string) { return null; }
  subscribeRun(id: string, onUpdate: (data: any) => void) { return () => {}; }
  async retryStage(runId: string) {}
  async cancelRun(runId: string) {}
  async regenerateSlide(deckId: string, slideId: string, prompt: string) { return {}; }
  async restyleDeck(deckId: string, instructions: string) { return {}; }
  async renameDeck(deckId: string, title: string) { return {}; }
  async duplicateDeck(deckId: string) { return {}; }
  async deleteDeck(deckId: string) {}
  async updateSlide(deckId: string, slideId: string, content: any) { return {}; }
  async exportPptx(deckId: string) { return ""; }
  async getAgentConfigs() { return []; }
  async saveAgentConfig(name: string, config: any) {}
  async getAgentPrompt(name: string) { return ""; }
  async saveAgentPrompt(name: string, prompt: string) {}
  async resetAgentPrompt(name: string) {}
  async runAgentTest(name: string, input: any) { return {}; }
  async listModels() { return []; }
  async getSettings() { return {}; }
  async saveSettings(settings: any) {}
}

const isMock = import.meta.env.VITE_API_MODE !== 'http';
export const api = isMock ? new MockApi() : new HttpApi();
