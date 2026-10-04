import React, { useEffect, useState } from 'react';
import type { Instrument } from './Instrument';
import { InstrumentContext, paletteOf } from './context';
import { afterColdOpen } from '../coldOpen';

/**
 * Creates the one instrument for the page. Three.js is loaded as a separate
 * chunk after first paint (and after the cold open, if one is playing), so the
 * headline and the content never wait for it.
 * If WebGL is unavailable, hosts are told to show their DOM fallbacks.
 */
export const InstrumentProvider: React.FC<{ reducedMotion: boolean; children: React.ReactNode }> = ({ reducedMotion, children }) => {
  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let made: Instrument | null = null;
    const load = () =>
      import('./Instrument')
        .then(({ Instrument: Ctor, webglAvailable }) => {
          if (disposed) return;
          if (!webglAvailable()) {
            setFailed(true);
            return;
          }
          try {
            made = new Ctor(paletteOf(document.documentElement), {}, { reduced: reducedMotion });
            setInstrument(made);
          } catch {
            setFailed(true);
          }
        })
        .catch(() => !disposed && setFailed(true));
    const cancel = afterColdOpen(() => void load());
    return () => {
      cancel();
      disposed = true;
      made?.dispose();
      setInstrument(null);
    };
  }, [reducedMotion]);

  // Resume after the tab comes back.
  useEffect(() => {
    if (!instrument) return;
    const onVis = () => !document.hidden && instrument.resume();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [instrument]);

  return <InstrumentContext.Provider value={{ instrument, failed }}>{children}</InstrumentContext.Provider>;
};
