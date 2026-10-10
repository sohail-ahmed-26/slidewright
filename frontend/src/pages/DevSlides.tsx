import React, { useState } from 'react';
import { FIXTURES } from '@slidewright/shared/src/fixtures';
import { SlideRenderer } from '../components/slide/SlideRenderer';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function DevSlides() {
  const deck = FIXTURES.decks[0];
  const slides = deck.slides || [];
  const [currentIdx, setCurrentIdx] = useState(0);

  if (slides.length === 0) {
    return <div className="p-8">No slides found in fixture.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <div className="p-4 border-b bg-background flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold">Slide Gallery</h1>
          <p className="text-sm text-muted-foreground">{deck.title} - Slide {currentIdx + 1} of {slides.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentIdx(i => Math.min(slides.length - 1, i + 1))} disabled={currentIdx === slides.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-8 flex flex-col items-center gap-8">
        {/* Render a nice container for the slide to show how it scales */}
        <Card className="w-full max-w-5xl aspect-video bg-gray-100/50 p-4 flex items-center justify-center border-dashed">
          <div className="w-full h-full relative">
            <SlideRenderer slide={slides[currentIdx]} />
          </div>
        </Card>

        {/* Thumbnail gallery */}
        <div className="grid grid-cols-4 gap-4 w-full max-w-5xl">
          {slides.map((s, i) => (
            <button 
              key={s.id} 
              onClick={() => setCurrentIdx(i)}
              className={`aspect-video relative rounded-lg overflow-hidden border-2 transition-all ${i === currentIdx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'}`}
            >
              <div className="w-full h-full pointer-events-none">
                <SlideRenderer slide={s} />
              </div>
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                {s.layout}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
