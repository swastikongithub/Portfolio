import React, { useRef, useState } from 'react';
import { ScrollTrigger, useGSAP } from '../../lib/motion';

/*
 * LPU Reserve's shared ledger, told in five steps. States, statuses and the
 * order of operations come from apps/bookings (models.py TRANSITIONS, services.py
 * create_booking) and apps/checkins (sweep_no_shows). The day itself is
 * illustrative: one resource, one Monday.
 */

const DAY_START = 8;
const DAY_END = 20;
const HOURS = DAY_END - DAY_START;
const pct = (h: number) => `${((h - DAY_START) / HOURS) * 100}%`;
const span = (a: number, b: number) => `${((b - a) / HOURS) * 100}%`;
const hh = (h: number) => `${String(h).padStart(2, '0')}:00`;

interface Step {
  title: string;
  body: string;
  /** What the system printed at this step. */
  log: string;
  chip: string;
}

const STEPS: Step[] = [
  {
    title: 'One ledger',
    body: 'Classes from the timetable, maintenance windows and bookings are all rows in one table, BookingSlot. Separate tables cannot share a constraint, so everything that takes the room\'s time goes here.',
    log: 'EXCLUDE USING gist (resource_id WITH =, period WITH &&)',
    chip: '3 claims',
  },
  {
    title: 'Refused, with a reason',
    body: 'Ask for 10:00 and the friendly pre-check explains why not: a timetabled class runs 09:00 to 11:00. That message is a courtesy. If two requests slip past it at once, the constraint still says no.',
    log: 'A timetabled class runs 09:00 to 11:00.',
    chip: 'refused',
  },
  {
    title: 'Claimed in one savepoint',
    body: '13:00 is free. The Booking row and its ledger row are inserted together; if either constraint fires, both roll back. When the resource\'s workflow needs an approver, the booking waits as pending.',
    log: 'INSERT booking, booking_slot   ok',
    chip: 'pending',
  },
  {
    title: 'Approved, then a QR scan',
    body: 'The approval chain is data, picked by resource, role, attendees and duration. Check-in opens shortly before the start and closes after a grace period; scanning the pass or the door QR moves the booking to In use.',
    log: 'pending → approved   check-in window open',
    chip: 'confirmed',
  },
  {
    title: 'Released for someone else',
    body: 'Nobody scans. The no-show sweep marks the booking, deletes its ledger row, and the hour is free again. Repeat no-shows climb a restriction ladder that someone other than the custodian has to lift.',
    log: 'sweep_no_shows: approved → no_show, slot row deleted',
    chip: 'released',
  },
];

type Kind = 'class' | 'booking' | 'maintenance' | 'yours';

const BASE: { kind: Kind; from: number; to: number; label: string }[] = [
  { kind: 'class', from: 9, to: 11, label: 'Class' },
  { kind: 'booking', from: 12, to: 13, label: 'Booked' },
  { kind: 'maintenance', from: 15, to: 16, label: 'Maintenance' },
];

const blockClass: Record<Kind, string> = {
  class: 'hatch bg-sunk text-ink',
  booking: 'bg-ink-3/45 text-ink',
  maintenance: 'stripes bg-sunk text-ink',
  yours: 'bg-signal text-on-signal',
};

