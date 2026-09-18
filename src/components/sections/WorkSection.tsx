import React, { useRef } from 'react';
import { PROJECTS } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { MOTION_OK, gsap, useGSAP } from '../../lib/motion';
import { SectionHead } from '../ui/SectionHead';
import { ProjectSpread } from './ProjectSpread';

export const WorkSection: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // Oversized numerals drift against the scroll — depth without decoration.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOTION_OK} and (min-width: 768px)`, () => {
        gsap.utils.toArray<HTMLElement>('[data-num]').forEach((num) => {
          gsap.fromTo(
            num,
            { yPercent: 18 },
            {
              yPercent: -12,
              ease: 'none',
              scrollTrigger: { trigger: num.closest('article'), start: 'top bottom', end: 'center top', scrub: 0.8 },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="work" ref={root} aria-labelledby="work-title" className="frame pt-24 md:pt-36">
      <SectionHead id="work" number="01" kicker="Selected work" lines={['Three systems,', ['read closely.', 't-serif normal-case !font-normal !tracking-[-0.01em]']]}>
        Each project is written up the way I would walk someone through it in a design review: the problem, what I
        built, and the decision most worth arguing about. The details come from the code and its documentation.
      </SectionHead>

      <div>
        {PROJECTS.map((p) => (
          <ProjectSpread key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
};
