import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '../store/useJobStore';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { ChevronDown, Wand2, Bot, Sparkles } from 'lucide-react';

const EXAMPLES = [
  "Types of jobs in data science for students",
  "Quarterly sales review for a retail team",
  "Pitch deck for an AI healthcare startup"
];

export function NewDeck() {
  const navigate = useNavigate();
  const createJob = useJobStore(s => s.createJob);
  
  const [prompt, setPrompt] = useState('');
  const [audience, setAudience] = useState('');
  const [language, setLanguage] = useState('en');
  const [slideCount, setSlideCount] = useState([10]);
  const [tone, setTone] = useState('professional');
  const [visualsOn, setVisualsOn] = useState(true);
  const [criticRounds, setCriticRounds] = useState('1');
  const [simulateFailure, setSimulateFailure] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    const jobId = createJob({
      prompt,
      audience,
      language,
      slideCount: slideCount[0],
      tone,
      visualsOn,
      criticRounds: parseInt(criticRounds)
    }, simulateFailure);
    
    navigate(`/runs/${jobId}`);
  };

  return (
    <div className="flex-1 overflow-auto p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Presentation</h1>
        <p className="text-muted-foreground mt-1">Configure your agents to generate a new slide deck.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">What is this presentation about?</Label>
            <span className="text-xs text-muted-foreground">{prompt.length} / 500</span>
          </div>
          <Textarea 
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Describe your topic, key takeaways, and what you want to achieve..."
            className="h-32 text-base resize-none"
            maxLength={500}
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <div 
                key={ex} 
                onClick={() => setPrompt(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted cursor-pointer hover:bg-muted/80 border text-muted-foreground transition-colors"
              >
                {ex}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-semibold border-b pb-2">Content Parameters</h3>
            
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Input placeholder="e.g. Executives, Students, General Public" value={audience} onChange={e => setAudience(e.target.value)} />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Slide Count ({slideCount[0]})</Label>
              </div>
              <Slider value={slideCount} onValueChange={setSlideCount} min={6} max={20} step={1} />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">Urdu (RTL)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone & Voice</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional & Direct</SelectItem>
                  <SelectItem value="friendly">Friendly & Accessible</SelectItem>
                  <SelectItem value="academic">Academic & Detailed</SelectItem>
                  <SelectItem value="persuasive">Persuasive & Visionary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-semibold border-b pb-2">Agent Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-3 rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Writer Agent</div>
                    <div className="text-xs text-muted-foreground">Always required</div>
                  </div>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between border p-3 rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-sm">Visuals & Designer Agent</div>
                    <div className="text-xs text-muted-foreground">Layouts, colors, and images</div>
                  </div>
                </div>
                <Switch checked={visualsOn} onCheckedChange={setVisualsOn} />
              </div>

              <div className="space-y-2 pt-2">
                <Label>Critic Iteration Rounds</Label>
                <Select value={criticRounds} onValueChange={setCriticRounds}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 (Fastest)</SelectItem>
                    <SelectItem value="1">1 (Recommended)</SelectItem>
                    <SelectItem value="2">2 (Higher Quality)</SelectItem>
                    <SelectItem value="3">3 (Maximum Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-4">
                <Switch id="fail" checked={simulateFailure} onCheckedChange={setSimulateFailure} />
                <Label htmlFor="fail" className="text-muted-foreground font-normal">Simulate pipeline failure (for testing)</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>Cancel</Button>
          <Button type="submit" size="lg" disabled={!prompt.trim()}>
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Presentation
          </Button>
        </div>
      </form>
    </div>
  );
}
