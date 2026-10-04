import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../../data/portfolioData';
import type { ProjectSlug } from '../../types/portfolio';
import { useSite } from '../../context/site';
import { EASE, MOTION_OK, gsap, ScrollTrigger, useGSAP } from '../../lib/motion';
import { useInstrument } from '../../lib/instrument/context';
import { useInstrumentHost } from '../../lib/instrument/useInstrumentHost';
import type { Instrument, Mode } from '../../lib/instrument/Instrument';
import { TransitionLink } from '../ui/TransitionLink';
import { useProximity } from '../../hooks/useProximity';
import { Letters } from '../ui/Letters';

const MODES: Record<ProjectSlug, Mode> = {
  'lpu-reserve': 'race',
  vulntrack: 'boundary',
  tenora: 'dedupe',
  'ai-interview-platform': 'pipeline',
};

/** What the replay button re-runs, per system. */
const REPLAY: Record<Mode, string> = {
  race: 'Run the race again',
  boundary: 'Send the requests again',
  dedupe: 'Redeliver the events',
  pipeline: 'Upload the resumes again',
};

/** What the cursor says a click will send, per system. */
const CURSOR: Record<Mode, string> = {
  race: 'click: one more attempt',
  boundary: 'click: knock from outside',
  dedupe: 'click: deliver an event',
  pipeline: 'click: upload a resume',
};

/** What each colour in the instrument means, per system. Also the text equivalent of the visual. */
const LEGEND: Record<Mode, { key: 'signal' | 'ink' | 'ink3' | 'shape' | 'you'; text: string }[]> = {
  race: [
    { key: 'signal', text: 'the one booking' },
    { key: 'ink3', text: '499 attempts refused, SQLSTATE 23P01' },
    { key: 'shape', text: 'the membrane: an exclusion constraint' },
    { key: 'you', text: 'click or tap: one more attempt' },
  ],
  boundary: [
    { key: 'signal', text: 'members, inside their organization' },
    { key: 'ink3', text: 'requests from outside: 404, never 403' },
    { key: 'shape', text: 'the organization boundary' },
    { key: 'you', text: 'click or tap: you are the outsider' },
  ],
  dedupe: [
    { key: 'signal', text: 'first delivery of an event: stored' },
    { key: 'ink3', text: 'same event id again: refused' },
    { key: 'shape', text: 'the gate: unique (external_event_id)' },
    { key: 'you', text: 'click once: stored. twice, fast: duplicate' },
  ],
  pipeline: [
    { key: 'ink', text: 'a resume in flight, off the request path' },
    { key: 'ink3', text: 'same file again: leaves at the hash' },
    { key: 'signal', text: 'validated and persisted' },
    { key: 'you', text: 'click once: upload. twice, fast: same file' },
  ],
};

const Swatch: React.FC<{ k: 'signal' | 'ink' | 'ink3' | 'shape' | 'you' }> = ({ k }) =>
  k === 'you' ? (
    <span className="h-3 w-3 shrink-0 rounded-full border-2 border-signal" aria-hidden="true" />
  ) : k === 'shape' ? (
    <span className="h-3 w-3 shrink-0 rounded-[2px] border border-ink-2" aria-hidden="true" />
  ) : (
    <span className={`h-[3px] w-4 shrink-0 rounded-full ${k === 'signal' ? 'bg-signal' : k === 'ink' ? 'bg-ink' : 'bg-ink-3'}`} aria-hidden="true" />
  );

/**
 * The four systems, explored rather than read. On capable screens the section
 * pins; scrolling (or the index) moves between projects and the instrument
 * reconfigures to show each one's mechanism. Without WebGL or with reduced
 * motion, the four are simply listed, with the same words.
 */
export const WorkExplorer: React.FC = () => {
  const { reducedMotion, scrollToY } = useSite();
  const { failed } = useInstrument();
  const stacked = reducedMotion || failed;
  return stacked ? <WorkList /> : <PinnedExplorer scrollToY={scrollToY} />;
};

