import React from 'react';
import { SlideCanvas } from './SlideCanvas';
import { SlideLayouts } from './SlideLayouts';
import { ErrorState } from '../ui/error-state';
import { SlideContext, SlideTheme } from './SlideContext';
import { MotionConfig } from 'framer-motion';

interface SlideRendererProps {
  slide: {
    id: string;
    layout: string;
    data: any;
  };
  theme?: SlideTheme;
  exportMode?: boolean;
}

export function SlideRenderer({ slide, theme, exportMode = false }: SlideRendererProps) {
  const LayoutComponent = SlideLayouts[slide.layout] || SlideLayouts.title_body;
  const isDark = ['cover', 'closing', 'big_number_dark'].includes(slide.layout || '');

  return (
    <SlideContext.Provider value={{ exportMode, theme, layout: slide.layout, isDark }}>
      <MotionConfig reducedMotion="user">
        <SlideCanvas exportMode={exportMode} theme={theme} layout={slide.layout}>
          <LayoutComponent {...slide.data} />
        </SlideCanvas>
      </MotionConfig>
    </SlideContext.Provider>
  );
}
