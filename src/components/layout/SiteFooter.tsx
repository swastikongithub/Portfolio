import React from 'react';
import { PERSONAL_INFO } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { Mark } from './Header';

export const SiteFooter: React.FC = () => {
  const { scrollToSection } = useSite();
  return (
    <footer className="frame mt-[clamp(80px,12vw,180px)] pb-8">
      <div className="flex flex-col gap-6 border-t border-line-2 pt-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <Mark className="mt-1.5" />
          <p className="t-small max-w-[44ch]">
            Close the tab whenever. Nothing here is holding a lock.
            <span className="block text-ink-2">
              &copy; {new Date().getFullYear()} {PERSONAL_INFO.name}. Every number on this site names the file it came from.
            </span>
          </p>
        </div>
        <a
          href="#main"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection(0);
          }}
          className="btn btn-sm self-start md:self-auto"
        >
          Back to the top
        </a>
      </div>
    </footer>
  );
};
