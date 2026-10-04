import React, { useRef } from 'react';
import { PROJECTS, SECOND_TIMES } from '../../data/portfolioData';
import type { SecondTime as Scene } from '../../types/portfolio';
import { useSite } from '../../context/site';
import { EASE, gsap, useGSAP } from '../../lib/motion';

const projectOf = (slug: Scene['slug']) => PROJECTS.find((p) => p.slug === slug)!;

/** Where the guard stands on the wire, as a fraction of its width. */
const GATE = 0.56;

/**
 * "Everything happens twice": the story the hero promises, told four times.
 * The section pins and each system meets its duplicate on one wire: the first
 * copy reaches the guard and goes through (or doesn't), the second copy hits
 * the same guard and gets the project's real answer. Under reduced motion the
 * four scenes are simply listed in their final state.
 */
export const SecondTime: React.FC = () => {
  const { reducedMotion } = useSite();
  const root = useRef<HTMLElement>(null);
  const pinned = !reducedMotion;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]', el);
      const timelines = scenes.map((s) => sceneTimeline(s));
      if (!pinned) {
        const settle = () => timelines.forEach((tl) => tl.invalidate().progress(0).progress(1));
        settle();
        // Final positions depend on label widths: measure again once the mono face has loaded.
        document.fonts?.ready.then(settle);
        gsap.set('[data-ghost-strike]', { backgroundSize: '100% 0.07em' });
        return;
      }

      // The headline arrives while the section rises out of the dive.
      gsap.fromTo(
        '[data-intro-w]',
        { yPercent: 110 },
        { yPercent: 0, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 25%', scrub: 0.5 } },
      );

      const master = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * (0.9 + scenes.length) * 0.85)}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      // The line happens twice: its copy slides out from under it and is refused.
      master
        .fromTo('[data-ghost]', { yPercent: -100 }, { yPercent: 0, duration: 0.35, ease: 'power2.out' }, 0)
        .fromTo('[data-ghost-strike]', { backgroundSize: '0% 0.07em' }, { backgroundSize: '100% 0.07em', duration: 0.18 }, 0.32)
        .fromTo('[data-intro-sub]', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.15 }, 0.42)
        .to('[data-intro]', { autoAlpha: 0, y: -60, duration: 0.25, ease: 'power1.in' }, 0.7)
        .fromTo('[data-rail]', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.8);

      scenes.forEach((scene, i) => {
        const at = 0.9 + i;
        master
          .set(scene, { autoAlpha: 1 }, at)
          .add(timelines[i], at)
          .fromTo(`[data-rail-fill="${i}"]`, { scaleX: 0 }, { scaleX: 1, duration: 1 }, at)
          .fromTo(`[data-rail-name="${i}"]`, { opacity: 0.4 }, { opacity: 1, duration: 0.05 }, at);
        if (i < scenes.length - 1) {
          master
            .to(scene, { autoAlpha: 0, y: -40, duration: 0.1, ease: 'power1.in' }, at + 0.9)
            .to(`[data-rail-name="${i}"]`, { opacity: 0.4, duration: 0.05 }, at + 0.95);
        }
      });
    },
    { scope: root, dependencies: [pinned], revertOnUpdate: true },
  );

  return (
    <section
      ref={root}
      id="twice"
      aria-labelledby="twice-title"
      className={pinned ? 'relative h-[100svh] overflow-hidden' : 'relative py-[clamp(72px,10vw,140px)]'}
    >
      <div className={pinned ? 'frame relative h-full' : 'frame'}>
        <div data-intro className={pinned ? 'absolute inset-x-[var(--gutter)] top-1/2 -translate-y-1/2' : ''}>
          <h2 id="twice-title" className="relative font-[800] leading-[0.92] tracking-[-0.05em] text-[clamp(2.6rem,8.4vw,8.6rem)]">
            <span className="sr-only">Everything happens twice.</span>
            <span aria-hidden="true" className="relative z-10 block bg-bg">
              {['Everything', 'happens', 'twice.'].map((w) => (
                <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-top last:mr-0">
                  <span data-intro-w className="inline-block">
                    {w}
                  </span>
                </span>
              ))}
            </span>
            {/* The duplicate: the same line again, sliding out from under it, refused. */}
            <span aria-hidden="true" data-ghost className="relative block text-ink-3">
              <span data-ghost-strike className="ghost-strike">
                Everything happens twice.
              </span>
            </span>
          </h2>
          <p data-intro-sub className="t-lead mt-[clamp(18px,3svh,40px)] max-w-[40ch] text-ink-2">
            A double click, a retried webhook, a race between two admins. Here is what each system does with the second
            copy.
          </p>
        </div>

        {pinned && (
          <ol data-rail className="invisible absolute inset-x-[var(--gutter)] top-[calc(var(--header-h)+12px)] grid grid-cols-4 gap-2" aria-hidden="true">
            {SECOND_TIMES.map((s, i) => (
              <li key={s.slug}>
                <span className="block h-[3px] overflow-hidden rounded-full bg-line-2">
                  <span data-rail-fill={i} className="block h-full origin-left scale-x-0 bg-signal" />
                </span>
                <span data-rail-name={i} className="t-mono mt-2 block truncate text-ink opacity-40 max-sm:hidden">
                  {projectOf(s.slug).title}
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className={pinned ? '' : 'mt-16 space-y-20'}>
          {SECOND_TIMES.map((s) => (
            <SceneView key={s.slug} scene={s} pinned={pinned} />
          ))}
        </div>
      </div>
    </section>
  );
};

/** LPU Reserve's crowd: the other 499, abstracted. Fixed offsets, so every render is the same. */
const CROWD = Array.from({ length: 30 }, (_, i) => ({
  delay: ((i * 7919) % 30) / 30,
  back: 14 + ((i * 3571) % 70),
  dy: (((i * 2971) % 100) / 100 - 0.5) * 2,
}));

/** Lane heights on the wire, as percentages. */
const LANE_A = 26;
const LANE_B = 58;

const SceneView: React.FC<{ scene: Scene; pinned: boolean }> = ({ scene, pinned }) => {
  const p = projectOf(scene.slug);
  const crowd = scene.slug === 'lpu-reserve';
  const gate = `${GATE * 100}%`;
  return (
    <article
      data-scene
      data-passes={scene.first.passes ? '' : undefined}
      className={
        pinned
          ? 'invisible absolute inset-x-[var(--gutter)] bottom-[clamp(16px,4svh,56px)] top-[calc(var(--header-h)+48px)] grid content-center gap-[clamp(18px,3.5svh,44px)] lg:grid-cols-12 lg:items-center lg:gap-x-[var(--gutter)]'
          : 'grid gap-8 border-t border-line-2 pt-10 lg:grid-cols-12 lg:items-center lg:gap-x-[var(--gutter)]'
      }
    >
      <div className="lg:col-span-5">
        <h3 className="t-mono text-signal-text" data-s-in>
          {p.title}
        </h3>
        <p className="mt-3 font-[750] leading-[1.02] tracking-[-0.035em] text-[clamp(1.5rem,3.5vw,3.4rem)]" data-s-in>
          {scene.event}
        </p>
        <p className="mt-[clamp(14px,3svh,32px)] max-lg:hidden" data-s-law>
          <span className="t-mono text-ink-2">So, always:</span>
          <span className="mt-1 block font-[750] tracking-[-0.02em] text-signal-text text-[clamp(1.2rem,1.9vw,1.8rem)]">{p.invariant}</span>
        </p>
      </div>

      {/* The wire. Decorative: the sentence after it says the same. */}
      <div className="lg:col-span-7" aria-hidden="true">
        <div data-wire className="relative h-[clamp(230px,40svh,440px)] text-[12px] sm:text-[13px]">
          <span data-lane className="wire-lane" style={{ top: `${LANE_A}%` }} />
          <span data-lane className="wire-lane" style={{ top: `${LANE_B}%` }} />
          <span
            data-gate-label
            className="t-mono absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-[3px] border border-line-2 px-1.5 py-0.5 text-ink"
            style={{ left: gate }}
          >
            {scene.gate}
          </span>
          <div
            data-gate
            className="absolute top-[12%] w-[clamp(12px,1.3vw,18px)] -translate-x-1/2 overflow-hidden rounded-full border-[1.5px] border-ink-2 bg-bg"
            style={{ left: gate, bottom: `${100 - LANE_B - 14}%` }}
          >
            <span data-gate-flash className="absolute inset-0 block bg-ink opacity-0" />
          </div>
          <span data-ring-a className="wire-ring border-signal" style={{ left: gate, top: `${LANE_A}%` }} />
          <span data-ring-b className="wire-ring border-ink-2" style={{ left: gate, top: `${LANE_B}%` }} />

          {crowd &&
            CROWD.map((d, i) => (
              <span
                key={i}
                data-dot
                data-back={d.back}
                data-dy={d.dy}
                data-delay={d.delay}
                className="absolute left-0 block h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-ink-2"
                style={{ top: `${LANE_B}%` }}
              />
            ))}

          <Packet attr="b" top={`${LANE_B}%`} label={scene.second.label} />
          <Packet attr="a" top={`${LANE_A}%`} label={scene.first.label} />

          <span
            data-out-a
            className={`t-mono absolute right-0 rounded-[3px] px-1.5 py-0.5 ${
              scene.first.passes ? 'bg-signal text-on-signal' : 'border border-dashed border-ink-3 text-ink-2'
            }`}
            style={{ top: `calc(${LANE_A}% + 22px)` }}
          >
            {scene.first.outcome}
          </span>
          <div className="wire-out absolute right-0" style={{ top: `calc(${LANE_B}% + 22px)` }}>
            <span data-stamp className="wire-stamp t-mono">
              {scene.stamp}
            </span>
            <span data-out-b className="t-mono mt-2 block max-w-[34ch] leading-[1.45] text-ink-2">
              {scene.second.outcome}
            </span>
          </div>
        </div>
      </div>

      <p className="lg:hidden" data-s-law>
        <span className="font-[750] tracking-[-0.02em] text-signal-text text-[clamp(1.15rem,4.6vw,1.5rem)]">{p.invariant}</span>
      </p>
      <p className="sr-only">
        First, {scene.first.label}: {scene.first.outcome}. Then {scene.second.label}: {scene.second.outcome}.
      </p>
    </article>
  );
};

const Packet: React.FC<{ attr: 'a' | 'b'; top: string; label: string }> = ({ attr, top, label }) => (
  <span data-packet={attr} className="absolute left-0 z-[1] block -translate-y-1/2" style={{ top }}>
    <span data-pill className="t-mono relative block whitespace-nowrap rounded-full border-[1.5px] border-ink bg-bg px-3 py-1.5 text-ink">
      {label}
    </span>
  </span>
);

/** One scene's choreography, one unit long (the master timeline scrubs it). */
function sceneTimeline(scene: HTMLElement) {
  const q = gsap.utils.selector(scene);
  const wire = q('[data-wire]')[0] as HTMLElement;
  const a = q('[data-packet="a"]')[0] as HTMLElement;
  const b = q('[data-packet="b"]')[0] as HTMLElement;
  const pillA = a.querySelector('[data-pill]');
  const pillB = b.querySelector('[data-pill]');
  const flash = q('[data-gate-flash]');
  const dots = q('[data-dot]') as HTMLElement[];
  const passes = scene.hasAttribute('data-passes');
  const gateX = () => wire.offsetWidth * GATE;
  const stop = (el: HTMLElement) => () => gateX() - el.offsetWidth - 16;
  const end = (el: HTMLElement) => () => wire.offsetWidth - el.offsetWidth;
  const half = () => (wire.offsetHeight * (LANE_B - LANE_A)) / 200;
  const refused = { color: 'var(--ink-3)', borderColor: 'var(--ink-3)', borderStyle: 'dashed', duration: 0.03 };

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(q('[data-s-in]'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.14, stagger: 0.05, ease: EASE.out }, 0)
    .fromTo(q('[data-lane]'), { scaleX: 0 }, { scaleX: 1, duration: 0.18, stagger: 0.04, ease: 'power2.out' }, 0.04)
    .fromTo(q('[data-gate]'), { autoAlpha: 0, scaleY: 0 }, { autoAlpha: 1, scaleY: 1, duration: 0.1, ease: 'back.out(1.7)' }, 0.1)
    .fromTo(q('[data-gate-label]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.14)
    // One request, then its copy: they start as one and split onto two lanes.
    .fromTo(a, { x: -10, y: half, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.03 }, 0.15)
    .fromTo(b, { x: -10, y: () => -half(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.03 }, 0.15)
    .to([a, b], { y: 0, duration: 0.08, ease: 'power2.inOut' }, 0.19)
    // The first copy reaches the guard.
    .to(a, { x: stop(a), duration: 0.15, ease: 'power1.in' }, 0.24)
    .to(flash, { opacity: 0.95, duration: 0.015 }, 0.39)
    .to(flash, { opacity: 0, duration: 0.06 }, 0.405);
  if (passes) {
    tl.set(flash, { backgroundColor: 'var(--signal)' }, 0)
      .fromTo(q('[data-ring-a]'), { scale: 0.3, autoAlpha: 1 }, { scale: 3.2, autoAlpha: 0, duration: 0.12, ease: 'power2.out' }, 0.39)
      .to(a, { x: end(a), duration: 0.12, ease: 'power2.out' }, 0.39)
      .to(pillA, { backgroundColor: 'var(--signal)', color: 'var(--on-signal)', borderColor: 'var(--signal)', duration: 0.03 }, 0.4);
  } else {
    tl.set(flash, { backgroundColor: 'var(--ink)' }, 0)
      .fromTo(q('[data-ring-a]'), { scale: 0.3, autoAlpha: 1 }, { scale: 2.4, autoAlpha: 0, duration: 0.1, ease: 'power2.out' }, 0.39)
      .to(a, { keyframes: { x: ['+=7', '-=12', '+=5'] }, duration: 0.05 }, 0.39)
      .to(pillA, refused, 0.41);
  }
  tl.fromTo(q('[data-out-a]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.05, ease: 'back.out(2)' }, 0.5);

  // LPU Reserve: the crowd arrives with the second copy and piles up against the guard.
  dots.forEach((d) => {
    const at = 0.3 + +d.dataset.delay! * 0.26;
    const jitter = (+d.dataset.back! % 7) - 3;
    tl.fromTo(d, { x: -8, autoAlpha: 0 }, { x: () => gateX() - 14 + jitter, autoAlpha: 1, duration: 0.1, ease: 'power1.in' }, at).to(
      d,
      {
        x: () => gateX() - 14 - +d.dataset.back! * 1.6,
        y: () => +d.dataset.dy! * wire.offsetHeight * 0.13,
        opacity: 0.45,
        duration: 0.08,
        ease: 'power3.out',
      },
      at + 0.1,
    );
  });

  // The second copy: same wire, same guard, a different answer.
  tl.to(b, { x: stop(b), duration: 0.18, ease: 'power1.in' }, 0.44)
    .set(flash, { backgroundColor: 'var(--ink)' }, 0.615)
    .to(flash, { opacity: 0.95, duration: 0.015 }, 0.62)
    .to(flash, { opacity: 0, duration: 0.06 }, 0.635)
    .fromTo(q('[data-ring-b]'), { scale: 0.3, autoAlpha: 1 }, { scale: 2.6, autoAlpha: 0, duration: 0.12, ease: 'power2.out' }, 0.62)
    .to(b, { keyframes: { x: ['+=8', '-=14', '+=6'] }, duration: 0.05 }, 0.62)
    .to(pillB, refused, 0.64)
    .fromTo(q('[data-stamp]'), { autoAlpha: 0, scale: 1.9, rotate: -12 }, { autoAlpha: 1, scale: 1, rotate: -4, duration: 0.06, ease: 'power4.in' }, 0.66)
    .fromTo(q('[data-out-b]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: EASE.out }, 0.72)
    .fromTo(q('[data-s-law]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: EASE.out }, 0.78)
    .to({}, { duration: 0.12 }, 0.88);
  return tl;
}
