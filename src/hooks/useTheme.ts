import { useCallback, useState } from 'react';
import { flushSync } from 'react-dom';
import { prefersReducedMotion } from '../lib/motion';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'portfolio-theme';

function readTheme(): Theme {
  // index.html has already applied the resolved theme before first paint.
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable (private mode) — the choice just won't persist */
  }
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme);

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark';
    const commit = () => {
      applyTheme(next);
      flushSync(() => setTheme(next));
    };

    if (prefersReducedMotion()) {
      commit();
      return;
    }

    const doc = document as ViewTransitionDocument;
    if (typeof doc.startViewTransition === 'function') {
      // Page-turn wipe (see ::view-transition-new in index.css).
      doc.startViewTransition(commit);
      return;
    }

    const root = document.documentElement;
    root.classList.add('theme-anim');
    commit();
    window.setTimeout(() => root.classList.remove('theme-anim'), 500);
  }, []);

  return { theme, toggleTheme };
}
