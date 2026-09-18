import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PERSONAL_INFO, PROJECTS, SECTIONS } from '../../data/portfolioData';
import { useSite } from '../../context/site';
import { EASE, gsap, ScrollTrigger, useGSAP } from '../../lib/motion';
import { trapTab } from '../../lib/focus';
import { ThemeToggle } from '../ui/ThemeToggle';
import { TransitionLink } from '../ui/TransitionLink';

export const Navigation: React.FC = () => {
  const { openPalette, scrollToSection, setScrollLocked, reducedMotion } = useSite();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide on scroll down, return on scroll up; hairline once the page moves.
  useGSAP(
    () => {
      const header = headerRef.current;
      if (!header) return;
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const y = self.scroll();
          header.classList.toggle('is-scrolled', y > 24);
          header.classList.toggle('is-hidden', y > 240 && self.direction === 1);
        },
      });
    },
    { dependencies: [location.pathname], revertOnUpdate: true },
  );

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  // The Index sheet: lock scroll, trap focus, animate in.
  useEffect(() => {
    if (!menuOpen) return;
    setScrollLocked(true);
    const sheet = sheetRef.current;
    sheet?.querySelector<HTMLElement>('[data-autofocus]')?.focus();

    let tl: gsap.core.Timeline | undefined;
    if (sheet && !reducedMotion) {
      tl = gsap
        .timeline()
        .fromTo(sheet, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: EASE.press })
        .fromTo(
          sheet.querySelectorAll('[data-sheet-item]'),
          { yPercent: 60, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: EASE.out, stagger: 0.05 },
          '-=0.35',
        );
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
      else trapTab(e, sheet);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      tl?.kill();
      document.removeEventListener('keydown', onKey);
      setScrollLocked(false);
    };
  }, [menuOpen, reducedMotion, setScrollLocked, closeMenu]);

  const goToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (menuOpen) {
      setMenuOpen(false);
      // Wait for the sheet to unmount and smooth scroll to resume before scrolling.
      requestAnimationFrame(() => scrollToSection(id));
    } else {
      scrollToSection(id);
    }
  };

  return (
    <>
      <header
        ref={headerRef}
        className="site-header fixed inset-x-0 top-0 z-[60] border-b border-transparent [&.is-scrolled]:border-rule [&.is-scrolled]:bg-paper/90 [&.is-scrolled]:backdrop-blur-sm"
      >
        <div className="frame flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link
            to="/"
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                scrollToSection(0);
              }
            }}
            className="group flex items-center gap-2.5 font-[760] [font-stretch:80%] uppercase tracking-tight text-[1.05rem]"
            aria-label="Swastik Singh — home"
          >
            <span className="w-2.5 h-2.5 bg-accent transition-transform duration-500 group-hover:rotate-90" aria-hidden="true" />
            <span>Swastik Singh</span>
          </Link>

          <nav aria-label="Sections" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`/#${s.id}`} onClick={(e) => goToSection(e, s.id)} className="group t-label flex items-baseline gap-1.5">
                    <span className="text-muted group-hover:text-accent-text transition-colors">{s.number}</span>
                    <span className="link-u">{s.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={PERSONAL_INFO.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex t-label items-center gap-1.5 px-3 h-11 hover:text-accent-text transition-colors"
            >
              Résumé <span className="arrow" aria-hidden="true">↗</span>
              <span className="sr-only">(PDF, opens in a new tab)</span>
            </a>
            <button
              type="button"
              onClick={openPalette}
              className="hidden md:inline-flex items-center gap-3 h-11 px-3 border border-rule hover:border-ink transition-colors t-label"
              aria-label="Open command palette (Control or Command plus K)"
            >
              <span>Search</span>
              <kbd className="font-mono text-[0.65rem] px-1.5 py-0.5 bg-ink/10">Ctrl K</kbd>
            </button>
            <ThemeToggle />
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="index-sheet"
              className="lg:hidden inline-flex items-center gap-2 h-11 px-4 bg-ink text-paper t-label"
            >
              Index
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="index-sheet"
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site index"
          className="fixed inset-0 z-[80] bg-paper text-ink overflow-y-auto overscroll-contain"
          data-lenis-prevent
        >
          <div className="frame min-h-full flex flex-col pb-10">
            <div className="flex h-[var(--header-h)] items-center justify-between border-b border-rule">
              <span className="t-label">Index</span>
              <button
                type="button"
                data-autofocus
                onClick={closeMenu}
                className="inline-flex items-center h-11 px-4 border border-ink t-label"
              >
                Close
              </button>
            </div>

            <nav aria-label="Sections" className="pt-6">
              <ul>
                {SECTIONS.map((s) => (
                  <li key={s.id} className="border-b border-rule overflow-hidden">
                    <a
                      href={`/#${s.id}`}
                      onClick={(e) => goToSection(e, s.id)}
                      data-sheet-item
                      className="flex items-baseline justify-between py-3 active:text-accent-text"
                    >
                      <span className="t-display !text-[clamp(2.6rem,13vw,5rem)]">{s.label}</span>
                      <span className="t-label text-muted">{s.number}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-10" data-sheet-item>
              <p className="t-label text-muted mb-3">Case studies</p>
              <ul className="space-y-1">
                {PROJECTS.map((p) => (
                  <li key={p.slug}>
                    <TransitionLink
                      to={`/projects/${p.slug}`}
                      curtainLabel={p.title}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-baseline gap-3 py-2 text-xl font-[650] [font-stretch:85%]"
                    >
                      <span className="t-label text-accent-text">{p.number}</span>
                      {p.title}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-12 grid grid-cols-2 gap-3" data-sheet-item>
              <a href={`mailto:${PERSONAL_INFO.email}`} className="col-span-2 btn btn-solid justify-between">
                Email me <span aria-hidden="true">→</span>
              </a>
              <a href={PERSONAL_INFO.resume} target="_blank" rel="noopener noreferrer" className="btn justify-between">
                Résumé <span aria-hidden="true">↗</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openPalette();
                }}
                className="btn justify-between"
              >
                Search <span aria-hidden="true">⌕</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
