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
        timelines.forEach((tl) => tl.progress(1));
        gsap.set('[data-ghost]', { yPercent: 100 });
        gsap.set('[data-ghost-strike]', { backgroundSize: '100% 0.07em' });
        return;
      }

      // The headline arrives while the section rises out of the dive.
      gsap.fromTo(
        '[data-intro-w]',
        { yPercent: 110 },
        { yPercent: 0, ease: 'none', stagger: 0.08, scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 15%', scrub: 0.5 } },
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
        .fromTo('[data-ghost]', { yPercent: 0 }, { yPercent: 100, duration: 0.35, ease: 'power2.out' }, 0)
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
            <span aria-hidden="true" data-ghost className="absolute inset-x-0 top-0 block text-ink-3">
              <span data-ghost-strike className="ghost-strike">
                Everything happens twice.
              </span>
            </span>
          </h2>
          <p data-intro-sub className="t-lead mt-[calc(clamp(2.6rem,8.4vw,8.6rem)*1.95)] max-w-[40ch] text-ink-2">
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

const SceneView: React.FC<{ scene: Scene; pinned: boolean }> = ({ scene, pinned }) => {
  const p = projectOf(scene.slug);
  const crowd = scene.slug === 'lpu-reserve';
  return (
    <article
      data-scene
      data-passes={scene.first.passes ? '' : undefined}
      className={
        pinned
          ? 'invisible absolute inset-x-[var(--gutter)] bottom-[clamp(20px,5svh,64px)] top-[calc(var(--header-h)+56px)] grid content-center gap-[clamp(20px,4svh,48px)] lg:grid-cols-12 lg:items-center lg:gap-x-[var(--gutter)]'
          : 'grid gap-8 border-t border-line-2 pt-10 lg:grid-cols-12 lg:items-center lg:gap-x-[var(--gutter)]'
      }
    >
      <div className="lg:col-span-5">
        <h3 className="t-mono text-signal-text" data-s-in>
          {p.title}
        </h3>
        <p className="mt-3 font-[750] leading-[1.02] tracking-[-0.035em] text-[clamp(1.55rem,3.6vw,3.5rem)]" data-s-in>
          {scene.event}
        </p>
        <p className="mt-[clamp(14px,3svh,32px)] max-lg:hidden" data-s-law>
          <span className="t-mono text-ink-2">So, always:</span>
          <span className="mt-1 block font-[750] tracking-[-0.02em] text-signal-text text-[clamp(1.2rem,1.9vw,1.8rem)]">{p.invariant}</span>
        </p>
      </div>

      {/* The wire. Decorative: the sentence below says the same. */}
      <div className="lg:col-span-7" aria-hidden="true">
        <div data-wire className="relative h-[clamp(190px,30svh,340px)]">
          <span data-lane className="absolute inset-x-0 top-[30%] block h-px origin-left bg-line-2" />
          <span data-lane className="absolute inset-x-0 top-[66%] block h-px origin-left bg-line-2" />
          <div
            data-gate
            className="absolute bottom-[14%] top-[14%] w-[clamp(10px,1.2vw,16px)] -translate-x-1/2 overflow-hidden rounded-full border border-ink-2"
            style={{ left: `${GATE * 100}%` }}
          >
            <span data-gate-flash className="absolute inset-0 block bg-ink opacity-0" />
          </div>
          <span data-gate-label className="t-mono absolute top-0 -translate-x-1/2 -translate-y-full whitespace-nowrap pb-1 text-ink-2" style={{ left: `${GATE * 100}%` }}>
            {scene.gate}
          </span>

          <Packet attr="a" top="30%" label={scene.first.label} />
          <Packet attr="b" top="66%" label={scene.second.label} crowd={crowd} />

          <span
            data-out-a
            className={`t-mono absolute right-0 top-[30%] -translate-y-[calc(100%+12px)] rounded-[3px] px-1.5 py-0.5 ${
              scene.first.passes ? 'bg-signal text-on-signal' : 'border border-ink-3 text-ink-2'
            }`}
          >
            {scene.first.outcome}
          </span>
          <span
            data-out-b
            className="t-mono absolute top-[calc(66%+14px)] max-w-[44%] text-ink-2"
            style={{ left: `calc(${GATE * 100}% + 18px)` }}
          >
            {scene.second.outcome}
          </span>
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

const Packet: React.FC<{ attr: 'a' | 'b'; top: string; label: string; crowd?: boolean }> = ({ attr, top, label, crowd }) => (
  <span data-packet={attr} className="absolute left-0 block -translate-y-1/2" style={{ top }}>
    {crowd && (
      <>
        <span className="absolute inset-0 translate-x-[-10px] rounded-full border border-ink-3/50" />
        <span className="absolute inset-0 translate-x-[-5px] rounded-full border border-ink-3/70 bg-bg" />
      </>
    )}
    <span data-pill className="t-mono relative block whitespace-nowrap rounded-full border border-ink bg-bg px-2.5 py-1 text-ink">
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
  const passes = scene.hasAttribute('data-passes');
  const stop = (el: HTMLElement) => () => wire.offsetWidth * GATE - el.offsetWidth - 14;
  const end = (el: HTMLElement) => () => wire.offsetWidth - el.offsetWidth;

  const tl = gsap.timeline({ defaults: { ease: 'none' } });
  tl.fromTo(q('[data-s-in]'), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.16, stagger: 0.05, ease: EASE.out }, 0)
    .fromTo(q('[data-lane]'), { scaleX: 0 }, { scaleX: 1, duration: 0.2, stagger: 0.04, ease: 'power2.out' }, 0.04)
    .fromTo(q('[data-gate], [data-gate-label]'), { autoAlpha: 0, scaleY: 0.3 }, { autoAlpha: 1, scaleY: 1, duration: 0.1, ease: 'back.out(2)' }, 0.14)
    // The first copy.
    .fromTo(a, { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.04 }, 0.18)
    .to(a, { x: stop(a), duration: 0.18, ease: 'power1.in' }, 0.2)
    .to(flash, { opacity: 0.9, duration: 0.02 }, 0.38)
    .to(flash, { opacity: 0, duration: 0.06 }, 0.4);
  if (passes) {
    tl.set(flash, { backgroundColor: 'var(--signal)' }, 0)
      .to(a, { x: end(a), duration: 0.14, ease: 'power2.out' }, 0.38)
      .to(pillA, { backgroundColor: 'var(--signal)', color: 'var(--on-signal)', borderColor: 'var(--signal)', duration: 0.04 }, 0.4);
  } else {
    tl.to(a, { keyframes: { x: ['+=6', '-=10', '+=4'] }, duration: 0.05 }, 0.38).to(
      pillA,
      { color: 'var(--ink-3)', borderColor: 'var(--ink-3)', borderStyle: 'dashed', duration: 0.03 },
      0.4,
    );
  }
  tl.fromTo(q('[data-out-a]'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.06, ease: 'back.out(2)' }, 0.5)
    // The second copy: same wire, same guard, a different answer.
    .fromTo(b, { x: -12, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.04 }, 0.44)
    .to(b, { x: stop(b), duration: 0.18, ease: 'power1.in' }, 0.46)
    .set(flash, { backgroundColor: 'var(--ink)' }, 0.63)
    .to(flash, { opacity: 0.9, duration: 0.02 }, 0.64)
    .to(flash, { opacity: 0, duration: 0.06 }, 0.66)
    .to(b, { keyframes: { x: ['+=7', '-=12', '+=5'] }, duration: 0.05 }, 0.64)
    .to(pillB, { color: 'var(--ink-3)', borderColor: 'var(--ink-3)', borderStyle: 'dashed', duration: 0.03 }, 0.66)
    .fromTo(q('[data-out-b]'), { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.06, ease: EASE.out }, 0.7)
    .fromTo(q('[data-s-law]'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.1, ease: EASE.out }, 0.76)
    .to({}, { duration: 0.14 }, 0.86);
  return tl;
}
