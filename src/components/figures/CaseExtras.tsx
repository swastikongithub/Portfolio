import React from 'react';
import type { ProjectSlug } from '../../types/portfolio';

/* Project-specific detail blocks for the case-study pages. Facts as in each repository. */

const OUTCOMES: { status: string; when: string; stored: boolean }[] = [
  { status: 'affected', when: 'The installed version is inside a published range, or in the explicit version list.', stored: true },
  { status: 'unknown_version', when: 'The package matches, but the component has no recorded version.', stored: true },
  { status: 'undetermined', when: 'A version will not parse, the scheme has no order, or only GIT ranges exist.', stored: true },
  { status: 'not_affected', when: 'Every applicable range was evaluated and excluded it.', stored: false },
];

const FLOWS: [row: string, billing: string, properties: string][] = [
  ['Who pays whom', 'Owner → Tenora', 'Resident → owner'],
  ['What', 'SaaS subscription', 'Monthly property bills'],
  ['Provider product', 'Cashfree Subscriptions', 'Cashfree Payment Gateway'],
  ['Webhook route', '/api/webhooks/cashfree/subscriptions/', '/api/webhooks/cashfree/property-payments/'],
];

const PIPELINE: [stage: string, detail: string][] = [
  ['Upload', 'PDF only, 5 MB limit, candidate role required.'],
  ['Hash', 'SHA-256 of the file. An unchanged file returns the existing report, with no AI call.'],
  ['Enqueue', 'BullMQ job id resume-{user}-{hash}, so a re-upload never runs twice.'],
  ['Extract', 'pdf-parse, then Gemini with a response schema.'],
  ['Validate', 'Zod safeParse on the model output. AI output is untrusted input.'],
  ['Persist', 'Profile complete, or "failed" with every manual field untouched.'],
];

const LEDGER: [kind: string, writtenBy: string, released: string][] = [
  ['booking', 'create_booking', 'the booking leaves a holding status'],
  ['class', 'timetable.publish (every remaining occurrence this term)', 'the next timetable version supersedes it, in the same transaction'],
  ['maintenance', 'maintenance.schedule', 'the window is cancelled or completed early'],
];

export const CaseExtras: React.FC<{ slug: ProjectSlug }> = ({ slug }) => {
  if (slug === 'lpu-reserve') {
    return (
      <div className="overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[520px] border-collapse text-left">
          <caption className="t-small mb-3 text-left text-ink-2">Every claim on a resource&rsquo;s time is a row in one ledger, BookingSlot.</caption>
          <thead>
            <tr className="border-b border-line-2">
              {['kind', 'written by', 'released when'].map((h) => (
                <th key={h} scope="col" className="t-mono py-2 pr-4 font-[400] text-ink-2">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEDGER.map(([k, w, r]) => (
              <tr key={k} className="border-b border-line">
                <td className="t-mono py-2.5 pr-4 text-ink">{k}</td>
                <td className="t-mono py-2.5 pr-4">{w}</td>
                <td className="t-small py-2.5 text-ink-2">{r}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (slug === 'vulntrack') {
    return (
      <ul className="grid gap-2 sm:grid-cols-2">
        {OUTCOMES.map((o) => (
          <li key={o.status} className={`rounded-[var(--r-md)] border p-4 ${o.stored ? 'border-line bg-bg-2' : 'border-dashed border-line-2'}`}>
            <code className={`t-mono ${o.status === 'affected' ? 'rounded-[2px] bg-signal px-1 text-on-signal' : ''}`}>{o.status}</code>
            <p className="t-small mt-2 text-ink-2">{o.when}</p>
            {!o.stored && <p className="t-mono mt-2 text-ink-2">derived, never stored</p>}
          </li>
        ))}
      </ul>
    );
  }
  if (slug === 'tenora') {
    return (
      <div className="grid grid-cols-2 gap-2" role="table" aria-label="Tenora's two money flows compared">
        <div role="row" className="contents">
          {(['apps.billing', 'apps.properties'] as const).map((h) => (
            <div key={h} role="columnheader" className="t-mono rounded-t-[var(--r-md)] bg-signal px-4 py-3 text-on-signal">
              {h}
            </div>
          ))}
        </div>
        {FLOWS.map(([row, a, b]) => (
          <div key={row} role="row" className="contents">
            {[a, b].map((v, i) => (
              <div key={i} role="cell" className="bg-bg-2 px-4 py-3">
                <span className="t-mono block text-ink-2">{row}</span>
                <span className={`mt-1 block break-words ${row === 'Webhook route' ? 't-mono' : 'font-[550]'}`}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-1 border-t border-line-2 sm:grid-cols-2 lg:grid-cols-3">
      {PIPELINE.map(([stage, detail], i) => (
        <li key={stage} className="border-b border-line py-5 pr-5">
          <span className="t-mono text-ink-2">{String(i + 1).padStart(2, '0')}</span>
          <p className="mt-2 text-[1.2rem] font-[700]">{stage}</p>
          <p className="t-small mt-2 text-ink-2">{detail}</p>
        </li>
      ))}
    </ol>
  );
};

