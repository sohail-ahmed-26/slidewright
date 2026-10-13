import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentStore } from '../store/useAgentStore';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bot, Terminal, Activity, ArrowRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const PIPELINE_ORDER = ['orchestrator', 'writer', 'designer', 'visuals', 'critic', 'export'];

export function Agents() {
  const navigate = useNavigate();
  const agents = useAgentStore(s => s.agents);
  const fetchPromptsFromServer = useAgentStore(s => s.fetchPromptsFromServer);

  React.useEffect(() => {
    fetchPromptsFromServer().catch(console.error);
  }, []);

  return (
    <div className="flex-1 overflow-auto p-8 max-w-[1200px] mx-auto w-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground mt-1">Manage the intelligence layer that powers Slidewright.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-background border rounded-md px-3 py-1.5 text-sm font-medium">
            <option>Default Pipeline</option>
            <option>Max Quality</option>
            <option>Fast (No Critic)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {PIPELINE_ORDER.map((id, index) => {
          const agent = agents[id];
          if (!agent) return null;

          return (
            <Card key={id} className="flex flex-col border p-6 relative group hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
                    id === 'orchestrator' || id === 'writer' || id === 'visuals' ? 'bg-blue-600' :
                    id === 'designer' ? 'bg-purple-600' :
                    id === 'critic' ? 'bg-red-600' :
                    'bg-orange-600'
                  }`}>
                    {agent.type === 'code' ? <Terminal className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{agent.name}</h3>
                </div>
                {!agent.enabled ? (
                  <Badge variant="outline" className="text-muted-foreground">Disabled</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Enabled</Badge>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 flex-1 mb-6">
                {agent.description}
              </p>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Bot className="w-3 h-3" /> Model</span>
                  <span className="font-mono text-xs">{agent.model}</span>
                </div>
                {agent.type === 'llm' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-3 h-3" /> Avg Tokens</span>
                    <span>{agent.avgTokens.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-3 h-3" /> Last Run</span>
                  <div className="flex items-center gap-1.5">
                    {agent.lastRunStatus === 'success' ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : agent.lastRunStatus === 'failed' ? <XCircle className="w-3 h-3 text-red-500" /> : <Clock className="w-3 h-3 text-yellow-500" />}
                    <span>{agent.lastRunTime}</span>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full justify-center bg-background hover:bg-muted/50 border-border text-foreground transition-colors"
                onClick={() => navigate(`/agents/${id}`)}
              >
                Configure Agent <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
