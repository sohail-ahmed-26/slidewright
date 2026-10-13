import React, { useEffect, useRef, useState, memo } from 'react';
import { SlideRenderer } from './SlideRenderer';

interface SlideThumbProps {
  deck: any;
  slide: any;
  width: number;
}

export const SlideThumb = memo(({ deck, slide, className }: { deck: any, slide: any, className?: string }) => {
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    
    const resizeObserver = new ResizeObserver(([entry]) => {
      const newWidth = Math.round(entry.contentRect.width);
      setWidth(prev => Math.abs(prev - newWidth) > 1 ? newWidth : prev);
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  const scale = width / 1280;

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden pointer-events-none bg-muted aspect-video w-full ${className || ''}`}
      style={{ contain: 'paint' }}
    >
      {isVisible && width > 0 && (
        <div 
          className="absolute origin-top-left shadow-sm bg-white"
          style={{
            width: '1280px',
            height: '720px',
            transform: `scale(${scale})`
          }}
        >
          <SlideRenderer slide={slide} theme={deck?.design || deck?.theme || {}} />
        </div>
      )}
    </div>
  );
});

SlideThumb.displayName = 'SlideThumb';
