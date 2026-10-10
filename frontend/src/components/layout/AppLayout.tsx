import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Toaster } from '../ui/sonner';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Loader2, KeyRound } from 'lucide-react';
import { Button } from '../ui/button';

export function AppLayout() {
  const { openRouterKeyStatus, loadSettings } = useSettingsStore();

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (openRouterKeyStatus === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (openRouterKeyStatus === 'missing') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="max-w-md w-full p-8 border rounded-xl shadow-lg bg-card text-center space-y-6">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
            <KeyRound className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">OpenRouter Key Missing</h2>
            <p className="text-muted-foreground text-sm">
              Slidewright requires a valid OpenRouter API key to function. We do not use mock data or fallbacks.
            </p>
          </div>
          <div className="bg-muted p-4 rounded-md text-sm text-left">
            <p>1. Get an API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-primary hover:underline">OpenRouter</a></p>
            <p>2. Add it to your <code>.env</code> file:</p>
            <code className="block mt-2 bg-background p-2 rounded border font-mono text-xs text-muted-foreground">OPENROUTER_API_KEY=sk-or-v1-...</code>
            <p className="mt-2">3. Restart the backend server.</p>
          </div>
          <Button className="w-full" onClick={() => loadSettings()}>Test Connection</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto bg-background relative">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
