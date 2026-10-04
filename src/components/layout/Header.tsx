import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PERSONAL_INFO, PROJECTS, SECTIONS } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { trapTab } from '../../lib/focus';
import { EASE, gsap, ScrollTrigger } from '../../lib/motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { TransitionLink } from '../ui/TransitionLink';

/** The site mark: three lanes, one of which reached the slot. */
export const Mark: React.FC<{ className?: string }> = ({ className = '' }) => (
  <span className={`inline-flex flex-col justify-center gap-[3px] ${className}`} aria-hidden="true">
    <span className="block h-[3px] w-[9px] rounded-[1px] bg-ink-3" />
    <span className="block h-[3px] w-[16px] rounded-[1px] bg-signal" />
    <span className="block h-[3px] w-[6px] rounded-[1px] bg-ink-3" />
  </span>
);

export const Header: React.FC = () => {
  const { scrollToSection, openPalette, setScrollLocked, reducedMotion } = useSite();
  const location = useLocation();
  const barRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide while reading downwards, return on any upward scroll. Never hidden near the top.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    let hidden = false;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        setScrolled(y > 8);
        const shouldHide = !reducedMotion && self.direction === 1 && y > 320;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          gsap.to(bar, { yPercent: hidden ? -100 : 0, duration: 0.45, ease: EASE.out, overwrite: true });
        }
      },
    });
    return () => {
      st.kill();
      gsap.set(bar, { yPercent: 0 });
    };
  }, [reducedMotion, location.pathname]);

  // Keep the bar visible while it holds keyboard focus.
  const onFocusCapture = () => gsap.to(barRef.current, { yPercent: 0, duration: 0.3, ease: EASE.out, overwrite: true });

  // Mobile sheet: lock scroll, trap focus, return focus to the button on close.
  useEffect(() => {
    if (!menuOpen) return;
    setScrollLocked(true);
    const sheet = sheetRef.current;
    const button = menuButtonRef.current;
    sheet?.querySelector<HTMLElement>('a, button')?.focus();
    if (sheet && !reducedMotion) {
      gsap.fromTo(
        sheet.querySelectorAll('[data-sheet-item]'),
        { yPercent: 100 },
        { yPercent: 0, duration: 0.7, ease: EASE.out, stagger: 0.04 },
      );
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
      else trapTab(e, sheet);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      setScrollLocked(false);
      button?.focus();
    };
  }, [menuOpen, setScrollLocked, reducedMotion]);

  const go = (id: string) => {
    setMenuOpen(false);
    requestAnimationFrame(() => scrollToSection(id));
  };

  return (
    <>
      <header
        ref={barRef}
        data-site-header
        onFocusCapture={onFocusCapture}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300 ${
          scrolled || menuOpen ? 'border-b border-line bg-bg' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="frame flex h-[var(--header-h)] items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                setMenuOpen(false);
                scrollToSection(0);
              }
            }}
            className="group flex items-center gap-2.5 py-2 font-[700] tracking-[-0.01em]"
          >
            <Mark />
            <span>{PERSONAL_INFO.name}</span>
          </a>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`/#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(s.id);
                    }}
                    className="rounded-full px-3.5 py-2 text-[0.95rem] font-[550] text-ink-2 transition-colors duration-200 hover:text-ink"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={PERSONAL_INFO.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-3.5 py-2 text-[0.95rem] font-[550] text-ink-2 transition-colors duration-200 hover:text-ink"
                >
                  Résumé<span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={openPalette}
              className="hidden sm:inline-flex btn btn-sm !min-h-9 !px-3 t-mono !text-[0.72rem]"
              aria-label="Open command palette (Control or Command plus K)"
            >
              <kbd className="font-[inherit]">Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <button
              ref={menuButtonRef}
              type="button"
              className="md:hidden btn btn-sm !min-h-10"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={sheetRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-bg md:hidden"
          data-lenis-prevent
        >
          <nav aria-label="Mobile" className="frame flex min-h-full flex-col justify-between gap-10 pb-8 pt-6">
            <ul>
              {SECTIONS.map((s) => (
                <li key={s.id} className="overflow-hidden border-b border-line">
                  <a
                    href={`/#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(s.id);
                    }}
                    className="block py-3 t-h2"
                    data-sheet-item
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <div>
              <p className="t-mono text-ink-2 mb-2">Systems</p>
              <ul className="grid gap-1">
                {PROJECTS.map((p) => (
                  <li key={p.slug} className="overflow-hidden">
                    <TransitionLink
                      to={`/projects/${p.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline justify-between gap-4 py-1.5 t-lead font-[600]"
                      data-sheet-item
                    >
                      {p.title}
                      <span className="t-mono text-ink-2 truncate">{p.kind}</span>
                    </TransitionLink>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-2">
                <a className="btn btn-sm" href={PERSONAL_INFO.resume} target="_blank" rel="noopener noreferrer">
                  Résumé<span className="sr-only"> (PDF, opens in a new tab)</span>
                </a>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    setMenuOpen(false);
                    openPalette();
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
