import React, { useRef } from 'react';
import { CERTIFICATIONS, EDUCATION, HABITS, PERSONAL_INFO, TRAINING } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { MOTION_OK, gsap, useGSAP } from '../../lib/motion';
import { SplitWords } from '../ui/SplitWords';
import portrait from '../../assets/portfoliopic.jpeg';

/**
 * Who built it, briefly: a face, two sentences, four habits named with the
 * evidence for each. The full record is in the résumé.
 */
export const About: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // The sheet rises over the stage; the portrait wipes open and drifts a little.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          root.current,
          { scale: 0.94, borderTopLeftRadius: 64, borderTopRightRadius: 64 },
          { scale: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 30%', scrub: 0.5 } },
        );
        gsap.fromTo(
          '[data-portrait]',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '[data-portrait]', start: 'top 92%', end: 'top 40%', scrub: 0.6 } },
        );
        gsap.fromTo(
          '[data-portrait] img',
          { scale: 1.25, yPercent: -6 },
          { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: '[data-portrait]', start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const lpu = EDUCATION[0];

  return (
    <section
      ref={root}
      id="about"
      aria-labelledby="about-title"
      className="relative z-10 -mt-8 origin-top rounded-t-[28px] border-t border-line-2 bg-bg py-[clamp(72px,10vw,150px)]"
    >
      <div className="frame grid-12 gap-y-10">
        <div className="col-span-4 md:col-span-5 lg:col-span-4">
          <figure className="overflow-hidden rounded-[var(--r-lg)] bg-sunk" data-portrait>
            <img
              src={portrait}
              alt="Swastik Singh: curly dark hair, rectangular glasses, a black turtleneck and a charcoal blazer."
              width={896}
              height={1195}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] h-auto w-full object-cover"
            />
          </figure>
        </div>

        <div className="col-span-4 flex flex-col gap-8 md:col-span-7 lg:col-span-7 lg:col-start-6">
          <h2 id="about-title" tabIndex={-1} className="t-display outline-none" data-split>
            <SplitWords lines={['I like the part', 'nobody demos.']} />
          </h2>
          <p className="t-lead max-w-[46ch]" data-reveal>
            The constraint, the retry, the audit row, the 404 that could have been a 403. I&rsquo;m Swastik, a Computer
            Science student at Lovely Professional University.
          </p>

          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {HABITS.map((h) => (
              <li key={h.title} className="border-t border-line-2 pt-3" data-reveal>
                <h3 className="font-[700] text-[1.15rem] tracking-[-0.01em]">{h.title}</h3>
                <p className="t-mono mt-2 text-ink-2">{h.evidence}</p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-4 border-t border-line-2 pt-5 sm:flex-row sm:items-end sm:justify-between" data-reveal>
            <div>
              <p className="font-[650]">
                {lpu.qualification}, {lpu.institution}
              </p>
              <p className="t-small text-ink-2">
                {lpu.period}. {lpu.result}. {CERTIFICATIONS.length} certifications and a {TRAINING[0].title} program, all in the résumé.
              </p>
            </div>
            <a href={PERSONAL_INFO.resume} target="_blank" rel="noopener noreferrer" className="btn btn-sm shrink-0">
              Résumé, PDF<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
          <p className="t-small text-ink-2" data-reveal>
            {PERSONAL_INFO.availability}
          </p>
        </div>
      </div>
    </section>
  );
};
