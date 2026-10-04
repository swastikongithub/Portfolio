import React, { Fragment } from 'react';

interface SplitWordsProps {
  /** Each entry is one visual line. */
  lines: string[];
  className?: string;
}

/**
 * Renders heading text as masked words for the word-by-word reveal, while
 * assistive technology reads one unsplit string. Place inside a heading marked
 * with `data-split`. Never use for links.
 */
export const SplitWords: React.FC<SplitWordsProps> = ({ lines, className = '' }) => (
  <>
    <span className="sr-only">{lines.join(' ')}</span>
    <span aria-hidden="true" className={className}>
      {lines.map((line, li) => {
        const words = line.split(' ');
        return (
          <span key={li} className="block">
            {words.map((w, wi) => (
              <Fragment key={wi}>
                <span className="word-mask">
                  <span className="word">{w}</span>
                </span>
                {wi < words.length - 1 ? ' ' : null}
              </Fragment>
            ))}
          </span>
        );
      })}
    </span>
  </>
);
