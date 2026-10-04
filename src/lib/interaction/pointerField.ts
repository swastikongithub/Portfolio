import { INTERACTION } from './config';

/**
 * The pointer field: the single source of pointer and touch input for every
 * reactive system on the site.
 *
 * It listens passively on the window (never blocking clicks, selection,
 * scrolling or keyboard use), reads only event coordinates (no layout reads on
 * input), and keeps a smoothed state that consumers sample from their own
 * animation frames. Discrete impulses (click, double, stampede) are classified
 * here and broadcast. Clicks on controls are not impulses: the control wins.
 */

export type FieldState = 'resting' | 'exploring' | 'focus' | 'impact';
export type ImpulseKind = 'click' | 'double' | 'stampede';

export interface Impulse {
  x: number;
  y: number;
  kind: ImpulseKind;
  /** 1 for a mouse click; less for a tap. */
  weight: number;
  touch: boolean;
  /** Milliseconds since the previous impulse (for "the same event again"). */
  sincePrevious: number;
}

export interface FieldSnapshot {
  /** Raw client coordinates. */
  x: number;
  y: number;
  /** Smoothed client coordinates. */
  sx: number;
  sy: number;
  /** Smoothed velocity, px/s (client space). */
  vx: number;
  vy: number;
  speed: number;
  dragging: boolean;
  /** 0 at rest … 1 exploring (eased), scaled down while over a control. */
  strength: number;
  state: FieldState;
  /** True when the last input came from touch (no continuous influence). */
  touch: boolean;
  /** Whether a pointer has been seen at all. */
  present: boolean;
}

type Listener<T> = (v: T) => void;

class PointerField {
  readonly s: FieldSnapshot = {
    x: -9999,
    y: -9999,
    sx: -9999,
    sy: -9999,
    vx: 0,
    vy: 0,
    speed: 0,
    dragging: false,
    strength: 0,
    state: 'resting',
    touch: false,
    present: false,
  };
  private lastMove = 0;
  private lastT = 0;
  private overControl = false;
  private impactUntil = 0;
  private clicks: number[] = [];
  private lastImpulse = 0;
  private moveListeners = new Set<Listener<FieldSnapshot>>();
  private impulseListeners = new Set<Listener<Impulse>>();
  private started = 0;

  /** Start listening (reference-counted; every start needs a stop). */
  start() {
    this.started++;
    if (this.started > 1) return;
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerdown', this.onDown, { passive: true });
    window.addEventListener('pointerup', this.onUp, { passive: true });
    window.addEventListener('pointercancel', this.onUp, { passive: true });
    window.addEventListener('click', this.onClick, { passive: true });
    document.addEventListener('pointerleave', this.onLeave);
  }

  stop() {
    this.started = Math.max(0, this.started - 1);
    if (this.started > 0) return;
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
    window.removeEventListener('click', this.onClick);
    document.removeEventListener('pointerleave', this.onLeave);
  }

  onWake(fn: Listener<FieldSnapshot>) {
    this.moveListeners.add(fn);
    return () => void this.moveListeners.delete(fn);
  }

  onImpulse(fn: Listener<Impulse>) {
    this.impulseListeners.add(fn);
    return () => void this.impulseListeners.delete(fn);
  }

  /**
   * Advance the smoothing by dt seconds. Called by consumers from their frame
   * loop (several consumers in one frame is harmless: dt is measured).
   */
  step(now = performance.now()) {
    const s = this.s;
    const dt = this.lastT ? Math.min(0.05, (now - this.lastT) / 1000) : 1 / 60;
    if (dt <= 0) return s;
    this.lastT = now;
    const k = 1 - Math.pow(1 - INTERACTION.pointer.smoothing, dt * 60);
    if (s.sx < -9000) {
      s.sx = s.x;
      s.sy = s.y;
    } else {
      s.sx += (s.x - s.sx) * k;
      s.sy += (s.y - s.sy) * k;
    }
    const idle = now - this.lastMove > INTERACTION.pointer.restAfterMs;
    // Velocity decays toward zero when the pointer stops.
    if (idle) {
      const d = Math.pow(0.82, dt * 60);
      s.vx *= d;
      s.vy *= d;
    }
    s.speed = Math.hypot(s.vx, s.vy);
    const target = s.touch || !s.present ? 0 : idle ? 0 : this.overControl ? INTERACTION.pointer.focusStrength : 1;
    s.strength += (target - s.strength) * (1 - Math.pow(0.88, dt * 60));
    if (s.strength < 0.002) s.strength = 0;
    s.state = now < this.impactUntil ? 'impact' : this.overControl && !idle ? 'focus' : idle ? 'resting' : 'exploring';
    return s;
  }

