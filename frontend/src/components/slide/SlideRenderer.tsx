import React from 'react';
import { SlideCanvas } from './SlideCanvas';
import { SlideLayouts } from './SlideLayouts';
import { ErrorState } from '../ui/error-state';
import { SlideContext } from './SlideContext';
import { MotionConfig } from 'framer-motion';

interface SlideRendererProps {
  slide: {
    id: string;
    layout: string;
    data: any;
  };
  theme?: {
    primary?: string;
    fontFamily?: string;
  };
  exportMode?: boolean;
}

export function SlideRenderer({ slide, theme, exportMode = false }: SlideRendererProps) {
  const LayoutComponent = SlideLayouts[slide.layout];

  if (!LayoutComponent) {
    return (
      <SlideContext.Provider value={{ exportMode }}>
        <MotionConfig reducedMotion="user">
          <SlideCanvas exportMode={exportMode} theme={theme}>
            <ErrorState title="Unknown Layout" error={`The layout "${slide.layout}" does not exist.`} />
          </SlideCanvas>
        </MotionConfig>
      </SlideContext.Provider>
    );
  }

  return (
    <SlideContext.Provider value={{ exportMode }}>
      <MotionConfig reducedMotion="user">
        <SlideCanvas exportMode={exportMode} theme={theme}>
          <LayoutComponent {...slide.data} />
        </SlideCanvas>
      </MotionConfig>
    </SlideContext.Provider>
  );
}
