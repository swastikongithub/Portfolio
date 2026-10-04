import React, { useRef } from 'react';
import { PROJECTS } from '../../data/portfolioData';
import { MOTION_OK, gsap, ScrollTrigger, useGSAP } from '../../lib/motion';

/**
 * "Inside the system": the dark stage the hero's dive opens onto. While it is
 * under the header, the header and the section trace take its palette too.
 */
export const Stage: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top+=64',
        end: 'bottom top+=64',
        onToggle: (self) => document.documentElement.toggleAttribute('data-on-stage', self.isActive),
      });
      return () => {
        st.kill();
        document.documentElement.removeAttribute('data-on-stage');
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={`stage relative ${className}`} data-stage>
      {children}
    </div>
  );
};

/**
 * The page's one marquee: the actual mechanisms, as written in the four
 * codebases. It drifts with the scroll and reverses with it; it stops when
 * offscreen and stays still under reduced motion.
 */
export const MechanismMarquee: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const items = PROJECTS.map((p) => p.mechanism);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = track.current;
        if (!el) return;
        const half = () => el.scrollWidth / 2;
        let x = 0;
        let dir = -1;
        let boost = 0;
        let active = false;
        const tick = (_: number, delta: number) => {
          if (!active) return;
          const w = half();
          x += dir * (0.045 + boost) * delta;
          boost *= 0.92;
          if (x <= -w) x += w;
          if (x > 0) x -= w;
          gsap.set(el, { x });
        };
        gsap.ticker.add(tick);
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => (active = self.isActive),
          onUpdate: (self) => {
            dir = self.direction === 1 ? -1 : 1;
            boost = Math.min(1.2, Math.abs(self.getVelocity()) / 2600);
          },
        });
        return () => {
          gsap.ticker.remove(tick);
          st.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === 'b'}>
      {items.map((m) => (
        <span key={m} className="flex items-center">
          <span className="t-mono-lg whitespace-nowrap px-[clamp(16px,3vw,40px)] text-[clamp(1.1rem,2.6vw,2.2rem)] text-ink">{m}</span>
          <span className="h-3 w-3 shrink-0 rounded-[2px] bg-signal" aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div ref={root} className="overflow-hidden border-y border-line-2 py-5" role="region" aria-label="The four mechanisms">
      <div ref={track} className="flex w-max will-change-transform">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
};
