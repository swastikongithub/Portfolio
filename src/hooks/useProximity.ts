import { useEffect, type RefObject } from 'react';
import { INTERACTION } from '../lib/interaction/config';

/**
 * Lets controls anticipate the pointer: each element matching `selector`
 * inside `container` gets a CSS variable --near from 0 (far) to 1 (on it),
 * updated at most once per frame while the pointer is over the container.
 * Rectangles are measured when the pointer enters, not on every move.
 */
export function useProximity(container: RefObject<HTMLElement | null>, selector: string, deps: unknown[] = []) {
  useEffect(() => {
    const root = container.current;
    if (!root || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let rects: { el: HTMLElement; r: DOMRect }[] = [];
    let raf = 0;
    let px = 0;
    let py = 0;
    const R = INTERACTION.magnetic.proximity;
    const measure = () => {
      rects = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => ({ el, r: el.getBoundingClientRect() }));
    };
    const paint = () => {
      raf = 0;
      for (const { el, r } of rects) {
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const near = Math.max(0, 1 - Math.hypot(dx, dy) / R);
        el.style.setProperty('--near', near.toFixed(3));
      }
    };
    const onEnter = () => measure();
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      rects.forEach(({ el }) => el.style.setProperty('--near', '0'));
    };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointermove', onMove, { passive: true });
    root.addEventListener('pointerleave', onLeave);
    return () => {
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      onLeave();
      root.querySelectorAll<HTMLElement>(selector).forEach((el) => el.style.setProperty('--near', '0'));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
