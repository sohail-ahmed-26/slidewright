import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobStore, JobStep } from '../store/useJobStore';
import { useDeckStore } from '../store/useDeckStore';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { SlideRenderer } from '../components/slide/SlideRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  CheckCircle2, Circle, Loader2, XCircle, ArrowRight, 
  Terminal, ChevronDown, RefreshCw, X, Play, FileText, Copy, Code2, MessageSquare
} from 'lucide-react';

const StepIcon = ({ status }: { status: JobStep['status'] }) => {
  if (status === 'done') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (status === 'failed') return <XCircle className="w-5 h-5 text-red-500" />;
  if (status === 'running') return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
  if (status === 'skipped') return <Circle className="w-5 h-5 text-muted-foreground opacity-50" />;
  return <Circle className="w-5 h-5 text-muted-foreground" />;
};

export function RunJob() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const job = useJobStore(s => s.jobs[jobId || '']);
  const cancelJob = useJobStore(s => s.cancelJob);
  const retryJob = useJobStore(s => s.retryJob);
  
  const deck = useDeckStore(s => s.decks.find(d => d.id === job?.deckId));
  const [logFilter, setLogFilter] = useState('all');

  if (!job) return <div className="p-8 text-center text-red-500">Job not found</div>;

  const renderNode = (stepId: string) => {
    const step = job.steps[stepId];
    if (!step) return null;
    return (
      <div className="flex flex-col items-center">
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 bg-card mb-2 transition-all ${step.status === 'running' ? 'border-primary shadow-[0_0_15px_rgba(22,183,179,0.4)]' : step.status === 'done' ? 'border-success' : step.status === 'failed' ? 'border-destructive' : step.status === 'skipped' ? 'border-muted opacity-50' : 'border-muted'}`}>
          <StepIcon status={step.status} />
        </div>
        <span className="text-xs font-medium">{step.name}</span>
        <span className="text-[10px] text-muted-foreground">{step.elapsedMs > 0 ? `${(step.elapsedMs/1000).toFixed(1)}s` : '--'}</span>
      </div>
    );
  };

  const filteredLogs = job.logs.filter(l => logFilter === 'all' || l.level === logFilter);

  return (
    <div className="flex-1 overflow-hidden flex flex-col w-full h-full bg-background">
      {/* Top Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
        <div>
          <h1 className="font-bold text-lg flex items-center gap-2">
            Job Run: {job.id}
            <Badge variant="outline" className={job.status === 'running' ? 'bg-info/10 text-info border-info/20' : job.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}>
              {job.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl truncate">Prompt: {job.settings?.prompt || 'No prompt'}</p>
        </div>
        <div className="flex items-center gap-3">
          {job.status === 'running' && (
            <Button variant="destructive" size="sm" onClick={() => cancelJob(job.id)}>
              <X className="w-4 h-4 mr-2" /> Cancel Run
            </Button>
          )}
          {job.status === 'failed' && (
            <Button size="sm" onClick={() => retryJob(job.id)} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" /> Retry Failed
            </Button>
          )}
          {job.status === 'completed' && job.deckId && (
            <Button size="sm" onClick={() => navigate(`/decks/${job.deckId}`)}>
              <Play className="w-4 h-4 mr-2" /> Open Presentation
            </Button>
          )}
        </div>
      </header>

      {/* Pipeline Graph */}
      <div className="p-6 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-center gap-6 max-w-5xl mx-auto">
          {renderNode('orchestrator')}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col gap-4 border p-3 rounded-xl bg-card shadow-sm">
            {renderNode('writer')}
            <div className="h-px bg-border w-full" />
            {renderNode('designer')}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          {renderNode('visuals')}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          {renderNode('critic')}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          {renderNode('export')}
        </div>
        <div className="max-w-2xl mx-auto mt-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Overall Progress</span>
            <span className="font-mono">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Agents and Logs */}
        <div className="w-1/2 border-r flex flex-col bg-muted/10 min-w-0">
          <ScrollArea className="flex-1 p-6">
            <h3 className="font-semibold mb-4 text-sm">Agent Details</h3>
            <div className="space-y-4">
              {Object.values(job.steps).map((step: JobStep) => (
                <Card key={step.id} className="p-0 overflow-hidden shadow-sm">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <StepIcon status={step.status} />
                        <div className="text-left">
                          <div className="font-medium text-sm">{step.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {step.model !== 'none' ? step.model : 'Internal'} • {step.elapsedMs > 0 ? `${(step.elapsedMs/1000).toFixed(1)}s` : 'Pending'}
                          </div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="p-4 pt-0 border-t text-sm bg-muted/10">
                      <Tabs defaultValue="overview" className="mt-4">
                        <TabsList className="h-8">
                          <TabsTrigger value="overview" className="text-xs px-3">Overview</TabsTrigger>
                          <TabsTrigger value="prompt" className="text-xs px-3">Prompt</TabsTrigger>
                          <TabsTrigger value="io" className="text-xs px-3">I/O JSON</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background border rounded p-3">
                              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Tokens In</div>
                              <div className="font-mono text-lg">{step.tokensIn.toLocaleString()}</div>
                            </div>
                            <div className="bg-background border rounded p-3">
                              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Tokens Out</div>
                              <div className="font-mono text-lg">{step.tokensOut.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-xs font-medium flex items-center justify-between">
                              Agent Logs
                              {step.status === 'failed' && (
                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={(e) => { e.stopPropagation(); retryJob(job.id); }}>
                                  <RefreshCw className="w-3 h-3 mr-1" /> Retry
                                </Button>
                              )}
                            </div>
                            <div className="bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] p-3 rounded-md max-h-40 overflow-auto border border-[#333]">
                              {job.logs.filter(l => l.agent === step.name).map(l => (
                                <div key={l.id} className="mb-1 leading-relaxed">
                                  <span className="text-[#569cd6]">{new Date(l.timestamp).toISOString().split('T')[1].slice(0,-1)}</span>{' '}
                                  <span className={l.level === 'error' ? 'text-[#f44747]' : l.level === 'warn' ? 'text-[#d7ba7d]' : 'text-[#4ec9b0]'}>[{l.level}]</span>{' '}
                                  <span className={l.level === 'error' ? 'text-[#f44747]' : ''}>{l.message}</span>
                                </div>
                              ))}
                              {job.logs.filter(l => l.agent === step.name).length === 0 && <span className="text-muted-foreground">No logs yet.</span>}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="prompt" className="pt-4">
                          <div className="relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="secondary" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                            </div>
                            <pre className="bg-[#1e1e1e] text-[#ce9178] p-4 rounded-md overflow-auto text-[11px] font-mono max-h-64 border border-[#333]">
                              {step.status === 'pending' ? 'Waiting to start...' : `You are an expert presentation ${step.name.toLowerCase()}.\nTask: Generate high quality slides based on the user prompt...\n\nUser Prompt: ${job.settings?.prompt}`}
                            </pre>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="io" className="pt-4">
                           <div className="relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                              <Button size="icon" variant="secondary" className="h-6 w-6"><Copy className="w-3 h-3" /></Button>
                            </div>
                            <pre className="bg-[#1e1e1e] text-[#9cdcfe] p-4 rounded-md overflow-auto text-[11px] font-mono max-h-64 border border-[#333]">
                              {step.status === 'pending' ? 'No data yet.' : `{\n  "status": "success",\n  "data": {\n    "generated_items": ${step.tokensOut > 0 ? step.tokensOut / 10 : 0}\n  }\n}`}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          {/* Terminal Log */}
          <div className="h-64 border-t bg-[#1e1e1e] text-[#d4d4d4] font-mono flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#252526] text-xs">
              <div className="flex items-center gap-2 text-[#cccccc]">
                <Terminal className="w-4 h-4" /> System Logs
              </div>
              <div className="flex gap-4">
                <button onClick={() => setLogFilter('all')} className={logFilter === 'all' ? 'text-white border-b border-white' : 'text-muted-foreground'}>All</button>
                <button onClick={() => setLogFilter('info')} className={logFilter === 'info' ? 'text-[#4ec9b0] border-b border-[#4ec9b0]' : 'text-muted-foreground'}>Info</button>
                <button onClick={() => setLogFilter('warn')} className={logFilter === 'warn' ? 'text-[#d7ba7d] border-b border-[#d7ba7d]' : 'text-muted-foreground'}>Warn</button>
                <button onClick={() => setLogFilter('error')} className={logFilter === 'error' ? 'text-[#f44747] border-b border-[#f44747]' : 'text-muted-foreground'}>Error</button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="text-[11px] mb-1.5 font-mono leading-relaxed flex gap-2">
                  <span className="text-[#569cd6] shrink-0">{new Date(log.timestamp).toISOString().split('T')[1].slice(0,-1)}</span>
                  <span className={`shrink-0 w-12 ${log.level === 'error' ? 'text-[#f44747]' : log.level === 'warn' ? 'text-[#d7ba7d]' : 'text-[#4ec9b0]'}`}>[{log.level.toUpperCase()}]</span>
                  <span className="text-[#c586c0] shrink-0 w-24">[{log.agent}]</span>
                  <span className={`break-words ${log.level === 'error' ? 'text-[#f44747]' : 'text-[#d4d4d4]'}`}>{log.message}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && <div className="text-[#808080] italic">No logs found for this filter.</div>}
            </ScrollArea>
          </div>
        </div>

        {/* Right column: Live Preview */}
        <div className="w-1/2 flex flex-col bg-muted/40 p-8 min-w-0">
          <div className="mb-4 flex items-center justify-between shrink-0">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Live Preview</h3>
            {deck && <Badge variant="secondary">{deck.slides.length} slides generated</Badge>}
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden border rounded-xl bg-card shadow-sm relative">
            {deck && deck.slides.length > 0 ? (
              <div className="w-full h-full p-8 flex items-center justify-center relative bg-muted/20">
                <div className="w-full max-w-full aspect-video shadow-xl relative overflow-hidden bg-white ring-1 ring-border">
                  {/* Just show the first slide as a live preview */}
                  <SlideRenderer slide={deck.slides[0]} theme={deck.theme} />
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-4 text-sm">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                </div>
                <p>Waiting for Writer to generate initial slides...</p>
              </div>
            )}
            
            {job.status === 'completed' && (
               <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                 <div className="w-16 h-16 rounded-full bg-success/20 text-success flex items-center justify-center">
                   <CheckCircle2 className="w-8 h-8" />
                 </div>
                 <h2 className="text-xl font-bold">Presentation Ready</h2>
                 <Button size="lg" onClick={() => navigate(`/decks/${job.deckId}`)} className="mt-2 shadow-lg">
                   <Play className="w-4 h-4 mr-2" /> Open Editor
                 </Button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
