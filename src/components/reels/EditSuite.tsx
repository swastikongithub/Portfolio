import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  MARKERS,
  REELS_CHRONO,
  REEL_COUNT,
  STREAK,
  TOTAL_VIEWS,
  fmtDate,
  fmtViews,
  reelUrl,
  thumbSrc,
  type Reel, quoted } from '../../data/reels';
import { useSite } from '../../context/site';
import { gsap, ScrollTrigger, useGSAP } from '../../lib/motion';
import { TransitionLink } from '../ui/TransitionLink';
import { ReelFrame } from './ReelMedia';
import { useReelPlayer } from './player';

const CLIPS = REELS_CHRONO;
const N = CLIPS.length;
const MAX = Math.max(...CLIPS.map((c) => c.views ?? 0));
/** Bar height for the views track: square-root scale, so the long tail stays visible next to 149K. */
const barH = (v?: number) => (v ? Math.max(0.08, Math.sqrt(v / MAX)) : 0);
const monthOf = (iso: string) => iso.slice(0, 7);

/**
 * Every post, in the order it was made, laid out as an edit: a program monitor,
 * an inspector, and a timeline with a picture track (the covers) and a second
 * track whose bars are views. Scrolling moves the playhead; the monitor shows
 * the clip under it and, for the ten most watched, plays its silent preview once
 * the playhead rests. Under reduced motion it is a plain, clickable strip.
 */
