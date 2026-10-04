import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PROFILE, REELS, TOP_REELS, coverSrc, fmtDate, fmtViews, fullSrc, reelUrl, quoted } from '../../data/reels';
import { useSite } from '../../context/site';
import { trapTab } from '../../lib/focus';
import { EASE, gsap } from '../../lib/motion';
import { ReelPlayerContext } from './player';

/** The reels that ship a full video, in the order the player steps through them. */
const PLAYABLE = TOP_REELS;

/**
 * The full reel, with sound, in a dialog. Opened from anywhere in the chapter;
 * only reels that ship a video open here (others go to Instagram). Escape or
 * the close button returns focus to whatever opened it; arrow keys step
 * through the ten.
 */
export const ReelPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setScrollLocked, reducedMotion } = useSite();
  const [code, setCode] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  const open = useCallback((c: string, from?: HTMLElement | null) => {
    const reel = REELS.find((r) => r.code === c);
    if (!reel) return;
    if (!reel.video) {
      window.open(reelUrl(reel), '_blank', 'noopener,noreferrer');
      return;
    }
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setCode(c);
  }, []);

  const close = useCallback(() => setCode(null), []);
  const step = useCallback(
    (d: number) =>
      setCode((c) => {
        const i = PLAYABLE.findIndex((r) => r.code === c);
        return PLAYABLE[(i + d + PLAYABLE.length) % PLAYABLE.length].code;
      }),
    [],
  );

  const isOpen = code !== null;
  useEffect(() => {
    if (!isOpen) return;
    setScrollLocked(true);
    const el = dialog.current;
    const back = opener.current;
    el?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    if (el && !reducedMotion) {
      gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(el.querySelector('[data-sheet]'), { y: 40, scale: 0.97 }, { y: 0, scale: 1, duration: 0.6, ease: EASE.out });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
      else trapTab(e, el);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      setScrollLocked(false);
      back?.focus({ preventScroll: true });
    };
  }, [isOpen, close, step, setScrollLocked, reducedMotion]);

  // A new reel: start it (the open was a click, so sound is allowed).
  useEffect(() => {
    const v = video.current;
    if (!v || !code) return;
    v.load();
    v.play().catch(() => {});
  }, [code]);

  const reel = code ? REELS.find((r) => r.code === code) : null;
  const rank = reel ? PLAYABLE.findIndex((r) => r.code === reel.code) + 1 : 0;

  return (
    <ReelPlayerContext.Provider value={open}>
      {children}
      {reel && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`${reel.label ?? 'Reel'} from swastik.mov`}
          className="reel fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-3 backdrop-blur-md sm:p-6"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <div data-sheet className="grid max-h-full w-full max-w-[1180px] gap-4 overflow-y-auto rounded-[var(--r-lg)] bg-bg p-3 text-ink sm:p-5 lg:grid-cols-[1fr_300px]">
            <div className={`relative mx-auto w-full overflow-hidden rounded-[var(--r-md)] bg-black ${reel.shape === 'tall' ? 'aspect-[9/16] max-h-[78svh] max-w-[calc(78svh*9/16)]' : 'aspect-video'}`}>
              <video
                ref={video}
                key={reel.code}
                src={fullSrc(reel)}
                poster={coverSrc(reel)}
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <p className="t-mono text-ink-2">
                  {rank} of {PLAYABLE.length} featured
                </p>
                <button type="button" onClick={close} className="btn btn-sm" data-autofocus>
                  Close
                </button>
              </div>
              <div>
                <p className="t-anton text-[clamp(2.4rem,5vw,3.6rem)] leading-none text-signal">{fmtViews(reel.views!)}</p>
                <p className="t-mono mt-1 text-ink-2">views as of {PROFILE.readOn}. Posted {fmtDate(reel.date)}.</p>
              </div>
              {reel.caption && <p className="t-serif-i text-[1.6rem] leading-[1.15]">{quoted(reel.caption)}</p>}
              {reel.label && <p className="t-mono text-ink-2">{reel.label}</p>}
              <div className="mt-auto flex flex-wrap gap-2">
                <button type="button" className="btn btn-sm" onClick={() => step(-1)} aria-label="Previous reel">
                  Previous
                </button>
                <button type="button" className="btn btn-sm" onClick={() => step(1)} aria-label="Next reel">
                  Next
                </button>
                <a href={reelUrl(reel)} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-signal">
                  Open on Instagram<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </ReelPlayerContext.Provider>
  );
};
