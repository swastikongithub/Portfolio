import React, { useRef } from 'react';
import { gsap, useGSAP } from '../../lib/motion';
import { SceneBox } from './SceneBox';

/*
 * Tenora, a webhook storm, scrubbed by scroll. Verified webhooks arrive from
 * the provider; every delivery is stored under a unique external_event_id, so a
 * redelivery dies at the index; stored events drive the subscription through
 * the legal-transition table. Event names are Tenora's own normalized
 * vocabulary (apps/billing/gateway/base.py); transitions follow
 * apps/billing/services.py. The sequence is a scripted example.
 */

type State = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

interface Delivery {
  id: string;
  type: string;
  dup?: boolean;
  to?: State;
  note: string;
}

const SEQ: Delivery[] = [
  { id: 'evt_0001', type: 'ACTIVATED', to: 'ACTIVE', note: 'stored   TRIALING → ACTIVE' },
  { id: 'evt_0001', type: 'ACTIVATED', dup: true, note: 'IntegrityError on external_event_id: ignored' },
  { id: 'evt_0002', type: 'PAYMENT_TROUBLE', to: 'PAST_DUE', note: 'stored   ACTIVE → PAST_DUE' },
  { id: 'evt_0003', type: 'CHARGED', to: 'ACTIVE', note: 'stored   PAST_DUE → ACTIVE' },
  { id: 'evt_0003', type: 'CHARGED', dup: true, note: 'IntegrityError on external_event_id: ignored' },
  { id: 'evt_0004', type: 'CANCELLED', to: 'CANCELED', note: 'stored   ACTIVE → CANCELED' },
  { id: 'evt_0005', type: 'CHARGED', note: 'stored   CANCELED is terminal: no change' },
];

const NODES: Record<State, { x: number; y: number }> = {
  TRIALING: { x: 650, y: 210 },
  ACTIVE: { x: 870, y: 210 },
  PAST_DUE: { x: 1090, y: 210 },
  CANCELED: { x: 870, y: 430 },
};

const EDGES: { id: string; d: string }[] = [
  { id: 'TRIALING-ACTIVE', d: 'M725 210 L795 210' },
  { id: 'ACTIVE-PAST_DUE', d: 'M945 196 Q980 160 1015 196' },
  { id: 'PAST_DUE-ACTIVE', d: 'M1015 224 Q980 260 945 224' },
  { id: 'ACTIVE-CANCELED', d: 'M870 238 L870 402' },
  { id: 'TRIALING-CANCELED', d: 'M650 238 Q660 430 795 430' },
  { id: 'PAST_DUE-CANCELED', d: 'M1090 238 Q1080 430 945 430' },
];

const GATE_X = 470;
const STEP = 1;

