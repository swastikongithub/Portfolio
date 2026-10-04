import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PROFILE, TOP_REELS, fmtDate, fmtViews, type Reel, quoted } from '../../data/reels';
import { MOTION_OK, gsap, useGSAP } from '../../lib/motion';
import { ReelFrame } from './ReelMedia';
import { useReelPlayer } from './player';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  i: number;
}

/** Squarified treemap (Bruls, Huizing, van Wijk) of values into a w × h box. */
function squarify(values: number[], W: number, H: number): Rect[] {
  const total = values.reduce((s, v) => s + v, 0);
  let rest = values.map((v, i) => ({ a: (v / total) * W * H, i }));
  const out: Rect[] = [];
  let x = 0;
  let y = 0;
  let w = W;
  let h = H;
  const worst = (row: { a: number }[], s: number) => {
    const sum = row.reduce((t, r) => t + r.a, 0);
    return Math.max(...row.map((r) => Math.max((s * s * r.a) / (sum * sum), (sum * sum) / (s * s * r.a))));
  };
  while (rest.length) {
    const s = Math.min(w, h);
    const row = [rest[0]];
    let k = 1;
    while (k < rest.length && worst([...row, rest[k]], s) <= worst(row, s)) row.push(rest[k++]);
    const area = row.reduce((t, r) => t + r.a, 0);
    if (w >= h) {
      const rw = area / h;
      let yy = y;
      row.forEach((r) => {
        out.push({ x, y: yy, w: rw, h: r.a / rw, i: r.i });
        yy += r.a / rw;
      });
      x += rw;
      w -= rw;
    } else {
      const rh = area / w;
      let xx = x;
      row.forEach((r) => {
        out.push({ x: xx, y, w: r.a / rh, h: rh, i: r.i });
        xx += r.a / rh;
      });
      y += rh;
      h -= rh;
    }
    rest = rest.slice(row.length);
  }
  return out;
}

/** Box shape per breakpoint: wide on desktop, tall on phones. */
const SHAPES = { wide: 1.78, tall: 0.62 };

/**
 * Ten of the most-watched reels, sized by how many people watched them: each
 * tile's area is its view count. The largest tiles play their silent previews
 * while on screen; the rest play when pointed at or focused. Any tile opens the
 * full reel with sound.
 */
export const TopReels: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const [shape, setShape] = useState<'wide' | 'tall'>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches ? 'tall' : 'wide',
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const on = () => setShape(mq.matches ? 'tall' : 'wide');
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const rects = useMemo(() => {
    const r = SHAPES[shape];
    return squarify(
      TOP_REELS.map((x) => x.views!),
      r,
      1,
    ).map((q) => ({ ...q, x: q.x / r, w: q.w / r }));
  }, [shape]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-tile]',
          { clipPath: 'inset(50% 50% 50% 50%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.07,
            scrollTrigger: { trigger: '[data-map]', start: 'top 78%', once: true },
          },
        );
        gsap.fromTo(
          '[data-top-in]',
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, stagger: 0.08, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [shape] },
  );

  const first = TOP_REELS[0];
  const last = TOP_REELS[TOP_REELS.length - 1];

  return (
    <section ref={root} aria-labelledby="top-title" className="relative py-[clamp(72px,10vw,150px)]">
      <div className="frame">
        <h3 id="top-title" className="leading-[0.86]" data-top-in>
          <span className="t-anton block text-[clamp(3rem,9vw,9.5rem)]">Ten of the</span>
          <span className="t-serif-i block text-[clamp(3rem,8.6vw,9rem)] text-[var(--reel-pink)]">most watched.</span>
        </h3>
        <p className="t-body mt-5 max-w-[52ch] text-ink-2" data-top-in>
          Each tile’s area is its view count as Instagram showed it on {PROFILE.readOn}: {fmtViews(first.views!)} for the first,{' '}
          {fmtViews(last.views!)} for the tenth. Press any of them to watch it with sound.
        </p>

        <ol
          data-map
          className="relative mt-[clamp(28px,4vw,56px)] w-full"
          style={{ aspectRatio: String(SHAPES[shape]) }}
          aria-label="Ten of the most watched reels, most watched first"
        >
          {rects.map((r) => (
            <Tile key={TOP_REELS[r.i].code} reel={TOP_REELS[r.i]} rank={r.i + 1} rect={r} autoplay={shape === 'tall' ? r.i === 0 : r.i < 4} />
          ))}
        </ol>
      </div>
    </section>
  );
};

const Tile: React.FC<{ reel: Reel; rank: number; rect: Rect; autoplay: boolean }> = ({ reel, rank, rect, autoplay }) => {
  const openReel = useReelPlayer();
  const [hot, setHot] = useState(false);
  const gap = 3;
  return (
    <li
      data-tile
      className="absolute"
      style={{
        left: `calc(${rect.x * 100}% + ${gap / 2}px)`,
        top: `calc(${rect.y * 100}% + ${gap / 2}px)`,
        width: `calc(${rect.w * 100}% - ${gap}px)`,
        height: `calc(${rect.h * 100}% - ${gap}px)`,
      }}
    >
      <button
        type="button"
        onClick={(e) => openReel(reel.code, e.currentTarget)}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={() => setHot(false)}
        className="tile group relative block h-full w-full overflow-hidden rounded-[6px] text-left"
        style={{ containerType: 'size' }}
        aria-label={`Number ${rank}: ${fmtViews(reel.views!)} views, ${reel.label ?? 'reel'}, ${fmtDate(reel.date)}${reel.caption ? `: ${reel.caption}` : ''}. Play with sound`}
        data-cursor-label="play with sound"
      >
        <ReelFrame reel={reel} play={autoplay || hot} className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.04]" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" />
        <span className="t-mono absolute left-[6cqmin] top-[5cqmin] text-[clamp(10px,5cqmin,13px)] text-white/85" aria-hidden="true">
          {String(rank).padStart(2, '0')}
        </span>
        <span className="absolute inset-x-[6cqmin] bottom-[5cqmin] block text-white" aria-hidden="true">
          <span className="t-anton block text-signal" style={{ fontSize: 'clamp(14px, 21cqmin, 150px)' }}>
            {fmtViews(reel.views!)}
          </span>
          <span className="tile-caption t-serif-i mt-1 block leading-[1.1]" style={{ fontSize: 'clamp(12px, 7cqmin, 30px)' }}>
            {reel.caption ? quoted(reel.caption) : reel.label}
          </span>
        </span>
      </button>
    </li>
  );
};
