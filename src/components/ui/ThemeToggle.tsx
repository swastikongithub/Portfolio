import React from 'react';
import { useSite } from '../../context/site';

/** Half-inked disc: the filled half flips with the theme. */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useSite();
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`group inline-flex items-center justify-center w-11 h-11 border border-rule hover:border-ink transition-colors ${className}`}
    >
      <span
        aria-hidden="true"
        className="block w-4 h-4 rounded-full border-[1.5px] border-ink transition-transform duration-500 ease-[var(--ease-press)] group-hover:rotate-180"
        style={{ background: 'linear-gradient(90deg, var(--ink) 50%, transparent 50%)' }}
      />
    </button>
  );
};
