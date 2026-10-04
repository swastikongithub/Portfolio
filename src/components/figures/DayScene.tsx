import React, { useMemo, useRef } from 'react';
import { EASE, gsap, useGSAP } from '../../lib/motion';

/*
 * LPU Reserve, one day on the shared ledger, scrubbed by scroll.
 *
 * The section pins and the day (08:00 to 20:00) slides past a fixed playhead.
 * Whatever is under the playhead happens: a timetabled class lands, a request
 * for 10:00 is refused with the pre-check's sentence, a stampede for 13:00
 * produces one booking, the check-in window opens, nobody scans, the no-show
 * sweep releases the hour, maintenance takes 15:00. States and sentences follow
 * apps/bookings, apps/checkins and apps/maintenance; the day is illustrative.
 */

const START = 8;
const HOURS = 12;
const PLAYHEAD = 0.3; // fraction of the viewport width

type Beat = { at: number; title: string; body: string; log: string };

const BEATS: Beat[] = [
  { at: 8, title: 'One ledger', body: 'Classes, maintenance and bookings are all rows in BookingSlot. One exclusion constraint guards all three.', log: 'EXCLUDE USING gist (resource_id WITH =, period WITH &&)' },
  { at: 9, title: 'The timetable lands first', body: 'Publishing a timetable writes every class occurrence into the ledger as a hard claim. It is never offered as free.', log: 'timetable.publish  →  slot(kind=class, [09:00, 11:00))' },
  { at: 10, title: 'Refused, with a reason', body: 'Ask for 10:00 and the pre-check answers in a sentence. If two requests slip past it, the constraint still refuses.', log: 'A timetabled class runs 09:00 to 11:00.' },
  { at: 12.3, title: 'Everyone wants 13:00', body: 'A stampede for one free hour. Each claim inserts Booking and BookingSlot in one savepoint, queued per resource by an advisory lock.', log: 'pg_advisory_xact_lock(20020, resource_id)' },
  { at: 13, title: 'Exactly one booking', body: 'The first claim commits. Every other one fails with SQLSTATE 23P01 and becomes "slot unavailable".', log: '1 × INSERT ok   35 × 23P01 exclusion_violation' },
  { at: 13.4, title: 'Check in, or lose it', body: 'Check-in opens before the start and closes after the grace period. A QR scan moves the booking to In use. Nobody scans.', log: 'approved → no_show   slot row deleted' },
  { at: 14.4, title: 'The hour is free again', body: 'The sweep released it and recorded the no-show. Repeat no-shows climb a restriction ladder.', log: 'sweep_no_shows: 1 released' },
  { at: 15, title: 'Maintenance takes its window', body: 'Scheduling maintenance displaces bookings with a notice and alternatives, and refuses to overlap a class.', log: 'maintenance.schedule  →  slot(kind=maintenance, [15:00, 17:00))' },
  { at: 18, title: 'Same rules, every row', body: 'Nothing here is checked by hope. Correctness lives in the index, at insert time, for every transaction.', log: 'SELECT count(*) … overlapping = 0' },
];

const RACERS = 36;
const SHARDS = 48;

