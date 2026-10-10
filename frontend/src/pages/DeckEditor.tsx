import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/useDeckStore';
import { SlideRenderer } from '../components/slide/SlideRenderer';
import { SlideThumb } from '../components/slide/SlideThumb';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Reorder } from 'framer-motion';
import { 
  Play, Download, Share, MoreVertical, Plus, Copy, Trash2, 
  ChevronLeft, ChevronRight, ZoomIn, Undo, Redo, CheckCircle2, Loader2, Link,
  LayoutTemplate, Image as ImageIcon, FileText, Type
} from 'lucide-react';
import { ScrollArea } from '../components/ui/scroll-area';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function DeckEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { decks, updateDeck, reorderSlides, addSlide, deleteSlide, updateSlide, undo, redo, history, future } = useDeckStore();
  
  const deck = decks.find(d => d.id === id);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [titleEdit, setTitleEdit] = useState('');

  useEffect(() => {
    if (deck) setTitleEdit(deck.title);
  }, [deck?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if inside an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo(); else undo();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setActiveSlideIdx(i => Math.min(i + 1, (deck?.slides.length || 1) - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setActiveSlideIdx(i => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck?.slides.length, undo, redo]);

  // Autosave simulation
  const handleDeckUpdate = (updates: Partial<typeof deck>) => {
    if (!deck) return;
    setIsSaving(true);
    updateDeck(deck.id, updates);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleSlideUpdate = (updates: any) => {
    if (!deck || !activeSlide) return;
    setIsSaving(true);
    updateSlide(deck.id, activeSlide.id, updates);
    setTimeout(() => setIsSaving(false), 800);
  };

  if (!deck) return <div className="p-8 text-center text-red-500">Deck not found</div>;

  const activeSlide = deck.slides[activeSlideIdx] || deck.slides[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full bg-muted/10 w-full overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Input 
            value={titleEdit}
            onChange={e => setTitleEdit(e.target.value)}
            onBlur={() => handleDeckUpdate({ title: titleEdit })}
            className="w-64 font-bold text-lg border-transparent hover:border-input focus-visible:bg-muted/50 bg-transparent h-9 px-2 shadow-none"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isSaving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : <><CheckCircle2 className="w-3 h-3 text-green-500" /> Saved</>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"><Undo className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)"><Redo className="w-4 h-4" /></Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button variant="secondary" onClick={() => navigate(`/decks/${deck.id}/present`)}><Play className="w-4 h-4 mr-2" /> Present</Button>
          <Button onClick={() => setExportOpen(true)}><Download className="w-4 h-4 mr-2" /> Download PPTX</Button>
          <Button variant="outline" size="icon" onClick={handleShare}><Share className="w-4 h-4" /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDeckUpdate({ status: 'failed' })}>Mark Failed (Test)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteDeck(deck.id)}>Delete Deck</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Rail - Thumbnails */}
        <aside className="w-[200px] bg-card border-r flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-3">
            <Reorder.Group 
              axis="y" 
              values={deck.slides} 
              onReorder={(newSlides) => {
                 // naive reorder mapping
                 const oldIdx = deck.slides.indexOf(activeSlide);
                 const newIdx = newSlides.indexOf(activeSlide);
                 if(oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                    reorderSlides(deck.id, oldIdx, newIdx);
                    setActiveSlideIdx(newIdx);
                 }
              }}
              className="flex flex-col gap-3"
            >
              {deck.slides.map((s, i) => (
                <Reorder.Item key={s.id} value={s} className="relative group cursor-pointer outline-none">
                  <div 
                    className={`text-xs text-muted-foreground font-medium mb-1 ${i === activeSlideIdx ? 'text-primary' : ''}`}
                  >
                    {i + 1}
                  </div>
                  <div 
                    onClick={() => setActiveSlideIdx(i)}
                    className={`aspect-video relative rounded-md overflow-hidden border-2 transition-colors ${i === activeSlideIdx ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-transparent hover:border-border bg-muted/50'}`}
                  >
                    <SlideThumb deck={deck} slide={s} className="w-full h-full rounded-none" />
                  </div>
                  
                  {/* Floating slide actions */}
                  <div className="absolute -right-2 top-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md shadow-sm">
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => { e.stopPropagation(); addSlide(deck.id, { ...s, id: `s_${Date.now()}` }, i+1); setActiveSlideIdx(i+1); }}><Copy className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteSlide(deck.id, s.id); setActiveSlideIdx(Math.max(0, i - 1)); }} disabled={deck.slides.length <= 1}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            <Button variant="outline" className="w-full mt-4 border-dashed" onClick={() => { addSlide(deck.id, { id: `s_${Date.now()}`, layout: 'cover', data: { title: 'New Slide' } }); setActiveSlideIdx(deck.slides.length); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Slide
            </Button>
          </ScrollArea>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F6F9F9] dark:bg-[#0A1413]">
          <div className="flex-1 p-[32px] flex items-center justify-center overflow-auto relative">
             <div className="w-full h-full max-w-[1280px] max-h-[720px] aspect-video rounded-xl overflow-hidden shadow-2xl flex items-center justify-center relative">
                <SlideRenderer slide={activeSlide} theme={deck.theme} />
             </div>
          </div>
          
          {/* Floating Canvas Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 h-12 bg-card/90 backdrop-blur-md border shadow-lg rounded-full flex items-center justify-center gap-4 px-6">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActiveSlideIdx(i => Math.max(0, i-1))} disabled={activeSlideIdx === 0}><ChevronLeft className="w-4 h-4" /></Button>
             <span className="text-sm font-medium w-16 text-center">Slide {activeSlideIdx + 1}</span>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActiveSlideIdx(i => Math.min(deck.slides.length - 1, i+1))} disabled={activeSlideIdx === deck.slides.length - 1}><ChevronRight className="w-4 h-4" /></Button>
             <div className="w-px h-4 bg-border mx-2" />
             <Button variant="ghost" size="sm" className="text-xs text-muted-foreground rounded-full h-8"><ZoomIn className="w-3 h-3 mr-2" /> Fit to screen</Button>
          </div>
        </main>

        {/* Right Panel - Inspector */}
        <aside className="w-[320px] bg-card border-l flex flex-col shrink-0">
          <Tabs defaultValue="slide" className="w-full flex flex-col h-full">
            <TabsList className="w-full grid grid-cols-4 rounded-none border-b bg-transparent h-12 p-0">
              <TabsTrigger value="slide" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Slide</TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Design</TabsTrigger>
              <TabsTrigger value="quality" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Quality</TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Agents</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              {/* SLIDE TAB */}
              <TabsContent value="slide" className="p-4 space-y-6 mt-0">
                <div className="space-y-2">
                  <Label>Layout Type</Label>
                  <Select value={activeSlide.layout} onValueChange={(val) => handleSlideUpdate({ layout: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="title_body">Title & Body</SelectItem>
                      <SelectItem value="chip_grid_callout">Chip Grid</SelectItem>
                      <SelectItem value="grid_2x2">Grid 2x2</SelectItem>
                      <SelectItem value="stats">Stats</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Slide Content</Label>
                  
                  {activeSlide.data?.title !== undefined && (
                     <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground flex justify-between">Title <span className={activeSlide.data.title.split(' ').length > 8 ? 'text-red-500' : ''}>{activeSlide.data.title.split(' ').length}/8 words</span></Label>
                       <Input value={activeSlide.data.title} onChange={e => handleSlideUpdate({ data: { ...activeSlide.data, title: e.target.value }})} />
                     </div>
                  )}

                  {activeSlide.data?.subtitle !== undefined && (
                     <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Subtitle</Label>
                       <Textarea className="resize-none" rows={2} value={activeSlide.data.subtitle} onChange={e => handleSlideUpdate({ data: { ...activeSlide.data, subtitle: e.target.value }})} />
                     </div>
                  )}
                  
                  {activeSlide.data?.text !== undefined && (
                     <div className="space-y-1">
                       <Label className="text-xs text-muted-foreground">Body Text</Label>
                       <Textarea className="resize-none" rows={4} value={activeSlide.data.text} onChange={e => handleSlideUpdate({ data: { ...activeSlide.data, text: e.target.value }})} />
                     </div>
                  )}
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Label>AI Generation</Label>
                  <Textarea placeholder="Instruct the AI to rewrite or redesign this slide..." className="text-sm resize-none" rows={3} />
                  <Button className="w-full"><Sparkles className="w-4 h-4 mr-2" /> Regenerate Slide</Button>
                </div>
              </TabsContent>

              {/* DESIGN TAB */}
              <TabsContent value="design" className="p-4 space-y-6 mt-0">
                <div className="space-y-4">
                  <Label>Brand Color Hue ({(deck as any).theme?.primary || '173 80% 40%'})</Label>
                  <Slider defaultValue={[173]} max={360} step={1} onValueChange={v => handleDeckUpdate({ theme: { ...(deck as any).theme, primary: `${v[0]} 80% 50%` }})} />
                </div>
                <div className="space-y-2">
                  <Label>Typography Pair</Label>
                  <Select value={(deck as any).theme?.fontFamily} onValueChange={v => handleDeckUpdate({ theme: { ...(deck as any).theme, fontFamily: v }})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter (Modern)</SelectItem>
                      <SelectItem value="Arial, sans-serif">Arial (Corporate)</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia (Classic)</SelectItem>
                      <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet (Playful)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full">Reset to Defaults</Button>
              </TabsContent>

              {/* QUALITY TAB */}
              <TabsContent value="quality" className="p-4 mt-0 space-y-4">
                <div className="bg-amber-500/10 border-amber-500/20 border p-3 rounded-md">
                  <h4 className="font-semibold text-sm text-amber-600 mb-1 flex items-center"><Type className="w-4 h-4 mr-1"/> Text Overflow Risk</h4>
                  <p className="text-xs text-amber-600/80">The body text on this slide is close to the bottom margin limit.</p>
                </div>
                <div className="bg-green-500/10 border-green-500/20 border p-3 rounded-md">
                  <h4 className="font-semibold text-sm text-green-600 mb-1 flex items-center"><CheckCircle2 className="w-4 h-4 mr-1"/> Contrast Score: AAA</h4>
                  <p className="text-xs text-green-600/80">All elements meet WCAG contrast guidelines.</p>
                </div>
              </TabsContent>

              {/* AGENTS TAB */}
              <TabsContent value="agents" className="p-4 mt-0 space-y-4">
                <div className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Writer Agent</Badge>
                    <span className="text-xs text-muted-foreground">2 mins ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Generated outline and drafted 12 slides. Used 4,500 tokens.</p>
                </div>
                <div className="border rounded-md p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">Designer Agent</Badge>
                    <span className="text-xs text-muted-foreground">1 min ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Assigned layouts and generated color palette. Used 2,100 tokens.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </aside>
      </div>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download PPTX</DialogTitle>
            <DialogDescription>
              Export your presentation as a fully editable PowerPoint file.
              <br/><br/>
              <em>Note: Animations shown in the browser preview are for presentation purposes only and are not currently exported to the PPTX file.</em>
            </DialogDescription>
          </DialogHeader>
          
          {exportError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
              {exportError}
            </div>
          )}
          
          <div className="flex justify-end pt-4 gap-2">
            <Button variant="outline" onClick={() => setExportOpen(false)} disabled={isExporting}>Cancel</Button>
            <Button 
              disabled={isExporting} 
              onClick={async () => {
                try {
                  setIsExporting(true);
                  setExportError('');
                  const { api } = await import('../lib/api');
                  const url = await api.exportPptx(deck.id);
                  toast.success("PPTX Export complete!");
                  window.location.href = url; // trigger download
                  setExportOpen(false);
                } catch (e: any) {
                  setExportError(e.message || "Failed to export PPTX");
                } finally {
                  setIsExporting(false);
                }
              }}
            >
              {isExporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isExporting ? 'Exporting...' : 'Download'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quick Sparkles missing icon import workaround
function Sparkles(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg> }
