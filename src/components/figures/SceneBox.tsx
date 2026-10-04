import React, { useEffect, useRef, useState } from 'react';

const SCENE_W = 1200;
const SCENE_H = 720;

/**
 * A fixed 1200 × 720 composition, scaled to fit the space it is given, so the
 * pinned scenes can be choreographed in exact coordinates. Used only at
 * widths where the scale keeps type readable (see `useSceneMode`).
 */
export const SceneBox: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => {
      const { width, height } = el.getBoundingClientRect();
      setScale(Math.min(width / SCENE_W, height / SCENE_H));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrap} className={`absolute inset-x-[var(--gutter)] bottom-6 top-[calc(var(--header-h)+20px)] ${className}`}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{ width: SCENE_W, height: SCENE_H, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: '50% 50%' }}
      >
        {children}
      </div>
    </div>
  );
};
