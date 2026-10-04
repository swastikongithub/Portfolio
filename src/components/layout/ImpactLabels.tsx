import React, { useEffect, useRef, useState } from 'react';
import { INTERACTION } from '../../lib/interaction/config';
import { onLabel, type ImpactLabel } from '../../lib/interaction/labels';

interface Live extends ImpactLabel {
  id: number;
}

/**
 * Where the system answers: a short mono label at the point of impact, for as
 * long as the ripple lasts. Never interactive, never in the way, and mirrored
 * to a polite live region so the outcome is not visual-only.
 */
export const ImpactLabels: React.FC = () => {
  const [labels, setLabels] = useState<Live[]>([]);
  const [announce, setAnnounce] = useState('');
  const seq = useRef(0);

  useEffect(() => {
    const timers = new Set<number>();
    const off = onLabel((l) => {
      const id = ++seq.current;
      setLabels((cur) => [...(INTERACTION.labels.max > 1 ? cur.slice(-(INTERACTION.labels.max - 1)) : []), { ...l, id }]);
      setAnnounce(l.text);
      const t = window.setTimeout(() => {
        setLabels((cur) => cur.filter((x) => x.id !== id));
        timers.delete(t);
      }, INTERACTION.labels.lifetimeMs);
      timers.add(t);
    });
    return () => {
      off();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden="true">
        {labels.map((l) => (
          <span
            key={l.id}
            className={`impact-label t-mono absolute whitespace-nowrap rounded-[3px] px-1.5 py-0.5 ${
              l.accepted ? 'bg-signal text-on-signal' : 'border border-line-2 bg-bg/85 text-ink backdrop-blur-sm'
            }`}
            style={{ left: l.x, top: l.y, animationDuration: `${INTERACTION.labels.lifetimeMs}ms` }}
          >
            {l.text}
          </span>
        ))}
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
    </>
  );
};
