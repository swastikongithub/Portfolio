import { forwardRef } from 'react';

export const LANES = 6;

/**
 * Route transition: six lanes sweep across, the request line for the next page
 * is printed, and the lanes leave the other way. Driven by App's transitionTo.
 * Purely visual (aria-hidden); focus moves to the new page's heading after.
 */
export const LaneTransition = forwardRef<HTMLDivElement>(function LaneTransition(_, ref) {
  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-[90] invisible" aria-hidden="true">
      <div className="absolute inset-0 flex flex-col">
        {Array.from({ length: LANES }, (_, i) => (
          <div key={i} className="relative flex-1 overflow-hidden">
            <div data-lane className="absolute inset-0 bg-ink" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <p className="t-mono-lg text-bg text-[clamp(0.95rem,2.2vw,1.4rem)] overflow-hidden">
          <span data-request className="block">
            <span data-request-line>GET /</span>{' '}
            <span data-request-status className="rounded-[3px] bg-signal px-1.5 text-on-signal">
              200
            </span>
          </span>
        </p>
      </div>
    </div>
  );
});
