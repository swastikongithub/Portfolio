import React, { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/motion';
import { SceneBox } from './SceneBox';

/*
 * AI Interview Platform: one résumé through the pipeline, scrubbed by scroll.
 * Stages follow routes/resume.routes.ts, services/resumeQueue.service.ts and
 * services/gemini.service.ts. Field names are the real response-schema keys;
 * values are elided on purpose.
 */

const STATIONS = [
  { x: 90, name: 'Upload', detail: 'application/pdf, under 5 MB, candidate role' },
  { x: 285, name: 'Hash', detail: 'SHA-256 of the file; seen before means no AI call' },
  { x: 480, name: 'Enqueue', detail: 'BullMQ, two jobs at a time' },
  { x: 675, name: 'Extract', detail: 'pdf-parse, then Gemini with a response schema' },
  { x: 870, name: 'Validate', detail: 'Zod safeParse: AI output is untrusted input' },
  { x: 1065, name: 'Persist', detail: 'profile complete, or failed with manual fields kept' },
];

const PROFILE_KEYS = ['name', 'education', 'experience', 'skills'];
const ATS_KEYS = ['score', 'missing_keywords', 'grammar_notes', 'improvement_suggestions'];
const LANE_Y = 470;

export const ResumeScene: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const card = q('[data-card]')[0];
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
          pin: true,
          scrub: 0.6,
        },
      });

      const at = (i: number) => i * 1;
      const goto = (i: number, t: number) => tl.to(card, { x: STATIONS[i].x - 60, duration: 0.45, ease: 'power3.inOut' }, t);
      const light = (i: number, t: number) =>
        tl.to(q(`[data-station="${i}"]`), { borderColor: 'var(--signal)', color: 'var(--signal-text)', duration: 0.1 }, t).fromTo(
          q(`[data-detail="${i}"]`),
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.2 },
          t,
        );

      // Upload: the card drops onto the lane; the checks tick.
      tl.fromTo(card, { x: STATIONS[0].x - 60, y: -260, rotate: -8, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 0.45, ease: 'bounce.out' }, 0);
      light(0, 0.3);
      tl.fromTo(q('[data-check]'), { scale: 0 }, { scale: 1, duration: 0.15, stagger: 0.08, ease: 'back.out(3)' }, 0.45);
      tl.fromTo(q('[data-track-fill]'), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0% 50%', duration: 5.6 }, 0.4);

      // Hash: the digest scrambles out of the file.
      goto(1, at(1));
      light(1, at(1) + 0.35);
      tl.to(q('[data-hash]'), { scrambleText: { text: 'sha256(file) = 9f2c…e41a', chars: '0123456789abcdef', speed: 0.7 }, duration: 0.5 }, at(1) + 0.4);

      // Enqueue: the job id is derived, not random; two worker slots.
      goto(2, at(2));
      light(2, at(2) + 0.35);
      tl.to(q('[data-jobid]'), { text: { value: 'jobId = resume-{user}-{hash}' }, duration: 0.45 }, at(2) + 0.4)
        .fromTo(q('[data-slot]'), { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', duration: 0.2, stagger: 0.1 }, at(2) + 0.45)
        .fromTo(q('[data-dupe]'), { x: -140, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.25 }, at(2) + 0.6)
        .to(q('[data-dupe]'), { x: 40, y: 80, rotate: 20, autoAlpha: 0, duration: 0.3 }, at(2) + 0.88);

      // Extract: the card's lines lift off as text; Gemini answers in the schema's shape.
      goto(3, at(3));
      light(3, at(3) + 0.35);
      tl.to(q('[data-line]'), { y: -150, x: (i) => 40 + i * 12, autoAlpha: 0, duration: 0.4, stagger: 0.04, ease: 'power2.in' }, at(3) + 0.35);
      tl.fromTo(q('[data-json-row]'), { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.12, stagger: 0.07 }, at(3) + 0.55);

      // Validate: Zod ticks every key.
      goto(4, at(4));
      light(4, at(4) + 0.35);
      tl.fromTo(q('[data-tick]'), { scale: 0 }, { scale: 1, duration: 0.1, stagger: 0.05, ease: 'back.out(3)' }, at(4) + 0.4);

      // Persist: the card files itself into the table.
      goto(5, at(5));
      light(5, at(5) + 0.35);
      tl.to(card, { y: 250, scale: 0.5, duration: 0.35, ease: 'power2.in' }, at(5) + 0.45)
        .fromTo(q('[data-db]'), { scale: 1 }, { scale: 1.08, duration: 0.08, yoyo: true, repeat: 1 }, at(5) + 0.78)
        .fromTo(q('[data-status]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.15 }, at(5) + 0.8)
        .to({}, { duration: 0.5 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-[100svh] w-full overflow-hidden">
      <SceneBox>
        <p className="t-mono absolute left-0 top-0 text-ink-2">POST /api/v1/resume   the request returns before the AI runs</p>

        {/* The lane and stations */}
        <div className="absolute h-[2px] rounded bg-line-2" style={{ left: 30, top: LANE_Y, width: 1140 }} />
        <div data-track-fill className="absolute h-[2px] rounded bg-signal" style={{ left: 30, top: LANE_Y, width: 1140 }} />
        {STATIONS.map((s, i) => (
          <div key={s.name} className="absolute w-[180px] -translate-x-1/2 text-center" style={{ left: s.x, top: LANE_Y + 18 }}>
            <span data-station={i} className="t-mono inline-block rounded-full border border-line-2 bg-bg px-3 py-1 !text-[0.8rem] text-ink">
              {String(i + 1).padStart(2, '0')} {s.name}
            </span>
            <p data-detail={i} className="t-mono invisible mt-2 !text-[0.7rem] leading-snug text-ink-2">
              {s.detail}
            </p>
          </div>
        ))}

        {/* Upload checks */}
        <div className="absolute flex w-[170px] flex-wrap gap-1.5" style={{ left: 10, top: 170 }}>
          {['pdf', '< 5 MB', 'candidate'].map((c) => (
            <span key={c} data-check className="t-mono rounded-full bg-signal px-2 py-0.5 !text-[0.72rem] text-on-signal">
              {c}
            </span>
          ))}
        </div>

        {/* Hash and job id */}
        <p data-hash className="t-mono-lg absolute w-[190px] text-[0.9rem] leading-snug text-ink" style={{ left: 195, top: 160 }}>
          ················
        </p>
        <p data-jobid className="t-mono-lg absolute w-[200px] text-[0.9rem] leading-snug text-signal-text" style={{ left: 390, top: 120 }} />
        <div className="absolute flex gap-2" style={{ left: 410, top: 200 }}>
          {[0, 1].map((i) => (
            <span key={i} data-slot className="block h-14 w-10 rounded-[var(--r-xs)] border border-line-2 bg-bg-2" />
          ))}
          <span className="t-mono self-end !text-[0.7rem] text-ink-2">concurrency: 2</span>
        </div>
        <div data-dupe className="t-mono invisible absolute rounded-[var(--r-xs)] border border-dashed border-ink px-2 py-1 !text-[0.72rem] text-ink-2" style={{ left: 300, top: 60 }}>
          same file again: existing report, no AI call
        </div>

        {/* Gemini's answer, as the schema shapes it */}
        <div className="absolute rounded-[var(--r-md)] border border-line-2 bg-bg-2 p-4" style={{ left: 640, top: 40, width: 540 }}>
          <p className="t-mono text-ink-2">responseMimeType: application/json, responseSchema</p>
          <div className="mt-3 grid grid-cols-2 gap-x-6">
            {[PROFILE_KEYS, ATS_KEYS].map((keys, col) => (
              <div key={col}>
                <p className="t-mono !text-[0.7rem] text-ink-2">{col === 0 ? 'profile' : 'ats report'}</p>
                {keys.map((k) => (
                  <p key={k} data-json-row className="t-mono mt-1 flex items-center justify-between gap-2 !text-[0.78rem]">
                    <span>
                      &quot;{k}&quot;: <span className="text-ink-2">…</span>
                    </span>
                    <span data-tick className="grid h-4 w-4 place-items-center rounded-full bg-signal !text-[0.6rem] text-on-signal">
                      ✓
                    </span>
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* The résumé */}
        <div data-card className="invisible absolute left-0 rounded-[var(--r-sm)] border border-line-2 bg-bg p-3 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.6)]" style={{ top: LANE_Y - 165, width: 120, height: 150 }}>
          <div className="h-2 w-16 rounded bg-ink" />
          {[90, 70, 84, 60, 78, 50, 66].map((w, i) => (
            <div key={i} data-line className="mt-2 h-1.5 rounded bg-ink-3" style={{ width: `${w}%` }} />
          ))}
          <span className="t-mono absolute bottom-2 right-2 !text-[0.6rem] text-ink-2">.pdf</span>
        </div>

        {/* The table */}
        <div data-db className="absolute grid place-items-center rounded-[50%/18%] border-2 border-line-2 bg-bg-2" style={{ left: 1000, top: 580, width: 130, height: 110 }}>
          <span className="t-mono !text-[0.75rem]">profiles</span>
        </div>
        <span data-status className="t-mono invisible absolute rounded-full bg-signal px-2 py-0.5 !text-[0.72rem] text-on-signal" style={{ left: 840, top: 640 }}>
          status: complete
        </span>
      </SceneBox>
    </div>
  );
};
