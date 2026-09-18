import React, { useEffect, useRef, useState } from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useReveal } from '../../hooks/useReveal';
import { SectionHead } from '../ui/SectionHead';

const LINKS: [label: string, href: string][] = [
  ['LinkedIn', PERSONAL_INFO.linkedin],
  ['GitHub', PERSONAL_INFO.github],
  ['Instagram', PERSONAL_INFO.instagram],
  ['Résumé (PDF)', PERSONAL_INFO.resume],
];

export const ContactSection: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  useReveal(root);

  useEffect(() => {
    if (copyState === 'idle') return;
    const t = window.setTimeout(() => setCopyState('idle'), 2600);
    return () => window.clearTimeout(t);
  }, [copyState]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PERSONAL_INFO.email);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  };

  return (
    <section id="contact" ref={root} aria-labelledby="contact-title" className="inverse pt-24 md:pt-36 pb-16">
      <div className="frame">
        <SectionHead id="contact" number="05" kicker="Contact" lines={['Write to me —', ['I read everything.', 't-serif normal-case !font-normal !tracking-[-0.01em]']]}>
          {PERSONAL_INFO.availability} Email is the quickest way to reach me.
        </SectionHead>

        <div className="border-t-2 border-ink pt-8" data-reveal>
          <a
            href={`mailto:${PERSONAL_INFO.email}`}
            className="group inline-flex max-w-full items-baseline gap-4 break-all text-[clamp(1.55rem,5.6vw,6.4rem)] font-[780] [font-stretch:76%] leading-[0.95] tracking-[-0.03em] hover:text-accent transition-colors"
          >
            <span className="link-u">{PERSONAL_INFO.email}</span>
            <span className="arrow text-accent" aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between" data-reveal>
          <div className="flex flex-wrap items-center gap-3">
            <a href={`mailto:${PERSONAL_INFO.email}`} className="btn btn-solid">
              Send an email <span aria-hidden="true">→</span>
            </a>
            <button type="button" onClick={copy} className="btn">
              {copyState === 'copied' ? 'Copied' : copyState === 'failed' ? 'Copy failed' : 'Copy address'}
            </button>
            <span className="sr-only" aria-live="polite">
              {copyState === 'copied' ? 'Email address copied to clipboard' : copyState === 'failed' ? 'Could not copy the email address' : ''}
            </span>
          </div>
          <ul className="flex flex-wrap gap-x-7 gap-y-3">
            {LINKS.map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="t-label inline-flex items-center gap-1.5 py-2 hover:text-accent-text">
                  <span className="link-u">{label}</span>
                  <span className="arrow" aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