  /** True while the field still has something to settle (consumers keep animating). */
  get settling() {
    return this.s.strength > 0.002 || this.s.speed > 4;
  }

  private onMove = (e: PointerEvent) => {
    const s = this.s;
    const now = performance.now();
    s.touch = e.pointerType === 'touch';
    s.present = true;
    // Coalesced events carry the true path between frames; the latest sample gives
    // position and the step since the previous event gives velocity.
    const list = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const last = list.length ? list[list.length - 1] : e;
    const dtMs = Math.max(1, now - this.lastMove);
    if (this.lastMove && dtMs < 120 && !s.touch) {
      const max = INTERACTION.pointer.maxSpeed;
      const ivx = Math.max(-max, Math.min(max, ((last.clientX - s.x) / dtMs) * 1000));
      const ivy = Math.max(-max, Math.min(max, ((last.clientY - s.y) / dtMs) * 1000));
      const kv = INTERACTION.pointer.velocitySmoothing;
      s.vx += (ivx - s.vx) * kv * 2;
      s.vy += (ivy - s.vy) * kv * 2;
    }
    s.x = last.clientX;
    s.y = last.clientY;
    if (s.sx < -9000) {
      s.sx = s.x;
      s.sy = s.y;
    }
    this.lastMove = now;
    const t = e.target as Element | null;
    this.overControl = !!t?.closest?.('a, button, input, [role="button"], [data-magnetic]');
    this.moveListeners.forEach((fn) => fn(s));
  };

  private onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button === 0) this.s.dragging = true;
    this.s.touch = e.pointerType === 'touch';
    this.s.x = e.clientX;
    this.s.y = e.clientY;
    this.s.present = true;
  };

  private onUp = () => {
    this.s.dragging = false;
  };

  private onLeave = () => {
    this.s.present = false;
    this.overControl = false;
  };

  private onClick = (e: MouseEvent) => {
    const t = e.target as Element | null;
    // The control wins: clicks on links, buttons and fields are never impulses.
    if (t?.closest?.('a, button, input, textarea, select, label, [role="button"], [contenteditable]')) return;
    // Selecting text is not an impulse either.
    if (window.getSelection()?.toString()) return;
    const now = performance.now();
    const cfg = INTERACTION.impulses;
    this.clicks = this.clicks.filter((c) => now - c < cfg.stampedeMs);
    this.clicks.push(now);
    const prev = this.clicks.length > 1 ? this.clicks[this.clicks.length - 2] : 0;
    let kind: ImpulseKind = 'click';
    if (this.clicks.length >= cfg.stampedeClicks) {
      kind = 'stampede';
      this.clicks = [];
    } else if (prev && now - prev < cfg.doubleMs) kind = 'double';
    const touch = (e as PointerEvent).pointerType === 'touch' || this.s.touch;
    const impulse: Impulse = {
      x: e.clientX,
      y: e.clientY,
      kind,
      weight: touch ? cfg.touchScale : 1,
      touch,
      sincePrevious: this.lastImpulse ? now - this.lastImpulse : Infinity,
    };
    this.lastImpulse = now;
    this.impactUntil = now + 260;
    this.s.present = true;
    this.impulseListeners.forEach((fn) => fn(impulse));
  };
}

/** The one pointer field for the page. */
export const pointerField = new PointerField();
