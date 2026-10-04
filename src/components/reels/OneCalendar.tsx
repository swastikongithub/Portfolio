import React, { useMemo, useRef } from 'react';
import { HISTORY } from '../../data/portfolioData';
import { REELS, STREAK, fmtDate } from '../../data/reels';
import { MOTION_OK, gsap, useGSAP } from '../../lib/motion';

const DAY = 864e5;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
/** Monday on or before the first post, to the last commit (a Sunday). */
const START = Date.parse('2025-11-17T00:00:00Z');
const END = Date.parse('2026-10-04T00:00:00Z');
const WEEKS = Math.round((END - START) / DAY / 7) + 1;

const POSTS: Record<string, number> = {};
REELS.forEach((r) => (POSTS[r.date] = (POSTS[r.date] ?? 0) + 1));
const COMMITS: Record<string, number> = {};
HISTORY.forEach((h) => Object.entries(h.days).forEach(([d, n]) => (COMMITS[d] = (COMMITS[d] ?? 0) + n)));
const TOTAL_COMMITS = Object.values(COMMITS).reduce((s, n) => s + n, 0);

/** Commit intensity, in four steps (like a contribution graph). */
const level = (n: number) => (n >= 20 ? 4 : n >= 10 ? 3 : n >= 3 ? 2 : 1);

/** Week column of a date, for the annotations. */
const col = (d: string) => Math.floor((Date.parse(`${d}T00:00:00Z`) - START) / DAY / 7);

const NOTES: { from: string; to: string; text: string; tone: 'post' | 'commit' }[] = [
  { from: STREAK.first, to: STREAK.last, text: `${STREAK.posts} posts in 56 days`, tone: 'post' },
  { from: '2026-01-20', to: '2026-01-23', text: 'Himachal', tone: 'post' },
  { from: '2026-09-09', to: '2026-10-04', text: `${TOTAL_COMMITS} commits, 4 systems`, tone: 'commit' },
];

/**
 * One calendar for both crafts: every post on the grid (pink) and every commit
 * on the four main branches (yellow, deeper for busier days), since the first
 * reel. The days fill in as it scrolls past; nothing here is estimated.
 */
