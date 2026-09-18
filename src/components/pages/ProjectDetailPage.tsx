import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PROJECTS, getProject } from '../../data/portfolioData';
import type { ProjectCaseStudy } from '../../types/portfolio';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useReveal } from '../../hooks/useReveal';
import { ScrollTrigger, useGSAP } from '../../lib/motion';
import { ProjectFigure } from '../ui/ProjectFigure';
import { SplitWords } from '../ui/SplitWords';
import { TransitionLink } from '../ui/TransitionLink';
import { Footer } from '../layout/Footer';
import { NotFoundPage } from './NotFoundPage';

const CHAPTERS = [
  { id: 'problem', label: 'The problem' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'built', label: 'What I built' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'safeguards', label: 'Safeguards' },
  { id: 'scope', label: 'Scope & known gaps' },
  { id: 'stack', label: 'Stack' },
];

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = getProject(slug);
  if (!project) return <NotFoundPage />;
  // Keyed so every animation and trigger is rebuilt from scratch per project.
  return <CaseStudy key={project.slug} project={project} />;
};

const Chapter: React.FC<{ id: string; index: number; title: string; children: React.ReactNode }> = ({ id, index, title, children }) => (
  <section id={id} aria-labelledby={`${id}-h`} data-chapter className="border-t border-ink pt-5 pb-16 md:pb-24">
    <p className="t-label text-accent-text">{String(index + 1).padStart(2, '0')}</p>
    <h2 id={`${id}-h`} className="t-display !text-[clamp(2.2rem,4.6vw,4.6rem)] mt-3 mb-8" data-split>
      <SplitWords lines={[title]} />
    </h2>
    {children}
  </section>
);

