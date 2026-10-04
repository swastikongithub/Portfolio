import React, { useEffect, useRef, useState } from 'react';

/*
 * Tenora's subscription state machine (apps/billing/services.py, LEGAL_TRANSITIONS)
 * and its normalized webhook vocabulary (apps/billing/gateway/base.py, EventType).
 * Handler behaviour follows WebhookProcessingService:
 *   ACTIVATED        TRIALING → ACTIVE
 *   CHARGED          TRIALING or PAST_DUE → ACTIVE; ACTIVE keeps its state, period dates update
 *   PAYMENT_TROUBLE  ACTIVE → PAST_DUE; TRIALING → PAST_DUE is not legal, so it is logged and ignored
 *   CANCELLED        → CANCELED, which is terminal
 * Redelivering an event reuses its external_event_id, which is unique: the
 * insert fails, nothing is stored and nothing changes.
 */

type State = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
type EventType = 'ACTIVATED' | 'CHARGED' | 'PAYMENT_TROUBLE' | 'CANCELLED';

const LEGAL: Record<State, State[]> = {
  TRIALING: ['ACTIVE', 'CANCELED'],
  ACTIVE: ['PAST_DUE', 'CANCELED'],
  PAST_DUE: ['ACTIVE', 'CANCELED'],
  CANCELED: [],
};

/** Node positions in a 600 × 300 viewBox. */
const NODES: Record<State, { x: number; y: number }> = {
  TRIALING: { x: 90, y: 110 },
  ACTIVE: { x: 300, y: 110 },
  PAST_DUE: { x: 510, y: 110 },
  CANCELED: { x: 300, y: 245 },
};

const EDGES: { from: State; to: State; d: string; lx: number; ly: number }[] = [
  { from: 'TRIALING', to: 'ACTIVE', d: 'M150 110 L240 110', lx: 195, ly: 100 },
  { from: 'ACTIVE', to: 'PAST_DUE', d: 'M360 98 Q405 70 450 98', lx: 405, ly: 70 },
  { from: 'PAST_DUE', to: 'ACTIVE', d: 'M450 124 Q405 152 360 124', lx: 405, ly: 160 },
  { from: 'TRIALING', to: 'CANCELED', d: 'M120 136 Q150 245 236 245', lx: 150, ly: 215 },
  { from: 'ACTIVE', to: 'CANCELED', d: 'M300 134 L300 221', lx: 300, ly: 182 },
  { from: 'PAST_DUE', to: 'CANCELED', d: 'M480 136 Q450 245 364 245', lx: 450, ly: 215 },
];

interface Delivery {
  id: string;
  event: EventType;
  outcome: 'applied' | 'no change' | 'ignored' | 'duplicate';
  note: string;
}

function apply(state: State, event: EventType): { next: State; outcome: Delivery['outcome']; note: string } {
  const legal = (to: State) => LEGAL[state].includes(to);
  if (state === 'CANCELED') return { next: state, outcome: 'ignored', note: 'CANCELED is terminal. Nothing leaves it.' };
  switch (event) {
    case 'ACTIVATED':
      return legal('ACTIVE')
        ? { next: 'ACTIVE', outcome: 'applied', note: 'TRIALING → ACTIVE' }
        : { next: state, outcome: 'no change', note: `Already ${state}.` };
    case 'CHARGED':
      if (state === 'ACTIVE') return { next: state, outcome: 'no change', note: 'Still ACTIVE; the billing period dates move.' };
      return { next: 'ACTIVE', outcome: 'applied', note: `${state} → ACTIVE` };
    case 'PAYMENT_TROUBLE':
      if (state === 'ACTIVE') return { next: 'PAST_DUE', outcome: 'applied', note: 'ACTIVE → PAST_DUE' };
      if (state === 'TRIALING') return { next: state, outcome: 'ignored', note: 'TRIALING → PAST_DUE is not a legal transition. Logged, ignored.' };
      return { next: state, outcome: 'no change', note: 'Already PAST_DUE.' };
    case 'CANCELLED':
      return { next: 'CANCELED', outcome: 'applied', note: `${state} → CANCELED` };
  }
}

