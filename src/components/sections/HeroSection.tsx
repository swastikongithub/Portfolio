import React, { useRef } from 'react';
import { PERSONAL_INFO, PROJECTS } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { EASE, MOTION_OK, gsap, useGSAP } from '../../lib/motion';
import { TransitionLink } from '../ui/TransitionLink';

/**
 * The cover. Reads like the opening spread of a technical journal: masthead,
 * the name set as the title, a thesis, and a table of contents that is also
 * the primary way into the work. Everything is legible in its final position;
 * the intro only choreographs how it is "set" onto the page.
 */
export const HeroSection: React.FC = () => {
  const { scrollToSection } = useSite();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: EASE.out } })
          .fromTo('[data-intro-rule]', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 1, ease: EASE.press, stagger: 0.1 })
          .fromTo('[data-cover-line]', { yPercent: 104 }, { yPercent: 0, duration: 1.15, stagger: 0.12 }, 0.1)
          .fromTo('[data-intro]', { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06 }, 0.45)
          .fromTo('[data-intro-row]', { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07 }, 0.6);
      });

      // As the cover leaves, the two name lines are pulled apart — type drawn off the press.
      mm.add(`${MOTION_OK} and (min-width: 768px)`, () => {
        const scrub = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 };
        gsap.to('[data-drift="l"]', { xPercent: -7, ease: 'none', scrollTrigger: scrub });
        gsap.to('[data-drift="r"]', { xPercent: 5, ease: 'none', scrollTrigger: scrub });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="cover-title" className="relative flex min-h-[100svh] flex-col pt-[var(--header-h)] overflow-hidden">
      <div className="frame relative flex flex-1 flex-col">
        {/* Registration marks */}
        <span className="reg -left-[7px] top-3 hidden md:block" aria-hidden="true" />
        <span className="reg -right-[7px] top-3 hidden md:block" aria-hidden="true" />

        {/* Masthead */}
        <div className="relative mt-3 grid-12 items-center py-3 t-label">
          <span className="absolute inset-x-0 bottom-0 h-px bg-rule" data-intro-rule aria-hidden="true" />
          <span className="col-span-2 md:col-span-3" data-intro>
            Portfolio — Ed. 2026
          </span>
          <span className="hidden md:block md:col-span-5 text-muted" data-intro>
            Software engineering · Backend &amp; systems
          </span>
          <span className="hidden lg:block lg:col-span-2 text-muted" data-intro>
            B.Tech CSE · LPU
          </span>
          <span className="col-span-2 md:col-span-4 lg:col-span-2 text-right" data-intro>
            {PERSONAL_INFO.location}
          </span>
        </div>

        {/* Title */}
        <div className="relative mt-[4vh] md:mt-[5vh]">
          <h1 id="cover-title" tabIndex={-1} className="t-mega outline-none">
            <span className="sr-only">{PERSONAL_INFO.name}</span>
            <span aria-hidden="true" className="block overflow-hidden pb-[0.04em]">
              <span data-drift="l" className="block">
                <span data-cover-line className="block">
                  {PERSONAL_INFO.firstName}
                </span>
              </span>
            </span>
            <span aria-hidden="true" className="block overflow-hidden pb-[0.04em] md:pl-[34%]">
              <span data-drift="r" className="block">
                <span data-cover-line className="block">
                  {PERSONAL_INFO.lastName}
                  <span className="text-accent">.</span>
                </span>
              </span>
            </span>
          </h1>
          <p
            className="t-serif italic mt-5 mb-10 md:mb-0 text-[1.2rem] leading-[1.2] text-muted md:absolute md:left-0 md:bottom-[4%] md:mt-0 md:w-[30%] md:text-[clamp(1.1rem,1.55vw,1.6rem)]"
            data-intro
          >
            {PERSONAL_INFO.role}, Computer Science student, building systems that have to hold up.
          </p>
        </div>

        {/* Thesis + contents */}
        <div className="relative mt-auto grid-12 gap-y-10 pt-8 pb-8 md:pb-10">
          <span className="absolute inset-x-0 top-0 h-[2px] bg-ink" data-intro-rule aria-hidden="true" />

          <div className="col-span-4 md:col-span-6 lg:col-span-5 flex flex-col gap-6">
            <p className="t-deck max-w-[22ch]" data-intro>
              {PERSONAL_INFO.headline}
            </p>
            <p className="t-body text-muted max-w-[44ch]" data-intro>
              Tenant boundaries, sessions, webhooks, state machines, background jobs. Three case studies follow — each
              written from the code itself.
            </p>
            <div className="flex flex-wrap gap-3" data-intro>
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('work');
                }}
                className="btn btn-solid"
              >
                Read the work <span aria-hidden="true">↓</span>
              </a>
              <a href={PERSONAL_INFO.resume} target="_blank" rel="noopener noreferrer" className="btn">
                Résumé <span className="arrow" aria-hidden="true">↗</span>
                <span className="sr-only">(PDF, opens in a new tab)</span>
              </a>
            </div>
          </div>

          <nav aria-labelledby="contents-label" className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-7">
            <p id="contents-label" className="t-label text-muted mb-2" data-intro>
              Contents
            </p>
            <ol className="border-t border-rule">
              {PROJECTS.map((p) => (
                <li key={p.slug} className="border-b border-rule" data-intro-row>
                  <TransitionLink
                    to={`/projects/${p.slug}`}
                    curtainLabel={p.title}
                    className="group relative isolate grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[3rem_1fr_auto_auto] items-baseline gap-3 py-4 md:py-5 px-1 overflow-hidden"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-ink origin-bottom scale-y-0 transition-transform duration-500 ease-[var(--ease-press)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
                    />
                    <span className="t-label text-accent-text group-hover:text-accent transition-colors">{p.number}</span>
                    <span className="t-head transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper">
                      {p.title}
                    </span>
                    <span className="hidden md:block t-label text-muted transition-colors group-hover:text-paper/70">
                      {p.kind}
                    </span>
                    <span
                      aria-hidden="true"
                      className="arrow text-lg transition-[color,transform] group-hover:text-accent group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </TransitionLink>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
};
