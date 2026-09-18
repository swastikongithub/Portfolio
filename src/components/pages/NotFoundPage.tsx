import React from 'react';
import { PROJECTS } from '../../data/portfolioData';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { TransitionLink } from '../ui/TransitionLink';
import { Footer } from '../layout/Footer';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Page not found');

  return (
    <>
      <main id="main" tabIndex={-1} className="frame min-h-[80svh] pt-[calc(var(--header-h)+10vh)] pb-24 outline-none">
        <p className="t-label text-accent-text">Error 404</p>
        <h1 tabIndex={-1} className="t-title mt-4 outline-none">
          Not in
          <br />
          this edition.
        </h1>
        <p className="t-deck mt-8 max-w-[30ch]">The page you asked for doesn’t exist. The work does:</p>
        <ul className="mt-8 border-t border-rule max-w-2xl">
          {PROJECTS.map((p) => (
            <li key={p.slug} className="border-b border-rule">
              <TransitionLink to={`/projects/${p.slug}`} curtainLabel={p.title} className="flex items-baseline gap-4 py-4 hover:text-accent-text">
                <span className="t-label text-accent-text">{p.number}</span>
                <span className="t-head">{p.title}</span>
              </TransitionLink>
            </li>
          ))}
        </ul>
        <TransitionLink to="/" curtainLabel="Index" className="btn btn-solid mt-10">
          <span aria-hidden="true">←</span> Back to the index
        </TransitionLink>
      </main>
      <Footer />
    </>
  );
};
