import React from 'react';
import { SplitWords, type SplitLine } from './SplitWords';

interface SectionHeadProps {
  id: string;
  number: string;
  kicker: string;
  lines: SplitLine[];
  children?: React.ReactNode;
}

/** The shared section opener: folio rule, section mark, split display title, optional standfirst. */
export const SectionHead: React.FC<SectionHeadProps> = ({ id, number, kicker, lines, children }) => (
  <header className="grid-12 gap-y-8 pb-12 md:pb-20">
    <div className="col-span-4 md:col-span-12 flex items-center justify-between border-t-2 border-ink pt-3" data-rule>
      <span className="t-label">
        <span className="text-accent-text">§ {number}</span> — {kicker}
      </span>
      <span className="t-label text-muted" aria-hidden="true">
        {number} / 05
      </span>
    </div>
    <h2 id={`${id}-title`} tabIndex={-1} className="t-display col-span-4 md:col-span-8 outline-none" data-split>
      <SplitWords lines={lines} />
    </h2>
    {children && (
      <div className="col-span-4 md:col-span-4 md:self-end t-body text-muted max-w-[46ch]" data-reveal>
        {children}
      </div>
    )}
  </header>
);
