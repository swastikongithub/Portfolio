import React, { useRef } from 'react';
import { PROJECTS, TOOL_GROUPS } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { SectionHead } from '../ui/SectionHead';

const titleOf = (n: string) => PROJECTS.find((p) => p.number === n)?.title ?? n;

/**
 * Skills as an index, not a scoreboard: every tool carries superscript references
 * to the case studies it was used in. No bars, no percentages.
 */
export const SkillsSection: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="toolkit" ref={root} aria-labelledby="toolkit-title" className="frame pb-24 md:pb-36">
      <SectionHead id="toolkit" number="03" kicker="Toolkit" lines={['Tools,', ['cross-referenced.', 't-serif normal-case !font-normal !tracking-[-0.01em]']]}>
        Superscripts point to the case study where a tool was used: <span className="text-ink">01</span> VulnTrack,{' '}
        <span className="text-ink">02</span> Tenora, <span className="text-ink">03</span> AI Interview Platform. Unmarked
        entries come from coursework and earlier projects.
      </SectionHead>

      <div className="border-t-2 border-ink">
        {TOOL_GROUPS.map((group) => (
          <div key={group.discipline} className="grid-12 gap-y-3 border-b border-rule py-6 md:py-7" data-reveal>
            <h3 className="col-span-4 md:col-span-3 t-label text-muted pt-2">{group.discipline}</h3>
            <ul className="col-span-4 md:col-span-9 flex flex-wrap gap-x-7 gap-y-2">
              {group.tools.map((tool) => (
                <li key={tool.name} className="text-[clamp(1.35rem,2.4vw,2.25rem)] font-[640] [font-stretch:84%] tracking-[-0.02em] leading-tight">
                  {tool.name}
                  {tool.usedIn.length > 0 && (
                    <>
                      <sup className="ml-1 font-mono text-[0.7rem] tracking-normal text-accent-text align-super" aria-hidden="true">
                        {tool.usedIn.join(' ')}
                      </sup>
                      <span className="sr-only"> (used in {tool.usedIn.map(titleOf).join(', ')})</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