const CaseStudy: React.FC<{ project: ProjectCaseStudy }> = ({ project: p }) => {
  const root = useRef<HTMLElement>(null);
  const tocRef = useRef<HTMLOListElement>(null);
  useDocumentTitle(`${p.title} — case study`, p.summary);
  useReveal(root);

  // Contents rail: mark the chapter currently being read (a state indicator, not motion).
  useGSAP(
    () => {
      const links = tocRef.current?.querySelectorAll<HTMLAnchorElement>('a');
      root.current?.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter, i) => {
        ScrollTrigger.create({
          trigger: chapter,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => {
            const link = links?.[i];
            if (!link) return;
            if (self.isActive) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          },
        });
      });
    },
    { scope: root },
  );

  const index = PROJECTS.findIndex((x) => x.slug === p.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  return (
    <>
      <main id="main" ref={root} tabIndex={-1} className="outline-none pt-[var(--header-h)]">
        {/* Breadcrumb */}
        <div className="frame">
          <div className="flex items-center justify-between border-b border-rule py-3 t-label">
            <TransitionLink to={`/#${p.slug}`} curtainLabel="Index" className="group inline-flex items-center gap-2 py-1 hover:text-accent-text">
              <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span> Back to the index
            </TransitionLink>
            <span className="text-muted">
              Case study {p.number} / {String(PROJECTS.length).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Title spread */}
        <header className="frame pt-10 md:pt-16 pb-14 md:pb-20">
          <div className="grid-12 gap-y-6 items-end">
            <span aria-hidden="true" className="col-span-4 md:col-span-3 t-numeral text-[clamp(7rem,20vw,20rem)] -ml-[0.04em]" data-reveal>
              {p.number}
            </span>
            <div className="col-span-4 md:col-span-9">
              <p className="t-label text-accent-text mb-5" data-reveal>{p.kind}</p>
              <h1 tabIndex={-1} className="t-title outline-none" data-split>
                <SplitWords lines={[p.title]} />
              </h1>
            </div>
          </div>
          <div className="grid-12 gap-y-10 mt-10 md:mt-14">
            <p className="col-span-4 md:col-span-7 t-deck" data-reveal>{p.deck}</p>
            <div className="col-span-4 md:col-span-4 md:col-start-9" data-reveal>
              <dl className="border-t-2 border-ink">
                {[
                  ['Period', p.period],
                  ['Status', p.status],
                ].map(([t, v]) => (
                  <div key={t} className="grid grid-cols-[6rem_1fr] gap-3 border-b border-rule py-3">
                    <dt className="t-label text-muted pt-0.5">{t}</dt>
                    <dd className="text-[0.95rem] font-[520]">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={p.links.source} target="_blank" rel="noopener noreferrer" className="btn btn-solid">
                  Source on GitHub <span className="arrow" aria-hidden="true">↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="btn">
                    Live app <span className="arrow" aria-hidden="true">↗</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
              {p.links.liveNote && <p className="mt-3 text-[0.85rem] text-muted">{p.links.liveNote}</p>}
            </div>
          </div>
        </header>

        {/* Body: contents rail + chapters */}
        <div className="frame grid-12 pb-10">
          <nav aria-label="Case study contents" className="hidden md:block md:col-span-3">
            <div className="sticky top-[calc(var(--header-h)+24px)]">
              <p className="t-label text-muted mb-3">Contents</p>
              <ol ref={tocRef} className="border-t border-rule">
                {CHAPTERS.map((c, i) => (
                  <li key={c.id} className="border-b border-rule">
                    <a
                      href={`#${c.id}`}
                      className="group flex items-baseline gap-3 py-2.5 text-[0.95rem] text-muted transition-colors hover:text-ink aria-[current=location]:text-ink aria-[current=location]:font-[620]"
                    >
                      <span className="t-label w-6 group-aria-[current=location]:text-accent-text">{String(i + 1).padStart(2, '0')}</span>
                      {c.label}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="col-span-4 md:col-span-9 lg:col-span-8 lg:col-start-5">
            <Chapter id="problem" index={0} title="The problem">
              <p className="t-deck" data-reveal>{p.problem}</p>
            </Chapter>

            <Chapter id="architecture" index={1} title="Architecture">
              <p className="t-body max-w-[64ch]" data-reveal>{p.architecture.intro}</p>
              <ol className="mt-8 border-t-2 border-ink">
                {p.architecture.layers.map((layer, i) => (
                  <li key={layer.name} className="grid grid-cols-1 sm:grid-cols-[2rem_12rem_1fr] gap-x-4 gap-y-1 border-b border-rule py-4" data-reveal>
                    <span className="t-label text-accent-text pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-mono text-[0.85rem] pt-0.5">{layer.name}</span>
                    <span className="text-[0.98rem] text-muted">{layer.detail}</span>
                  </li>
                ))}
              </ol>
              <ProjectFigure kind={p.figure} number={p.number} caption={p.figureCaption} className="mt-14" />
            </Chapter>

            <Chapter id="built" index={2} title="What I built">
              <ol className="border-t border-rule">
                {p.built.map((item, i) => (
                  <li key={i} className="flex gap-4 border-b border-rule py-5" data-reveal>
                    <span className="t-label text-accent-text pt-1" aria-hidden="true">{'abcd'[i]}</span>
                    <p className="t-body max-w-[64ch]">{item}</p>
                  </li>
                ))}
              </ol>
            </Chapter>

            <Chapter id="decisions" index={3} title="Decisions">
              <div className="space-y-10">
                {p.decisions.map((d, i) => (
                  <article key={d.title} className="grid grid-cols-1 sm:grid-cols-[3rem_1fr] gap-x-4 gap-y-3" data-reveal>
                    <span className="font-[800] [font-stretch:62%] text-[2.6rem] leading-none tracking-[-0.04em] text-accent-text" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="t-head">{d.title}</h3>
                      <p className="t-body mt-3 max-w-[64ch]">{d.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Chapter>

            <Chapter id="safeguards" index={4} title="Safeguards">
              <ul className="border-t border-rule">
                {p.safeguards.map((s) => (
                  <li key={s} className="flex gap-4 border-b border-rule py-4" data-reveal>
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-accent" aria-hidden="true" />
                    <p className="t-body max-w-[64ch]">{s}</p>
                  </li>
                ))}
              </ul>
            </Chapter>

            <Chapter id="scope" index={5} title="Scope & known gaps">
              <div className="bg-paper-2 p-5 md:p-8" data-reveal>
                <p className="t-serif italic text-[1.2rem] mb-4">Stated plainly, because a write-up that overclaims is worse than one that admits its edges.</p>
                <ul className="space-y-3">
                  {p.scope.map((s) => (
                    <li key={s} className="t-body flex gap-3">
                      <span aria-hidden="true" className="text-muted">—</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Chapter>

            <Chapter id="stack" index={6} title="Stack">
              <dl className="border-t-2 border-ink">
                {p.stack.map((g) => (
                  <div key={g.group} className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-2 border-b border-rule py-4" data-reveal>
                    <dt className="t-label text-muted pt-1">{g.group}</dt>
                    <dd className="text-[1.1rem] font-[560]">{g.items.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </Chapter>
          </div>
        </div>

        {/* Next case study */}
        <nav aria-label="Next case study" className="frame pb-20 md:pb-28">
          <TransitionLink
            to={`/projects/${next.slug}`}
            curtainLabel={next.title}
            className="group block border-t-[3px] border-ink pt-5"
          >
            <span className="t-label text-muted">
              Next case study — <span className="text-accent-text">{next.number}</span>
            </span>
            <span className="mt-4 flex items-end justify-between gap-6">
              <span className="t-title transition-colors duration-300 group-hover:text-accent">{next.title}</span>
              <span aria-hidden="true" className="text-[clamp(2.5rem,7vw,7rem)] leading-none transition-transform duration-500 group-hover:translate-x-3">
                →
              </span>
            </span>
          </TransitionLink>
        </nav>
      </main>
      <Footer />
    </>
  );
};
