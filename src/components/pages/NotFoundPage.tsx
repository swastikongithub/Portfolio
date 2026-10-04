import React from 'react';
import { useLocation } from 'react-router-dom';
import { PROJECTS } from '../../data/portfolioData';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { TransitionLink } from '../ui/TransitionLink';
import { SiteFooter } from '../layout/SiteFooter';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Page not found');
  const { pathname } = useLocation();

  return (
    <>
      <main id="main" tabIndex={-1} className="frame min-h-[80svh] pb-16 pt-[calc(var(--header-h)+8vh)] outline-none">
        <p className="t-mono text-ink-2">
          GET {pathname} <span className="rounded-[2px] bg-ink px-1 text-bg">404</span>
        </p>
        <h1 tabIndex={-1} className="t-display mt-4 outline-none">
          Not 403. 404.
        </h1>
        <p className="t-lead mt-6 max-w-[44ch] text-ink-2">
          This page doesn&rsquo;t exist, and I&rsquo;m not hiding it from you. These four do:
        </p>
        <ul className="mt-8 max-w-3xl border-t border-line-2">
          {PROJECTS.map((p) => (
            <li key={p.slug} className="border-b border-line-2">
              <TransitionLink to={`/projects/${p.slug}`} className="group flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <span className="t-h3 transition-colors group-hover:text-ink-2">{p.title}</span>
                <span className="t-small text-ink-2">{p.invariant}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
        <TransitionLink to="/" className="btn btn-ink mt-10">
          Back to the start
        </TransitionLink>
      </main>
      <SiteFooter />
    </>
  );
};
