import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { SiteContext, type SiteContextValue } from './context/site';
import { useTheme } from './hooks/useTheme';
import { useLenis } from './hooks/useLenis';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useCommandPalette } from './hooks/useCommandPalette';
import { EASE, gsap, ScrollTrigger } from './lib/motion';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { LaneTransition } from './components/layout/LaneTransition';
import { ImpactLabels } from './components/layout/ImpactLabels';
import { Cursor } from './components/layout/Cursor';
import { initMagnetic } from './lib/interaction/magnetic';
import { HomePage } from './components/pages/HomePage';
import { NotFoundPage } from './components/pages/NotFoundPage';

function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const lenisRef = useLenis(!reducedMotion);
  const palette = useCommandPalette();

  const curtainRef = useRef<HTMLDivElement>(null);

  // Controls that lean toward the pointer (fine pointers, motion allowed).
  useEffect(() => initMagnetic(), [reducedMotion]);
  const transitioning = useRef(false);

  const transitionTo = useCallback(
    (to: string) => {
      const curtain = curtainRef.current;
      if (transitioning.current) return;
      if (reducedMotion || !curtain) {
        navigate(to);
        return;
      }
      transitioning.current = true;
      const lanes = curtain.querySelectorAll<HTMLElement>('[data-lane]');
      const request = curtain.querySelector<HTMLElement>('[data-request]');
      const line = curtain.querySelector<HTMLElement>('[data-request-line]');
      const status = curtain.querySelector<HTMLElement>('[data-request-status]');
      if (line) line.textContent = `GET ${to.split('#')[0] || '/'}`;

      gsap
        .timeline({ onComplete: () => void (transitioning.current = false) })
        .set(curtain, { autoAlpha: 1 })
        .set(status, { autoAlpha: 0 })
        .fromTo(lanes, { xPercent: -101 }, { xPercent: 0, duration: 0.55, ease: EASE.move, stagger: 0.045 })
        .fromTo(request, { yPercent: 110 }, { yPercent: 0, duration: 0.45, ease: EASE.out }, '-=0.2')
        .add(() => {
          lenisRef.current?.stop();
          navigate(to);
        })
        .to(status, { autoAlpha: 1, duration: 0.01 }, '+=0.12')
        .to(request, { yPercent: -110, duration: 0.35, ease: EASE.out }, '+=0.22')
        .to(
          lanes,
          {
            xPercent: 101,
            duration: 0.6,
            ease: EASE.move,
            stagger: 0.045,
            onStart: () => {
              lenisRef.current?.start();
              lenisRef.current?.resize();
              ScrollTrigger.refresh();
            },
          },
          '-=0.15',
        )
        .set(curtain, { autoAlpha: 0 });
    },
    [navigate, reducedMotion, lenisRef],
  );

  const scrollToSection = useCallback(
    (id: string | 0) => {
      if (id !== 0 && location.pathname !== '/') {
        transitionTo(`/#${id}`);
        return;
      }
      const lenis = lenisRef.current;
      if (id === 0) {
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0 });
        document.getElementById('main')?.focus({ preventScroll: true });
        return;
      }
      const el = document.getElementById(id);
      if (!el) return;
      if (lenis) lenis.scrollTo(el, { offset: -8, duration: 1.4 });
      else el.scrollIntoView({ block: 'start' });
      document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
    },
    [lenisRef, location.pathname, transitionTo],
  );

  const scrollToY = useCallback(
    (y: number) => {
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(y, { duration: 1.2 });
      else window.scrollTo({ top: y });
    },
    [lenisRef],
  );

  const setScrollLocked = useCallback(
    (locked: boolean) => {
      if (locked) lenisRef.current?.stop();
      else lenisRef.current?.start();
    },
    [lenisRef],
  );

  // After client-side navigation (not the first load), give focus to the new page's main heading.
  const firstPath = useRef(location.pathname + location.hash);
  useEffect(() => {
    if (firstPath.current === location.pathname + location.hash) return;
    firstPath.current = '';
    if (location.hash) return; // ScrollRestoration scrolls to the hash target
    const id = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.hash]);

  const value = useMemo<SiteContextValue>(
    () => ({
      theme,
      toggleTheme,
      reducedMotion,
      openPalette: palette.open,
      transitionTo,
      scrollToSection,
      scrollToY,
      setScrollLocked,
    }),
    [theme, toggleTheme, reducedMotion, palette.open, transitionTo, scrollToSection, scrollToY, setScrollLocked],
  );

  return (
    <SiteContext.Provider value={value}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="relative min-h-screen bg-bg text-ink">
        <Header />
        <Outlet />
      </div>
      <CommandPalette isOpen={palette.isOpen} onClose={palette.close} />
      <LaneTransition ref={curtainRef} />
      <ImpactLabels />
      <Cursor enabled={!reducedMotion} />
      <ScrollRestoration />
    </SiteContext.Provider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    // Shown for the instant a lazily loaded route (a case study) resolves on a direct visit.
    HydrateFallback: () => <div className="min-h-screen bg-bg" />,
    children: [
      { index: true, element: <HomePage /> },
      // Case studies carry their own scenes; load them only when one is opened.
      { path: 'projects/:slug', lazy: () => import('./components/pages/ProjectPage').then((m) => ({ Component: m.ProjectPage })) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export const App: React.FC = () => <RouterProvider router={router} />;
