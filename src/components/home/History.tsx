import React, { useMemo, useRef } from 'react';
import { HISTORY, HISTORY_RANGE, PROJECTS } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { gsap, useGSAP } from '../../lib/motion';

const DAY = 86_400_000;
const start = Date.parse(`${HISTORY_RANGE.from}T00:00:00Z`);
const DAYS = Math.round((Date.parse(`${HISTORY_RANGE.to}T00:00:00Z`) - start) / DAY) + 1;
const dayIndex = (iso: string) => Math.round((Date.parse(`${iso}T00:00:00Z`) - start) / DAY);
const fmt = (i: number) =>
  new Date(start + i * DAY).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const titleOf = (slug: string) => PROJECTS.find((p) => p.slug === slug)!.title;

const LANES = HISTORY.map((h) => {
  const nodes = Object.entries(h.days).map(([iso, n]) => ({ day: dayIndex(iso), n }));
  const days = nodes.map((x) => x.day);
  return { ...h, title: titleOf(h.slug), nodes, first: Math.min(...days), last: Math.max(...days) };
});
const TOTAL = LANES.reduce((s, l) => s + l.nodes.reduce((t, x) => t + x.n, 0), 0);
const LOG = LANES.flatMap((l) => l.milestones.map((m) => ({ ...m, day: dayIndex(m.date), title: l.title }))).sort(
  (a, b) => a.day - b.day,
);

/** Node diameter (px) from the day's commit count. */
const size = (n: number) => Math.round(12 + Math.sqrt(n) * 5.6);

/**
 * The record: every commit on the four main branches, as a git graph that
 * scrolls past a playhead. Days light up as they cross it, the counter adds
 * them up, and the log reads out the commits worth reading. Nothing here is
 * estimated; see HISTORY in portfolioData.
 */
