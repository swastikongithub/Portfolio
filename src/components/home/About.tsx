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
        // Each habit is a check that passes as you reach it, with its evidence.
        gsap.utils.toArray<HTMLElement>('[data-check-row]').forEach((row) => {
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'play none none reverse' } })
            .fromTo(row.children[1], { autoAlpha: 0, x: -6 }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 0)
            .fromTo(row.querySelector('[data-check]'), { rotate: -90, scale: 0.6, backgroundColor: 'transparent' }, { rotate: 0, scale: 1, backgroundColor: 'var(--signal)', duration: 0.45, ease: 'back.out(2)' }, 0.05)
            .fromTo(row.querySelector('[data-check-path]'), { strokeDashoffset: 24 }, { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out' }, 0.25);
        });
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
          <div className="relative mb-10 mr-3 sm:mr-6">
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
          {/* The other side: the pinned post on swastik.mov. */}
          <figure className="absolute -bottom-8 -right-3 w-[42%] rotate-[3deg] overflow-hidden rounded-[var(--r-md)] border-4 border-bg shadow-[0_18px_40px_-18px_rgb(0_0_0/0.55)] sm:-right-6" data-polaroid>
            <img
              src="/media/reels/covers/DT2Nz0AkaEH.webp"
              alt="Swastik in the mountains near Manali, Himachal Pradesh, in a black sweatshirt with snow-capped peaks behind."
              width={720}
              height={960}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] h-auto w-full object-cover"
            />
            <figcaption className="t-mono bg-bg px-2 py-1.5 text-[10px] leading-snug text-ink-2">Himachal, Jan 2026. &ldquo;Cold hands. Clear head.&rdquo;</figcaption>
          </figure>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-8 md:col-span-7 lg:col-span-7 lg:col-start-6">
          <h2 id="about-title" tabIndex={-1} className="t-display outline-none" data-split>
            <SplitWords lines={['I like the part', 'nobody demos.']} />
          </h2>
          <p className="t-lead max-w-[46ch]" data-reveal>
            The constraint, the retry, the audit row, the 404 that could have been a 403. I&rsquo;m Swastik, a Computer
            Science student at Lovely Professional University. When the laptop closes I&rsquo;m{' '}
            <a href={PERSONAL_INFO.instagram} target="_blank" rel="noopener noreferrer" className="link">
              swastik.mov<span className="sr-only"> on Instagram (opens in a new tab)</span>
            </a>
            , and I record and edit videos about my life.
          </p>

          <ul className="grid gap-x-8 sm:grid-cols-2" aria-label="How I work, with the evidence">
            {HABITS.map((h) => (
              <li key={h.title} className="grid grid-cols-[26px_1fr] gap-x-3.5 border-t border-line-2 py-4" data-check-row>
                <span className="check-box" data-check aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none">
                    <path d="M4.5 10.5l3.6 3.6 7.4-8.2" data-check-path />
                  </svg>
                </span>
                <div>
                  <h3 className="font-[700] text-[1.15rem] leading-tight tracking-[-0.01em]">{h.title}</h3>
                  <p className="t-mono mt-2 text-ink-2">{h.evidence}</p>
                </div>
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
