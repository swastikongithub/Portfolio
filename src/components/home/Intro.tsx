import React, { useCallback, useEffect, useRef } from 'react';
import { HISTORY, INTRO_COMMITS, PROJECTS } from '../../data/portfolioData';
import { REELS_CHRONO, STREAK, thumbSrc } from '../../data/reels';
import { useSite } from '../../context/site';
import { EASE, gsap, useGSAP } from '../../lib/motion';
import { Mark } from '../layout/Header';
import { releaseHeavyWork } from '../../lib/coldOpen';

/** The daily run, in order: index + 1 is the post's own number (Post 1/14 to Post 45). */
const RUN = REELS_CHRONO.filter((r) => r.date >= STREAK.first && r.date <= STREAK.last);
const TOTAL_COMMITS = HISTORY.reduce((s, h) => s + Object.values(h.days).reduce((t, n) => t + n, 0), 0);
const DAYS_RUN = Math.round((Date.parse(STREAK.last) - Date.parse(STREAK.first)) / 864e5) + 1;
const titleOf = (slug: string) => PROJECTS.find((p) => p.slug === slug)!.title;
const day = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Beat start times (seconds). The whole film runs about 8 s; any input skips to the handoff. */
const T = { sw: 1.3, vid: 3.25, q: 5.25, out: 6.95 };
const TOKENS = 22;

/** Where an element sits on the page, ignoring transforms (its final, resting position). */
const restingBox = (el: HTMLElement) => {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x: x - window.scrollX, y: y - window.scrollY, w: el.offsetWidth, h: el.offsetHeight };
};

/**
 * The cold open. A film leader counts down; real commit messages stream past
 * ("I build software"); a hard cut into the reels' palette fills a contact
 * sheet with the 45 posts of the daily run ("I make videos"); then every frame
 * races for one slot, one gets in and the rest are refused ("What happens the
 * second time?"). The slot flies to the full stop of the hero's headline and
 * opens onto the page like an iris. Once per session; skipped by any input;
 * never shown under reduced motion.
 */
