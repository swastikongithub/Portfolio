import { useEffect, type RefObject } from 'react';
import type { Instrument } from './Instrument';
import { paletteOf, useInstrument } from './context';

/**
 * Lends the instrument to a host while the host is on screen: the canvas moves
 * into `host`, aims at `anchor`, and takes the host's palette. When the host
 * leaves the viewport the instrument stops rendering.
 */
export function useInstrumentHost(
  host: RefObject<HTMLElement | null>,
  anchor: RefObject<HTMLElement | null>,
  onEnter: (inst: Instrument) => void,
  deps: unknown[] = [],
) {
  const { instrument } = useInstrument();

  useEffect(() => {
    const el = host.current;
    const a = anchor.current;
    if (!instrument || !el || !a) return;
    let inside = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !inside) {
          inside = true;
          instrument.attach(el, a, paletteOf(el));
          instrument.setActive(true);
          onEnter(instrument);
        } else if (!e.isIntersecting && inside) {
          inside = false;
          // Only the host that owns the canvas may switch it off.
          if (instrument.currentHost === el) instrument.setActive(false);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (inside && instrument.currentHost === el) instrument.setActive(false);
    };
    // onEnter is intentionally read once per attach; callers pass stable deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instrument, ...deps]);
}