const PinnedExplorer: React.FC<{ scrollToY: (y: number) => void }> = ({ scrollToY }) => {
  const root = useRef<HTMLElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const instRef = useRef<Instrument | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  useProximity(panelRef, '[data-near]', [active]);

  useInstrumentHost(glRef, anchorRef, (inst) => {
    instRef.current = inst;
    inst.events = {};
    inst.setMode(MODES[PROJECTS[activeRef.current].slug]);
  });

  // Switch the instrument whenever the active project changes.
  useEffect(() => {
    activeRef.current = active;
    instRef.current?.setMode(MODES[PROJECTS[active].slug]);
  }, [active]);

  useGSAP(
    () => {
      const n = PROJECTS.length;
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (n - 1) * 0.9)}`,
        pin: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.25, max: 0.6 }, ease: 'power2.inOut', delay: 0.08 },
        onUpdate: (self) => {
          const idx = Math.round(self.progress * (n - 1));
          if (idx !== activeRef.current) setActive(idx);
        },
      });
      stRef.current = st;
      return () => st.kill();
    },
    { scope: root },
  );

  // Each project's words arrive with it.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo('[data-x-letter]', { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: EASE.out, stagger: 0.025 });
        gsap.fromTo('[data-x-in]', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: EASE.out, stagger: 0.06, delay: 0.15 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  );

  const goTo = (i: number) => {
    const st = stRef.current;
    if (!st) return;
    scrollToY(st.start + ((st.end - st.start) * i) / (PROJECTS.length - 1));
  };

  const p = PROJECTS[active];
  const mode = MODES[p.slug];
  const fact = p.facts[p.homeFact];

  return (
    <section ref={root} id="work" aria-labelledby="work-title" className="relative h-[100svh] overflow-hidden" data-cursor={CURSOR[mode]}>
      <div ref={glRef} className="absolute inset-0" aria-hidden="true" />
      {/* Where the instrument focuses: right of the text on wide screens, above it on phones. */}
      <div
        ref={anchorRef}
        className="pointer-events-none absolute left-[calc(50%-14px)] top-[calc(27%-14px)] h-7 w-7 lg:left-[calc(71%-14px)] lg:top-[calc(50%-14px)]"
        aria-hidden="true"
      />

      <div className="frame relative flex h-full flex-col justify-end pb-6 pt-[calc(var(--header-h)+16px)] lg:justify-center lg:pb-0">
        <div ref={panelRef} className="max-lg:-mx-1 max-lg:rounded-[var(--r-lg)] max-lg:border max-lg:border-line max-lg:bg-bg/85 max-lg:p-4 max-lg:backdrop-blur-md lg:w-[44%]">
          <h2 id="work-title" tabIndex={-1} className="t-mono text-ink-2 outline-none">
            Four systems. Each keeps one promise.
          </h2>
          <ol className="no-scrollbar -mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" aria-label="Projects">
            {PROJECTS.map((x, i) => (
              <li key={x.slug}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? 'true' : undefined}
                  data-near
                  data-magnetic
                  className={`btn btn-sm !min-h-9 shrink-0 whitespace-nowrap !px-3 !text-[0.82rem] ${i === active ? 'btn-signal' : 'near-aware'}`}
                >
                  {x.title}
                </button>
              </li>
            ))}
          </ol>

          <article key={p.slug} className="mt-[clamp(14px,3svh,48px)]" aria-live="polite">
            <p className="t-mono text-ink-2 max-sm:hidden" data-x-in>
              {p.kind}
            </p>
            <h3 className="mt-2 font-[800] leading-[0.88] tracking-[-0.05em] text-[clamp(2.3rem,7vw,7rem)]">
              <span className="sr-only">{p.title}</span>
              <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
                <Letters text={p.title} attr="data-x-letter" />
              </span>
            </h3>
            <p className="mt-3 font-[750] leading-[1.05] tracking-[-0.025em] text-signal-text text-[clamp(1.3rem,2.4vw,2.2rem)]" data-x-in>
              {p.invariant}
            </p>
            <p className="t-body mt-3 max-w-[40ch] text-ink-2 max-sm:hidden" data-x-in>
              {p.twice}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-4 sm:mt-5" data-x-in>
              <div>
                <p className="t-mono-lg t-num text-[clamp(1.8rem,3vw,2.6rem)] font-[600] leading-none">{fact.value}</p>
                <p className="t-small mt-1 max-w-[30ch] text-ink-2">{fact.label}</p>
              </div>
              <ul className="flex flex-wrap gap-1.5 max-sm:hidden" aria-label={`${p.title} stack`}>
                {p.stackShort.slice(0, 4).map((s) => (
                  <li key={s} className="chip">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5" data-x-in>
              <TransitionLink to={`/projects/${p.slug}`} className="btn btn-signal" data-magnetic>
                Open the case study
              </TransitionLink>
              <button type="button" className="btn" onClick={() => instRef.current?.replay()} data-magnetic>
                {REPLAY[mode]}
              </button>
            </div>
          </article>
        </div>

        {/* Legend: what the instrument is showing, in words. */}
        <ul
          className="absolute bottom-6 right-[var(--gutter)] hidden w-[300px] space-y-1.5 rounded-[var(--r-md)] border border-line bg-bg/70 p-3 backdrop-blur-md lg:block"
          aria-label={`What the visual shows for ${p.title}`}
        >
          {LEGEND[mode].map((l) => (
            <li key={l.text} className="t-mono flex items-center gap-2.5 text-ink-2">
              <Swatch k={l.key} />
              {l.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/** Reduced motion or no WebGL: the same four, as a list. Nothing pins, nothing is hidden. */
const WorkList: React.FC = () => (
  <section id="work" aria-labelledby="work-title" className="relative py-[clamp(72px,10vw,140px)]">
    <div className="frame">
      <h2 id="work-title" tabIndex={-1} className="t-display outline-none">
        Four systems.
        <br />
        Each keeps one promise.
      </h2>
      <ol className="mt-12 border-t border-line-2">
        {PROJECTS.map((p) => {
          const fact = p.facts[p.homeFact];
          return (
            <li key={p.slug} className="grid-12 gap-y-4 border-b border-line-2 py-10">
              <div className="col-span-4 md:col-span-6">
                <p className="t-mono text-ink-2">{p.kind}</p>
                <h3 className="mt-2 font-[800] leading-[0.9] tracking-[-0.045em] text-[clamp(2.4rem,6vw,5.5rem)]">{p.title}</h3>
                <p className="mt-3 font-[750] text-signal-text text-[clamp(1.2rem,2vw,1.8rem)]">{p.invariant}</p>
              </div>
              <div className="col-span-4 flex flex-col justify-end gap-4 md:col-span-5 md:col-start-8">
                <p className="t-body text-ink-2">{p.twice}</p>
                <code className="t-mono break-words text-ink">{p.mechanism}</code>
                <p>
                  <span className="t-mono-lg t-num text-[1.8rem] font-[600]">{fact.value}</span>{' '}
                  <span className="t-small text-ink-2">{fact.label}</span>
                </p>
                <TransitionLink to={`/projects/${p.slug}`} className="btn btn-signal self-start">
                  Open the case study
                </TransitionLink>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);