const Strip: React.FC<{ step: number }> = ({ step }) => {
  const claimed = step >= 2 && step < 4;
  const pending = step === 2;
  const released = step >= 4;

  return (
    <div className="panel p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="font-[650]">
          Computer lab <span className="font-[450] text-ink-2">Monday</span>
        </p>
        <span
          className={`chip transition-colors duration-300 ${
            step >= 2 && step < 4 ? '!border-signal bg-signal !text-on-signal' : ''
          }`}
          aria-hidden="true"
        >
          {STEPS[step].chip}
        </span>
      </div>

      {/* Hour scale */}
      <div className="relative mt-5 h-5" aria-hidden="true">
        {Array.from({ length: HOURS + 1 }, (_, i) => DAY_START + i).map((h) => (
          <span
            key={h}
            className={`t-mono absolute -translate-x-1/2 text-ink-2 ${h % 2 ? 'max-sm:hidden' : ''}`}
            style={{ left: pct(h) }}
          >
            {String(h).padStart(2, '0')}
          </span>
        ))}
      </div>

      {/* The day */}
      <div className="relative mt-1 h-[86px] rounded-[var(--r-sm)] border border-line bg-bg sm:h-[104px]" aria-hidden="true">
        {Array.from({ length: HOURS - 1 }, (_, i) => DAY_START + 1 + i).map((h) => (
          <span key={h} className="absolute inset-y-0 w-px bg-line" style={{ left: pct(h) }} />
        ))}

        {BASE.map((b) => (
          <div
            key={b.kind}
            className={`absolute inset-y-2 flex items-end overflow-hidden rounded-[var(--r-xs)] p-1.5 ${blockClass[b.kind]}`}
            style={{ left: pct(b.from), width: span(b.from, b.to) }}
          >
            <span className="t-mono truncate !text-[0.62rem] sm:!text-[0.7rem] rounded-[2px] bg-bg/80 px-1 text-ink">{b.label}</span>
          </div>
        ))}

        {/* The refused request: arrives at 10:00, bounces off the class. */}
        <div
          className={`absolute inset-y-4 rounded-[var(--r-xs)] border-2 border-dashed border-ink transition-[opacity,transform] duration-500 ease-[var(--ease-out)] ${
            step === 1 ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
          }`}
          style={{ left: pct(10), width: span(10, 11) }}
        />

        {/* Yours: 13:00 to 14:00. */}
        <div
          className={`absolute inset-y-2 flex items-end overflow-hidden rounded-[var(--r-xs)] p-1.5 transition-[opacity,transform,background-color] duration-500 ease-[var(--ease-out)] ${
            claimed ? 'opacity-100 translate-y-0' : released ? 'opacity-0 translate-y-0' : 'opacity-0 -translate-y-4'
          } ${pending ? 'border-2 border-signal bg-signal/30 hatch' : 'bg-signal'}`}
          style={{ left: pct(13), width: span(13, 14) }}
        >
          <span className="t-mono truncate !text-[0.62rem] sm:!text-[0.7rem] rounded-[2px] bg-bg/85 px-1 text-ink">Yours</span>
        </div>

        {/* Released: the hour is outlined, free again. */}
        <div
          className={`absolute inset-y-2 rounded-[var(--r-xs)] border border-dashed border-ink-3 transition-opacity duration-500 ${
            released ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ left: pct(13), width: span(13, 14) }}
        />

        {/* Check-in window: opens before the start, closes after the grace period. */}
        <div
          className={`absolute -bottom-3 h-2 border-x-2 border-b-2 border-ink transition-opacity duration-300 ${
            step === 3 ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ left: pct(12.75), width: span(12.75, 13.25) }}
        />
      </div>

      {/* The ledger rows themselves. */}
      <div className="mt-6 overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[300px] border-collapse text-left">
          <caption className="sr-only">BookingSlot ledger rows for this resource at the current step</caption>
          <thead>
            <tr className="border-b border-line-2">
              <th scope="col" className="t-mono py-1.5 pr-3 font-[400] text-ink-2">kind</th>
              <th scope="col" className="t-mono py-1.5 pr-3 font-[400] text-ink-2">period</th>
              <th scope="col" className="t-mono py-1.5 font-[400] text-ink-2">written by</th>
            </tr>
          </thead>
          <tbody>
            {[
              { kind: 'class', from: 9, to: 11, by: 'timetable.publish', show: true },
              { kind: 'booking', from: 12, to: 13, by: 'create_booking', show: true },
              { kind: 'booking', from: 13, to: 14, by: 'create_booking (yours)', show: claimed },
              { kind: 'maintenance', from: 15, to: 16, by: 'maintenance.schedule', show: true },
            ].map((r) => (
              <tr
                key={`${r.kind}-${r.from}`}
                className={`border-b border-line transition-[opacity,background-color] duration-500 ${
                  r.show ? 'opacity-100' : 'opacity-25'
                } ${r.by.includes('yours') && r.show ? 'bg-signal/25' : ''}`}
              >
                <td className="t-mono py-1.5 pr-3">{r.kind}</td>
                <td className="t-mono py-1.5 pr-3 whitespace-nowrap">
                  [{hh(r.from)}, {hh(r.to)})
                </td>
                <td className="t-mono py-1.5 text-ink-2">
                  {r.by.includes('yours') && !r.show ? (step >= 4 ? 'deleted by the sweep' : 'not yet') : r.by}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="t-mono mt-4 min-h-[3.2em] break-words text-ink" aria-hidden="true">
        <span className="text-ink-2">&gt; </span>
        {STEPS[step].log}
      </p>
    </div>
  );
};

/**
 * Scrollytelling without scroll-jacking: the strip is sticky, the five captions
 * scroll past it normally, and whichever caption is in the middle of the
 * viewport sets the strip's state. Works the same on touch, keyboard and with
 * reduced motion (the state still changes; only the easing disappears).
 */
export const LedgerFigure: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const items = root.current?.querySelectorAll<HTMLElement>('[data-ledger-step]');
      const triggers = Array.from(items ?? []).map((el, i) =>
        ScrollTrigger.create({
          trigger: el,
          start: 'top 62%',
          end: 'bottom 62%',
          onToggle: (self) => self.isActive && setStep(i),
        }),
      );
      return () => triggers.forEach((t) => t.kill());
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid-12 gap-y-6">
      <div className="col-span-4 md:col-span-12 lg:col-span-7 lg:col-start-6 lg:row-start-1">
        <div className="sticky top-[calc(var(--header-h)+12px)] z-10">
          <Strip step={step} />
        </div>
      </div>
      <ol className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-1 lg:row-start-1">
        {STEPS.map((s, i) => (
          <li
            key={s.title}
            data-ledger-step
            className={`flex min-h-[46svh] flex-col justify-center py-8 transition-opacity duration-500 lg:min-h-[64svh] ${
              i === step ? 'opacity-100' : 'opacity-40'
            }`}
            aria-current={i === step ? 'step' : undefined}
          >
            <h4 className="t-h3">{s.title}</h4>
            <p className="t-body mt-3 max-w-[42ch] text-ink-2">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};
