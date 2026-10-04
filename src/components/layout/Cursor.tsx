import React, { useEffect, useRef } from 'react';
import { INTERACTION } from '../../lib/interaction/config';
import { pointerField } from '../../lib/interaction/pointerField';
import { gsap } from '../../lib/motion';

type Mode = 'free' | 'lock' | 'text' | 'system' | 'hidden';

/**
 * The cursor is a request in flight: a precise dot (never smoothed, so aiming
 * stays exact) and a ring with a little mass that trails and stretches along
 * its velocity. It reads what it is over:
 *   controls   the ring locks onto the control's box with four brackets
 *   text       it narrows to an I-beam, so reading and selecting stay natural
 *   a system   it opens into a crosshair and says what a click will send
 *              ([data-cursor] on the element provides the words)
 *   fields     the native cursor returns
 * Fine pointers with motion allowed only; everyone else keeps the native cursor.
 */
export const Cursor: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const root = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const el = root.current;
    const d = dot.current;
    const r = ring.current;
    const lab = label.current;
    if (!enabled || !fine || !el || !d || !r || !lab) return;
    document.documentElement.classList.add('has-cursor');
    pointerField.start();

    const cfg = INTERACTION.cursor;
    let mode: Mode = 'free';
    let target: HTMLElement | null = null;
    let lock: DOMRect | null = null;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let last = performance.now();
    let visible = false;

    const setMode = (m: Mode, text = '') => {
      if (m === mode && lab.textContent === text) return;
      mode = m;
      el.dataset.mode = m;
      lab.textContent = text;
    };

    const classify = (t: Element | null) => {
      target = null;
      lock = null;
      if (!t) return setMode('free');
      if (t.closest('input, textarea, select, [contenteditable="true"]')) return setMode('hidden');
      const control = t.closest<HTMLElement>('a, button, [role="button"], summary, label, [role="option"]');
      if (control) {
        target = control;
        lock = control.getBoundingClientRect();
        return setMode('lock', control.dataset.cursorLabel ?? '');
      }
      const sys = t.closest<HTMLElement>('[data-cursor]');
      if (sys) return setMode('system', sys.dataset.cursor ?? '');
      if (t.closest('p, h1, h2, h3, h4, li, blockquote, code, pre, dd, dt, figcaption, td, th')) return setMode('text');
      return setMode('free');
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const f = pointerField.step(now);
      const x = f.x;
      const y = f.y;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      lab.style.transform = `translate3d(${x + 18}px, ${y + 18}px, 0)`;
      const k = 1 - Math.pow(1 - cfg.ringSmoothing, dt * 60);
      let w = 34;
      let h = 34;
      let cx = x;
      let cy = y;
      if (mode === 'lock' && target) {
        // Re-measured while locked: magnetic controls move under the pointer.
        lock = target.getBoundingClientRect();
        w = lock.width + cfg.lockPadding * 2;
        h = lock.height + cfg.lockPadding * 2;
        cx = lock.left + lock.width / 2;
        cy = lock.top + lock.height / 2;
      } else if (mode === 'text') {
        w = 3;
        h = 24;
      } else if (mode === 'system') {
        w = 58;
        h = 58;
      }
      rx += (cx - rx) * k;
      ry += (cy - ry) * k;
      const free = mode === 'free';
      const speed = free ? Math.min(1, f.speed / INTERACTION.pointer.maxSpeed) : 0;
      const sx = 1 + speed * cfg.stretch;
      const sy = 1 - speed * cfg.stretch * 0.5;
      const angle = free && f.speed > 40 ? Math.atan2(f.vy, f.vx) : 0;
      r.style.width = `${w}px`;
      r.style.height = `${h}px`;
      r.style.transform = `translate3d(${rx - w / 2}px, ${ry - h / 2}px, 0) rotate(${angle}rad) scale(${sx}, ${sy})`;
      const settled = Math.abs(cx - rx) < 0.3 && Math.abs(cy - ry) < 0.3 && f.speed < 4;
      raf = settled && mode !== 'lock' ? 0 : requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!visible) {
        visible = true;
        el.dataset.visible = 'true';
        rx = pointerField.s.x;
        ry = pointerField.s.y;
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      classify(e.target as Element);
      wake();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') el.dataset.pressed = 'true';
    };
    const onUp = () => {
      delete el.dataset.pressed;
    };
    const onLeave = () => {
      visible = false;
      el.dataset.visible = 'false';
    };
    const onScroll = () => {
      // Content moves under a still pointer: re-read what it is over.
      if (visible) classify(document.elementFromPoint(pointerField.s.x, pointerField.s.y));
      wake();
    };
    const offWake = pointerField.onWake((s) => {
      if (!s.touch) wake();
    });
    // A click leaves a ring behind: the request has been sent.
    const offImpulse = pointerField.onImpulse((imp) => {
      if (imp.touch) return;
      const burst = document.createElement('span');
      burst.className = 'cursor-burst';
      burst.style.left = `${imp.x}px`;
      burst.style.top = `${imp.y}px`;
      el.appendChild(burst);
      gsap.fromTo(
        burst,
        { scale: 0.4, opacity: 0.9 },
        {
          scale: imp.kind === 'click' ? 2.2 : 3.6,
          opacity: 0,
          duration: 0.7,
          ease: 'expo.out',
          onComplete: () => burst.remove(),
        },
      );
    });

    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      offWake();
      offImpulse();
      pointerField.stop();
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.documentElement.classList.remove('has-cursor');
      el.dataset.visible = 'false';
    };
  }, [enabled]);

  return (
    <div ref={root} className="cursor-layer" data-mode="free" data-visible="false" aria-hidden="true">
      <div ref={ring} className="cursor-ring">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div ref={dot} className="cursor-dot" />
      <span ref={label} className="cursor-label t-mono" />
    </div>
  );
};