export const StateMachineFigure: React.FC<{ autoplay?: boolean }> = ({ autoplay = false }) => {
  const [state, setState] = useState<State>('TRIALING');
  const [log, setLog] = useState<Delivery[]>([]);
  const [lastEdge, setLastEdge] = useState<string | null>(null);
  const counter = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const script = useRef<number[]>([]);

  const deliver = (event: EventType) => {
    counter.current += 1;
    const id = `evt_${String(counter.current).padStart(4, '0')}`;
    const r = apply(state, event);
    setLastEdge(r.next !== state ? `${state}>${r.next}` : null);
    setState(r.next);
    setLog((l) => [{ id, event, outcome: r.outcome, note: r.note }, ...l].slice(0, 5));
  };

  const redeliver = () => {
    const last = log.find((d) => d.outcome !== 'duplicate');
    if (!last) return;
    setLastEdge(null);
    setLog((l) =>
      [
        {
          id: last.id,
          event: last.event,
          outcome: 'duplicate' as const,
          note: 'unique (external_event_id): stored nothing, changed nothing.',
        },
        ...l,
      ].slice(0, 5),
    );
  };

  const reset = () => {
    counter.current = 0;
    setState('TRIALING');
    setLog([]);
    setLastEdge(null);
  };

  // A one-time scripted run the first time the figure is seen: deliver, redeliver, fail, recover, cancel.
  useEffect(() => {
    const el = rootRef.current;
    if (!autoplay || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const press = (name: string) => el.querySelector<HTMLButtonElement>(`[data-ev="${name}"]`)?.click();
    const steps = ['ACTIVATED', 'AGAIN', 'PAYMENT_TROUBLE', 'CHARGED', 'AGAIN', 'CANCELLED'];
    const timers = script.current;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        steps.forEach((s, i) => timers.push(window.setTimeout(() => press(s), 500 + i * 1100)));
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [autoplay]);

  const stopScript = () => {
    script.current.forEach(clearTimeout);
    script.current = [];
  };

  return (
    <div ref={rootRef} className="panel p-4 sm:p-6">
      <svg viewBox="0 0 600 300" className="h-auto w-full" role="img" aria-label={`Subscription state machine. Current state: ${state}.`}>
        <defs>
          <marker id="sm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)" />
          </marker>
          <marker id="sm-arrow-hot" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--ink)" />
          </marker>
        </defs>
        {EDGES.map((e) => {
          const hot = lastEdge === `${e.from}>${e.to}`;
          return (
            <path
              key={`${e.from}-${e.to}`}
              d={e.d}
              fill="none"
              stroke={hot ? 'var(--ink)' : 'var(--ink-3)'}
              strokeWidth={hot ? 2.5 : 1.25}
              strokeDasharray={e.to === 'CANCELED' && !hot ? '4 4' : undefined}
              markerEnd={`url(#${hot ? 'sm-arrow-hot' : 'sm-arrow'})`}
              style={{ transition: 'stroke 300ms, stroke-width 300ms' }}
            />
          );
        })}
        {(Object.keys(NODES) as State[]).map((s) => {
          const { x, y } = NODES[s];
          const current = s === state;
          return (
            <g key={s}>
              <rect
                x={x - 60}
                y={y - 24}
                width={120}
                height={48}
                rx={24}
                fill={current ? 'var(--signal)' : 'var(--bg)'}
                stroke={current ? 'var(--signal)' : 'var(--line-2)'}
                strokeWidth={s === 'CANCELED' ? 3 : 1.25}
                style={{ transition: 'fill 300ms' }}
              />
              {s === 'CANCELED' && (
                <rect x={x - 55} y={y - 19} width={110} height={38} rx={19} fill="none" stroke={current ? 'var(--on-signal)' : 'var(--line-2)'} strokeWidth={1} />
              )}
              <text
                x={x}
                y={y + 4.5}
                textAnchor="middle"
                className="font-mono"
                fontSize="13"
                fontWeight={current ? 600 : 400}
                fill={current ? 'var(--on-signal)' : 'var(--ink)'}
              >
                {s}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 border-t border-line pt-4">
        <p className="t-mono text-ink-2">deliver a verified webhook</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(['ACTIVATED', 'CHARGED', 'PAYMENT_TROUBLE', 'CANCELLED'] as EventType[]).map((ev) => (
            <button
              key={ev}
              type="button"
              data-ev={ev}
              className="btn btn-sm !min-h-9 !px-3 t-mono !text-[0.72rem]"
              onClick={(e) => {
                if (e.isTrusted) stopScript();
                deliver(ev);
              }}
            >
              {ev}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm btn-signal !min-h-9 !px-3"
            data-ev="AGAIN"
            onClick={(e) => {
              if (e.isTrusted) stopScript();
              redeliver();
            }}
            disabled={!log.some((d) => d.outcome !== 'duplicate')}
          >
            Deliver the last one again
          </button>
          <button
            type="button"
            className="btn btn-sm !min-h-9 !px-3"
            onClick={() => {
              stopScript();
              reset();
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <ol className="mt-4 min-h-[9.5rem] space-y-1" aria-live="polite" aria-label="Delivery log, newest first">
        {log.length === 0 && (
          <li className="t-small text-ink-2">
            Nothing delivered yet. Start with ACTIVATED, then try delivering it again.
          </li>
        )}
        {log.map((d, i) => (
          <li key={`${d.id}-${i}-${d.outcome}`} className="grid grid-cols-[4.6rem_1fr] gap-x-3 sm:grid-cols-[4.6rem_9.5rem_1fr]">
            <span className="t-mono text-ink-2">{d.id}</span>
            <span className="t-mono max-sm:hidden">{d.event}</span>
            <span className="t-mono">
              <span
                className={`mr-2 rounded-[2px] px-1 ${
                  d.outcome === 'applied' ? 'bg-signal text-on-signal' : d.outcome === 'duplicate' ? 'bg-ink text-bg' : 'border border-line-2'
                }`}
              >
                {d.outcome}
              </span>
              <span className="text-ink-2">{d.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};