export const Intro: React.FC<{
  target: React.RefObject<HTMLElement | null>;
  onReveal: () => void;
  onDone: () => void;
}> = ({ target, onReveal, onDone }) => {
  const { setScrollLocked } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const skip = useCallback(() => {
    const tl = tlRef.current;
    if (!tl) return;
    releaseHeavyWork();
    if (tl.time() < T.out - 0.05) tl.seek(T.out - 0.001).play();
    else tl.play();
  }, []);

  useEffect(() => {
    setScrollLocked(true);
    skipRef.current?.focus({ preventScroll: true });
    // Warm the thumbnails, behind the page's own scripts.
    RUN.forEach((r) => {
      const img = new Image();
      img.fetchPriority = 'low';
      img.src = thumbSrc(r);
    });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && skip();
    const onWheel = () => skip();
    window.addEventListener('keydown', onKey);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onWheel);
      setScrollLocked(false);
      releaseHeavyWork();
    };
  }, [setScrollLocked, skip]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const flash = q('[data-flash]');
      const slot = el.querySelector<HTMLElement>('[data-slot]')!;
      const fill = q('[data-slot-fill]');
      const tc = el.querySelector('[data-tc]');
      const commitN = el.querySelector('[data-commit-n]');
      const postN = el.querySelector('[data-post-n]');
      const leaderN = el.querySelector('[data-leader-n]');
      const cells = q('[data-cell]') as HTMLElement[];
      const tokens = q('[data-token]') as HTMLElement[];
      const commits = { n: 0 };
      const posts = { n: 0 };

      const tl = gsap.timeline({
        paused: true,
        onUpdate: () => {
          const t = tl.time();
          const f = Math.floor((t % 1) * 24);
          if (tc) tc.textContent = `00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f).padStart(2, '0')}`;
        },
        onComplete: onDone,
      });
      tlRef.current = tl;

      // Leader: 3, 2, 1.
      tl.set(q('[data-beat]'), { autoAlpha: 0 }, 0).set(q('[data-beat="leader"]'), { autoAlpha: 1 }, 0);
      [3, 2, 1].forEach((n, i) => {
        tl.call(() => void (leaderN && (leaderN.textContent = String(n))), undefined, i * 0.41).fromTo(
          q('[data-sweep]'),
          { rotate: 0 },
          { rotate: 360, duration: 0.41, ease: 'none' },
          i * 0.41,
        );
      });
      tl.to(flash, { opacity: 0.55, duration: 0.03 }, T.sw - 0.04).to(flash, { opacity: 0, duration: 0.16 }, T.sw);

      // I build software.
      tl.set(q('[data-beat="leader"]'), { autoAlpha: 0 }, T.sw)
        .set(q('[data-beat="sw"]'), { autoAlpha: 1 }, T.sw)
        .fromTo(q('[data-sw-w]'), { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.07, ease: EASE.out }, T.sw)
        .fromTo(q('[data-sw-in]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 }, T.sw + 0.25)
        .fromTo(q('[data-stream]'), { yPercent: 18 }, { yPercent: -48, duration: T.vid - T.sw + 0.2, ease: 'none' }, T.sw)
        .fromTo(q('[data-line]'), { autoAlpha: 0, x: 14 }, { autoAlpha: 1, x: 0, duration: 0.25, stagger: 0.075 }, T.sw + 0.08)
        .to(
          commits,
          {
            n: TOTAL_COMMITS,
            duration: 1.5,
            ease: 'power2.out',
            onUpdate: () => void (commitN && (commitN.textContent = String(Math.round(commits.n)))),
          },
          T.sw + 0.2,
        )
        .fromTo(q('[data-seg="0"]'), { scaleX: 0 }, { scaleX: 1, duration: T.vid - T.sw, ease: 'none' }, T.sw);

      // The cut. I make videos.
      tl.to(flash, { opacity: 0.6, duration: 0.03 }, T.vid - 0.04)
        .to(flash, { opacity: 0, duration: 0.18 }, T.vid)
        .set(q('[data-beat="sw"]'), { autoAlpha: 0 }, T.vid)
        .set(q('[data-beat="vid"], [data-beat="sheet"]'), { autoAlpha: 1 }, T.vid)
        .to(q('[data-warm]'), { opacity: 1, duration: 0.25 }, T.vid)
        .fromTo(q('[data-vid-w]'), { yPercent: 110 }, { yPercent: 0, duration: 0.6, stagger: 0.08, ease: EASE.out }, T.vid + 0.05)
        .fromTo(q('[data-vid-in]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4 }, T.vid + 0.3)
        .fromTo(cells, { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, duration: 0.32, stagger: 0.027, ease: 'back.out(1.7)' }, T.vid + 0.12)
        .to(
          posts,
          {
            n: RUN.length,
            duration: RUN.length * 0.027 + 0.15,
            ease: 'none',
            onUpdate: () => void (postN && (postN.textContent = String(Math.max(1, Math.round(posts.n))))),
          },
          T.vid + 0.12,
        )
        .fromTo(q('[data-seg="1"]'), { scaleX: 0 }, { scaleX: 1, duration: T.q - T.vid, ease: 'none' }, T.vid);

      // What happens the second time? Every frame races for one slot.
      const slotC = () => {
        const r = slot.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
      };
      // Every racer's start point and the slot, read in one pass when the race is set up
      // (not one layout per racer as each launches).
      const starts = new Map<HTMLElement, { x: number; y: number }>();
      let goal = { x: 0, y: 0, w: 0 };
      const measure = () => {
        goal = slotC();
        [...cells, ...tokens].forEach((r) => {
          const b = r.getBoundingClientRect();
          starts.set(r, { x: b.left + b.width / 2, y: b.top + b.height / 2 });
        });
      };
      const aim = (r: HTMLElement, stop: number) => {
        let d = { x: 0, y: 0 };
        return {
          x: () => {
            const c = starts.get(r) ?? { x: goal.x, y: goal.y };
            const vx = goal.x - c.x;
            const vy = goal.y - c.y;
            const len = Math.hypot(vx, vy) || 1;
            d = { x: vx - (vx / len) * stop, y: vy - (vy / len) * stop };
            return d.x;
          },
          y: () => d.y,
        };
      };
      tl.to(q('[data-beat="vid"]'), { autoAlpha: 0, y: -24, duration: 0.18, ease: 'power2.in' }, T.q)
        .set(q('[data-beat="q"]'), { autoAlpha: 1 }, T.q + 0.18)
        .fromTo(q('[data-q-in]'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.35 }, T.q + 0.2)
        .fromTo(q('[data-q-w]'), { yPercent: 110 }, { yPercent: 0, duration: 0.55, stagger: 0.05, ease: EASE.out }, T.q + 0.22)
        .to(q('[data-warm]'), { opacity: 0, duration: 0.7 }, T.q + 0.35)
        .fromTo(slot, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, T.q + 0.25)
        .fromTo(tokens, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.01 }, T.q + 0.3)
        .fromTo(q('[data-seg="2"]'), { scaleX: 0 }, { scaleX: 1, duration: T.out - T.q, ease: 'none' }, T.q)
        // The page behind can start building now: about 1.7 s before the handoff.
        .call(releaseHeavyWork, undefined, T.q)
        .call(measure, undefined, T.q + 0.26);

      // The winner (one commit) arrives first; everything after it is turned away at the edge.
      const winner = tokens[0];
      const won = T.q + 0.75;
      tl.to(winner, { ...aim(winner, 0), scale: 0.6, duration: 0.45, ease: 'power2.in' }, won - 0.45)
        .to(winner, { autoAlpha: 0, duration: 0.08 }, won)
        .fromTo(fill, { scale: 0 }, { scale: 1, duration: 0.25, ease: 'back.out(2.4)' }, won)
        .fromTo(q('[data-ring]'), { scale: 0.6, autoAlpha: 0.9 }, { scale: 4, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, won);
      const racers = [...cells, ...tokens.slice(1)];
      racers.forEach((r, i) => {
        const start = won - 0.2 + (((i * 7919) % 97) / 97) * 0.4;
        const ang = (((i * 2971) % 360) * Math.PI) / 180;
        const fly = 90 + ((i * 131) % 140);
        tl.to(r, { ...aim(r, 26), scale: 0.18, duration: 0.38, ease: 'power2.in' }, start).to(
          r,
          { x: `+=${Math.cos(ang) * fly}`, y: `+=${Math.sin(ang) * fly}`, rotate: (i % 2 ? 1 : -1) * 70, autoAlpha: 0, duration: 0.42, ease: 'power3.out' },
          start + 0.38,
        );
      });
      tl.to({}, { duration: 0.1 }, T.out - 0.1);

      // Handoff: the slot becomes the full stop, and the page opens from it.
      let dest = { x: 0, y: 0, w: 0, h: 0 };
      tl.set(q('[data-beat], [data-cell], [data-token]'), { autoAlpha: 0 }, T.out)
        .set(slot, { autoAlpha: 1 }, T.out)
        .set(fill, { scale: 1 }, T.out)
        .call(
          () => {
            const t = target.current;
            dest = t ? restingBox(t) : { x: window.innerWidth / 2, y: window.innerHeight / 2, w: 24, h: 24 };
            el.style.setProperty('--ix', `${dest.x + dest.w / 2}px`);
            el.style.setProperty('--iy', `${dest.y + dest.h / 2}px`);
            el.querySelector('[data-intro-iris]')?.classList.add('intro-iris');
            onReveal();
          },
          undefined,
          T.out + 0.01,
        )
        .to(
          slot,
          {
            x: () => dest.x + dest.w / 2 - slotC().x + (Number(gsap.getProperty(slot, 'x')) || 0),
            y: () => dest.y + dest.h / 2 - slotC().y + (Number(gsap.getProperty(slot, 'y')) || 0),
            scale: () => (dest.w || 24) / (el.querySelector<HTMLElement>('[data-slot-box]')!.offsetWidth || 1),
            duration: 0.75,
            ease: EASE.move,
          },
          T.out + 0.02,
        )
        .to(q('[data-chrome]'), { autoAlpha: 0, duration: 0.3 }, T.out)
        .fromTo(q('[data-intro-iris]'), { '--iris': '0px' }, { '--iris': `${Math.hypot(window.innerWidth, window.innerHeight) * 1.1}px`, duration: 0.95, ease: 'power3.in' }, T.out + 0.25)
        .to(slot, { autoAlpha: 0, duration: 0.3 }, T.out + 1.0);

      // Fonts first (they arrive without blocking the page), but never wait long.
      const fonts = document.fonts
        ? Promise.all([
            document.fonts.load('800 64px "Schibsted Grotesk"'),
            document.fonts.load('64px Anton'),
            document.fonts.load('italic 64px "Instrument Serif"'),
          ])
        : Promise.resolve();
      Promise.race([fonts, new Promise((r) => setTimeout(r, 900))]).then(() => tl.play());
      return () => tl.kill();
    },
    { scope: root },
  );

  return (
    <div ref={root} data-cold-open className="fixed inset-0 z-[95]" onPointerDown={(e) => !(e.target as Element).closest('button') && skip()}>
      {/* Everything that the iris opens away. */}
      <div data-intro-iris className="absolute inset-0 overflow-hidden bg-[#0a0c0f] text-[#eceef1]" aria-hidden="true">
        <div data-warm className="absolute inset-0 bg-[#120e0c] opacity-0" />
        <div className="intro-vignette pointer-events-none absolute inset-0" />

        {/* 3, 2, 1 */}
        <div data-beat="leader" className="absolute inset-0 grid place-items-center">
          <div className="relative aspect-square w-[min(58vmin,440px)]">
            <span className="absolute inset-0 rounded-full border-2 border-white/70" />
            <span className="absolute inset-[9%] rounded-full border border-white/35" />
            <span className="absolute bottom-0 left-1/2 top-0 w-px bg-white/25" />
            <span className="absolute left-0 right-0 top-1/2 h-px bg-white/25" />
            <span data-sweep className="leader-sweep absolute inset-[9%] rounded-full" />
            <span data-leader-n className="t-anton absolute inset-0 grid place-items-center text-[min(30vmin,230px)] leading-none">
              3
            </span>
          </div>
        </div>

        {/* I build software. */}
        <div data-beat="sw" className="absolute inset-0">
          <div className="frame grid h-full content-center gap-y-8 pt-[var(--header-h)] lg:grid-cols-12 lg:gap-x-[var(--gutter)]">
            <div className="lg:col-span-6">
              <p data-sw-in className="t-mono text-white/60">
                Swastik Singh
              </p>
              <h2 className="mt-3 font-[800] leading-[0.9] tracking-[-0.05em] text-[clamp(3rem,8vw,8.4rem)]">
                {['I', 'build', 'software.'].map((w) => (
                  <span key={w} className="mr-[0.2em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                    <span data-sw-w className="inline-block">
                      {w}
                    </span>
                  </span>
                ))}
              </h2>
              <p data-sw-in className="t-mono mt-5 text-white/70">
                <span data-commit-n className="t-num text-[#ffc21a]">0</span> commits in 26 days, across four systems.
              </p>
            </div>
            <div className="relative h-[34svh] overflow-hidden lg:col-span-6 lg:h-[62svh]" style={{ maskImage: 'linear-gradient(transparent, #000 18%, #000 78%, transparent)' }}>
              <ol data-stream className="space-y-2.5 lg:space-y-3.5">
                {INTRO_COMMITS.map((c) => (
                  <li key={c.message} data-line className="t-mono grid grid-cols-[4.6em_1fr] gap-x-3 text-[11px] sm:grid-cols-[4.6em_9.5em_1fr] sm:text-[12.5px] lg:text-[15px]">
                    <span className="text-white/45">{day(c.date)}</span>
                    <span className="truncate text-[#ffc21a] max-sm:hidden">{titleOf(c.slug)}</span>
                    <span className="truncate text-white/85">{c.message}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* I make videos: the contact sheet of the daily run. */}
        <div data-beat="vid" className="absolute inset-x-0 top-0">
          <div className="frame pt-[calc(var(--header-h)+clamp(8px,3svh,40px))]">
            <h2 className="leading-[0.86]">
              <span className="mr-[0.18em] inline-block overflow-hidden align-bottom">
                <span data-vid-w className="t-anton inline-block text-[clamp(3rem,8vw,8.4rem)]">
                  I make
                </span>
              </span>
              <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <span data-vid-w className="t-serif-i inline-block text-[clamp(3.3rem,8.8vw,9.2rem)] text-[#ff9fd4]">
                  videos.
                </span>
              </span>
            </h2>
            <p data-vid-in className="t-mono mt-3 text-white/70">
              <span data-post-n className="t-num text-[#ff9fd4]">1</span> posts in {DAYS_RUN} days, as swastik.mov.
            </p>
          </div>
        </div>
        <div data-beat="sheet" className="absolute inset-x-0 bottom-[clamp(56px,10svh,96px)]">
          <ol className="frame grid grid-cols-5 gap-[clamp(3px,0.5vw,8px)] sm:grid-cols-9">
            {RUN.map((r, i) => (
              <li key={r.code} data-cell className="relative aspect-video overflow-hidden rounded-[3px] bg-white/5">
                <img src={thumbSrc(r)} alt="" decoding="async" fetchPriority="low" className="h-full w-full object-cover" />
                <span className="t-mono absolute left-1 top-0.5 text-[9px] text-white/85 [text-shadow:0_1px_2px_#000]">{String(i + 1).padStart(2, '0')}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* What happens the second time? */}
        <div data-beat="q" className="absolute inset-x-0 top-[calc(var(--header-h)+clamp(16px,7svh,90px))] text-center">
          <div className="frame">
            <p data-q-in className="t-mono text-white/60">
              Both come down to one question:
            </p>
            <h2 className="mt-3 font-[800] leading-[0.92] tracking-[-0.05em] text-[clamp(2.5rem,7vw,7.4rem)]">
              {['What', 'happens', 'the', 'second', 'time?'].map((w) => (
                <span key={w} className="mr-[0.2em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                  <span data-q-w className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
            </h2>
          </div>
        </div>

        {/* Commits racing with the frames: small yellow bars, scattered where the log was. */}
        {Array.from({ length: TOKENS }, (_, i) => (
          <span
            key={i}
            data-token
            className="absolute block h-[5px] w-[16px] rounded-[2px] bg-[#ffc21a] opacity-0"
            style={{ left: `${6 + ((i * 37) % 88)}%`, top: `${58 + ((i * 53) % 30)}%` }}
          />
        ))}

        <div data-flash className="pointer-events-none absolute inset-0 bg-white opacity-0" />
      </div>

      {/* The slot: outside the iris, so it can land on the headline as the page opens. */}
      <span data-slot className="pointer-events-none absolute left-1/2 top-[64%] block h-0 w-0 opacity-0" aria-hidden="true">
        <span data-slot-box className="intro-slot absolute">
          <span className="absolute inset-0 rounded-[16%] border-[3px] border-[#ffc21a]" />
          <span data-slot-fill className="absolute inset-0 rounded-[16%] bg-[#ffc21a]" style={{ transform: 'scale(0)' }} />
          <span data-ring className="absolute inset-0 rounded-[16%] border-2 border-[#ffc21a] opacity-0" />
        </span>
      </span>

      {/* Chrome: who, the timecode, the way out, and where we are. */}
      <div data-chrome className="pointer-events-none absolute inset-0 text-[#eceef1]">
        <div className="frame flex h-[var(--header-h)] items-center justify-between gap-4">
          <span className="flex items-center gap-2.5 font-[700] tracking-[-0.01em]" aria-hidden="true">
            <Mark />
            Swastik Singh
          </span>
          <span className="flex items-center gap-4">
            <span data-tc className="t-mono t-num text-white/55 max-sm:hidden" aria-hidden="true">
              00:00:00:00
            </span>
            <button ref={skipRef} type="button" onClick={skip} className="intro-skip btn btn-sm pointer-events-auto">
              Skip intro
            </button>
          </span>
        </div>
        <div className="absolute inset-x-[var(--gutter)] bottom-[clamp(14px,3svh,28px)] grid grid-cols-3 gap-2" aria-hidden="true">
          {['software', 'video', 'the second time'].map((l, i) => (
            <div key={l}>
              <span className="block h-[2px] overflow-hidden rounded-full bg-white/15">
                <span data-seg={i} className="block h-full origin-left scale-x-0 bg-[#ffc21a]" />
              </span>
              <span className="t-mono mt-1.5 block text-[10px] text-white/50 sm:text-[11px]">{l}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="sr-only">
        Intro. I build software: {TOTAL_COMMITS} commits in 26 days across four systems. I make videos: {RUN.length} posts in {DAYS_RUN} days
        as swastik.mov. Both come down to one question: what happens the second time?
      </p>
    </div>
  );
};
