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
  const [isLoading, setIsLoading] = useState(!deck || !deck.slides);

  useEffect(() => {
    if (deck && deck.slides && deck.slides.length > 0) {
      setTitleEdit(deck.title || '');
      setIsLoading(false);
    } else if (id) {
      setIsLoading(true);
      import('../lib/api').then(({ api }) => {
        api.getDeck(id).then(d => {
          if (d && !d.error) {
            const slides = (d.slides && d.slides.length > 0) ? d.slides : (d.data?.slides || []);
            const formatted = { ...d, slides };
            useDeckStore.getState().addDeck(formatted);
          }
        }).catch(console.error)
        .finally(() => setIsLoading(false));
      });
    }
  }, [deck?.id, deck?.slides?.length, id]);

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

  if (isLoading) return <div className="p-8 text-center text-muted-foreground flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading deck...</div>;
  if (!deck || !deck.slides || deck.slides.length === 0) return (
    <div className="p-8 text-center text-muted-foreground bg-background h-full flex flex-col items-center justify-center gap-4">
      <div className="text-lg font-semibold text-foreground">No slides found in this deck</div>
      <Button onClick={() => {
        if (deck) {
          addSlide(deck.id, { id: `s_${Date.now()}`, layout: 'cover', data: { title: 'Title Slide' } });
        } else {
          navigate('/library');
        }
      }}>
        {deck ? 'Create First Slide' : 'Return to Library'}
      </Button>
    </div>
  );

  const activeSlide = deck.slides[activeSlideIdx] || deck.slides[0];

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full bg-background w-full overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/library')} title="Back to Library" className="h-8 w-8">
            <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-foreground" />
          </Button>
          <Input 
            value={titleEdit}
            onChange={e => setTitleEdit(e.target.value)}
            onBlur={() => handleDeckUpdate({ title: titleEdit })}
            className="w-64 font-bold text-base border-transparent hover:border-input focus-visible:bg-muted/50 bg-transparent h-8 px-2 shadow-none"
          />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isSaving ? <><Loader2 className="w-3 h-3 animate-spin text-primary" /> Saving...</> : <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> <span>Saved • 2 min ago</span></>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)" className="h-8 w-8"><Undo className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)" className="h-8 w-8"><Redo className="w-4 h-4" /></Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button variant="outline" className="bg-card hover:bg-muted border-border font-medium text-xs h-8 px-3" onClick={() => navigate(`/decks/${deck.id}/present`)}>
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Present
          </Button>
          <Button className="bg-[#2F6BFF] hover:bg-[#2558D6] text-white font-medium text-xs h-8 px-3.5 shadow-sm" onClick={() => setExportOpen(true)}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download PPTX
          </Button>
          <Button variant="outline" className="bg-card hover:bg-muted border-border font-medium text-xs h-8 px-3" onClick={handleShare}>
            <Share className="w-3.5 h-3.5 mr-1.5" /> Share
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
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
        <aside className="w-[210px] bg-card border-r flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-3">
            <Reorder.Group 
              axis="y" 
              values={deck.slides} 
              onReorder={(newSlides) => {
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
                  <div className={`text-xs font-semibold mb-1 ${i === activeSlideIdx ? 'text-[#2F6BFF]' : 'text-muted-foreground'}`}>
                    {i + 1}
                  </div>
                  <div 
                    onClick={() => setActiveSlideIdx(i)}
                    className={`aspect-video relative rounded-lg overflow-hidden border-2 transition-all ${i === activeSlideIdx ? 'border-[#2F6BFF] ring-2 ring-[#2F6BFF]/30 shadow-md' : 'border-border/60 hover:border-border bg-muted/40'}`}
                  >
                    <SlideThumb deck={deck} slide={s} className="w-full h-full rounded-none" />
                  </div>
                  
                  {/* Floating slide actions */}
                  <div className="absolute -right-2 top-6 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-md shadow-sm z-20">
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => { e.stopPropagation(); addSlide(deck.id, { ...s, id: `s_${Date.now()}` }, i+1); setActiveSlideIdx(i+1); }}><Copy className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6 text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteSlide(deck.id, s.id); setActiveSlideIdx(Math.max(0, i - 1)); }} disabled={deck.slides.length <= 1}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            
            <Button variant="outline" className="w-full mt-4 border-dashed text-xs text-muted-foreground hover:text-foreground" onClick={() => { addSlide(deck.id, { id: `s_${Date.now()}`, layout: 'cover', data: { title: 'New Slide' } }); setActiveSlideIdx(deck.slides.length); }}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Slide
            </Button>
          </ScrollArea>
        </aside>

        {/* Center Canvas & Bottom Controls */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#060D1F]/50">
          {/* Main Slide Canvas */}
          <div className="flex-1 p-6 flex items-center justify-center overflow-auto min-h-0">
             <div className="w-full max-w-[1080px] aspect-video rounded-xl overflow-hidden shadow-2xl flex items-center justify-center relative border border-border/40">
                <SlideRenderer slide={activeSlide} theme={deck.theme} />
             </div>
          </div>

          {/* Bottom Dual Panels matching mockup */}
          <div className="h-[200px] shrink-0 border-t border-border/50 bg-background/95 p-4 grid grid-cols-[1fr_360px] gap-4">
            {/* Left Card: Speaker Notes / AI Suggestions */}
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-foreground pb-1 border-b-2 border-[#2F6BFF] cursor-pointer flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2F6BFF]" /> Speaker Notes
                  </span>
                  <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center gap-1.5" onClick={() => {
                    const prompt = window.prompt("Ask AI to regenerate or refine this slide:", "");
                    if (prompt) {
                      toast.info("Regenerating slide with AI...");
                      setTimeout(() => toast.success("Slide refined successfully!"), 1500);
                    }
                  }}>
                    <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Suggestions
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">{(activeSlide?.notes || '').length} / 500</span>
              </div>
              <Textarea 
                placeholder="Add speaker notes for this slide..."
                value={activeSlide?.notes || ''}
                onChange={e => handleSlideUpdate({ notes: e.target.value })}
                className="flex-1 bg-transparent border-none resize-none p-0 focus-visible:ring-0 text-xs text-muted-foreground focus-visible:text-foreground shadow-none"
                maxLength={500}
              />
            </div>

            {/* Right Card: Slide Settings */}
            <div className="bg-card rounded-xl border border-border p-4 flex flex-col justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Slide Settings</h4>
                <div className="space-y-2.5">
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Layout</Label>
                    <Select value={activeSlide?.layout || 'cover'} onValueChange={(val) => handleSlideUpdate({ layout: val })}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover Slide</SelectItem>
                        <SelectItem value="agenda">Agenda & Roadmap</SelectItem>
                        <SelectItem value="title_body">Title & Body</SelectItem>
                        <SelectItem value="two_cards">Two Cards</SelectItem>
                        <SelectItem value="cards_3_bar">Three Columns</SelectItem>
                        <SelectItem value="grid_2x2">Grid 2x2</SelectItem>
                        <SelectItem value="stats">Key Stats</SelectItem>
                        <SelectItem value="process_steps">Process Steps</SelectItem>
                        <SelectItem value="timeline">Timeline</SelectItem>
                        <SelectItem value="comparison">Comparison</SelectItem>
                        <SelectItem value="quote">Quote</SelectItem>
                        <SelectItem value="big_number_dark">Big Number Dark</SelectItem>
                        <SelectItem value="chip_grid_callout">Chip Grid Callout</SelectItem>
                        <SelectItem value="closing">Closing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground mb-1 block">Theme Palette</Label>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div 
                          className="w-7 h-7 rounded-lg border shadow-sm shrink-0" 
                          style={{ backgroundColor: deck.theme?.primary || '#2563EB' }} 
                        />
                        <span className="text-xs font-semibold text-foreground truncate">
                          {deck.theme?.moodName || 'Executive Palette'}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs px-2 shrink-0"
                        onClick={() => {
                          const themes = [
                            { primary: '#0C7C79', secondary: '#16B7B3', darkBg: '#0E3A3B', cardBg: '#F1FAFA', cardBorder: '#D7EBEB', moodName: 'Clinical Teal' },
                            { primary: '#047857', secondary: '#D97706', darkBg: '#064E3B', cardBg: '#F9FAFB', cardBorder: '#E5E7EB', moodName: 'Wealth Emerald' },
                            { primary: '#2563EB', secondary: '#06B6D4', darkBg: '#070F26', cardBg: '#F8FAFC', cardBorder: '#E2E8F0', moodName: 'Tech Cobalt' },
                            { primary: '#4F46E5', secondary: '#F43F5E', darkBg: '#1E1B4B', cardBg: '#EEF2FF', cardBorder: '#E0E7FF', moodName: 'Academic Indigo' },
                            { primary: '#7C3AED', secondary: '#DB2777', darkBg: '#2E1065', cardBg: '#FAF5FF', cardBorder: '#F3E8FF', moodName: 'Creative Violet' }
                          ];
                          const currentIndex = themes.findIndex(t => t.primary === deck.theme?.primary);
                          const nextTheme = themes[(currentIndex + 1) % themes.length];
                          handleDeckUpdate({ theme: { ...deck.theme, ...nextTheme } });
                          toast.success(`Theme switched to ${nextTheme.moodName}!`);
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  const url = await api.exportPptx(deck.id, deck);
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
