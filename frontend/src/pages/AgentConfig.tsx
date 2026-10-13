import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgentStore } from '../store/useAgentStore';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../components/ui/alert-dialog';
import {
  Bot,
  FileCode,
  CheckCircle2,
  XCircle,
  Terminal,
  Play,
  Save,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const MODELS = [
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (Default)', structured: true, vision: true, image: false },
  { id: 'gpt-4o', name: 'GPT-4o', structured: true, vision: true, image: false },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', structured: true, vision: true, image: false },
  { id: 'dall-e-3', name: 'DALL-E 3', structured: false, vision: false, image: true },
  { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash', structured: true, vision: true, image: false },
  { id: 'internal', name: 'Internal Code Engine', structured: true, vision: false, image: false }
];

export function AgentConfig() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const agentKey = (name === 'visual' ? 'visuals' : name) || '';
  const agent = useAgentStore(s => s.agents[agentKey]);
  const updateAgent = useAgentStore(s => s.updateAgent);
  const resetPrompt = useAgentStore(s => s.resetPrompt);

  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [localAgent, setLocalAgent] = useState(agent);
  const [playgroundInput, setPlaygroundInput] = useState('{\n  "test": "sample input"\n}');
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (agent) {
      setLocalAgent(agent);
    }
    if (agentKey) {
      api.getAgentPrompt(agentKey).then(savedPrompt => {
        if (savedPrompt && savedPrompt.trim()) {
          setLocalAgent(prev => prev ? { ...prev, systemPrompt: savedPrompt } : prev);
        }
      }).catch(console.error);
    }
  }, [agentKey]);

  if (!agent || !localAgent) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold text-destructive mb-2">Agent Not Found</h2>
        <p className="text-muted-foreground mb-4">No configuration found for agent key: "{name}".</p>
        <Button onClick={() => navigate('/agents')}>Back to Agents</Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await api.saveAgentPrompt(agentKey, localAgent.systemPrompt);
      await api.saveAgentConfig(agentKey, localAgent);
      updateAgent(agentKey, localAgent);
      setHasUnsaved(false);
      setSaveStatus('saved');
      toast.success(`Agent ${localAgent.name} system prompt and configuration saved permanently to database!`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      toast.error('Failed to save agent config: ' + (err.message || 'Unknown database error'));
    }
  };

  const handleConfirmedReset = async () => {
    setIsResetting(true);
    try {
      const defaultPrompt = await resetPrompt(agentKey);
      setLocalAgent(prev => prev ? { ...prev, systemPrompt: defaultPrompt } : prev);
      setHasUnsaved(false);
      setIsResetDialogOpen(false);
      setSaveStatus('saved');
      toast.success(`Agent ${localAgent.name} prompt reset to official master default!`);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      toast.error('Failed to reset prompt: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDiscardChanges = () => {
    setLocalAgent(agent);
    setHasUnsaved(false);
    setSaveStatus('idle');
  };

  const updateLocal = (updates: any) => {
    setLocalAgent({ ...localAgent, ...updates });
    setHasUnsaved(true);
    if (saveStatus !== 'idle') setSaveStatus('idle');
  };

  const runPlayground = () => {
    setPlaygroundOutput('Running...');
    setTimeout(() => {
      setPlaygroundOutput(JSON.stringify({ status: 'success', data: 'Mock generated JSON output matching Zod schema.' }, null, 2));
    }, 1000);
  };

  const isLLM = localAgent.type === 'llm';
  const isCustomized = localAgent.systemPrompt.trim() !== localAgent.defaultPrompt.trim();

  return (
    <div className="flex-1 overflow-auto p-8 max-w-6xl mx-auto w-full relative">
      {/* Unsaved changes floating bar */}
      {hasUnsaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground shadow-2xl border px-6 py-4 rounded-xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium text-sm">You have unsaved changes in {localAgent.name}.</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDiscardChanges} disabled={saveStatus === 'saving'}>Discard</Button>
            <Button size="sm" onClick={handleSave} disabled={saveStatus === 'saving'}>
              {saveStatus === 'saving' ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" /> Save to Database</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Reset */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Reset System Prompt to Master Default?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground pt-2">
              Are you sure you want to revert the system prompt for <strong>{localAgent.name}</strong> to the official master default?
              <br /><br />
              This action will permanently overwrite any customized instructions you have saved in the database for this agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmedReset}
              disabled={isResetting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isResetting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agents')} className="-ml-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            {localAgent.type === 'code' ? <Terminal className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{localAgent.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="uppercase tracking-wider font-semibold">{localAgent.type} Agent</span>
              <span>•</span>
              <span className="font-mono">{localAgent.model}</span>
              <span>•</span>
              <Badge variant="outline" className={isCustomized ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-primary/10 text-primary"}>
                {isCustomized ? "Customized Prompt" : "Default Master Prompt"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-8 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-6">Overview</TabsTrigger>
          {isLLM && <TabsTrigger value="model" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-6">Model & Parameters</TabsTrigger>}
          {isLLM && <TabsTrigger value="prompt" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-6">Prompt & Rules</TabsTrigger>}
          <TabsTrigger value="playground" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-6">Playground</TabsTrigger>
          <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none py-3 px-6">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Role & Purpose</h3>
            <p className="text-muted-foreground">{localAgent.description}</p>
          </Card>
          
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FileCode className="w-5 h-5 text-blue-500" /> Inputs (Zod Schema)</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {`z.object({
  topic: z.string(),
  slideCount: z.number().min(6).max(20),
  tone: z.enum(['professional', 'friendly'])
})`}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FileCode className="w-5 h-5 text-green-500" /> Outputs (Zod Schema)</h3>
              <div className="bg-muted p-4 rounded-lg font-mono text-xs text-muted-foreground whitespace-pre-wrap">
                {`z.object({
  slides: z.array(z.object({
    layout: z.string(),
    data: z.any()
  }))
})`}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Implementation</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Source Code:</span>
              <code className="bg-muted px-2 py-1 rounded">agents/{localAgent.id}/</code>
            </div>
          </Card>
        </TabsContent>

        {isLLM && (
          <TabsContent value="model" className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable Agent</Label>
                  <p className="text-sm text-muted-foreground">Allow this agent to run in the pipeline.</p>
                </div>
                <Switch 
                  checked={localAgent.enabled} 
                  onCheckedChange={(v) => updateLocal({ enabled: v })} 
                  disabled={!localAgent.canDisable} 
                />
              </div>

              <div className="pt-4 space-y-3">
                <Label>Language Model</Label>
                <Select value={localAgent.model} onValueChange={(v) => updateLocal({ model: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MODELS.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{m.name}</span>
                          <div className="flex gap-1">
                            {m.structured && <Badge variant="secondary" className="text-[10px]">Structured</Badge>}
                            {m.vision && <Badge variant="secondary" className="text-[10px]">Vision</Badge>}
                            {m.image && <Badge variant="secondary" className="text-[10px]">Image</Badge>}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Temperature ({localAgent.temperature})</Label>
                  <span className="text-xs text-muted-foreground">Higher = more creative</span>
                </div>
                <Slider 
                  value={[localAgent.temperature]} 
                  onValueChange={([v]) => updateLocal({ temperature: v })} 
                  min={0} max={2} step={0.1} 
                />
              </div>

              <div className="pt-6 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input type="number" value={localAgent.maxTokens} onChange={(e) => updateLocal({ maxTokens: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>Retries on failure</Label>
                  <Input type="number" value={localAgent.retries} onChange={(e) => updateLocal({ retries: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
          </TabsContent>
        )}

        {isLLM && (
          <TabsContent value="prompt" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">System Prompt</h3>
                {!isCustomized ? (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Official Master Default
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                    Customized (Saved in Database)
                  </Badge>
                )}
                {saveStatus === 'saved' && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Saved to DB
                  </Badge>
                )}
                {saveStatus === 'error' && (
                  <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Save Failed
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsResetDialogOpen(true)}
                  disabled={saveStatus === 'saving' || isResetting}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset to Default
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  disabled={saveStatus === 'saving'} 
                  className="bg-primary text-primary-foreground min-w-[120px]"
                >
                  {saveStatus === 'saving' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : saveStatus === 'saved' ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2 text-green-300" /> Saved!</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Prompt</>
                  )}
                </Button>
              </div>
            </div>
            
            <Card className="overflow-hidden border-2 focus-within:border-primary transition-colors">
              <div className="bg-muted/40 border-b px-4 py-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Prompt Length: {localAgent.systemPrompt.length.toLocaleString()} characters ({localAgent.systemPrompt.split('\n').length} lines)</span>
                <span>Active Agent: {localAgent.id}</span>
              </div>
              <Textarea 
                value={localAgent.systemPrompt}
                onChange={(e) => updateLocal({ systemPrompt: e.target.value })}
                className="min-h-[460px] border-0 focus-visible:ring-0 rounded-none font-mono text-xs md:text-sm leading-relaxed p-6 resize-none"
                placeholder="Enter system instructions..."
              />
            </Card>

            <Card className="p-4 bg-muted/50 border-dashed">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Bot className="w-4 h-4" /> Available Variables</h4>
              <p className="text-xs text-muted-foreground font-mono">{'{{user_prompt}}'}, {'{{slide_count}}'}, {'{{tone}}'}, {'{{audience}}'}</p>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="playground" className="flex h-[600px] gap-6">
          <div className="w-1/2 flex flex-col space-y-4">
            <h3 className="font-semibold flex items-center gap-2">Mock Input JSON</h3>
            <Textarea 
              value={playgroundInput}
              onChange={(e) => setPlaygroundInput(e.target.value)}
              className="flex-1 font-mono text-sm resize-none bg-muted/30"
            />
            <Button className="w-full" size="lg" onClick={runPlayground}>
              <Play className="w-4 h-4 mr-2" /> Run Agent Alone
            </Button>
          </div>
          <div className="w-1/2 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Output Log</h3>
              {playgroundOutput && playgroundOutput !== 'Running...' && <Badge variant="outline" className="bg-green-500/10 text-green-500">Zod Valid</Badge>}
            </div>
            <div className="flex-1 bg-black text-green-400 font-mono text-sm p-4 rounded-xl overflow-auto border shadow-inner">
              <pre>{playgroundOutput || 'Awaiting execution...'}</pre>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Deck Name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Tokens</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localAgent.history.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No run history yet.</TableCell>
                  </TableRow>
                ) : (
                  localAgent.history.map(run => (
                    <TableRow key={run.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/runs/${run.deckId}`)}>
                      <TableCell>
                        {run.status === 'success' ? <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1"/> Success</Badge> : 
                         <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1"/> Failed</Badge>}
                      </TableCell>
                      <TableCell className="font-medium">{run.deckName}</TableCell>
                      <TableCell className="text-muted-foreground">{run.timeStr}</TableCell>
                      <TableCell>{(run.durationMs / 1000).toFixed(1)}s</TableCell>
                      <TableCell className="font-mono">{run.tokens.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
