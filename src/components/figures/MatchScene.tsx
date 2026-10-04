import React, { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/motion';
import { SceneBox } from './SceneBox';

/*
 * VulnTrack, from messy inventory to explainable matches, scrubbed by scroll.
 *   1. Inventory names are normalized into canonical keys (the examples are the
 *      ones in docs/matching/matching.md).
 *   2. Advisories arrive from NVD and OSV through adapters, validated twice; a
 *      hostile record is rejected and skipped.
 *   3. Matching is an indexed equality join on the key, then a per-ecosystem
 *      version comparison. Results land in one of four outcomes; not_affected is
 *      derived and never stored.
 * Advisories carry the same canonical keys, so each one joins exactly one row.
 * Which outcome each lands in is illustrative.
 */

const INVENTORY: [raw: string, key: string][] = [
  ['Express', 'npm:express'],
  ['Django_REST.framework', 'pypi:django-rest-framework'],
  ['Serde_JSON', 'cargo:serde-json'],
  ['nginx (no registry)', 'generic: CPE nginx'],
];

const ADVISORIES: { src: 'NVD' | 'OSV'; row: number; bin: number }[] = [
  { src: 'OSV', row: 0, bin: 0 },
  { src: 'OSV', row: 1, bin: 3 },
  { src: 'OSV', row: 2, bin: 1 },
  { src: 'NVD', row: 3, bin: 2 },
  { src: 'OSV', row: 0, bin: 3 },
  { src: 'OSV', row: 1, bin: 0 },
];

const BINS = [
  { key: 'affected', note: 'inside a published range', stored: true },
  { key: 'unknown_version', note: 'package matches, no version recorded', stored: true },
  { key: 'undetermined', note: 'unparseable, unordered or GIT-only', stored: true },
  { key: 'not_affected', note: 'derived, never stored', stored: false },
];

const ROW_Y = (i: number) => 150 + i * 92;
const BIN_X = (i: number) => 820 + i * 95;

export const MatchScene: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 3)}`,
          pin: true,
          scrub: 0.6,
        },
      });

      // 1. Normalize: raw names scramble into canonical keys.
      tl.fromTo(q('[data-inv]'), { x: -60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, stagger: 0.12, ease: 'power3.out' }, 0);
      q('[data-inv-text]').forEach((node, i) => {
        tl.to(node, { duration: 0.5, scrambleText: { text: INVENTORY[i][1], chars: 'abcdefghijklmnopqrstuvwxyz:-_.', speed: 0.6 } }, 0.7 + i * 0.18);
        tl.to(q(`[data-inv="${i}"]`), { borderColor: 'var(--signal)', duration: 0.1 }, 1.1 + i * 0.18);
      });
      tl.fromTo(q('[data-normalize]'), { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 0%', duration: 0.5, ease: 'power2.out' }, 0.5);

      // 2. Advisories stream in through the adapters; a hostile record bounces.
      tl.fromTo(q('[data-src]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.1 }, 1.6);
      tl.fromTo(q('[data-hostile]'), { x: 0, y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 1.9)
        .to(q('[data-hostile]'), { x: 150, duration: 0.3, ease: 'power2.in' }, 1.95)
        .to(q('[data-hostile]'), { x: 60, y: 200, rotate: 40, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 2.25)
        .fromTo(q('[data-hostile-note]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 2.25)
        .to(q('[data-hostile-note]'), { autoAlpha: 0, duration: 0.15 }, 2.9);

      // 3. Join on the key, draw the link, then sort into an outcome.
      ADVISORIES.forEach((a, i) => {
        const p = q(`[data-adv="${i}"]`)[0];
        const link = q(`[data-link="${i}"]`)[0];
        const t0 = 2.1 + i * 0.42;
        const fromY = a.src === 'NVD' ? 40 : 640;
        tl.fromTo(p, { x: 540, y: fromY, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, t0)
          .to(p, { x: 420, y: ROW_Y(a.row) - 14, duration: 0.4, ease: 'power3.inOut' }, t0 + 0.02)
          .fromTo(link, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.18 }, t0 + 0.38)
          .to(p, { x: BIN_X(a.bin) - 70, y: 520 - (i % 2) * 40, scale: 0.7, duration: 0.35, ease: 'power2.in' }, t0 + 0.6)
          .to(p, { autoAlpha: 0, duration: 0.05 }, t0 + 0.95)
          .to(link, { autoAlpha: 0.25, duration: 0.1 }, t0 + 0.95)
          .fromTo(q(`[data-token="${i}"]`), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.12, ease: 'back.out(3)' }, t0 + 0.95);
      });

      // The comparator: why versions are never compared as strings.
      tl.fromTo(q('[data-cmp]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.15 }, 4.6)
        .to(q('[data-cmp-wrong]'), { scrambleText: { text: '1.9.0 > 1.10.0   string order, wrong', chars: '0123456789.<>' }, duration: 0.4 }, 4.8)
        .to(q('[data-cmp-right]'), { scrambleText: { text: '1.9.0 < 1.10.0   SemVer order, right', chars: '0123456789.<>' }, duration: 0.4 }, 5.0)
        .to({}, { duration: 0.6 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-[100svh] w-full overflow-hidden">
      <SceneBox>
        <p className="t-mono absolute left-0 top-0 text-ink-2">inventory</p>
        <p className="t-mono absolute top-0 text-ink-2" style={{ left: 560 }}>
          public advisories
        </p>
        <p className="t-mono absolute top-0 text-ink-2" style={{ left: 820 }}>
          matches, per organization
        </p>

        {/* Inventory, normalized */}
        {INVENTORY.map(([raw], i) => (
          <div
            key={raw}
            data-inv={i}
            className="absolute flex h-[60px] w-[330px] items-center rounded-[var(--r-sm)] border border-line-2 bg-bg-2 px-4"
            style={{ left: 0, top: ROW_Y(i) - 30 }}
          >
            <span data-inv-text className="t-mono-lg text-[1.05rem]">
              {raw}
            </span>
          </div>
        ))}
        <div data-normalize className="absolute w-[3px] rounded bg-signal" style={{ left: 350, top: 110, height: 330 }} />
        <p className="t-mono absolute w-[300px] text-signal-text" style={{ left: 0, top: 470 }}>
          one normalizer for both sides: matching is an equality join
        </p>

        {/* Sources */}
        <div data-src className="t-mono absolute rounded-full border border-line-2 px-3 py-1" style={{ left: 560, top: 40 }}>
          NVD CVE API 2.0
        </div>
        <div data-src className="t-mono absolute rounded-full border border-line-2 px-3 py-1" style={{ left: 560, top: 640 }}>
          OSV
        </div>
        <div data-hostile className="t-mono invisible absolute rounded-[3px] border border-dashed border-ink px-2 py-1 text-ink-2" style={{ left: 560, top: 360 }}>
          {'malformed record'}
        </div>
        <p data-hostile-note className="t-mono invisible absolute w-[260px] text-ink" style={{ left: 600, top: 420 }}>
          fails validation: counted invalid, noted, skipped; the run continues
        </p>

        {/* Links (drawn on join) */}
        <svg className="pointer-events-none absolute left-0 top-0" width={1200} height={720} aria-hidden="true">
          {ADVISORIES.map((a, i) => (
            <path
              key={i}
              data-link={i}
              d={`M330 ${ROW_Y(a.row)} C380 ${ROW_Y(a.row)} 380 ${ROW_Y(a.row)} 420 ${ROW_Y(a.row)}`}
              pathLength={1}
              strokeDasharray="1"
              stroke="var(--signal)"
              strokeWidth={2.5}
              fill="none"
            />
          ))}
        </svg>

        {ADVISORIES.map((a, i) => (
          <div
            key={i}
            data-adv={i}
            className="t-mono invisible absolute left-0 top-0 flex h-[30px] items-center gap-2 rounded-full border border-line-2 bg-bg px-3 !text-[0.75rem]"
          >
            <span className="text-ink-2">{a.src}</span>
            <span>{INVENTORY[a.row][1]}</span>
          </div>
        ))}

        {/* Outcomes */}
        {BINS.map((b, i) => (
          <div
            key={b.key}
            className={`absolute flex h-[300px] w-[86px] flex-col justify-end rounded-[var(--r-sm)] border p-2 ${b.stored ? 'border-line-2 bg-bg-2' : 'border-dashed border-line-2'}`}
            style={{ left: BIN_X(i) - 43, top: 160 }}
          >
            <div className="flex flex-col-reverse gap-1.5">
              {ADVISORIES.map((a, j) =>
                a.bin === i ? (
                  <span key={j} data-token={j} className={`invisible block h-5 rounded-[3px] ${i === 0 ? 'bg-signal' : i === 3 ? 'border border-dashed border-ink-3' : 'bg-ink-3'}`} />
                ) : null,
              )}
            </div>
          </div>
        ))}
        {BINS.map((b, i) => (
          <div key={b.key} className="absolute w-[92px]" style={{ left: BIN_X(i) - 46, top: 470 }}>
            <p className={`t-mono !text-[0.72rem] [overflow-wrap:anywhere] ${i === 0 ? 'text-signal-text' : 'text-ink'}`}>{b.key.replace('_', '_​')}</p>
            <p className="t-mono mt-1 !text-[0.66rem] leading-snug text-ink-2">{b.note}</p>
          </div>
        ))}

        {/* Comparator */}
        <div className="absolute grid grid-cols-2 gap-4" style={{ left: 0, top: 560, width: 780 }}>
          <div data-cmp className="rounded-[var(--r-md)] border border-dashed border-line-2 p-4">
            <p className="t-mono text-ink-2">"1.9.0" &gt; "1.10.0"</p>
            <p data-cmp-wrong className="t-mono-lg mt-1 text-[0.95rem]">
              1.9.0 &gt; 1.10.0   string order, wrong
            </p>
          </div>
          <div data-cmp className="rounded-[var(--r-md)] border border-signal p-4">
            <p className="t-mono text-ink-2">versionCompare.js, scheme: semver</p>
            <p data-cmp-right className="t-mono-lg mt-1 text-[0.95rem] text-signal-text">
              1.9.0 &lt; 1.10.0   SemVer order, right
            </p>
          </div>
        </div>
      </SceneBox>
    </div>
  );
};
