/* Shared building blocks of the case-study pages. */
import React from 'react';
import type { Fact, ProjectCaseStudy } from '../../types/portfolio';

export const Facts: React.FC<{ facts: Fact[]; className?: string }> = ({ facts, className = '' }) => (
  <dl className={`grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 ${className}`}>
    {facts.map((f) => (
      <div key={f.label} className="border-t border-line-2 pt-4" data-reveal>
        <dt className="sr-only">{f.label}</dt>
        <dd className="t-mono-lg t-num text-[clamp(2rem,4.2vw,3.6rem)] font-[500] leading-none">{f.value}</dd>
        <dd className="t-small mt-3 max-w-[24ch]" aria-hidden="true">
          {f.label}
        </dd>
        <dd className="t-mono mt-2 break-words text-ink-2">{f.source}</dd>
      </div>
    ))}
  </dl>
);

export const Story: React.FC<{ project: ProjectCaseStudy; code?: string; className?: string }> = ({ project, code, className = '' }) => (
  <article className={`relative rounded-[var(--r-lg)] bg-bg-2 p-6 sm:p-8 lg:p-10 ${className}`} data-reveal>
    <span className="absolute inset-y-6 left-0 w-[3px] rounded-r bg-signal sm:inset-y-8 lg:inset-y-10" aria-hidden="true" />
    <h3 className="t-h3">{project.story.title}</h3>
    <p className="t-body mt-4 max-w-[64ch] text-ink-2">{project.story.body}</p>
    {code && (
      <pre className="t-mono mt-6 overflow-x-auto rounded-[var(--r-sm)] border border-line bg-bg px-4 py-3 text-ink" data-lenis-prevent>
        <code>{code}</code>
      </pre>
    )}
  </article>
);

export const BuiltList: React.FC<{ items: string[]; columns?: 1 | 2 }> = ({ items, columns = 2 }) => (
  <ul className={`grid gap-x-10 gap-y-5 ${columns === 2 ? 'md:grid-cols-2' : ''}`}>
    {items.map((b) => (
      <li key={b} className="t-body flex gap-3" data-reveal>
        <span className="mt-[0.7em] h-[3px] w-3 shrink-0 rounded-[1px] bg-ink" aria-hidden="true" />
        <span>{b}</span>
      </li>
    ))}
  </ul>
);