export const DayScene: React.FC = () => {
  const root = useRef<HTMLElement>(null);

  // Deterministic scatter for the stampede and the shards.
  const racers = useMemo(
    () =>
      Array.from({ length: RACERS }, (_, i) => {
        const a = Math.sin(i * 12.9898) * 43758.5453;
        const r = a - Math.floor(a);
        const b = Math.sin(i * 78.233) * 12345.678;
        const q = b - Math.floor(b);
        return { dx: -(8 + r * 26), dy: (q - 0.5) * 70, delay: r * 0.35 };
      }),
    [],
  );
  const shards = useMemo(
    () =>
      Array.from({ length: SHARDS }, (_, i) => {
        const a = Math.sin(i * 3.17) * 9871.33;
        const r = a - Math.floor(a);
        const b = Math.sin(i * 9.71) * 3412.11;
        const q = b - Math.floor(b);
        return { x: (r - 0.3) * 60, y: (q - 0.65) * 50, rot: (r - 0.5) * 540 };
      }),
    [],
  );

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const track = q('[data-track]')[0];
      const clock = q('[data-clock]')[0];
      const caption = q('[data-caption]')[0];
      const titleEl = q('[data-cap-title]')[0];
      const bodyEl = q('[data-cap-body]')[0];
      const logEl = q('[data-cap-log]')[0];
      let beat = -1;

      const setBeat = (i: number) => {
        if (i === beat || i < 0) return;
        beat = i;
        const b = BEATS[i];
        titleEl.textContent = b.title;
        bodyEl.textContent = b.body;
        logEl.textContent = b.log;
        gsap.fromTo(caption, { y: 14, autoAlpha: 0.2 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: EASE.out, overwrite: true });
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 4.2)}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
            const h = START + tl.progress() * HOURS;
            const hh = Math.floor(h);
            const mm = Math.floor((h - hh) * 60);
            clock.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
            let idx = 0;
            for (let i = 0; i < BEATS.length; i++) if (h >= BEATS[i].at - 0.15) idx = i;
            setBeat(idx);
        },
      });

      // The day slides left: one timeline unit per hour.
      tl.to(track, { x: () => -(track.scrollWidth - window.innerWidth), duration: HOURS }, 0);

      const at = (h: number) => h - START;

      // 09:00 the class slams into the ledger.
      tl.fromTo(q('[data-block="class"]'), { yPercent: -260, rotate: -6, autoAlpha: 0 }, { yPercent: 0, rotate: 0, autoAlpha: 1, duration: 0.55, ease: 'bounce.out' }, at(8.25));
      // 10:00 a request hits the class and is thrown back.
      tl.fromTo(q('[data-ghost]'), { x: '-30vw', autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'power2.in' }, at(9.35))
        .to(q('[data-ghost]'), { x: '-8vw', y: '-14vh', rotate: -18, duration: 0.3, ease: 'power2.out' }, at(9.85))
        .to(q('[data-ghost]'), { y: '60vh', rotate: -50, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, at(10.15))
        .fromTo(q('[data-block="class"]'), { x: 0 }, { keyframes: { x: [0, 10, -8, 6, -3, 0] }, duration: 0.3 }, at(9.85))
        .fromTo(q('[data-refusal]'), { autoAlpha: 0, y: 20, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'back.out(2)' }, at(9.9))
        .to(q('[data-refusal]'), { autoAlpha: 0, y: -20, duration: 0.3 }, at(10.9));
      // 12:00 an existing booking.
      tl.fromTo(q('[data-block="booked"]'), { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.35, ease: 'back.out(1.6)' }, at(11.4));
      // 12:20 to 13:00 the stampede: 36 claims, one commits, the rest are thrown out.
      const racerEls = q('[data-racer]');
      racerEls.forEach((el, i) => {
        const r = racers[i];
        const win = i === 0;
        tl.fromTo(el, { x: `${r.dx}vw`, y: `${r.dy}%`, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.in' }, at(12.25) + r.delay);
        if (!win) {
          tl.to(el, { x: `${-3 - r.delay * 10}vw`, y: `${140 + r.dy * 2}%`, rotate: r.dy * 4, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, at(12.25) + r.delay + 0.55);
        } else {
          tl.to(el, { autoAlpha: 0, duration: 0.1 }, at(12.9));
        }
      });
      tl.fromTo(q('[data-block="yours"]'), { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(2.2)' }, at(12.85))
        .set(q('[data-ring]'), { autoAlpha: 1, scale: 0.6 }, at(12.9))
        .to(q('[data-ring]'), { scale: 3.2, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, at(12.9));
      // 12:45 to 13:15 the check-in window and the QR that never gets scanned.
      tl.fromTo(q('[data-window]'), { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, at(13.0))
        .fromTo(q('[data-qr]'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.2 }, at(13.0))
        .fromTo(q('[data-qr] span'), { scale: 0 }, { scale: 1, duration: 0.25, stagger: { each: 0.004, from: 'random' } }, at(13.0))
        .to(q('[data-qr]'), { autoAlpha: 0, duration: 0.2 }, at(13.55))
        .to(q('[data-window]'), { autoAlpha: 0, duration: 0.2 }, at(13.6));
      // 13:40 the no-show sweep: the booking shatters and the hour is free again.
      tl.set(q('[data-block="yours"]'), { autoAlpha: 0 }, at(13.7))
        .set(q('[data-shard]'), { autoAlpha: 1 }, at(13.7));
      q('[data-shard]').forEach((el, i) => {
        const s = shards[i];
        tl.fromTo(el, { x: 0, y: 0, rotate: 0 }, { x: `${s.x}vw`, y: `${s.y}vh`, rotate: s.rot, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, at(13.7));
      });
      tl.fromTo(q('[data-freed]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, at(14.0));
      // 15:00 maintenance slides in from the right.
      tl.fromTo(q('[data-block="maintenance"]'), { xPercent: 140, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' }, at(14.45));
      // The ledger table under the strip follows along.
      tl.fromTo(q('[data-row="class"]'), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.2 }, at(8.6))
        .fromTo(q('[data-row="booked"]'), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.2 }, at(11.6))
        .fromTo(q('[data-row="yours"]'), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.2 }, at(12.95))
        .to(q('[data-row="yours"]'), { autoAlpha: 0.15, duration: 0.2 }, at(13.75))
        .fromTo(q('[data-row="maintenance"]'), { autoAlpha: 0.15 }, { autoAlpha: 1, duration: 0.2 }, at(14.8));
    },
    { scope: root },
  );

  const hourPct = (h: number) => `calc(${PLAYHEAD * 100}vw + (${h - START}) * var(--hour))`;
  const width = (a: number, b: number) => `calc(${b - a} * var(--hour))`;

  return (
    <section
      ref={root}
      aria-label="A day on LPU Reserve's booking ledger"
      className="relative h-[100svh] overflow-hidden [--hour:34vw] max-md:[--hour:62vw]"
    >
      {/* The day. */}
      <div data-track className="absolute inset-y-0 left-0" style={{ width: `calc(${HOURS} * var(--hour) + 100vw)` }}>
        {/* Giant hour numerals, one over each hour. */}
        {Array.from({ length: HOURS + 1 }, (_, i) => START + i).map((h) => (
          <span
            key={h}
            aria-hidden="true"
            className="t-mono-lg pointer-events-none absolute top-[11svh] font-[700] leading-none text-transparent [-webkit-text-stroke:1px_var(--line-2)] text-[clamp(7rem,21vw,21rem)]"
            style={{ left: `calc(${hourPct(h)} + 1vw)` }}
          >
            {String(h).padStart(2, '0')}
          </span>
        ))}
        <div className="absolute inset-x-0 top-[46svh] h-[24svh] border-y border-line-2 bg-bg-2/60">
          {Array.from({ length: HOURS + 1 }, (_, i) => START + i).map((h) => (
            <div key={h} className="absolute inset-y-0 w-px bg-line" style={{ left: hourPct(h) }}>
              <span className="t-mono absolute -top-6 -translate-x-1/2 text-ink-2">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}

          <div data-block="class" className="hatch absolute inset-y-3 flex items-end rounded-[var(--r-xs)] bg-sunk p-3" style={{ left: hourPct(9), width: width(9, 11) }}>
            <span className="t-mono rounded-[2px] bg-bg px-1.5 text-ink">Timetabled class</span>
          </div>

          <div data-ghost className="absolute inset-y-6 rounded-[var(--r-xs)] border-2 border-dashed border-ink" style={{ left: hourPct(10), width: width(10, 11) }} />
          <div data-refusal className="absolute -top-[17svh] z-10 max-w-[30ch] rounded-[var(--r-md)] border border-line-2 bg-bg px-4 py-3" style={{ left: hourPct(9.6) }}>
            <p className="t-mono text-ink-2">10:00 to 11:00, refused</p>
            <p className="mt-1 font-[650]">A timetabled class runs 09:00 to 11:00.</p>
          </div>

          <div data-block="booked" className="absolute inset-y-3 flex items-end rounded-[var(--r-xs)] bg-ink-3/50 p-3" style={{ left: hourPct(12), width: width(12, 13) }}>
            <span className="t-mono rounded-[2px] bg-bg px-1.5 text-ink">Booked</span>
          </div>

          {racers.map((_, i) => (
            <span
              key={i}
              data-racer
              className={`absolute top-1/2 h-[3px] w-10 -translate-y-1/2 rounded-full ${i === 0 ? 'bg-signal' : 'bg-ink-2'}`}
              style={{ left: `calc(${hourPct(13)} - 2.6rem)` }}
            />
          ))}

          <div data-block="yours" className="absolute inset-y-3 flex items-end rounded-[var(--r-xs)] bg-signal p-3" style={{ left: hourPct(13), width: width(13, 14) }}>
            <span className="t-mono rounded-[2px] bg-bg px-1.5 text-ink">Yours</span>
          </div>
          <span data-ring className="invisible pointer-events-none absolute inset-y-3 rounded-[var(--r-sm)] border-2 border-signal" style={{ left: hourPct(13), width: width(13, 14) }} />
          <div className="pointer-events-none absolute inset-y-3" style={{ left: hourPct(13), width: width(13, 14) }}>
            <div className="grid h-full w-full grid-cols-8 grid-rows-6">
              {shards.map((_, i) => (
                <span key={i} data-shard className="invisible bg-signal" />
              ))}
            </div>
          </div>
          <div data-freed className="absolute inset-y-3 grid place-items-center rounded-[var(--r-xs)] border border-dashed border-ink-3" style={{ left: hourPct(13), width: width(13, 14) }}>
            <span className="t-mono text-ink-2">free again</span>
          </div>

          <div data-window className="absolute -bottom-5 h-3 origin-left border-x-2 border-b-2 border-signal" style={{ left: hourPct(12.75), width: width(12.75, 13.33) }} />
          <div data-qr className="absolute -bottom-[15svh] grid h-[11svh] w-[11svh] grid-cols-6 grid-rows-6 gap-[2px] rounded-[var(--r-sm)] bg-bg p-2" style={{ left: hourPct(13.1) }} aria-hidden="true">
            {Array.from({ length: 36 }, (_, i) => (
              <span key={i} className={`rounded-[1px] ${[0, 1, 2, 6, 8, 12, 13, 14, 3, 21, 27, 33, 34, 35, 29, 23, 17, 10, 19, 25].includes(i) ? 'bg-ink' : 'bg-transparent'}`} />
            ))}
          </div>

          <div data-block="maintenance" className="stripes absolute inset-y-3 flex items-end rounded-[var(--r-xs)] bg-sunk p-3" style={{ left: hourPct(15), width: width(15, 17) }}>
            <span className="t-mono rounded-[2px] bg-bg px-1.5 text-ink">Maintenance</span>
          </div>
        </div>
      </div>

      {/* The playhead. */}
      <div className="pointer-events-none absolute inset-y-0 w-[2px] bg-signal" style={{ left: `${PLAYHEAD * 100}vw` }} aria-hidden="true">
        <span data-clock className="t-mono-lg t-num absolute top-[30svh] left-3 rounded-[3px] bg-signal px-2 py-0.5 text-[clamp(1.1rem,2vw,1.6rem)] font-[600] text-on-signal">
          08:00
        </span>
      </div>

      {/* Caption and the ledger rows. */}
      <div className="frame pointer-events-none absolute inset-x-0 bottom-[4svh] grid-12 items-end gap-y-4">
        <div data-caption className="col-span-4 md:col-span-6 lg:col-span-5" aria-live="polite">
          <p data-cap-title className="t-h3">One ledger</p>
          <p data-cap-body className="t-small mt-2 max-w-[48ch] text-ink-2">
            Classes, maintenance and bookings are all rows in BookingSlot. One exclusion constraint guards all three.
          </p>
          <p data-cap-log className="t-mono mt-3 break-words text-signal-text">EXCLUDE USING gist (resource_id WITH =, period WITH &amp;&amp;)</p>
        </div>
        <table className="col-span-4 hidden md:col-span-5 md:col-start-8 md:table lg:col-span-4 lg:col-start-9">
          <caption className="t-mono mb-1 text-left text-ink-2">booking_slot, this resource</caption>
          <tbody>
            {[
              ['class', '[09:00, 11:00)'],
              ['booked', '[12:00, 13:00)'],
              ['yours', '[13:00, 14:00)'],
              ['maintenance', '[15:00, 17:00)'],
            ].map(([k, p]) => (
              <tr key={k} data-row={k} className="border-b border-line">
                <td className="t-mono py-1 pr-4">{k === 'booked' || k === 'yours' ? 'booking' : k}</td>
                <td className="t-mono py-1 text-ink-2">{p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