export const History: React.FC = () => {
  const { reducedMotion } = useSite();
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const dateRef = useRef<HTMLSpanElement>(null);
  const logRef = useRef<HTMLOListElement>(null);
  const pinned = !reducedMotion;

  const ticks = useMemo(() => Array.from({ length: DAYS }, (_, i) => i), []);

  useGSAP(
    () => {
      const vp = viewport.current;
      const tr = track.current;
      if (!pinned || !vp || !tr) return;
      const nodes = gsap.utils.toArray<HTMLElement>('[data-node]', tr);
      const fills = gsap.utils.toArray<HTMLElement>('[data-fill]', tr);
      const logItems = gsap.utils.toArray<HTMLElement>('[data-log]', logRef.current);
      const dayW = () => tr.querySelector<HTMLElement>('[data-axis]')!.offsetWidth / DAYS;
      const travel = () => DAYS * dayW() - dayW() * 0.5;
      let lastDay = -2;
      // Phones keep the two latest commits in view; wider screens three.
      const keep = window.matchMedia('(max-width: 639px)').matches ? 2 : 3;

      const paint = (progress: number) => {
        const cur = progress * (DAYS - 1);
        const d = Math.floor(cur + 0.001);
        // Lanes fill continuously; everything else changes only when the day does.
        LANES.forEach((l, i) => {
          const f = l.last === l.first ? (cur >= l.first ? 1 : 0) : (cur - l.first) / (l.last - l.first);
          fills[i].style.transform = `scaleX(${Math.max(0, Math.min(1, f))})`;
        });
        if (d === lastDay) return;
        lastDay = d;
        let sum = 0;
        nodes.forEach((el) => {
          const lit = +el.dataset.day! <= d;
          el.toggleAttribute('data-lit', lit);
          if (lit) sum += +el.dataset.n!;
        });
        if (countRef.current) countRef.current.textContent = String(sum);
        if (dateRef.current) dateRef.current.textContent = fmt(Math.max(0, d));
        const passed = logItems.filter((el) => +el.dataset.day! <= d);
        logItems.forEach((el) => {
          const age = passed.length - 1 - passed.indexOf(el);
          const shown = passed.includes(el) && age < keep;
          el.style.order = String(-age);
          el.toggleAttribute('data-shown', shown);
          el.style.opacity = shown ? String(1 - age * 0.3) : '0';
        });
      };

      gsap.to(tr, {
        x: () => -travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${Math.round(travel() * 1.1 + window.innerHeight * 0.4)}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => paint(self.progress),
          onRefresh: (self) => paint(self.progress),
        },
      });
      paint(0);
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="record"
      aria-labelledby="record-title"
      className={`relative overflow-hidden ${pinned ? 'flex h-[100svh] flex-col' : 'py-[clamp(72px,10vw,140px)]'}`}
    >
      <div className={`frame ${pinned ? 'pt-[calc(var(--header-h)+clamp(8px,3svh,40px))]' : ''}`}>
        <h2 id="record-title" className="font-[800] leading-[0.9] tracking-[-0.05em] text-[clamp(2.3rem,8vw,8rem)]">
          <span className="sr-only">
            {TOTAL} commits in {DAYS} days.
          </span>
          <span aria-hidden="true">
            <span ref={countRef} className="t-num text-signal">
              {pinned ? 0 : TOTAL}
            </span>{' '}
            commits
            <span className="block text-ink-3">in {DAYS} days.</span>
          </span>
        </h2>
        <p className="t-body mt-[clamp(10px,2svh,20px)] max-w-[52ch] text-ink-2">
          Every commit on the four main branches, {fmt(0)} to {fmt(DAYS - 1)} 2026, counted from <code className="t-mono text-ink">git log</code>.
        </p>
      </div>

      {/* The graph. Decorative: the list after it carries the same record. */}
      <div
        ref={viewport}
        className={`relative mt-[clamp(16px,4svh,48px)] ${pinned ? 'min-h-0 flex-1' : 'overflow-x-auto pb-4'}`}
        aria-hidden="true"
      >
        {pinned && (
          <div className="pointer-events-none absolute bottom-0 top-0 z-10 w-px bg-signal [left:var(--ph)]">
            <span ref={dateRef} className="t-mono absolute left-2 top-0 whitespace-nowrap rounded-[3px] bg-signal px-1.5 py-0.5 text-on-signal">
              {fmt(0)}
            </span>
          </div>
        )}
        <div
          ref={track}
          className="relative h-full min-h-[clamp(200px,32svh,380px)] w-max will-change-transform"
          style={{ paddingLeft: pinned ? 'var(--ph)' : 'var(--gutter)', paddingRight: pinned ? 'calc(100vw - var(--ph))' : 'var(--gutter)' }}
        >
          <div data-axis className="relative h-full" style={{ width: `calc(${DAYS} * var(--day))` }}>
            {ticks.map((i) => (
              <span key={i} className="absolute bottom-0 block w-px bg-line-2" style={{ left: `calc(${i + 0.5} * var(--day))`, height: i % 7 === 0 ? 14 : 6 }}>
                {(i % 7 === 0 || i === DAYS - 1) && (
                  <span className="t-mono absolute bottom-full mb-1 -translate-x-1/2 whitespace-nowrap text-ink-3">{fmt(i)}</span>
                )}
              </span>
            ))}
            {LANES.map((l, li) => {
              const top = `${10 + li * 21}%`;
              const left = `calc(${l.first + 0.5} * var(--day))`;
              const width = `calc(${l.last - l.first} * var(--day))`;
              return (
                <div key={l.slug} className="absolute inset-x-0" style={{ top }}>
                  <span className="t-mono absolute -translate-y-[calc(100%+14px)] whitespace-nowrap text-ink-2" style={{ left }}>
                    {l.title}
                    {l.note && <span className="text-ink-3">, history from {fmt(l.first)}</span>}
                  </span>
                  <span className="absolute block h-[2px] -translate-y-1/2 bg-line-2" style={{ left, width }} />
                  <span
                    data-fill
                    className="absolute block h-[2px] origin-left -translate-y-1/2 bg-signal"
                    style={{ left, width, transform: pinned ? 'scaleX(0)' : undefined }}
                  />
                  {l.nodes.map((x) => (
                    <span
                      key={x.day}
                      data-node
                      data-day={x.day}
                      data-n={x.n}
                      data-lit={pinned ? undefined : ''}
                      data-cursor={`${fmt(x.day)}: ${x.n} commit${x.n === 1 ? '' : 's'}`}
                      className="history-node t-mono absolute grid place-items-center rounded-full"
                      style={{ left: `calc(${x.day + 0.5} * var(--day))`, width: size(x.n), height: size(x.n) }}
                    >
                      {x.n}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`frame ${pinned ? 'pb-[clamp(16px,4svh,40px)] pt-3 lg:pb-20' : 'mt-10'}`}>
        <ol ref={logRef} className={pinned ? 'flex min-h-[5.5em] flex-col justify-end gap-1.5 sm:min-h-[7.5em]' : 'space-y-3'} aria-label="Commits worth reading">
          {LOG.map((m) => (
            <li
              key={m.message}
              data-log
              data-day={m.day}
              data-shown={pinned ? undefined : ''}
              className="history-log grid gap-x-4 sm:grid-cols-[6.5em_11em_1fr]"
              style={pinned ? { opacity: 0 } : undefined}
            >
              <span className="t-mono text-ink-3">{fmt(m.day)}</span>
              <span className="t-mono text-ink-2 max-sm:hidden">{m.title}</span>
              <span className="t-mono text-ink">
                <span className="text-ink-2 sm:hidden">{m.title}: </span>
                {m.message}
              </span>
            </li>
          ))}
        </ol>
        <ul className="sr-only">
          {LANES.map((l) => (
            <li key={l.slug}>
              {l.title}: {l.nodes.reduce((t, x) => t + x.n, 0)} commits between {fmt(l.first)} and {fmt(l.last)}.
              {l.note ? ` ${l.note}` : ''}
            </li>
          ))}
        </ul>
        <p className="t-small mt-3 text-ink-3 max-sm:hidden" aria-hidden="true">
          {LANES.filter((l) => l.note).map((l) => `${l.title}: ${l.note}`)}
        </p>
      </div>
    </section>
  );
};
