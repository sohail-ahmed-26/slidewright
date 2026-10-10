import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

interface SlideCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  exportMode?: boolean;
  theme?: {
    primary?: string;
    fontFamily?: string;
  };
}

export function SlideCanvas({ exportMode, theme, className, children, ...props }: SlideCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

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
        setScale(Math.min(scaleX, scaleY));
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
  };

  if (theme?.primary) {
    (customStyle as any)['--primary'] = theme.primary;
    (customStyle as any)['--ring'] = theme.primary;
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
          "bg-white relative shrink-0 text-gray-900",
          exportMode ? "" : "shadow-xl border border-gray-200",
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
