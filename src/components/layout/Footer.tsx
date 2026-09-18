import React from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useSite } from '../../context/site';

const SOCIAL: [label: string, href: string][] = [
  ['GitHub', PERSONAL_INFO.github],
  ['LinkedIn', PERSONAL_INFO.linkedin],
  ['Instagram', PERSONAL_INFO.instagram],
];

/** The colophon: credits and links. */
export const Footer: React.FC = () => {
  const { scrollToSection } = useSite();

  return (
    <footer className="inverse overflow-hidden">
      <div className="frame">
        <div className="grid-12 gap-y-8 border-t border-rule pt-8 pb-10">
          <p className="col-span-4 md:col-span-3 t-label">© {new Date().getFullYear()} {PERSONAL_INFO.name}</p>
          <p className="col-span-4 md:col-span-5 text-[0.9rem] leading-relaxed text-muted">
            <span className="t-label text-ink">Colophon — </span>
            Set in Archivo, Instrument Serif and JetBrains Mono. Built with React, TypeScript, Tailwind CSS, GSAP and
            Lenis. No trackers.
          </p>
          <ul className="col-span-2 md:col-span-2 space-y-1.5">
            {SOCIAL.map(([label, href]) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="t-label link-u hover:text-accent-text">
                  {label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="col-span-2 md:col-span-2 flex md:justify-end items-start">
            <button type="button" onClick={() => scrollToSection(0)} className="t-label inline-flex items-center gap-2 py-1 hover:text-accent-text">
              Back to top <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
