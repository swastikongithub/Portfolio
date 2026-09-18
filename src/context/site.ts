import { createContext, useContext } from 'react';
import type { Theme } from '../hooks/useTheme';

export interface SiteContextValue {
  theme: Theme;
  toggleTheme: () => void;
  reducedMotion: boolean;
  openPalette: () => void;
  toggleGrid: () => void;
  gridVisible: boolean;
  /** Navigate with the page-turn curtain (instant under reduced motion). */
  transitionTo: (to: string, label?: string) => void;
  /** Scroll to a section id (or 0 for top) using Lenis when active, then move focus there. */
  scrollToSection: (id: string | 0) => void;
  /** Pause/resume smooth scroll while a modal layer is open. */
  setScrollLocked: (locked: boolean) => void;
}

export const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteContext.Provider>');
  return ctx;
}
