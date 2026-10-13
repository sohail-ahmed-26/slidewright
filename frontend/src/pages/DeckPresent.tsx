import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/useDeckStore';
import { SlideRenderer } from '../components/slide/SlideRenderer';
import { SlideThumb } from '../components/slide/SlideThumb';
import { Button } from '../components/ui/button';
import { Maximize, Minimize, ChevronLeft, ChevronRight, MousePointer2, FileText, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function DeckPresent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deck = useDeckStore(s => s.decks.find(d => d.id === id));
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [laserOn, setLaserOn] = useState(false);
  const [notesOn, setNotesOn] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const filmstripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        setCurrentSlideIndex(i => Math.min(i + 1, (deck?.slides?.length || 1) - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentSlideIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Escape') {
        if (!document.fullscreenElement) {
          navigate(`/decks/${id}`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, id, navigate]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (filmstripRef.current) {
      const activeThumb = filmstripRef.current.children[currentSlideIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [currentSlideIndex]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserOn) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  if (!deck || !deck.slides) return <div className="p-8 text-center text-red-500">Deck not found or no slides.</div>;

  const slide = deck.slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / (deck.slides?.length || 1)) * 100;

  return (
    <div 
      ref={containerRef} 
      className={cn("w-screen h-screen bg-black flex flex-col relative group", laserOn ? "cursor-none" : "")}
      onMouseMove={handleMouseMove}
    >
      {/* Laser Pointer */}
      {laserOn && (
        <div 
          className="w-4 h-4 rounded-full bg-red-500 absolute pointer-events-none z-[100] shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          style={{ left: laserPos.x - 8, top: laserPos.y - 8 }}
        />
      )}

      {/* Main Slide Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-4 pb-32">
        <div className="w-full h-full max-w-[1280px] max-h-[720px] aspect-video relative">
          <SlideRenderer key={slide.id} slide={slide} theme={deck.theme} exportMode={false} />
        </div>
      </div>

      {/* Presenter Notes Overlay */}
      {notesOn && (
        <div className="absolute top-4 right-4 w-96 bg-card/95 backdrop-blur-md text-card-foreground border p-6 rounded-xl shadow-2xl z-40 animate-in slide-in-from-right-4">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Presenter Notes</h3>
          <div className="space-y-4 text-sm leading-relaxed">
            <p>Slide {currentSlideIndex + 1}: {slide.data.title || "Untitled"}</p>
            <div className="p-3 bg-muted rounded-lg border">
              This is an AI generated placeholder note. In a real scenario, the Writer agent would embed presenter notes into the slide data.
            </div>
          </div>
        </div>
      )}

      {/* Filmstrip & Controls Overlay (hover to show) */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-50 pb-4 bg-gradient-to-t from-black/80 to-transparent">
        
        {/* Filmstrip */}
        <div 
          ref={filmstripRef}
          className="flex gap-4 px-8 py-4 w-full overflow-x-auto no-scrollbar scroll-smooth items-center min-h-[140px]"
        >
          {deck.slides.map((s, idx) => (
            <div 
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={cn(
                "relative cursor-pointer transition-all shrink-0 rounded-lg overflow-hidden border-2",
                idx === currentSlideIndex ? "border-primary scale-110 shadow-[0_0_15px_rgba(22,183,179,0.5)] z-10" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
              )}
              style={{ width: '160px', height: '90px' }}
            >
              <SlideThumb slide={s} theme={deck.theme} />
              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 text-white px-6 py-2 rounded-full mt-2 shadow-2xl">
          <span className="text-sm font-medium mr-4 w-16 text-center font-mono text-gray-300">{currentSlideIndex + 1} / {deck.slides?.length || 0}</span>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setCurrentSlideIndex(i => Math.max(i - 1, 0))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setCurrentSlideIndex(i => Math.min(i + 1, (deck.slides?.length || 1) - 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <div className="w-px h-6 bg-gray-700 mx-2"></div>
          
          <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-white hover:bg-white/20", laserOn && "bg-red-500/20 text-red-400")} onClick={() => setLaserOn(!laserOn)}>
            <MousePointer2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-white hover:bg-white/20", notesOn && "bg-blue-500/20 text-blue-400")} onClick={() => setNotesOn(!notesOn)}>
            <FileText className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/20 hover:text-red-300 ml-2" onClick={() => { document.exitFullscreen().catch(()=>{}); navigate(`/decks/${id}`); }}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Progress Bar (Always visible at the very bottom edge) */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-800/50 z-[60]">
        <div className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_rgba(22,183,179,0.8)]" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
}
