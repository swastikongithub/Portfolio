import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PROJECTS, getProject } from '../../data/portfolioData';
import type { ProjectCaseStudy, ProjectSlug } from '../../types/portfolio';
import { useSite } from '../../context/site';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useReveal } from '../../hooks/useReveal';
import { useSceneMode } from '../../hooks/useSceneMode';
import { EASE, MOTION_OK, gsap, useGSAP } from '../../lib/motion';
import { TransitionLink } from '../ui/TransitionLink';
import { Letters } from '../ui/Letters';
import { BuiltList, Facts, Story } from '../case/CaseParts';
import { LedgerFigure } from '../figures/LedgerFigure';
import { DayScene } from '../figures/DayScene';
import { BoundaryFigure } from '../figures/BoundaryFigure';
import { MatchScene } from '../figures/MatchScene';
import { StateMachineFigure } from '../figures/StateMachineFigure';
import { WebhookScene } from '../figures/WebhookScene';
import { OtherDoorFigure } from '../figures/OtherDoorFigure';
import { ResumeScene } from '../figures/ResumeScene';
import { CaseExtras } from '../figures/CaseExtras';
import { SiteFooter } from '../layout/SiteFooter';
import { Stage } from '../home/Stage';
import { NotFoundPage } from './NotFoundPage';

/** The hands-on figure for each project. */
const FIGURES: Record<ProjectSlug, React.FC<{ autoplay?: boolean }>> = {
  'lpu-reserve': LedgerFigure,
  vulntrack: BoundaryFigure,
  tenora: StateMachineFigure,
  'ai-interview-platform': OtherDoorFigure,
};

/** The choreographed, scroll-driven scene for each project (wide screens, motion allowed). */
const SCENES: Record<ProjectSlug, React.FC> = {
  'lpu-reserve': DayScene,
  vulntrack: MatchScene,
  tenora: WebhookScene,
  'ai-interview-platform': ResumeScene,
};

const EXTRA_TITLE: Record<ProjectSlug, string> = {
  'lpu-reserve': 'One ledger for every claim',
  vulntrack: 'Four answers, never a silent guess',
  tenora: 'Two money flows that never import each other',
  'ai-interview-platform': 'The resume never sits in a request',
};

const STORY_CODE: Partial<Record<ProjectSlug, string>> = {
  'lpu-reserve': 'SELECT pg_advisory_xact_lock(20020, resource_id);  -- queue same-resource claims\n-- on 40P01: roll back to the savepoint, wait a few jittered ms, retry',
  vulntrack: "await Organization.updateOne({ _id: organizationId }, { $inc: { rosterVersion: 1 } }, { session })",
  'ai-interview-platform': 'DROP POLICY IF EXISTS "Users can update own row" ON public.users;',
};

const CONTENTS = [
  { id: 'guarantee', label: 'The guarantee' },
  { id: 'problem', label: 'The problem' },
  { id: 'try', label: 'Try it' },
  { id: 'built', label: 'What I built' },
  { id: 'detail', label: 'In detail' },
  { id: 'story', label: 'The story' },
  { id: 'request', label: 'How a request moves' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'safeguards', label: 'Safeguards' },
  { id: 'limits', label: 'Where it stops' },
  { id: 'stack', label: 'Stack' },
];

const Block: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-line-2 py-[clamp(48px,6vw,88px)]">
    <h2 id={`${id}-heading`} className="t-h3 mb-6 text-ink-2" data-reveal>
      {title}
    </h2>
    {children}
  </section>
);

export const ProjectPage: React.FC = () => {
  const { slug } = useParams();
  const project = getProject(slug);
  if (!project) return <NotFoundPage />;
  return <CaseStudy key={project.slug} project={project} />;
};

