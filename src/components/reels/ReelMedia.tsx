import React, { useEffect, useRef, useState } from 'react';
import { quietMedia } from './player';
import type { Reel } from '../../data/reels';
import { coverSrc, previewSrc } from '../../data/reels';

/**
 * A reel's cover, and (for the ten that ship one) its silent preview loop.
 * The video element gets a source only once `play` is true and the frame is
 * near the viewport, so nothing downloads until it can be seen; it pauses when
 * it leaves. Previews never play under reduced motion or Save-Data.
 */
export const ReelFrame: React.FC<{
  reel: Reel;
  play?: boolean;
  className?: string;
  fit?: 'cover' | 'contain';
  eager?: boolean;
}> = ({ reel, play = false, className = '', fit = 'cover', eager = false }) => {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const canPlay = !!reel.video && play && !quietMedia();

  useEffect(() => {
    const el = box.current;
    if (!el || !reel.video) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reel.video]);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (canPlay && near) {
      if (!v.src) v.src = previewSrc(reel);
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [canPlay, near, reel]);

  const objectFit = fit === 'cover' ? 'object-cover' : 'object-contain';
  return (
    <div ref={box} className={`overflow-hidden bg-black ${/\b(absolute|fixed)\b/.test(className) ? '' : 'relative'} ${className}`}>
      {fit === 'contain' && (
        <img src={coverSrc(reel)} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl" loading="lazy" decoding="async" />
      )}
      <img
        src={coverSrc(reel)}
        alt=""
        className={`absolute inset-0 h-full w-full ${objectFit}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
      {reel.video && (
        <video
          ref={vid}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          onPlaying={() => setReady(true)}
          className={`absolute inset-0 h-full w-full ${objectFit} transition-opacity duration-500 ${ready && canPlay && near ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};
