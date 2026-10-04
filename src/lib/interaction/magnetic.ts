import { gsap } from '../motion';
import { INTERACTION } from './config';

/**
 * Controls marked [data-magnetic] lean toward the pointer while it is over
 * them and spring back when it leaves. One set of delegated listeners for the
 * whole document; each control's rectangle is measured once on entry (never on
 * every move). Only for fine pointers with motion allowed; touch never moves a
 * control under a finger.
 */
export function initMagnetic(): () => void {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return () => {};

  const { strength, maxShift } = INTERACTION.magnetic;
  let current: HTMLElement | null = null;
  let rect: DOMRect | null = null;
  let qx: ((v: number) => void) | null = null;
  let qy: ((v: number) => void) | null = null;

  const release = () => {
    if (current) gsap.to(current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
    current = null;
    rect = null;
  };

  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const el = (e.target as Element | null)?.closest<HTMLElement>('[data-magnetic]');
    if (!el || el === current) return;
    release();
    current = el;
    gsap.set(el, { x: 0, y: 0 });
    rect = el.getBoundingClientRect();
    qx = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    qy = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
  };

  const onMove = (e: PointerEvent) => {
    if (!current || !rect || !qx || !qy) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    qx(Math.max(-maxShift, Math.min(maxShift, dx * strength)));
    qy(Math.max(-maxShift, Math.min(maxShift, dy * strength)));
  };

  const onOut = (e: PointerEvent) => {
    if (!current) return;
    const to = e.relatedTarget as Node | null;
    if (to && current.contains(to)) return;
    release();
  };

  document.addEventListener('pointerover', onOver, { passive: true });
  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onOut, { passive: true });
  window.addEventListener('scroll', release, { passive: true });
  return () => {
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerout', onOut);
    window.removeEventListener('scroll', release);
    release();
  };
}
