import { createContext, useContext } from 'react';
import type { Theme } from '../hooks/useTheme';

export interface SiteContextValue {
  theme: Theme;
  /** Flip the theme; an origin point makes the wipe start from the control that was pressed. */
  toggleTheme: (origin?: { x: number; y: number }) => void;
  reducedMotion: boolean;
  openPalette: () => void;
  /** Navigate with the lane transition (instant under reduced motion). */
  transitionTo: (to: string) => void;
  /** Scroll to a section id (or 0 for top) using Lenis when active, then move focus there. */
  scrollToSection: (id: string | 0) => void;
  /** Scroll the page to an absolute position (smoothly when Lenis is active). */
  scrollToY: (y: number) => void;
  /** Pause/resume smooth scroll while a modal layer is open. */
  setScrollLocked: (locked: boolean) => void;
}

export const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteContext.Provider>');
  return ctx;
}
