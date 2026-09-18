import React, { useRef } from 'react';
import type { ProjectFigure as FigureKind } from '../../types/portfolio';
import { EASE, MOTION_OK, gsap, useGSAP } from '../../lib/motion';

/*
 * Project "plates". Instead of mock screenshots, each case study shows a real
 * artifact of its implementation, typeset as a figure. Data is transcribed
 * from the project's source/docs; see each block's comment for provenance.
 */

// VulnTrack — server/src/config/roles.js via docs/organization/rbac.md (excerpt).
const ROLES: [full: string, short: string][] = [
  ['Owner', 'Own'],
  ['Admin', 'Adm'],
  ['Analyst', 'Ana'],
  ['Developer', 'Dev'],
  ['Viewer', 'View'],
];
const MATRIX: [permission: string, grants: boolean[]][] = [
  ['organization:update', [true, true, false, false, false]],
  ['members:read', [true, true, true, false, false]],
  ['members:invite', [true, true, false, false, false]],
  ['members:update_role', [true, true, false, false, false]],
  ['assets:read', [true, true, true, true, true]],
  ['assets:create', [true, true, true, false, false]],
  ['assets:update', [true, true, true, false, false]],
  ['assets:delete', [true, true, false, false, false]],
];

// Tenora — README, "Two financial domains that never mix".
const FLOWS: [row: string, billing: string, properties: string][] = [
  ['Module', 'apps.billing', 'apps.properties'],
  ['Who pays whom', 'Owner → Tenora', 'Resident → owner'],
  ['What', 'SaaS subscription', 'Monthly property bills'],
  ['Provider', 'Cashfree Subscriptions', 'Cashfree Payment Gateway'],
  ['Webhook', '/webhooks/cashfree/subscriptions/', '/webhooks/cashfree/property-payments/'],
];

// AI Interview Platform — routes/resume.routes.ts, services/resumeQueue.service.ts, gemini.service.ts.
const PIPELINE: [stage: string, detail: string][] = [
  ['Upload', 'PDF only, 5 MB limit, candidate role required'],
  ['Hash', 'SHA-256 of the file; unchanged file → existing report, no AI call'],
  ['Enqueue', 'BullMQ job id resume-{user}-{hash}'],
  ['Extract', 'pdf-parse, then Gemini with a response schema'],
  ['Validate', 'Zod safeParse on the model output'],
  ['Persist', 'Profile → complete, or failed with manual fields untouched'],
];

function MatrixFigure() {
  return (
    <div>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">VulnTrack permission matrix: which roles hold which permissions</caption>
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="t-label py-2 pr-2 font-normal text-muted w-[38%] sm:w-[34%]">Permission</th>
            {ROLES.map(([full, short]) => (
              <th key={full} scope="col" className="t-label py-2 px-0.5 font-normal text-center !tracking-normal sm:!tracking-[0.06em]">
                <span className="sm:hidden" aria-hidden="true">{short}</span>
                <span className="max-sm:sr-only">{full}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MATRIX.map(([perm, grants]) => (
            <tr key={perm} className="border-b border-rule">
              <th scope="row" className="font-mono text-[0.72rem] sm:text-[0.78rem] py-2.5 pr-2 font-normal break-words">
                {perm.split(':')[0]}:<wbr />
                {perm.split(':')[1]}
              </th>
              {grants.map((g, i) => (
                <td key={i} className="py-2.5 px-0.5 text-center">
                  <span
                    data-cell
                    className={`inline-block w-3.5 h-3.5 align-middle ${g ? 'bg-ink' : 'border border-rule'}`}
                    aria-hidden="true"
                  />
                  <span className="sr-only">{g ? 'granted' : 'not granted'}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="t-label text-muted mt-3 flex items-center gap-4">
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-ink" aria-hidden="true" /> granted</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 border border-rule" aria-hidden="true" /> default deny</span>
      </p>
    </div>
  );
}

function FlowsFigure() {
  return (
    <div>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Tenora's two money flows compared</caption>
        <thead>
          <tr className="border-b border-ink">
            <td />
            <th scope="col" className="t-label py-2 px-2 sm:px-3 font-normal">Tenora subscriptions</th>
            <th scope="col" className="t-label py-2 px-2 sm:px-3 font-normal border-l-2 border-accent" data-divider>
              Property payments
            </th>
          </tr>
        </thead>
        <tbody>
          {FLOWS.map(([row, a, b]) => (
            <tr key={row} className="border-b border-rule align-top" data-flow-row>
              <th scope="row" className="t-label py-3 pr-2 font-normal text-muted w-[24%] break-words">
                {row}
              </th>
              <td className={`py-3 px-2 sm:px-3 ${row === 'Webhook' || row === 'Module' ? 'font-mono text-[0.72rem] break-all' : 'text-[0.9rem] sm:text-[0.95rem]'}`}>{a}</td>
              <td className={`py-3 px-2 sm:px-3 border-l-2 border-accent ${row === 'Webhook' || row === 'Module' ? 'font-mono text-[0.72rem] break-all' : 'text-[0.9rem] sm:text-[0.95rem]'}`}>
                {b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="t-label text-muted mt-3">Neither module imports the other.</p>
    </div>
  );
}

function PipelineFigure() {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 border-t border-ink">
      {PIPELINE.map(([stage, detail], i) => (
        <li key={stage} className="relative border-b border-rule lg:border-b-0 lg:border-r last:border-r-0 py-4 pr-4 lg:pl-4 lg:first:pl-0" data-stage>
          <span className="absolute left-0 top-0 h-[2px] w-full origin-left bg-accent" data-stage-bar aria-hidden="true" />
          <span className="t-label text-accent-text">{String(i + 1).padStart(2, '0')}</span>
          <p className="t-head !text-[1.35rem] mt-2">{stage}</p>
          <p className="text-[0.9rem] leading-snug text-muted mt-2">{detail}</p>
        </li>
      ))}
    </ol>
  );
}

interface ProjectFigureProps {
  kind: FigureKind;
  number: string;
  caption: string;
  className?: string;
}

export const ProjectFigure: React.FC<ProjectFigureProps> = ({ kind, number, caption, className = '' }) => {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const st = { trigger: root.current, start: 'top 82%', once: true };
        if (kind === 'permission-matrix') {
          gsap.fromTo('[data-cell]', { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: { grid: 'auto', from: 'start', amount: 0.9 }, scrollTrigger: st });
        } else if (kind === 'money-flows') {
          gsap.fromTo('[data-flow-row]', { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE.out, stagger: 0.09, scrollTrigger: st });
        } else {
          gsap.fromTo('[data-stage-bar]', { scaleX: 0 }, { scaleX: 1, duration: 0.55, ease: EASE.press, stagger: 0.16, scrollTrigger: st });
        }
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <figure ref={root} className={className}>
      {kind === 'permission-matrix' && <MatrixFigure />}
      {kind === 'money-flows' && <FlowsFigure />}
      {kind === 'resume-pipeline' && <PipelineFigure />}
      <figcaption className="mt-4 flex gap-3 text-[0.85rem] leading-snug text-muted">
        <span className="t-label text-ink shrink-0">Fig. {number}</span>
        <span className="t-serif italic text-[1rem]">{caption}</span>
      </figcaption>
    </figure>
  );
};
