import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { EASE, MOTION_OK, gsap, ScrollTrigger, useGSAP } from '../../lib/motion';
import { useInstrument } from '../../lib/instrument/context';
import { useInstrumentHost } from '../../lib/instrument/useInstrumentHost';
import type { Instrument } from '../../lib/instrument/Instrument';

/** The colour of the "inside the system" stage the dive lands in (see .stage in index.css). */
const STAGE = '#0a0c0f';
const BOOT_KEY = 'portfolio-booted';

/** The slot's box inside the section, from layout offsets (ignores in-flight transforms). */
const slotBox = (dot: HTMLElement, section: HTMLElement) => {
  let x = 0;
  let y = 0;
  let el: HTMLElement | null = dot;
  while (el && el !== section) {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  return { x, y, w: dot.offsetWidth, h: dot.offsetHeight };
};

/**
 * The first viewport: a 3D run of LPU Reserve's concurrency test. 500 attempts
 * race out of the depth toward one slot, which is the full stop of the DOM
 * headline. A membrane (the exclusion constraint) lets one through and ripples
 * where it refuses the rest. Scrolling on dives into that slot.
 */
export const Hero: React.FC = () => {
  const { scrollToSection, reducedMotion, setScrollLocked } = useSite();
  const { failed } = useInstrument();
  const root = useRef<HTMLElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const diveRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<Instrument | null>(null);
  const releaseRequested = useRef(false);
  const attemptsRef = useRef<HTMLSpanElement>(null);
  const refusedRef = useRef<HTMLSpanElement>(null);
  const bookedRef = useRef<HTMLSpanElement>(null);

  const [booked, setBooked] = useState(false);
  const [boot, setBoot] = useState(() => {
    if (reducedMotion) return false;
    try {
      return sessionStorage.getItem(BOOT_KEY) !== '1';
    } catch {
      return false;
    }
  });

  const setCounts = (a: number, r: number, b: number) => {
    if (attemptsRef.current) attemptsRef.current.textContent = String(a);
    if (refusedRef.current) refusedRef.current.textContent = String(r);
    if (bookedRef.current) bookedRef.current.textContent = String(b);
  };

  // Lend the instrument to the hero while it is on screen.
  useInstrumentHost(glRef, dotRef, (inst) => {
    instRef.current = inst;
    inst.events = { onCounts: setCounts, onBooked: () => setBooked(true), onRestart: () => setBooked(false) };
    inst.setMode('race', { hold: !releaseRequested.current, heap: false });
    if (reducedMotion) {
      const c = inst.staticCounts;
      setCounts(c.attempts, c.refused, c.booked);
      setBooked(true);
    }
  });

  // Fonts can arrive after first paint (the stylesheet doesn't block): the full
  // stop moves with them, so the instrument re-measures where it is aiming.
  useEffect(() => {
    const onFonts = () => instRef.current?.reaim();
    document.fonts?.addEventListener?.('loadingdone', onFonts);
    return () => document.fonts?.removeEventListener?.('loadingdone', onFonts);
  }, []);

  const release = useCallback(() => {
    releaseRequested.current = true;
    instRef.current?.release();
  }, []);

  // Intro: an optional boot (first visit per session), the headline, then the barrier releases.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: EASE.out } });
        if (boot && bootRef.current) {
          setScrollLocked(true);
          const counter = { n: 0 };
          const num = bootRef.current.querySelector('[data-boot-n]');
          const status = bootRef.current.querySelector('[data-boot-status]');
          tl.to(counter, {
            n: 500,
            duration: 0.95,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (num) num.textContent = String(Math.round(counter.n)).padStart(3, '0');
            },
          })
            .fromTo(bootRef.current.querySelector('[data-boot-bar]'), { scaleX: 0 }, { scaleX: 1, duration: 0.95, ease: 'power2.inOut' }, 0)
            .add(() => {
              if (status) status.textContent = 'barrier released';
            }, '+=0.05')
            .to(bootRef.current, { yPercent: -100, duration: 0.85, ease: EASE.move }, '+=0.15')
            .add(() => {
              setScrollLocked(false);
              try {
                sessionStorage.setItem(BOOT_KEY, '1');
              } catch {
                /* storage unavailable: the boot simply shows again next visit */
              }
            });
        }
        tl.fromTo('[data-hero-line]', { yPercent: 108 }, { yPercent: 0, duration: 1.2, stagger: 0.09 }, boot ? '-=0.55' : 0.1)
          .fromTo('[data-hero-in]', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06 }, '-=0.8')
          .add(release, '-=0.7')
          .add(() => {
            setBoot(false);
            ScrollTrigger.refresh();
            instRef.current?.reaim();
          });
      });
      mm.add('(prefers-reduced-motion: reduce)', () => {
        setBoot(false);
        release();
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [] },
  );

  // The dive: scroll pins the hero and the slot grows until it is the whole screen.
  useGSAP(
    () => {
      const section = root.current;
      const dive = diveRef.current;
      const dot = dotRef.current;
      if (!section || !dive || !dot) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const place = () => {
          const b = slotBox(dot, section);
          gsap.set(dive, { left: b.x, top: b.y, width: b.w, height: b.h });
        };
        const cover = () => {
          const b = slotBox(dot, section);
          const W = section.offsetWidth;
          const H = window.innerHeight;
          const cx = b.x + b.w / 2;
          const cy = b.y + b.h / 2;
          const far = Math.max(Math.hypot(cx, cy), Math.hypot(W - cx, cy), Math.hypot(cx, H - cy), Math.hypot(W - cx, H - cy));
          return (far * 2.2) / Math.max(4, b.w);
        };
        place();
        ScrollTrigger.addEventListener('refreshInit', place);
        const iris = dive.querySelector('[data-iris]');
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => `+=${Math.round(window.innerHeight * 1.1)}`,
              pin: true,
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(dive, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0)
          .fromTo(dive, { scale: 1 }, { scale: cover, ease: 'power2.in', duration: 0.78 }, 0)
          .fromTo(iris, { scale: 0 }, { scale: 1.6, ease: 'power2.inOut', duration: 0.3 }, 0.7)
          .to('[data-hero-fade]', { autoAlpha: 0, y: -24, ease: 'power1.in', duration: 0.45 }, 0.05)
          .to(glRef.current, { autoAlpha: 0, ease: 'none', duration: 0.5 }, 0.2)
          .to('[data-hero-title]', { scale: 1.06, transformOrigin: '50% 60%', ease: 'none', duration: 0.6 }, 0);
        return () => ScrollTrigger.removeEventListener('refreshInit', place);
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const showFinal = failed || reducedMotion;

  // The counters are written directly (by the instrument while it runs); React never renders their text.
  useEffect(() => {
    if (showFinal) setCounts(500, 499, 1);
    else if (!attemptsRef.current?.textContent) setCounts(0, 0, 0);
  }, [showFinal]);

  return (
    <>
      {boot && (
        <div ref={bootRef} className="fixed inset-0 z-[95] flex flex-col justify-end bg-ink text-bg" aria-hidden="true">
          <div className="frame pb-10">
            <p className="t-mono-lg t-num text-[clamp(3rem,12vw,9rem)] font-[500] leading-none">
              <span data-boot-n>000</span>
              <span className="text-ink-3">/500</span>
            </p>
            <div className="mt-6 h-[3px] w-full overflow-hidden rounded bg-ink-2/40">
              <div data-boot-bar className="h-full w-full origin-left bg-signal" />
            </div>
            <p className="t-mono mt-3 flex justify-between gap-4 text-ink-3">
              <span data-boot-status>connecting clients, waiting at the barrier</span>
              <span className="max-sm:hidden">test_concurrency.py</span>
            </p>
          </div>
        </div>
      )}

      <section
        ref={root}
        aria-labelledby="hero-title"
        data-cursor="click: one more attempt"
        className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
      >
        <div ref={glRef} className="absolute inset-0 -z-10" aria-hidden="true" />

        <div className="frame flex flex-1 flex-col justify-between gap-8 pb-7 pt-[calc(var(--header-h)+clamp(12px,3svh,32px))]">
          <p className="t-small font-[600]" data-hero-fade data-hero-in>
            {PERSONAL_INFO.name}, software engineer and swastik.mov
          </p>

          <h1 id="hero-title" tabIndex={-1} className="t-hero-xl outline-none" data-hero-title>
            <span className="sr-only">Everything works once.</span>
            <span aria-hidden="true">
              <span className="line-mask">
                <span className="line" data-hero-line>
                  Everything
                </span>
              </span>
              <span className="line-mask">
                <span className="line" data-hero-line>
                  works once
                  <span
                    ref={dotRef}
                    className={`ml-[0.03em] inline-block h-[0.19em] w-[0.19em] rounded-[0.03em] border-[0.028em] align-baseline transition-colors duration-300 ${
                      booked || showFinal ? 'border-signal bg-signal' : 'border-ink bg-transparent'
                    }`}
                  />
                </span>
              </span>
            </span>
          </h1>

          <div className="grid-12 items-end gap-y-6" data-hero-fade>
            <div className="col-span-4 flex flex-col gap-5 md:col-span-6 lg:col-span-5">
              <p className="t-lead max-w-[30ch]" data-hero-in>
                I build backends for the second time something happens.
              </p>
              <div className="flex flex-wrap gap-2.5" data-hero-in>
                <a
                  href="#work"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('work');
                  }}
                  className="btn btn-signal"
                  data-magnetic
                >
                  See the four systems
                </a>
                <a href={PERSONAL_INFO.resume} target="_blank" rel="noopener noreferrer" className="btn bg-bg/70 backdrop-blur-sm" data-magnetic>
                  Resume
                  <span className="sr-only">(PDF, opens in a new tab)</span>
                </a>
              </div>
            </div>

            <figure
              className="col-span-4 border-t border-line-2 pt-3 sm:rounded-[var(--r-md)] sm:border sm:border-line sm:bg-bg/75 sm:p-4 sm:backdrop-blur-md md:col-span-6 lg:col-span-4 lg:col-start-9"
              data-hero-in
            >
              <dl className="flex items-end gap-6 sm:gap-8">
                <div>
                  <dt className="t-mono text-ink-2">attempts</dt>
                  <dd className="t-mono-lg t-num text-[clamp(1.6rem,2.6vw,2.4rem)] font-[500] leading-tight">
                    <span ref={attemptsRef} />
                  </dd>
                </div>
                <div>
                  <dt className="t-mono text-ink-2">booked</dt>
                  <dd className="t-mono-lg t-num text-[clamp(1.6rem,2.6vw,2.4rem)] font-[500] leading-tight">
                    <span ref={bookedRef} className="rounded-[3px] bg-signal px-1 text-on-signal" />
                  </dd>
                </div>
                <div>
                  <dt className="t-mono text-ink-2">refused</dt>
                  <dd className="t-mono-lg t-num text-[clamp(1.6rem,2.6vw,2.4rem)] font-[500] leading-tight">
                    <span ref={refusedRef} />
                  </dd>
                </div>
              </dl>
              <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="t-mono text-ink-2">500 threads, one slot, from LPU Reserve&rsquo;s CI</span>
                {!showFinal && (
                  <button type="button" className="link t-mono text-ink" onClick={() => instRef.current?.replay()}>
                    run the race again
                  </button>
                )}
              </figcaption>
            </figure>
          </div>
        </div>

        <div ref={diveRef} className="pointer-events-none invisible absolute z-20 overflow-hidden rounded-[16%] bg-signal" aria-hidden="true">
          <div data-iris className="absolute inset-0 rounded-full" style={{ background: STAGE, transform: 'scale(0)' }} />
        </div>
      </section>
    </>
  );
};