export const WebhookScene: React.FC = () => {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const counters = {
        delivered: q('[data-c="delivered"]')[0],
        stored: q('[data-c="stored"]')[0],
        dups: q('[data-c="dups"]')[0],
        changes: q('[data-c="changes"]')[0],
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
          pin: true,
          scrub: 0.6,
        },
        onUpdate: () => {
            const t = tl.time();
            let delivered = 0;
            let stored = 0;
            let dups = 0;
            let changes = 0;
            SEQ.forEach((d, i) => {
              if (t >= i * STEP + 0.55) {
                delivered++;
                if (d.dup) dups++;
                else {
                  stored++;
                  if (d.to) changes++;
                }
              }
            });
            counters.delivered.textContent = String(delivered);
            counters.stored.textContent = String(stored);
            counters.dups.textContent = String(dups);
            counters.changes.textContent = String(changes);
        },
      });

      let state: State = 'TRIALING';
      const cursor = q('[data-cursor]')[0];
      gsap.set(cursor, { x: NODES.TRIALING.x - 85, y: NODES.TRIALING.y - 34 });

      SEQ.forEach((d, i) => {
        const p = q(`[data-packet="${i}"]`)[0];
        const line = q(`[data-log="${i}"]`)[0];
        const t0 = i * STEP;
        tl.fromTo(p, { x: 60, y: 312, autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.08 }, t0)
          .to(q('[data-emitter]'), { scale: 1.12, duration: 0.06, yoyo: true, repeat: 1 }, t0)
          .to(p, { x: GATE_X - 200, duration: 0.42, ease: 'power2.in' }, t0 + 0.05);
        if (d.dup) {
          tl.to(q('[data-gate]'), { backgroundColor: 'var(--ink)', duration: 0.04, yoyo: true, repeat: 3 }, t0 + 0.47)
            .to(p, { x: GATE_X - 330, y: 312 + (i % 2 ? 120 : -120), rotate: i % 2 ? 25 : -25, autoAlpha: 0, duration: 0.4, ease: 'power3.out' }, t0 + 0.47)
            .set(q('[data-dup-flash]'), { autoAlpha: 1, scale: 0.6 }, t0 + 0.47)
            .to(q('[data-dup-flash]'), { autoAlpha: 0, scale: 1.6, duration: 0.35 }, t0 + 0.48);
        } else {
          const target = d.to ?? state;
          const node = NODES[target];
          tl.to(q('[data-gate]'), { backgroundColor: 'var(--signal)', duration: 0.05, yoyo: true, repeat: 1 }, t0 + 0.47)
            .to(p, { x: node.x - 95, y: node.y - 17, scale: 0.55, duration: 0.35, ease: 'power2.inOut' }, t0 + 0.5)
            .to(p, { autoAlpha: 0, duration: 0.08 }, t0 + 0.85);
          if (d.to && d.to !== state) {
            const pulse = q('[data-pulse]')[0];
            const edge = `#wh-${state}-${d.to}`;
            tl.set(pulse, { autoAlpha: 1 }, t0 + 0.82)
              .to(pulse, { motionPath: { path: edge, align: edge, alignOrigin: [0.5, 0.5] }, duration: 0.15, ease: 'power1.inOut' }, t0 + 0.82)
              .set(pulse, { autoAlpha: 0 }, t0 + 0.98)
              .to(cursor, { x: node.x - 85, y: node.y - 34, duration: 0.15, ease: 'power3.inOut' }, t0 + 0.84)
              .to(q(`[data-edge="${state}-${d.to}"]`), { stroke: 'var(--signal)', strokeWidth: 3, duration: 0.05 }, t0 + 0.82)
              .to(q(`[data-edge="${state}-${d.to}"]`), { stroke: 'var(--ink-3)', strokeWidth: 1.4, duration: 0.1 }, t0 + 0.97);
            state = d.to;
          } else {
            tl.fromTo(q('[data-terminal]'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.1 }, t0 + 0.85);
          }
        }
        tl.fromTo(line, { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.1 }, t0 + 0.55);
      });
      tl.to({}, { duration: 0.6 });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-[100svh] w-full overflow-hidden">
      <SceneBox>
        <p className="t-mono absolute left-0 top-0 text-ink-2">POST /api/webhooks/cashfree/subscriptions/   raw-body signature verified first</p>

        {/* Provider */}
        <div data-emitter className="absolute grid h-[104px] w-[104px] place-items-center rounded-full border border-line-2 bg-bg-2" style={{ left: 40, top: 278 }}>
          <span className="t-mono text-ink">provider</span>
        </div>
        <div className="absolute h-px bg-line-2" style={{ left: 150, top: 330, width: GATE_X - 150 }} />

        {/* The unique index */}
        <div data-gate className="absolute rounded-[3px] bg-ink-3" style={{ left: GATE_X, top: 170, width: 14, height: 320 }} />
        <p className="t-mono absolute w-[240px] text-ink" style={{ left: GATE_X - 110, top: 128 }}>
          unique (external_event_id)
        </p>
        <span data-dup-flash className="invisible absolute h-24 w-24 rounded-full border-4 border-ink" style={{ left: GATE_X - 41, top: 282 }} />
        <div className="absolute h-px bg-line-2" style={{ left: GATE_X + 14, top: 330, width: 90 }} />

        {/* State machine */}
        <svg className="absolute left-0 top-0" width={1200} height={720} aria-hidden="true">
          <defs>
            <marker id="wh-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)" />
            </marker>
          </defs>
          {EDGES.map((e) => (
            <path key={e.id} id={`wh-${e.id}`} data-edge={e.id} d={e.d} fill="none" stroke="var(--ink-3)" strokeWidth={1.4} markerEnd="url(#wh-arrow)" />
          ))}
          <circle data-pulse r={7} fill="var(--signal)" opacity={0} />
        </svg>
        <div data-cursor className="absolute h-[68px] w-[170px] rounded-full border-[3px] border-signal shadow-[0_0_40px_-6px_var(--signal)]" />
        {(Object.keys(NODES) as State[]).map((s) => (
          <div
            key={s}
            className={`t-mono absolute grid h-[56px] w-[150px] place-items-center rounded-full border bg-bg-2 !text-[0.85rem] ${s === 'CANCELED' ? 'border-[3px] border-line-2' : 'border-line-2'}`}
            style={{ left: NODES[s].x - 75, top: NODES[s].y - 28 }}
          >
            {s}
          </div>
        ))}
        <p data-terminal className="invisible t-mono absolute w-[260px] text-center text-ink" style={{ left: 740, top: 478 }}>
          terminal: nothing leaves CANCELED
        </p>

        {/* Packets */}
        {SEQ.map((d, i) => (
          <div
            key={i}
            data-packet={i}
            className={`t-mono invisible absolute left-0 top-0 flex h-[36px] w-[200px] items-center justify-center gap-2 rounded-full border !text-[0.78rem] ${
              d.dup ? 'border-ink bg-bg text-ink' : 'border-signal bg-signal text-on-signal'
            }`}
          >
            <span className="opacity-70">{d.id}</span>
            <span className="font-[600]">{d.type}</span>
          </div>
        ))}

        {/* Log */}
        <ol className="absolute space-y-1" style={{ left: 0, top: 520, width: 640 }}>
          {SEQ.map((d, i) => (
            <li key={i} data-log={i} className="t-mono grid grid-cols-[86px_150px_1fr] gap-2 !text-[0.78rem]">
              <span className="text-ink-2">{d.id}</span>
              <span>{d.type}</span>
              <span className={d.dup ? 'text-ink-2' : 'text-ink'}>{d.note}</span>
            </li>
          ))}
        </ol>

        {/* Counters */}
        <dl className="absolute grid grid-cols-4 gap-6" style={{ left: 700, top: 590, width: 500 }}>
          {[
            ['delivered', 'delivered'],
            ['stored', 'stored'],
            ['dups', 'duplicates'],
            ['changes', 'state changes'],
          ].map(([k, label]) => (
            <div key={k} className="border-t border-line-2 pt-2">
              <dt className="t-mono text-ink-2">{label}</dt>
              <dd data-c={k} className={`t-mono-lg t-num mt-1 text-[2.4rem] font-[500] leading-none ${k === 'dups' ? 'text-signal-text' : ''}`}>
                0
              </dd>
            </div>
          ))}
        </dl>
      </SceneBox>
    </div>
  );
};
