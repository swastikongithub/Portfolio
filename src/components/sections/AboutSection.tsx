import React, { useRef } from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { EditorialImage } from '../ui/EditorialImage';
import { SectionHead } from '../ui/SectionHead';
import portrait from '../../assets/portfoliopic.jpeg';

const FACTS: [string, string][] = [
  ['Studying', 'B.Tech, Computer Science and Engineering — Lovely Professional University'],
  ['Focus', 'Backend and systems work, security, full-stack delivery'],
  ['Building now', 'VulnTrack'],
  ['Based in', PERSONAL_INFO.location],
];

export const AboutSection: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="about" ref={root} aria-labelledby="about-title" className="frame pt-12 md:pt-20 pb-24 md:pb-36">
      <SectionHead id="about" number="02" kicker="About" lines={['A student', ['of failure modes.', 't-serif normal-case !font-normal !tracking-[-0.01em]']]} />

      <div className="grid-12 gap-y-12 items-start">
        <EditorialImage
          src={portrait}
          alt="Portrait of Swastik Singh in a dark blazer and glasses"
          width={896}
          height={1195}
          caption="The author, 2026."
          className="col-span-4 md:col-span-5 lg:col-span-4"
        />

        <div className="col-span-4 md:col-span-7 lg:col-span-7 lg:col-start-6">
          <p className="t-deck" data-reveal>
            I’m Swastik Singh, a Computer Science and Engineering undergraduate at Lovely Professional University.
          </p>
          <div className="mt-8 space-y-5 t-body max-w-[60ch]">
            <p data-reveal>
              I’m most interested in the parts of software that are easy to get subtly wrong: who is allowed to do
              what, what happens when two requests race, what a webhook delivered twice should do. My projects are
              where I practise that — each is tested against its failure cases, and each documents its known gaps
              instead of hiding them.
            </p>
            <p data-reveal className="text-muted">
              Right now I’m building VulnTrack. I’m looking for internships and software engineering roles where that
              kind of care is useful.
            </p>
          </div>

          <dl className="mt-12 border-t border-ink" data-reveal>
            {FACTS.map(([term, value]) => (
              <div key={term} className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-rule py-3.5">
                <dt className="t-label text-muted pt-0.5">{term}</dt>
                <dd className="text-[0.98rem] font-[520]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