export const OneCalendar: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const cells = useMemo(
    () =>
      Array.from({ length: WEEKS * 7 }, (_, k) => {
        const w = Math.floor(k / 7);
        const d = k % 7;
        const day = iso(START + (w * 7 + d) * DAY);
        return { day, w, d, posts: POSTS[day] ?? 0, commits: COMMITS[day] ?? 0 };
      }),
    [],
  );
  const months = useMemo(() => {
    const out: { w: number; label: string }[] = [];
    let last = '';
    for (let w = 0; w < WEEKS; w++) {
      const m = iso(START + w * 7 * DAY).slice(0, 7);
      if (m !== last) {
        out.push({ w, label: fmtDate(`${m}-01`, { month: 'short' }) });
        last = m;
      }
    }
    return out;
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          '[data-day-on]',
          { scale: 0.2, opacity: 0.1 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            stagger: 0.05,
            scrollTrigger: { trigger: '[data-cal]', start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
          },
        );
        gsap.fromTo(
          '[data-cal-note]',
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, stagger: 0.3, scrollTrigger: { trigger: '[data-cal]', start: 'top 70%', end: 'bottom 50%', scrub: 0.6 } },
        );
        gsap.fromTo(
          '[data-triad] > *',
          { yPercent: 100, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, stagger: 0.12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '[data-triad]', start: 'top 82%', once: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const postCount = REELS.length;

  return (
    <section ref={root} aria-labelledby="calendar-title" className="relative pb-[clamp(96px,12vw,180px)]">
      <div className="frame">
        <h3 id="calendar-title" className="leading-[0.86]">
          <span className="t-anton block text-[clamp(2.4rem,6vw,6rem)]">One calendar,</span>
          <span className="t-serif-i block text-[clamp(2.6rem,6.4vw,6.6rem)] text-signal">two crafts.</span>
        </h3>
        <p className="t-body mt-5 max-w-[56ch] text-ink-2">
          From the oldest post on the grid ({fmtDate(STREAK.first)}) to today: every post on Instagram and every commit on the
          four main branches, one square per day.
        </p>
        <p className="t-mono mt-4 flex flex-wrap gap-x-6 gap-y-1 text-ink-2">
          <span className="flex items-center gap-2">
            <span className="cal-cell cal-post inline-block h-3 w-3" aria-hidden="true" />
            {postCount} posts on Instagram
          </span>
          <span className="flex items-center gap-2">
            <span className="cal-cell cal-c3 inline-block h-3 w-3" aria-hidden="true" />
            {TOTAL_COMMITS} commits on GitHub
          </span>
        </p>

        <div data-cal className="relative mt-10" aria-hidden="true">
          {/* Annotations above the weeks they describe. */}
          <div className="relative h-12">
            {NOTES.map((n) => (
              <span
                key={n.text}
                data-cal-note
                className={`t-mono absolute bottom-0 border-b-2 pb-1 text-[11px] sm:text-[12px] ${n.text === 'Himachal' ? 'max-md:hidden' : ''} ${n.tone === 'post' ? 'border-[var(--reel-pink)] text-[var(--reel-pink)]' : 'border-signal text-signal'} ${n.tone === 'commit' ? 'flex justify-end' : ''}`}
                style={
                  n.tone === 'commit'
                    ? { right: `${((WEEKS - 1 - col(n.to)) / WEEKS) * 100}%`, width: `${((col(n.to) - col(n.from) + 1) / WEEKS) * 100}%` }
                    : { left: `${(col(n.from) / WEEKS) * 100}%`, width: `${((col(n.to) - col(n.from) + 1) / WEEKS) * 100}%` }
                }
              >
                <span className="whitespace-nowrap">{n.text}</span>
              </span>
            ))}
          </div>
          <div className="mt-2 grid gap-[clamp(1.5px,0.3vw,4px)]" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}>
            {cells.map((c) => {
              const on = c.posts || c.commits;
              const cls = c.posts ? 'cal-post' : c.commits ? `cal-c${level(c.commits)}` : 'cal-empty';
              return <span key={c.day} {...(on ? { 'data-day-on': '' } : {})} className={`cal-cell aspect-square ${cls}`} title={on ? `${fmtDate(c.day)}: ${c.posts ? `${c.posts} post${c.posts > 1 ? 's' : ''}` : `${c.commits} commits`}` : undefined} />;
            })}
          </div>
          <div className="relative mt-2 h-4">
            {months.map((m) => (
              <span key={m.w} className="t-mono absolute text-[10px] text-ink-3 max-sm:[&:nth-child(even)]:hidden" style={{ left: `${(m.w / WEEKS) * 100}%` }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
        <p className="sr-only">
          Posts: {STREAK.posts} numbered daily posts from {fmtDate(STREAK.first)} to {fmtDate(STREAK.last)}, then occasional posts until{' '}
          {fmtDate(REELS[0].date)}. Commits: {TOTAL_COMMITS} commits between 9 September and 4 October 2026.
        </p>

        {/* The whole person, in both typefaces. */}
        <p data-triad className="mt-[clamp(72px,10vw,150px)] overflow-hidden leading-[0.9]">
          <span className="block font-[800] tracking-[-0.05em] text-[clamp(2.6rem,7.6vw,8rem)]">I build software.</span>
          <span className="t-serif-i block text-[clamp(2.9rem,8.4vw,9rem)] text-[var(--reel-pink)]">I make videos.</span>
          <span className="block text-[clamp(2.6rem,7.6vw,8rem)]">
            <span className="t-anton">I publish </span>
            <span className="t-serif-i text-signal">both.</span>
          </span>
        </p>
      </div>
    </section>
  );
};
