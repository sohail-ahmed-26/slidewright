import React from 'react';
import { SlideCanvas } from './SlideCanvas';
import { SlideLayouts } from './SlideLayouts';
import { ErrorState } from '../ui/error-state';

interface SlideRendererProps {
  slide: {
    id: string;
    layout: string;
    data: any;
  };
  exportMode?: boolean;
}

export function SlideRenderer({ slide, exportMode }: SlideRendererProps) {
  const LayoutComponent = SlideLayouts[slide.layout];

  if (!LayoutComponent) {
    return (
      <SlideCanvas exportMode={exportMode}>
        <ErrorState title="Unknown Layout" error={`The layout "${slide.layout}" does not exist.`} />
      </SlideCanvas>
    );
  }

  return (
    <SlideCanvas exportMode={exportMode}>
      <LayoutComponent {...slide.data} />
    </SlideCanvas>
  );
}
