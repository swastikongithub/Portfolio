import { createContext, useContext } from 'react';
import type { Instrument, Palette } from './Instrument';

export interface InstrumentState {
  /** The live instrument, or null while it loads or when WebGL is unavailable. */
  instrument: Instrument | null;
  /** True when WebGL could not be used; hosts render their DOM fallback instead. */
  failed: boolean;
}

export const InstrumentContext = createContext<InstrumentState>({ instrument: null, failed: false });

export const useInstrument = () => useContext(InstrumentContext);

/** The palette a host should be drawn in, read from the tokens in effect on that element. */
export function paletteOf(el: Element): Palette {
  const s = getComputedStyle(el);
  const v = (n: string) => s.getPropertyValue(n).trim();
  return { bg: v('--bg'), ink: v('--ink'), ink3: v('--ink-3'), signal: v('--signal') };
}