const CaseStudy: React.FC<{ project: ProjectCaseStudy }> = ({ project: p }) => {
  useDocumentTitle(p.title, p.summary);
  const { reducedMotion } = useSite();
  const sceneMode = useSceneMode();
  const root = useRef<HTMLElement>(null);
  useReveal(root, [p.slug]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ defaults: { ease: EASE.out } })
          .fromTo('[data-cs-letter]', { yPercent: 115, rotate: 8 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.035 })
          .fromTo('[data-cs-in]', { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.07 }, 0.35);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [p.slug] },
  );

  const index = PROJECTS.findIndex((x) => x.slug === p.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const Figure = FIGURES[p.slug];
  const Scene = SCENES[p.slug];
  // The day scene works at every width; the others need the room of a wide screen.
  const showScene = !reducedMotion && (p.slug === 'lpu-reserve' || sceneMode);

  return (
    <>
      <main ref={root} id="main" tabIndex={-1} className="pt-[var(--header-h)] outline-none">
        <header className="frame pb-[clamp(40px,6vw,80px)] pt-[clamp(32px,6vw,72px)]">
          <TransitionLink to={`/#work`} className="t-small link text-ink-2" data-cs-in>
            Back to all four systems
          </TransitionLink>
          <p className="t-mono mt-8 text-ink-2" data-cs-in>
            {p.kind}
            <span className="mx-2 text-ink-3" aria-hidden="true">/</span>
            {p.period}
          </p>
          <h1 tabIndex={-1} className="mt-3 font-[800] leading-[0.85] tracking-[-0.055em] text-[clamp(3.4rem,12vw,14rem)] outline-none">
            <span className="sr-only">{p.title}</span>
            <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
              <Letters text={p.title} attr="data-cs-letter" />
            </span>
          </h1>
          <div className="grid-12 mt-8 gap-y-8">
            <div className="col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-7">
              <p className="font-[750] leading-[1.12] tracking-[-0.03em] text-[clamp(1.6rem,3.2vw,3rem)]" data-cs-in>
                <span className="mark">{p.invariant}</span>
              </p>
              <p className="t-lead max-w-[54ch]" data-cs-in>
                {p.deck}
              </p>
            </div>
            <dl className="col-span-4 grid grid-cols-2 content-start gap-x-6 gap-y-4 md:col-span-4 lg:col-start-9" data-cs-in>
              <div className="col-span-2">
                <dt className="t-mono text-ink-2">status</dt>
                <dd className="t-small mt-1">{p.status}</dd>
              </div>
              <div className="col-span-2 flex flex-wrap gap-2">
                <a href={p.links.source} target="_blank" rel="noopener noreferrer" className="btn btn-sm">
                  Source <span aria-hidden="true">↗</span>
                  <span className="sr-only">(GitHub, opens in a new tab)</span>
                </a>
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-signal">
                    Live <span aria-hidden="true">↗</span>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
              {p.links.liveNote && <dd className="col-span-2 t-small text-ink-2">{p.links.liveNote}</dd>}
            </dl>
          </div>
        </header>

        {showScene && (
          <Stage>
            <Scene />
          </Stage>
        )}

        <div className="frame">
          <div className="grid-12">
            <nav aria-label="On this page" className="hidden lg:col-span-3 lg:block">
              <ol className="sticky top-[calc(var(--header-h)+40px)] space-y-1 border-t border-line-2 pt-6">
                {CONTENTS.map((c) => (
                  <li key={c.id}>
                    <a href={`#${c.id}`} className="t-small text-ink-2 transition-colors hover:text-ink">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="col-span-4 md:col-span-12 lg:col-span-9">
              <Block id="guarantee" title="The guarantee">
                <p className="t-h2" data-reveal>
                  {p.invariant}
                </p>
                <pre className="t-mono mt-6 overflow-x-auto rounded-[var(--r-sm)] border border-line bg-bg-2 px-4 py-3" data-reveal data-lenis-prevent>
                  <code>{p.mechanism}</code>
                </pre>
                <p className="t-body mt-4 text-ink-2" data-reveal>
                  It has to survive: {p.twice.charAt(0).toLowerCase() + p.twice.slice(1)}
                </p>
              </Block>

              <Block id="problem" title="The problem">
                <p className="t-lead max-w-[62ch]" data-reveal>
                  {p.problem}
                </p>
              </Block>

              <Block id="try" title="Try it">
                <figure>
                  <Figure autoplay={!reducedMotion} />
                  <figcaption className="t-small mt-3 text-ink-2">{p.figureCaption}</figcaption>
                </figure>
              </Block>

              <Block id="built" title="What I built">
                <BuiltList items={p.built} columns={1} />
                <Facts facts={p.facts} className="mt-14" />
              </Block>

              <Block id="detail" title={EXTRA_TITLE[p.slug]}>
                <CaseExtras slug={p.slug} />
              </Block>

              <Block id="story" title="The story">
                <Story project={p} code={STORY_CODE[p.slug]} />
              </Block>

              <Block id="request" title="How a request moves">
                <p className="t-body max-w-[62ch] text-ink-2" data-reveal>
                  {p.architecture.intro}
                </p>
                <ol className="mt-8 border-l border-line-2">
                  {p.architecture.layers.map((l, i) => (
                    <li key={l.name} className="relative pb-7 pl-6 last:pb-0" data-reveal>
                      <span className="absolute -left-[5px] top-[0.55em] h-[9px] w-[9px] rounded-full border border-ink bg-bg" aria-hidden="true" />
                      <p className="t-mono text-ink-2">{String(i + 1).padStart(2, '0')}</p>
                      <p className="t-mono-lg mt-1 break-words text-[1.05rem] font-[600]">{l.name}</p>
                      <p className="t-small mt-1 max-w-[60ch] text-ink-2">{l.detail}</p>
                    </li>
                  ))}
                </ol>
              </Block>

              <Block id="decisions" title="Decisions">
                <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
                  {p.decisions.map((d) => (
                    <div key={d.title} data-reveal>
                      <h3 className="text-[1.2rem] font-[700] tracking-[-0.01em]">{d.title}</h3>
                      <p className="t-small mt-2 text-ink-2">{d.body}</p>
                    </div>
                  ))}
                </div>
              </Block>

              <Block id="safeguards" title="Safeguards">
                <BuiltList items={p.safeguards} columns={1} />
              </Block>

              <Block id="limits" title="Where it stops today">
                <ul className="space-y-3">
                  {p.limits.map((l) => (
                    <li key={l} className="t-body flex gap-3 text-ink-2" data-reveal>
                      <span className="mt-[0.8em] h-px w-3 shrink-0 bg-ink-3" aria-hidden="true" />
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block id="stack" title="Stack">
                <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {p.stack.map((g) => (
                    <div key={g.group} data-reveal>
                      <dt className="t-mono text-ink-2">{g.group}</dt>
                      <dd className="mt-2 flex flex-wrap gap-1.5">
                        {g.items.map((it) => (
                          <span key={it} className="chip !text-ink">
                            {it}
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Block>
            </article>
          </div>

          <TransitionLink to={`/projects/${next.slug}`} className="group mt-[clamp(32px,5vw,64px)] block border-t border-line-2 pt-8">
            <span className="t-mono text-ink-2">Next system</span>
            <span className="t-display mt-2 block transition-colors duration-300 group-hover:text-ink-2">{next.title}</span>
            <span className="t-lead mt-3 block">
              <span className="mark">{next.invariant}</span>
            </span>
          </TransitionLink>
        </div>
      </main>
      <SiteFooter />
    </>
  );
};
