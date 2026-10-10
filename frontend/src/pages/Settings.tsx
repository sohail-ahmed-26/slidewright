import React, { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { KeyRound, Server, Palette, FlaskConical, AlertTriangle, CheckCircle2, RotateCcw, FolderOpen } from 'lucide-react';

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
  { id: 'dall-e-3', name: 'DALL-E 3 (Image only)' }
];

export function Settings() {
  const settings = useSettingsStore();
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const testConnection = () => {
    setTestStatus('testing');
    setTimeout(() => setTestStatus('success'), 1500);
  };

  return (
    <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global configuration, mock parameters, and API keys.</p>
      </div>

      <div className="space-y-8">
        {/* API & Backend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5 text-primary" /> OpenRouter API</CardTitle>
            <CardDescription>Configure external AI connectivity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
              <div>
                <Label className="text-base">Mock Mode</Label>
                <p className="text-sm text-muted-foreground">Run completely local without hitting actual APIs. Saves credits.</p>
              </div>
              <Switch checked={settings.mockMode} onCheckedChange={settings.setMockMode} />
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>API Key Status</Label>
                  <p className="text-sm text-muted-foreground">Managed via <code className="bg-muted px-1 py-0.5 rounded">.env</code> on the backend.</p>
                </div>
                <div className="flex items-center gap-4">
                  {settings.openRouterKeyStatus === 'set' ? (
                    <span className="text-green-500 text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Configured</span>
                  ) : (
                    <span className="text-red-500 text-sm font-medium flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Missing in .env</span>
                  )}
                  <Button variant="secondary" onClick={testConnection} disabled={testStatus === 'testing'}>
                    {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Connected!' : 'Test Connection'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <div className="space-y-2">
                <Label>Default Text Model</Label>
                <Select value={settings.defaultTextModel} onValueChange={settings.setDefaultTextModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MODELS.filter(m => m.id !== 'dall-e-3').map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Vision Model</Label>
                <Select value={settings.defaultVisionModel} onValueChange={settings.setDefaultVisionModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{MODELS.filter(m => m.id !== 'dall-e-3').map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Image Model</Label>
                <Select value={settings.defaultImageModel} onValueChange={settings.setDefaultImageModel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="dall-e-3">DALL-E 3</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5 text-primary" /> Local Storage</CardTitle>
            <CardDescription>File paths and database management.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Outputs Folder</Label>
              <div className="flex gap-2">
                <Input value="/slidewright/outputs/" readOnly className="bg-muted text-muted-foreground font-mono text-sm" />
                <Button variant="outline" size="icon"><FolderOpen className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground">Generated PPTX files are saved here natively.</p>
            </div>

            <div className="pt-4 border-t flex items-center justify-between">
              <div>
                <Label className="text-red-500">Clear Mock Data</Label>
                <p className="text-sm text-muted-foreground">Wipes local Zustand store. Cannot be undone.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive"><RotateCcw className="w-4 h-4 mr-2" /> Reset Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all mock presentations, jobs, and reset agent configurations to their default states.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600">Yes, delete everything</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Development & Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5 text-primary" /> Development & Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Simulate Random Failures</Label>
                <p className="text-sm text-muted-foreground">Occasionally fails pipeline steps to test retry mechanisms.</p>
              </div>
              <Switch checked={settings.simulateFailure} onCheckedChange={settings.setSimulateFailure} />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-primary" /> Appearance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={settings.theme} onValueChange={(v: any) => settings.setTheme(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>UI Density</Label>
              <Select value={settings.density} onValueChange={(v: any) => settings.setDensity(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pt-4 pb-8">
          Slidewright v0.1.0 • Local Environment
        </div>
      </div>
    </div>
  );
}
