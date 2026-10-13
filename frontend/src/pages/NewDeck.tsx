import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStore } from '../store/useJobStore';
import { useAgentStore } from '../store/useAgentStore';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Wand2, Bot, Sparkles, Code, Palette, Image as ImageIcon, Search } from 'lucide-react';

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
  
  const [designerOn, setDesignerOn] = useState(true);
  const [visualsOn, setVisualsOn] = useState(true);
  const [criticOn, setCriticOn] = useState(true);
  
  const [criticRounds, setCriticRounds] = useState([1]);
  const [designMode, setDesignMode] = useState('auto');
  const [imagesOn, setImagesOn] = useState(true);
  const [diagramsOn, setDiagramsOn] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsSubmitting(true);
    try {
      const writerPrompt = useAgentStore.getState().agents.writer?.systemPrompt;
      const jobId = await createJob({
        prompt,
        audience,
        language,
        slideCount: slideCount[0],
        tone,
        writerPrompt,
        designerOn,
        designMode,
        visualsOn,
        imagesOn,
        diagramsOn,
        criticOn,
        criticRounds: criticRounds[0]
      }, false);
      
      navigate(`/runs/${jobId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-background flex justify-center">
      <div className="w-full max-w-[1200px] flex flex-col h-full relative">
        <div className="p-8 pb-8 flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Turn ideas into impactful presentations</span>
          <h1 className="text-4xl font-bold tracking-tight">Create <span className="text-primary">Presentation</span></h1>
          <p className="text-muted-foreground text-sm">Configure your content and AI agent pipeline.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 p-8 pt-0 overflow-auto">
            {/* Left Column: Content */}
            <div className="space-y-8">
              <div className="bg-card rounded-xl p-6 border space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold text-foreground">What is this presentation about?</Label>
                  <span className="text-xs text-muted-foreground">{prompt.length} / 500</span>
                </div>
                <Textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe your topic, key takeaways, and what you want to achieve..."
                  className="h-32 text-sm resize-none bg-background border-border/50 focus-visible:ring-primary shadow-inner"
                  maxLength={500}
                />
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-muted-foreground mr-2">Try an example:</span>
                  {EXAMPLES.map(ex => (
                    <div 
                      key={ex} 
                      onClick={() => setPrompt(ex)}
                      className="text-xs px-3 py-1.5 rounded-full bg-secondary cursor-pointer hover:bg-secondary/80 border text-secondary-foreground transition-colors"
                    >
                      {ex}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4 border shadow-sm space-y-2">
                  <Label className="text-sm font-medium text-foreground">Target Audience</Label>
                  <Input 
                    placeholder="e.g. Executives, Students" 
                    value={audience} 
                    onChange={e => setAudience(e.target.value)}
                    className="bg-background text-sm h-9" 
                  />
                </div>
                <div className="bg-card rounded-xl p-4 border shadow-sm space-y-2">
                  <Label className="text-sm font-medium text-foreground">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-background text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ur" dir="rtl">اردو (Urdu)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="ar" dir="rtl">العربية (Arabic)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl p-4 border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">Slide Count</Label>
                    <span className="text-xs font-medium text-muted-foreground">{slideCount[0]} slides</span>
                  </div>
                  <Slider value={slideCount} onValueChange={setSlideCount} min={6} max={20} step={1} className="py-2" />
                </div>
                <div className="bg-card rounded-xl p-4 border shadow-sm space-y-2">
                  <Label className="text-sm font-medium text-foreground">Tone & Voice</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-background text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional & Direct</SelectItem>
                      <SelectItem value="friendly">Friendly & Accessible</SelectItem>
                      <SelectItem value="academic">Academic & Detailed</SelectItem>
                      <SelectItem value="persuasive">Persuasive & Visionary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column: Agent Pipeline */}
            <div className="bg-card rounded-xl border p-6 flex flex-col gap-6 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between z-10 relative">
                <h3 className="font-semibold text-lg text-foreground">Agent Pipeline</h3>
                <Select defaultValue="default">
                  <SelectTrigger className="w-[120px] h-8 text-xs bg-background">
                    <SelectValue placeholder="Presets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="fast">Fast (No Critic)</SelectItem>
                    <SelectItem value="max">Max Quality</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-4 relative z-10 before:absolute before:inset-y-4 before:left-4 before:w-px before:bg-border">
                
                {/* Orchestrator */}
                <div className="flex gap-4 relative items-center">
                  <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground z-10">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Orchestrator (Code)</div>
                </div>

                {/* Writer */}
                <div className="flex gap-4 relative">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-2 z-10 shadow-[0_0_15px_rgba(47,107,255,0.4)]">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 bg-background border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">Writer Agent</div>
                      <Switch checked disabled className="scale-75" />
                    </div>
                    <Select defaultValue="gpt-4o">
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">
                          GPT-4o <Badge variant="secondary" className="ml-2 text-[10px] bg-blue-500/10 text-blue-600">Structured</Badge>
                        </SelectItem>
                        <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Designer */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-2 z-10 transition-colors ${designerOn ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(47,107,255,0.4)]' : 'bg-secondary text-muted-foreground border'}`}>
                    <Palette className="w-4 h-4" />
                  </div>
                  <div className={`flex-1 bg-background border rounded-lg p-3 space-y-3 transition-opacity ${!designerOn && 'opacity-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">Designer Agent</div>
                      <Switch checked={designerOn} onCheckedChange={setDesignerOn} className="scale-75" />
                    </div>
                    {designerOn && (
                      <div className="space-y-2">
                        <Select defaultValue="claude-3-5-sonnet">
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={designMode} onValueChange={setDesignMode}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Design Mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto (Context aware)</SelectItem>
                            <SelectItem value="mood">Mood + Hue matching</SelectItem>
                            <SelectItem value="reference">Match reference style</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Visuals */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-2 z-10 transition-colors ${visualsOn ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(47,107,255,0.4)]' : 'bg-secondary text-muted-foreground border'}`}>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className={`flex-1 bg-background border rounded-lg p-3 space-y-3 transition-opacity ${!visualsOn && 'opacity-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">Visuals Agent</div>
                      <Switch checked={visualsOn} onCheckedChange={setVisualsOn} className="scale-75" />
                    </div>
                    {visualsOn && (
                      <div className="space-y-2">
                        <Select defaultValue="dall-e-3">
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dall-e-3">
                              DALL-E 3 <Badge variant="secondary" className="ml-2 text-[10px] bg-purple-500/10 text-purple-600">Image</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-4 text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Switch checked={imagesOn} onCheckedChange={setImagesOn} className="scale-75" /> Images
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <Switch checked={diagramsOn} onCheckedChange={setDiagramsOn} className="scale-75" /> Diagrams
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Critic */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-2 z-10 transition-colors ${criticOn ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(47,107,255,0.4)]' : 'bg-secondary text-muted-foreground border'}`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <div className={`flex-1 bg-background border rounded-lg p-3 space-y-3 transition-opacity ${!criticOn && 'opacity-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm text-foreground">Critic Agent</div>
                      <Switch checked={criticOn} onCheckedChange={setCriticOn} className="scale-75" />
                    </div>
                    {criticOn && (
                      <div className="space-y-2">
                        <Select defaultValue="gpt-4o">
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4o">
                              GPT-4o <Badge variant="secondary" className="ml-2 text-[10px] bg-green-500/10 text-green-600">Vision</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="space-y-2 pt-1 px-1">
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>Critic Rounds</span>
                            <span className="font-medium">{criticRounds[0]}</span>
                          </div>
                          <Slider value={criticRounds} onValueChange={setCriticRounds} min={1} max={3} step={1} className="py-2" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Export */}
                <div className="flex gap-4 relative items-center">
                  <div className="w-8 h-8 rounded-full bg-background border flex items-center justify-center shrink-0 text-muted-foreground z-10">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Export (Code)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t p-6 flex justify-between items-center z-50">
            <Button type="button" variant="ghost" onClick={() => navigate('/library')} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" size="lg" className="px-8 bg-gradient-to-r from-[#3B7BFF] to-[#2459E6] hover:from-[#1F55E0] hover:to-[#1F55E0] shadow-[0_4px_14px_0_rgba(47,107,255,0.39)] hover:shadow-[0_6px_20px_rgba(47,107,255,0.23)] border-none text-white font-medium transition-all" disabled={!prompt.trim() || isSubmitting}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isSubmitting ? "Starting..." : prompt.trim() ? "Generate Presentation" : "Enter a topic to begin"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
