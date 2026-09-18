import type { RefObject } from 'react';
import { EASE, MOTION_OK, gsap, ScrollTrigger, useGSAP } from '../lib/motion';

/**
 * Section choreography, declared in markup:
 *   [data-split]  heading whose `.word` spans rise out of their masks, word by word
 *   [data-rule]   structural line that draws in from the left
 *   [data-reveal] block that settles into place (batched, staggered)
 *
 * Runs only when motion is allowed; otherwise nothing is hidden and the final
 * layout renders immediately. Every trigger fires once — no work is left running
 * for content that has already been read.
 */
export function useReveal(scope: RefObject<HTMLElement | null>, dependencies: unknown[] = []) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        root.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
          gsap.fromTo(
            el.querySelectorAll('.word'),
            { yPercent: 115 },
            {
              yPercent: 0,
              duration: 1.05,
              ease: EASE.out,
              stagger: 0.045,
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            },
          );
        });

        root.querySelectorAll<HTMLElement>('[data-rule]').forEach((el) => {
          gsap.fromTo(
            el,
            { scaleX: 0, transformOrigin: 'left center' },
            {
              scaleX: 1,
              duration: 1.3,
              ease: EASE.press,
              scrollTrigger: { trigger: el, start: 'top 94%', once: true },
            },
          );
        });

        const blocks = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-reveal]'));
        if (blocks.length) {
          gsap.set(blocks, { autoAlpha: 0, y: 32 });
          ScrollTrigger.batch(blocks, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.95, ease: EASE.out, stagger: 0.08 }),
          });
        }
      });

      return () => mm.revert();
    },
    { scope, dependencies },
  );
}
