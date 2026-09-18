import { forwardRef } from 'react';

/**
 * The page-turn curtain shown while one page is exchanged for the next.
 * It is purely presentational (aria-hidden); App drives it with GSAP and
 * never uses it under reduced motion. Hidden by default, so it can never block
 * content if JavaScript animation fails.
 */
export const PageLoader = forwardRef<HTMLDivElement>(function PageLoader(_, ref) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 z-[90] bg-ink text-paper flex flex-col justify-between p-[var(--gutter)] invisible"
    >
      <div className="flex justify-between t-label opacity-70">
        <span>Swastik Singh</span>
        <span>Setting page</span>
      </div>
      <div className="overflow-hidden pb-2">
        <p data-curtain-label className="t-title will-change-transform" />
      </div>
    </div>
  );
});
