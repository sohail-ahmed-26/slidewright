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
import { 
  CheckCircle2, Circle, Loader2, XCircle, ArrowRight, 
  Terminal, ChevronDown, RefreshCw, X, Play, FileText 
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
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 bg-card mb-2 ${step.status === 'running' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : step.status === 'done' ? 'border-green-500' : step.status === 'failed' ? 'border-red-500' : 'border-muted'}`}>
          <StepIcon status={step.status} />
        </div>
        <span className="text-xs font-medium">{step.name}</span>
        <span className="text-[10px] text-muted-foreground">{step.elapsedMs > 0 ? `${(step.elapsedMs/1000).toFixed(1)}s` : '--'}</span>
      </div>
    );
  };

  const filteredLogs = job.logs.filter(l => logFilter === 'all' || l.level === logFilter);

  return (
    <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
      {/* Top Header */}
      <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0">
        <div>
          <h1 className="font-bold text-lg flex items-center gap-2">
            Job Run: {job.id}
            <Badge variant="outline" className={job.status === 'running' ? 'bg-blue-500/10 text-blue-500' : job.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
              {job.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl truncate">Prompt: {job.settings?.prompt}</p>
        </div>
        <div className="flex items-center gap-3">
          {job.status === 'running' && (
            <Button variant="destructive" size="sm" onClick={() => cancelJob(job.id)}>
              <X className="w-4 h-4 mr-2" /> Cancel Run
            </Button>
          )}
          {job.status === 'failed' && (
            <Button size="sm" onClick={() => retryJob(job.id)}>
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
      <div className="p-6 border-b bg-muted/10 shrink-0">
        <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
          {renderNode('orchestrator')}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="flex flex-col gap-4 border p-2 rounded-xl bg-card/50">
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
            <span>{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left column: Agents and Logs */}
        <div className="w-1/2 border-r flex flex-col bg-muted/10">
          <ScrollArea className="flex-1 p-6">
            <h3 className="font-semibold mb-4 text-sm">Agent Details</h3>
            <div className="space-y-4">
              {Object.values(job.steps).map(step => (
                <Card key={step.id} className="p-0 overflow-hidden">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <StepIcon status={step.status} />
                        <div className="text-left">
                          <div className="font-medium text-sm">{step.name}</div>
                          <div className="text-xs text-muted-foreground">{step.model} • {step.elapsedMs > 0 ? `${(step.elapsedMs/1000).toFixed(1)}s` : 'Pending'}</div>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 pt-0 border-t text-sm bg-muted/20">
                      <div className="grid grid-cols-2 gap-4 my-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Tokens In</div>
                          <div className="font-mono">{step.tokensIn}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Tokens Out</div>
                          <div className="font-mono">{step.tokensOut}</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium">Logs</div>
                        <div className="bg-black text-green-400 font-mono text-[10px] p-2 rounded max-h-32 overflow-auto">
                          {job.logs.filter(l => l.agent === step.name).map(l => (
                            <div key={l.id}>{new Date(l.timestamp).toISOString().split('T')[1].slice(0,-1)} [{l.level}] {l.message}</div>
                          ))}
                          {job.logs.filter(l => l.agent === step.name).length === 0 && <span className="text-muted-foreground">No logs yet.</span>}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          {/* Terminal Log */}
          <div className="h-64 border-t bg-black text-gray-300 font-mono flex flex-col shrink-0">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <Terminal className="w-4 h-4" /> System Logs
              </div>
              <div className="flex gap-2">
                <button onClick={() => setLogFilter('all')} className={logFilter === 'all' ? 'text-white' : ''}>All</button>
                <button onClick={() => setLogFilter('info')} className={logFilter === 'info' ? 'text-blue-400' : ''}>Info</button>
                <button onClick={() => setLogFilter('warn')} className={logFilter === 'warn' ? 'text-yellow-400' : ''}>Warn</button>
                <button onClick={() => setLogFilter('error')} className={logFilter === 'error' ? 'text-red-400' : ''}>Error</button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="text-xs mb-1 font-mono">
                  <span className="text-gray-500">{new Date(log.timestamp).toISOString().split('T')[1].slice(0,-1)}</span>{' '}
                  <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-blue-400'}>[{log.level.toUpperCase()}]</span>{' '}
                  <span className="text-purple-400">[{log.agent}]</span>{' '}
                  <span className={log.level === 'error' ? 'text-red-300' : 'text-gray-300'}>{log.message}</span>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>

        {/* Right column: Live Preview */}
        <div className="w-1/2 flex flex-col bg-[#e5e5e5] dark:bg-black/90 p-8">
          <div className="mb-4 flex items-center justify-between shrink-0">
            <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Live Preview</h3>
            {deck && <span className="text-xs text-muted-foreground">{deck.slides.length} slides generated</span>}
          </div>
          
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {deck && deck.slides.length > 0 ? (
              <div className="w-full max-w-[1280px] aspect-video bg-white shadow-xl relative overflow-hidden">
                {/* Just show the first slide as a live preview to indicate progress */}
                <SlideRenderer slide={deck.slides[0]} theme={deck.theme} />
              </div>
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin opacity-50" />
                <p>Waiting for Writer to generate initial slides...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
