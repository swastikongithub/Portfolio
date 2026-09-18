import React, { Fragment } from 'react';

/** A line of heading text; a tuple applies a class to that line (e.g. the serif italic accent line). */
export type SplitLine = string | [text: string, className: string];

interface SplitWordsProps {
  lines: SplitLine[];
}

/**
 * Renders heading text as masked words for the word-by-word reveal, while
 * assistive technology reads one unsplit string. Place inside a heading and
 * mark the heading with `data-split`. Never use for links.
 */
export const SplitWords: React.FC<SplitWordsProps> = ({ lines }) => {
  const plain = lines.map((l) => (typeof l === 'string' ? l : l[0])).join(' ');

  return (
    <>
      <span className="sr-only">{plain}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => {
          const [text, cls] = typeof line === 'string' ? [line, ''] : line;
          const words = text.split(' ');
          return (
            <span key={li} className={`block ${cls}`}>
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
};
