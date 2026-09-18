import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/motion';

/**
 * The site's single smooth-scroll engine.
 *
 * Lenis is driven by GSAP's ticker (one rAF loop for scroll and animation) and
 * feeds ScrollTrigger on every scroll. It is not created at all under
 * `prefers-reduced-motion: reduce`, and is destroyed — ticker callback included —
 * when the preference changes or the app unmounts, so there is never more than
 * one instance.
 */
export function useLenis(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch keeps native momentum scrolling; smoothing it feels wrong on phones.
      syncTouch: false,
      // Same-page anchor links (e.g. case-study contents) scroll smoothly too.
      anchors: { offset: -24 },
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Webfonts change line lengths and therefore every trigger position.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) {
        lenis.resize();
        ScrollTrigger.refresh();
      }
    });

    return () => {
      cancelled = true;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
