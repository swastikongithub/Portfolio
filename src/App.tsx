import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Navigation } from './components/layout/Navigation';
import { CommandPalette } from './components/layout/CommandPalette';
import { PageLoader } from './components/layout/PageLoader';
import { ScrollProgress } from './components/layout/ScrollProgress';
import { GridOverlay } from './components/ui/GridOverlay';
import { HomePage } from './components/pages/HomePage';
import { ProjectDetailPage } from './components/pages/ProjectDetailPage';
import { NotFoundPage } from './components/pages/NotFoundPage';

function RootLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();
  const lenisRef = useLenis(!reducedMotion);

  const [gridVisible, setGridVisible] = useState(false);
  const toggleGrid = useCallback(() => setGridVisible((v) => !v), []);
  const palette = useCommandPalette(toggleGrid);

  const curtainRef = useRef<HTMLDivElement>(null);
  const transitioning = useRef(false);

  const transitionTo = useCallback(
    (to: string, label?: string) => {
      const curtain = curtainRef.current;
      if (transitioning.current) return;
      if (reducedMotion || !curtain) {
        navigate(to);
        return;
      }
      transitioning.current = true;
      const labelEl = curtain.querySelector<HTMLElement>('[data-curtain-label]');
      if (labelEl) labelEl.textContent = label ?? 'Swastik Singh';

      gsap
        .timeline({
          onComplete: () => {
            transitioning.current = false;
          },
        })
        .set(curtain, { autoAlpha: 1, yPercent: 100 })
        .to(curtain, { yPercent: 0, duration: 0.65, ease: EASE.press })
        .fromTo(labelEl, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: EASE.out }, '-=0.25')
        .add(() => {
          lenisRef.current?.stop();
          navigate(to);
        })
        .to(curtain, {
          yPercent: -100,
          duration: 0.75,
          ease: EASE.press,
          delay: 0.2,
          onStart: () => {
            lenisRef.current?.start();
            lenisRef.current?.resize();
            ScrollTrigger.refresh();
          },
        })
        .set(curtain, { autoAlpha: 0 });
    },
    [navigate, reducedMotion, lenisRef],
  );

  const scrollToSection = useCallback(
    (id: string | 0) => {
      if (id !== 0 && location.pathname !== '/') {
        transitionTo(`/#${id}`, 'Index');
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
      // Move keyboard/screen-reader focus to the section heading as well.
      document.getElementById(`${id}-title`)?.focus({ preventScroll: true });
    },
    [lenisRef, location.pathname, transitionTo],
  );

  const setScrollLocked = useCallback(
    (locked: boolean) => {
      if (locked) lenisRef.current?.stop();
      else lenisRef.current?.start();
    },
    [lenisRef],
  );

  // After client-side navigation, give focus to the new page's main heading.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
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
      toggleGrid,
      gridVisible,
      transitionTo,
      scrollToSection,
      setScrollLocked,
    }),
    [theme, toggleTheme, reducedMotion, palette.open, toggleGrid, gridVisible, transitionTo, scrollToSection, setScrollLocked],
  );

  return (
    <SiteContext.Provider value={value}>
      <a href="#main" className="skip-link t-label">
        Skip to content
      </a>
      <div className="grain relative min-h-screen bg-paper text-ink">
        <ScrollProgress routeKey={location.pathname} />
        <Navigation />
        <Outlet />
      </div>
      <CommandPalette isOpen={palette.isOpen} onClose={palette.close} />
      <GridOverlay visible={gridVisible} />
      <PageLoader ref={curtainRef} />
      <ScrollRestoration />
    </SiteContext.Provider>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects/:slug', element: <ProjectDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export const App: React.FC = () => <RouterProvider router={router} />;
