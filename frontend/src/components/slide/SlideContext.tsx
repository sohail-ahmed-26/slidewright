import { createContext, useContext } from 'react';

export interface SlideTheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  cardBg?: string;
  cardBorder?: string;
  darkBg?: string;
  lightBg?: string;
  fontFamily?: string;
  fontHeading?: string;
  moodName?: string;
}

export interface SlideContextValue {
  exportMode: boolean;
  theme?: SlideTheme;
  layout?: string;
  isDark?: boolean;
}

export const SlideContext = createContext<SlideContextValue>({ exportMode: false, isDark: false });

export function useSlideContext() {
  return useContext(SlideContext);
}