export const EditSuite: React.FC = () => {
  const { reducedMotion, scrollToY } = useSite();
  const openReel = useReelPlayer();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [cur, setCur] = useState(() => CLIPS.findIndex((c) => c.code === 'DRUXT1_Enrm'));
  const [settled, setSettled] = useState(true);
  const curRef = useRef(cur);
  const pinned = !reducedMotion;

  useGSAP(
    () => {
      const tr = track.current;
      if (!pinned || !tr) return;
      const clipW = () => tr.querySelector<HTMLElement>('[data-clip]')!.offsetWidth;
      let timer = 0;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${Math.round((N - 1) * clipW() * 0.9 + window.innerHeight * 0.6)}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const f = self.progress * (N - 1);
          gsap.set(tr, { x: -f * clipW() });
          const i = Math.round(f);
          if (i !== curRef.current) {
            curRef.current = i;
            setCur(i);
          }
          setSettled(false);
          window.clearTimeout(timer);
          timer = window.setTimeout(() => setSettled(true), 260);
        },
        onRefresh: (self) => gsap.set(tr, { x: -self.progress * (N - 1) * clipW() }),
      });
      stRef.current = st;
      return () => {
        window.clearTimeout(timer);
        st.kill();
        stRef.current = null;
      };
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true },
  );

  const select = useCallback(
    (i: number) => {
      const st = stRef.current;
      if (st) scrollToY(st.start + ((st.end - st.start) * i) / (N - 1));
      else {
        curRef.current = i;
        setCur(i);
      }
    },
    [scrollToY],
  );

  // Without the pin the strip scrolls itself: keep the current clip in view.
  useEffect(() => {
    if (pinned) return;
    track.current?.querySelector<HTMLElement>(`[data-clip="${cur}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [cur, pinned]);

  const openAt = useCallback((i: number, el: HTMLElement) => openReel(CLIPS[i].code, el), [openReel]);
  const clip = CLIPS[cur];

  return (
    <section
      ref={root}
      aria-labelledby="sequence-title"
      className={`relative overflow-hidden ${pinned ? 'flex h-[100svh] flex-col' : 'py-[clamp(56px,8vw,120px)]'}`}
    >
      <div className={`frame ${pinned ? 'pt-[calc(var(--header-h)+clamp(6px,1.6svh,20px))]' : ''}`}>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h3 id="sequence-title" className="leading-[0.9]">
            <span className="t-anton text-[clamp(1.9rem,4.4vw,4.4rem)]">Every post, </span>
            <span className="t-serif-i text-[clamp(2.1rem,4.8vw,4.8rem)] text-signal">in the order I made them.</span>
          </h3>
          <dl className="t-mono flex gap-5 text-ink-2 max-sm:text-[11px]">
            <div>
              <dt className="sr-only">Reels</dt>
              <dd>{REEL_COUNT} reels</dd>
            </div>
            <div>
              <dt className="sr-only">Views</dt>
              <dd>{Math.floor(TOTAL_VIEWS / 1000)}K+ views</dd>
            </div>
            <div className="max-sm:hidden">
              <dt className="sr-only">Daily run</dt>
              <dd>
                {STREAK.posts} posts in {Math.round((Date.parse(STREAK.last) - Date.parse(STREAK.first)) / 864e5) + 1} days
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Monitor and inspector. */}
      <div className={`frame flex flex-col gap-x-[var(--gutter)] gap-y-3 lg:flex-row ${pinned ? 'mt-[clamp(8px,2svh,24px)] min-h-0 flex-1' : 'mt-8'}`}>
        <div className={`min-h-0 ${pinned ? 'lg:h-full' : 'lg:w-[62%]'}`}>
          <Monitor clip={clip} play={settled} fill={pinned} onOpen={(el) => openReel(clip.code, el)} />
        </div>
        <Inspector clip={clip} onOpen={(el) => openReel(clip.code, el)} />
      </div>

      {/* Timeline. Decorative for screen readers: the list below it carries the same posts. */}
      <Timeline ref={track} cur={cur} pinned={pinned} onSelect={select} onOpen={openAt} />
    </section>
  );
};

const Monitor: React.FC<{ clip: Reel; play: boolean; fill: boolean; onOpen: (el: HTMLElement) => void }> = ({ clip, play, fill, onOpen }) => (
  <div className={`relative aspect-video w-full overflow-hidden rounded-[var(--r-md)] border border-line bg-black ${fill ? 'lg:h-full lg:max-h-[62svh] lg:w-auto lg:max-w-[62vw]' : ''}`}>
    <div key={clip.code} className="monitor-cut absolute inset-0">
      <ReelFrame reel={clip} play={play} fit="contain" className="absolute inset-0" eager />
    </div>
    {/* Program monitor chrome. */}
    <div className="t-mono pointer-events-none absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/60 to-transparent px-3 py-2 text-[11px] text-white/90">
      <span>{fmtDate(clip.date, { day: '2-digit', month: '2-digit', year: 'numeric' }).replaceAll('/', '.')}</span>
      <span>{clip.label ?? (clip.kind === 'reel' ? 'Reel' : clip.kind === 'photo' ? 'Photo' : 'Carousel')}</span>
    </div>
    <span className="pointer-events-none absolute inset-[7%] border border-white/15" aria-hidden="true" />
    {clip.video && (
      <button
        type="button"
        onClick={(e) => onOpen(e.currentTarget)}
        className="btn btn-sm btn-signal absolute bottom-3 left-3"
        data-cursor-label="play with sound"
      >
        Play with sound
      </button>
    )}
  </div>
);

const Inspector: React.FC<{ clip: Reel; onOpen: (el: HTMLElement) => void }> = ({ clip, onOpen }) => (
  <div className="flex min-w-0 flex-col gap-2 lg:max-w-[440px] lg:flex-1 lg:gap-3" aria-live="polite">
    <p className="t-mono flex flex-wrap gap-x-3 text-ink-2">
      <span>{fmtDate(clip.date)}</span>
      <span>{clip.label ?? clip.kind}</span>
    </p>
    <p className="flex items-baseline gap-3">
      <span className="t-anton text-[clamp(2.2rem,4.6vw,4.4rem)] leading-none text-signal">{clip.views ? fmtViews(clip.views) : clip.kind}</span>
      {clip.views && <span className="t-mono text-ink-2">views</span>}
    </p>
    {clip.caption ? (
      <p className="t-serif-i line-clamp-3 text-[clamp(1.3rem,2vw,1.9rem)] leading-[1.1]">{quoted(clip.caption)}</p>
    ) : (
      <p className="t-mono text-ink-3">No caption beyond the number.</p>
    )}
    {clip.crossover && (
      <p className="t-small border-l-2 border-signal pl-3 text-ink-2">
        {clip.crossover} <TransitionLink to="/projects/lpu-reserve" className="link text-ink">See LPU Reserve</TransitionLink>
      </p>
    )}
    <div className="mt-1 flex flex-wrap gap-2 max-lg:hidden">
      {clip.video ? (
        <button type="button" className="btn btn-sm btn-signal" onClick={(e) => onOpen(e.currentTarget)}>
          Play with sound
        </button>
      ) : null}
      <a href={reelUrl(clip)} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
        Open on Instagram<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </div>
  </div>
);

const Timeline = memo(
  React.forwardRef<
    HTMLDivElement,
    { cur: number; pinned: boolean; onSelect: (i: number) => void; onOpen: (i: number, el: HTMLElement) => void }
  >(({ cur, pinned, onSelect, onOpen }, ref) => {
    const onKey = (e: React.KeyboardEvent, i: number) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const j = Math.max(0, Math.min(N - 1, i + d));
      onSelect(j);
      (e.currentTarget.parentElement?.parentElement?.querySelector(`[data-clip="${j}"] button`) as HTMLElement | null)?.focus({ preventScroll: true });
    };
    return (
      <div className={`relative mt-[clamp(10px,2.4svh,28px)] ${pinned ? 'pb-[clamp(14px,3svh,32px)]' : 'pb-2'}`}>
        <div className={`relative pt-6 ${pinned ? 'overflow-hidden' : 'no-scrollbar overflow-x-auto'}`}>
          {pinned && (
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-6 z-10 w-[2px] -translate-x-1/2 bg-signal" aria-hidden="true">
              <span className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[8px] border-x-transparent border-t-signal" />
            </div>
          )}
          <div
            ref={ref}
            className="relative flex w-max will-change-transform"
            style={{ paddingLeft: pinned ? 'calc(50% - var(--clip) / 2)' : 'var(--gutter)', paddingRight: pinned ? 'calc(50% - var(--clip) / 2)' : 'var(--gutter)' }}
            role="list"
            aria-label="Posts, oldest first"
          >
            {CLIPS.map((c, i) => {
              const newMonth = i === 0 || monthOf(c.date) !== monthOf(CLIPS[i - 1].date);
              const active = i === cur;
              return (
                <div key={c.code} data-clip={i} role="listitem" className="relative w-[var(--clip)] shrink-0">
                  {/* Ruler: a tick per post, the month where it changes, and markers. */}
                  <div className="relative h-7 border-b border-line-2" aria-hidden="true">
                    {newMonth && (
                      <span className="t-mono absolute bottom-1 left-1 whitespace-nowrap text-[10px] text-ink-2">
                        {fmtDate(c.date, { month: 'short', year: '2-digit' })}
                      </span>
                    )}
                    <span className={`absolute bottom-0 left-0 w-px bg-line-2 ${newMonth ? 'h-full' : 'h-1.5'}`} />
                    {MARKERS[c.code] && (
                      <span className="t-mono absolute -top-5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap text-[10px] text-[var(--reel-pink)]">
                        <span className="h-1.5 w-1.5 rotate-45 bg-[var(--reel-pink)]" />
                        {MARKERS[c.code]}
                      </span>
                    )}
                  </div>
                  {/* V1: the picture. */}
                  <button
                    type="button"
                    tabIndex={active ? 0 : -1}
                    onClick={(e) => (active ? onOpen(i, e.currentTarget) : onSelect(i))}
                    onKeyDown={(e) => onKey(e, i)}
                    className={`clip-btn relative mt-1 block h-[var(--v1)] w-full overflow-hidden rounded-[3px] border ${active ? 'border-signal' : 'border-transparent'}`}
                    aria-label={`${c.label ?? c.kind}, ${fmtDate(c.date)}${c.views ? `, ${fmtViews(c.views)} views` : ''}${c.caption ? `: ${c.caption.replace(/[.…]$/, '')}` : ''}${active ? (c.video ? '. Press to play with sound' : '. Press to open on Instagram') : ''}`}
                    aria-current={active ? 'true' : undefined}
                    data-cursor-label={active ? (c.video ? 'play with sound' : 'open on Instagram') : 'go to this post'}
                  >
                    <img src={thumbSrc(c)} alt="" loading="lazy" decoding="async" className={`h-full w-full object-cover transition-[filter,opacity] duration-300 ${active ? '' : 'opacity-75 grayscale-[35%]'}`} />
                    {c.video && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-signal" aria-hidden="true" />}
                  </button>
                  {/* A1: views. */}
                  <div className="relative mt-1 h-[var(--a1)] border-t border-line" aria-hidden="true">
                    <span
                      className={`absolute bottom-0 left-[12%] right-[12%] origin-bottom rounded-t-[2px] ${c.video ? 'bg-signal' : 'bg-ink-3'}`}
                      style={{ height: `${barH(c.views) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="frame t-mono mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ink-3" aria-hidden="true">
          <span>V1 the covers</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-1.5 bg-ink-3" />
            A1 views
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal" />
            the ten most watched
          </span>
        </div>
      </div>
    );
  }),
);
Timeline.displayName = 'Timeline';
