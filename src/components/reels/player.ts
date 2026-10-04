import { createContext, useContext } from 'react';

/** Open a reel in the player (with sound). Provided by ReelPlayerProvider. */
export const ReelPlayerContext = createContext<(code: string, from?: HTMLElement | null) => void>(() => {});
export const useReelPlayer = () => useContext(ReelPlayerContext);

/** True when the visitor asked for less motion or less data: previews then stay as covers. */
export const quietMedia = () => {
  if (typeof window === 'undefined') return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!conn?.saveData;
};
