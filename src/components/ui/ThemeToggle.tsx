import React from 'react';
import { useSite } from '../../context/site';

/** Half-inked disc: the filled half flips with the theme; the wipe starts from the button. */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useSite();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`group inline-flex h-10 w-10 items-center justify-center rounded-full border border-line-2 transition-colors duration-200 hover:border-ink ${className}`}
    >
      <span
        aria-hidden="true"
        className="block h-4 w-4 rounded-full border-[1.5px] border-ink transition-transform duration-500 ease-[var(--ease-in-out)] group-hover:rotate-180"
        style={{ background: 'linear-gradient(90deg, var(--ink) 50%, transparent 50%)' }}
      />
    </button>
  );
};
