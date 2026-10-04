import React, { Fragment } from 'react';

/**
 * Splits text into per-letter spans for a letter-by-letter reveal, while each
 * word stays unbreakable (so "Interview" never wraps as "Intervie / w").
 * Decorative: render inside an aria-hidden wrapper next to an sr-only copy.
 */
export const Letters: React.FC<{ text: string; attr: string }> = ({ text, attr }) => {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {w.split('').map((c, i) => (
              <span key={i} {...{ [attr]: '' }} className="inline-block">
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
};
