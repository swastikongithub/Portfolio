import React, { useRef } from 'react';
import { PROFILE, REELS, fmtDate } from '../../data/reels';
import { useSite } from '../../context/site';
import { EASE, gsap, useGSAP } from '../../lib/motion';
import { ReelFrame } from './ReelMedia';
import { useReelPlayer } from './player';

/** Post 25, the reel that asks the question this chapter is about. */
const TAKES = REELS.find((r) => r.code === 'DSWbE9qkgRU')!;

/**
 * The cut from one craft to the other. The engineering story ends on "works
 * once"; the camera is the one place where nothing does. The slate counts
 * takes, stops at the question his own reel asks, and his answer is quoted
 * beside that reel.
 */
export const TheCut: React.FC = () => {
  const { reducedMotion } = useSite();
  const openReel = useReelPlayer();
  const root = useRef<HTMLElement>(null);
  const takeRef = useRef<HTMLSpanElement>(null);
  const pinned = !reducedMotion;

  useGSAP(
    () => {
      if (!pinned) return;
      const take = { n: 0 };
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${Math.round(window.innerHeight * 1.7)}`, pin: true, scrub: 0.6 },
      });
      tl.fromTo('[data-cut-a] [data-w]', { yPercent: 110 }, { yPercent: 0, stagger: 0.04, duration: 0.18, ease: EASE.out }, 0)
        .fromTo('[data-cut-strike]', { scaleX: 0 }, { scaleX: 1, duration: 0.1 }, 0.22)
        .to('[data-cut-a]', { opacity: 0.32, duration: 0.08 }, 0.3)
        .fromTo('[data-cut-b]', { yPercent: 60, autoAlpha: 0, rotate: -3 }, { yPercent: 0, autoAlpha: 1, rotate: 0, duration: 0.16, ease: EASE.out }, 0.3)
        .fromTo('[data-cut-slate]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.44)
        .fromTo('[data-cut-clap]', { rotate: -24 }, { rotate: 0, duration: 0.05, ease: 'power4.in' }, 0.5)
        .to(
          take,
          {
            n: 10,
            duration: 0.22,
            onUpdate: () => {
              if (takeRef.current) takeRef.current.textContent = take.n >= 9.5 ? '?' : String(Math.max(1, Math.ceil(take.n)));
            },
          },
          0.5,
        )
        .fromTo('[data-cut-frame]', { autoAlpha: 0, scale: 0.9, rotate: 4 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.16, ease: EASE.out }, 0.42)
        .fromTo('[data-cut-quote]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.14, stagger: 0.05 }, 0.74)
        .to({}, { duration: 0.1 }, 0.9);
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="reels"
      aria-labelledby="reels-title"
      className={`relative overflow-hidden ${pinned ? 'h-[100svh]' : 'py-[clamp(72px,10vw,140px)]'}`}
    >
      <div className={`frame grid h-full content-center gap-y-[clamp(14px,2.6svh,28px)] lg:grid-cols-12 lg:gap-x-[var(--gutter)] ${pinned ? 'pt-[var(--header-h)]' : ''}`}>
        <div className="lg:col-span-8">
          <p className="t-mono text-ink-2">
            On Instagram, {PROFILE.handle}
          </p>
          <h2 id="reels-title" className="mt-3">
            <span className="sr-only">Everything works once, except on camera.</span>
            <span aria-hidden="true" data-cut-a className="t-anton relative block text-[clamp(2.7rem,6.4vw,6.8rem)]">
              {['Everything', 'works', 'once.'].map((w) => (
                <span key={w} className="mr-[0.18em] inline-block overflow-hidden align-top">
                  <span data-w className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
              <span data-cut-strike className="absolute left-0 right-[8%] top-[52%] block h-[0.07em] origin-left bg-[var(--reel-red)]" />
            </span>
            <span aria-hidden="true" data-cut-b className="t-serif-i block text-[clamp(2.9rem,6.6vw,7rem)] leading-[0.95] text-[var(--reel-pink)]">
              except on camera.
            </span>
          </h2>

          <div data-cut-slate className="mt-[clamp(16px,3svh,36px)] flex items-end gap-5">
            <div className="relative" aria-hidden="true">
              <span data-cut-clap className="slate-clap absolute -top-[18px] left-0 block h-[14px] w-full origin-bottom-left" />
              <p className="t-anton flex items-baseline gap-3 rounded-[4px] border-2 border-ink px-3 pb-1 pt-2 text-[clamp(2rem,4vw,3.4rem)]">
                Take
                <span ref={takeRef} className="t-num inline-block min-w-[1.2ch] text-signal">
                  {pinned ? '1' : '?'}
                </span>
              </p>
            </div>
            <p className="t-mono max-w-[22ch] text-ink-2">
              “How many takes for 1 good clip?” <span className="text-ink-3">(the question on Post 25)</span>
            </p>
          </div>

          <button
            type="button"
            data-cut-quote
            onClick={(e) => openReel(TAKES.code, e.currentTarget)}
            className="float-right ml-4 mt-[clamp(18px,3.4svh,40px)] w-[26vw] max-w-[130px] overflow-hidden rounded-[8px] border border-line-2 lg:hidden"
            aria-label={`Play ${TAKES.label} with sound: ${TAKES.caption}`}
          >
            <ReelFrame reel={TAKES} play className="aspect-[9/16] w-full" />
          </button>
          <blockquote data-cut-quote className="mt-[clamp(18px,3.4svh,40px)] max-w-[30ch]">
            <p className="t-serif-i text-[clamp(1.7rem,3vw,2.7rem)] leading-[1.08]">“{TAKES.caption}”</p>
            <footer className="t-mono mt-2 text-ink-2">
              {PROFILE.handle}, {TAKES.label}, {fmtDate(TAKES.date)}
            </footer>
          </blockquote>
          <p data-cut-quote className="t-body mt-4 max-w-[46ch] text-ink-2">
            Away from the keyboard I record and edit short videos about my life. Different craft, same habit: make it, ship it,
            look at what happened, do it again tomorrow.
          </p>
        </div>

        <div className="max-lg:hidden lg:col-span-3 lg:col-start-10">
          <button
            type="button"
            data-cut-frame
            onClick={(e) => openReel(TAKES.code, e.currentTarget)}
            className="group relative block w-full overflow-hidden rounded-[10px] border border-line-2 text-left"
            data-cursor-label="play with sound"
            aria-label={`Play ${TAKES.label} with sound: ${TAKES.caption}`}
          >
            <ReelFrame reel={TAKES} play className="aspect-[9/16] w-full" />
            <span className="t-mono pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-[3px] bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
              <span className="h-2 w-2 rounded-full bg-[var(--reel-red)]" />
              {TAKES.label}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};
