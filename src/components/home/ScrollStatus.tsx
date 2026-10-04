import React, { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../../lib/motion';

/** The home page's chapters, in order, by section id. */
const CHAPTERS: [id: string, label: string][] = [
  ['hero', 'the claim'],
  ['twice', 'the second time'],
  ['work', 'four systems'],
  ['record', 'the record'],
  ['reels', 'swastik.mov'],
  ['about', 'who built them'],
  ['contact', 'write to me'],
];

/**
 * Where you are in the story: the chapter and how far through the page, in the
 * corner on wide screens. It takes the stage's palette while over the stage.
 */
export const ScrollStatus: React.FC = () => {
  const [chapter, setChapter] = useState(0);
  const fill = useRef<HTMLSpanElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const triggers = CHAPTERS.map(([id], i) => {
      const el = id === 'hero' ? document.querySelector('main section') : document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setChapter(i),
      });
    });
    const page = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (fill.current) fill.current.style.transform = `scaleX(${self.progress})`;
        if (pct.current) pct.current.textContent = `${Math.round(self.progress * 100)}%`;
      },
    });
    return () => {
      triggers.forEach((t) => t?.kill());
      page.kill();
    };
  }, []);

  // Out of the way where the page's own controls sit low: the hero and the contact finale.
  const shown = chapter > 0 && chapter < CHAPTERS.length - 1;

  return (
    <div
      data-trace
      className={`pointer-events-none fixed bottom-5 left-[var(--gutter)] z-40 hidden items-center gap-3 rounded-full border border-line bg-bg/80 py-1.5 pl-3 pr-3.5 text-ink backdrop-blur-md transition-opacity duration-300 lg:flex ${shown ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden="true"
    >
      <span className="h-2 w-2 rounded-full bg-signal" />
      <span className="t-mono min-w-[13ch]">{CHAPTERS[chapter][1]}</span>
      <span className="block h-[2px] w-16 overflow-hidden rounded-full bg-line-2">
        <span ref={fill} className="block h-full origin-left bg-signal" style={{ transform: 'scaleX(0)' }} />
      </span>
      <span ref={pct} className="t-mono t-num w-[4ch] text-right text-ink-2">
        0%
      </span>
    </div>
  );
};
