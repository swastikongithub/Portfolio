/**
 * The cold open plays once per session. While it plays, heavy work (loading
 * Three.js and building the instrument) waits, so the film runs on a quiet main
 * thread; the intro releases it shortly before it hands off to the hero.
 */
const KEY = 'portfolio-intro';

export const introPending = () => {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    return sessionStorage.getItem(KEY) !== '1';
  } catch {
    return false;
  }
};

export const markIntroSeen = () => {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    /* storage unavailable: the intro simply plays again next visit */
  }
};

let released = false;
const waiters = new Set<() => void>();

/** Let deferred work start (idempotent). */
export const releaseHeavyWork = () => {
  if (released) return;
  released = true;
  waiters.forEach((fn) => fn());
  waiters.clear();
};

/** Run `fn` now, or once the cold open releases heavy work. Returns a canceller. */
export const afterColdOpen = (fn: () => void) => {
  if (released || !introPending()) {
    fn();
    return () => {};
  }
  waiters.add(fn);
  return () => void waiters.delete(fn);
};
