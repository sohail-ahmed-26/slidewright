export interface Api {
  listDecks(): Promise<any[]>;
  getDeck(id: string): Promise<any>;
  createDeck(data: string | { prompt: string; audience?: string; language?: string; slideCount?: number; tone?: string; [key: string]: any }): Promise<any>;
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
  exportPptx(deckId: string, deck?: any): Promise<string>;
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

class HttpApi implements Api {
  async listDecks() { const r = await fetch('/api/decks'); return r.json(); }
  async getDeck(id: string) { const r = await fetch(`/api/decks/${id}`); return r.json(); }
  async createDeck(data: any) { 
    const payload = typeof data === 'string' ? { prompt: data } : data;
    const r = await fetch('/api/decks', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    }); 
    return r.json(); 
  }
  async getRun(id: string) { const r = await fetch(`/api/jobs/${id}`); return r.json(); }
  
  subscribeRun(id: string, onUpdate: (data: any) => void) {
    const sse = new EventSource(`/api/jobs/${id}/events`);
    sse.onmessage = (e) => onUpdate(JSON.parse(e.data));
    return () => sse.close();
  }
  
  async retryStage(runId: string) { await fetch(`/api/jobs/${runId}/retry`, { method: 'POST' }); }
  async cancelRun(runId: string) { await fetch(`/api/jobs/${runId}/cancel`, { method: 'POST' }); }
  async regenerateSlide(deckId: string, slideId: string, prompt: string) { return {}; }
  async restyleDeck(deckId: string, instructions: string) { return {}; }
  async renameDeck(deckId: string, title: string) { const r = await fetch(`/api/decks/${deckId}/rename`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title }) }); return r.json(); }
  async duplicateDeck(deckId: string) { const r = await fetch(`/api/decks/${deckId}/duplicate`, { method: 'POST' }); return r.json(); }
  async deleteDeck(deckId: string) { await fetch(`/api/decks/${deckId}`, { method: 'DELETE' }); }
  async updateSlide(deckId: string, slideId: string, content: any) { return {}; }
  async exportPptx(deckId: string, deck?: any) {
    const r = await fetch(`/api/export/${deckId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deck })
    });
    const res = await r.json();
    if (res.error) throw new Error(res.error);
    return res.url;
  }
  async getAgentConfigs() { const r = await fetch('/api/agents'); return r.json(); }
  async saveAgentConfig(name: string, config: any) {
    await fetch(`/api/agents/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
  }
  async getAgentPrompt(name: string) { const r = await fetch(`/api/agents/${name}/prompt`); const res = await r.json(); return res.prompt; }
  async saveAgentPrompt(name: string, prompt: string) {
    const r = await fetch(`/api/agents/${name}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Failed to save prompt' }));
      throw new Error(err.error || 'Failed to save prompt');
    }
    return r.json();
  }
  async resetAgentPrompt(name: string) {
    const r = await fetch(`/api/agents/${name}/reset`, { method: 'POST' });
    if (!r.ok) {
      const err = await r.json().catch(() => ({ error: 'Failed to reset prompt' }));
      throw new Error(err.error || 'Failed to reset prompt');
    }
    return r.json();
  }
  async runAgentTest(name: string, input: any) { return {}; }
  async listModels() { const r = await fetch('/api/models'); return r.json(); }
  async getSettings() { const r = await fetch('/api/settings'); return r.json(); }
  async saveSettings(settings: any) { await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }); }
}

export const api = new HttpApi();

