import React, { useRef } from 'react';
import { ScrollTrigger, gsap, useGSAP } from '../../lib/motion';

/** Reading-progress hairline. Written straight to a transform — no React re-render per scroll. */
export const ScrollProgress: React.FC<{ routeKey: string }> = ({ routeKey }) => {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const setX = gsap.quickSetter(bar.current, 'scaleX');
      setX(0);
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => setX(self.progress),
      });
    },
    { dependencies: [routeKey], revertOnUpdate: true },
  );

  return (
    <div className="fixed inset-x-0 top-0 z-[70] h-[2px] pointer-events-none" aria-hidden="true">
      <div ref={bar} className="h-full origin-left bg-accent" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
};
