import React from 'react';
import type { ProjectCaseStudy } from '../../types/portfolio';
import { ProjectFigure } from '../ui/ProjectFigure';
import { SplitWords } from '../ui/SplitWords';
import { TransitionLink } from '../ui/TransitionLink';

const LETTERS = ['a', 'b', 'c', 'd'];

/** One case study laid out as a magazine spread. Composition varies with `project.layout`. */
export const ProjectSpread: React.FC<{ project: ProjectCaseStudy }> = ({ project: p }) => {
  const figure = (
    <ProjectFigure kind={p.figure} number={p.number} caption={p.figureCaption} />
  );
  const problem = (
    <div data-reveal>
      <p className="t-label text-muted mb-4">The problem</p>
      <p className="t-deck !text-[clamp(1.3rem,1.9vw,1.85rem)]">{p.problem}</p>
    </div>
  );

  return (
    <article id={p.slug} aria-labelledby={`${p.slug}-heading`} className="relative pt-5 pb-20 md:pb-32">
      <span className="absolute inset-x-0 top-0 h-[3px] bg-ink" data-rule aria-hidden="true" />

      {/* Opener: numeral + title */}
      <div className="grid-12 gap-y-4 items-start">
        <div className="col-span-4 md:col-span-3 overflow-hidden" aria-hidden="true">
          <span data-num className="t-numeral block text-[clamp(7rem,19vw,19rem)] -ml-[0.04em]">
            {p.number}
          </span>
        </div>
        <div className="col-span-4 md:col-span-9 md:pt-4">
          <p className="t-label mb-5 flex flex-wrap gap-x-3 gap-y-1" data-reveal>
            <span className="text-accent-text">Case study {p.number}</span>
            <span className="text-muted">{p.kind}</span>
          </p>
          <h3 id={`${p.slug}-heading`} className="t-title" data-split>
            <SplitWords lines={[p.title]} />
          </h3>
          <p className="t-deck mt-6 md:mt-8 max-w-[36ch]" data-reveal>
            {p.deck}
          </p>
        </div>
      </div>

      {/* Metadata strip */}
      <dl className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 border-y border-rule" data-reveal>
        {[
          ['Period', p.period],
          ['Status', p.status],
          ['Stack', p.stackShort.join(' · ')],
        ].map(([term, value], i) => (
          <div
            key={term}
            className={`py-4 pr-4 ${i === 2 ? 'col-span-2 border-t md:border-t-0 md:border-l md:pl-4' : i === 1 ? 'border-l border-rule pl-4' : ''} border-rule`}
          >
            <dt className="t-label text-muted">{term}</dt>
            <dd className="mt-1.5 text-[0.95rem] font-[520]">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Problem + figure */}
      <div className="mt-14 md:mt-20 grid-12 gap-y-12">
        {p.layout === 'figure-left' ? (
          <>
            <div className="col-span-4 md:col-span-7 order-2 md:order-1" data-reveal>{figure}</div>
            <div className="col-span-4 md:col-span-4 md:col-start-9 order-1 md:order-2">{problem}</div>
          </>
        ) : p.layout === 'figure-right' ? (
          <>
            <div className="col-span-4 md:col-span-5">{problem}</div>
            <div className="col-span-4 md:col-span-6 md:col-start-7" data-reveal>{figure}</div>
          </>
        ) : (
          <>
            <div className="col-span-4 md:col-span-7">{problem}</div>
            <div className="col-span-4 md:col-span-12" data-reveal>{figure}</div>
          </>
        )}
      </div>

      {/* What I built */}
      <div className="mt-16 md:mt-24">
        <p className="t-label text-muted mb-5" data-reveal>What I built</p>
        <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-[clamp(16px,2vw,32px)]">
          {p.built.map((item, i) => (
            <li key={i} className="flex gap-4 border-t border-rule py-5" data-reveal>
              <span className="t-label text-accent-text pt-1" aria-hidden="true">{LETTERS[i]}</span>
              <p className="t-body max-w-[58ch]">{item}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* The decision worth noticing */}
      <div className="mt-12 md:mt-16 grid-12 gap-y-6 bg-paper-2 p-5 md:p-10" data-reveal>
        <div className="col-span-4 md:col-span-3">
          <p className="t-label text-accent-text">The decision worth noticing</p>
        </div>
        <div className="col-span-4 md:col-span-9">
          <p className="t-head">{p.keyDecision.title}</p>
          <p className="t-body mt-4 max-w-[68ch]">{p.keyDecision.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <TransitionLink to={`/projects/${p.slug}`} curtainLabel={p.title} className="btn btn-solid">
              Read the case study <span className="arrow arrow-r" aria-hidden="true">→</span>
              <span className="sr-only">: {p.title}</span>
            </TransitionLink>
            <a href={p.links.source} target="_blank" rel="noopener noreferrer" className="btn">
              Source <span className="arrow" aria-hidden="true">↗</span>
              <span className="sr-only">: {p.title} on GitHub (opens in a new tab)</span>
            </a>
            {p.links.live && (
              <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="btn" title={p.links.liveNote}>
                Live app <span className="arrow" aria-hidden="true">↗</span>
                <span className="sr-only">: {p.title} (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
