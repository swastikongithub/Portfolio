import React from 'react';

/** The 12-column layout grid, toggled with “G” or the command palette. A designer's x-ray of the page. */
export const GridOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[65] pointer-events-none" aria-hidden="true">
      <div className="frame grid-12 h-full">
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            className={`h-full bg-accent/[0.07] border-x border-accent/25 ${i >= 4 ? 'hidden md:block' : ''}`}
          />
        ))}
      </div>
      <span className="fixed bottom-3 right-3 t-label bg-accent text-[#101010] px-2 py-1">Grid · press G</span>
    </div>
  );
};
