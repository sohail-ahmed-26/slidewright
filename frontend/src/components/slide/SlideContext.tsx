import { createContext, useContext } from 'react';

export const SlideContext = createContext<{ exportMode: boolean }>({ exportMode: false });

export function useSlideContext() {
  return useContext(SlideContext);
}
