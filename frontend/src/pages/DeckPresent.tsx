import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FIXTURES } from '@slidewright/shared/src/fixtures';
import { SlideRenderer } from '../components/slide/SlideRenderer';
import { Button } from '../components/ui/button';
import { Maximize, Minimize, ChevronLeft, ChevronRight, MousePointer2, FileText, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function DeckPresent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [laserOn, setLaserOn] = useState(false);
  const [notesOn, setNotesOn] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // In real app, fetch from mock API. Using FIXTURES for now.
  const { data: deck, isLoading } = useQuery({
    queryKey: ['deck', id],
    queryFn: async () => {
      return FIXTURES.decks.find(d => d.id === id);
    }
  });

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

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!deck || !deck.slides) return <div className="p-8 text-center text-red-500">Deck not found or no slides.</div>;

  const slide = deck.slides[currentSlideIndex];
  const progress = ((currentSlideIndex + 1) / deck.slides.length) * 100;

  return (
    <div 
      ref={containerRef} 
      className={cn("w-screen h-screen bg-black flex flex-col relative", laserOn ? "cursor-none" : "")}
      onMouseMove={handleMouseMove}
    >
      {/* Laser Pointer */}
      {laserOn && (
        <div 
          className="w-4 h-4 rounded-full bg-red-500 absolute pointer-events-none z-50 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          style={{ left: laserPos.x - 8, top: laserPos.y - 8 }}
        />
      )}

      {/* Main Slide Area */}
      <div className="flex-1 overflow-hidden relative">
        <SlideRenderer key={slide.id} slide={slide} theme={deck.theme} exportMode={false} />
      </div>

      {/* Presenter Notes Overlay */}
      {notesOn && (
        <div className="absolute top-4 right-4 w-80 bg-white/90 backdrop-blur-md text-black p-4 rounded-xl shadow-2xl z-40">
          <h3 className="font-bold text-lg mb-2">Presenter Notes</h3>
          <p className="text-sm text-gray-700">Slide {currentSlideIndex + 1} notes... (Placeholder: Explain {slide.layout} concept here. Don't read the text exactly as written, but use it as a talking point.)</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 z-50">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Controls Overlay (hover to show) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full opacity-0 hover:opacity-100 transition-opacity z-50">
        <span className="text-sm font-medium mr-4 w-16 text-center">{currentSlideIndex + 1} / {deck.slides.length}</span>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setCurrentSlideIndex(i => Math.max(i - 1, 0))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setCurrentSlideIndex(i => Math.min(i + 1, deck.slides.length - 1))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        
        <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-white hover:bg-white/20", laserOn && "bg-red-500/20 text-red-400")} onClick={() => setLaserOn(!laserOn)}>
          <MousePointer2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-white hover:bg-white/20", notesOn && "bg-blue-500/20 text-blue-400")} onClick={() => setNotesOn(!notesOn)}>
          <FileText className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 ml-2" onClick={() => navigate(`/decks/${id}`)}>
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
