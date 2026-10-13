import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { SlideTheme } from './SlideContext';

interface SlideCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  exportMode?: boolean;
  layout?: string;
  theme?: SlideTheme;
}

export function SlideCanvas({ exportMode, layout, theme, className, children, ...props }: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const isDarkLayout = ['cover', 'closing', 'big_number_dark'].includes(layout || '');

  useEffect(() => {
    if (exportMode) {
      setScale(1);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const scaleX = width / 1280;
        const scaleY = height / 720;
        const newScale = Math.min(scaleX, scaleY);
        setScale(prev => Math.abs(prev - newScale) > 0.001 ? newScale : prev);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [exportMode]);

  const customStyle: React.CSSProperties = {
    width: 1280,
    height: 720,
    transform: `scale(${scale})`,
    transformOrigin: 'center center',
    backgroundColor: isDarkLayout ? (theme?.darkBg || '#070F26') : (theme?.lightBg || '#FFFFFF'),
    color: isDarkLayout ? '#FFFFFF' : '#0F172A',
  };

  if (theme?.primary) {
    (customStyle as any)['--primary'] = theme.primary;
    (customStyle as any)['--ring'] = theme.primary;
  }
  if (theme?.secondary) {
    (customStyle as any)['--secondary'] = theme.secondary;
  }
  if (theme?.fontFamily) {
    customStyle.fontFamily = theme.fontFamily;
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("w-full h-full flex items-center justify-center overflow-hidden", exportMode && "export-mode")}
      style={exportMode ? { width: 1280, height: 720 } : {}}
    >
      <div 
        className={cn(
          "relative shrink-0 overflow-hidden transition-colors",
          isDarkLayout ? "text-white" : "text-slate-900",
          exportMode ? "" : "shadow-2xl rounded-xl border",
          isDarkLayout ? "border-white/10" : "border-slate-200/80",
          className
        )}
        style={customStyle}
        data-pptx="rect"
        {...props}
      >
        {children}
      </div>
    </div>
  );
}
