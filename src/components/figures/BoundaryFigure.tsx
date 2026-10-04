import React, { useEffect, useId, useRef, useState } from 'react';

/*
 * VulnTrack's permission map, transcribed from server/src/config/roles.js:
 * five roles, sixteen permissions, default deny. "Not a member" shows the other
 * half of the boundary: requireMembership answers 404 before any permission is
 * consulted (docs/organization/security.md).
 */

const ROLES = [
  { id: 'owner', label: 'Owner' },
  { id: 'admin', label: 'Admin' },
  { id: 'security_analyst', label: 'Security analyst' },
  { id: 'developer', label: 'Developer' },
  { id: 'viewer', label: 'Viewer' },
  { id: 'outsider', label: 'Not a member' },
] as const;

type RoleId = (typeof ROLES)[number]['id'];

const EVERYONE: RoleId[] = ['owner', 'admin', 'security_analyst', 'developer', 'viewer'];
const MANAGERS: RoleId[] = ['owner', 'admin'];
const SECURITY_TEAM: RoleId[] = ['owner', 'admin', 'security_analyst'];

/** permission → roles holding it; `reserved` = granted now, used by a later phase. */
const GRANTS: { permission: string; roles: RoleId[]; reserved?: boolean }[] = [
  { permission: 'organization:read', roles: EVERYONE },
  { permission: 'organization:update', roles: MANAGERS },
  { permission: 'members:read', roles: SECURITY_TEAM },
  { permission: 'members:invite', roles: MANAGERS },
  { permission: 'members:update_role', roles: MANAGERS },
  { permission: 'members:remove', roles: MANAGERS },
  { permission: 'assets:read', roles: EVERYONE },
  { permission: 'assets:create', roles: SECURITY_TEAM },
  { permission: 'assets:update', roles: SECURITY_TEAM },
  { permission: 'assets:delete', roles: MANAGERS },
  { permission: 'vulnerabilities:read', roles: EVERYONE },
  { permission: 'findings:create', roles: SECURITY_TEAM },
  { permission: 'findings:read', roles: EVERYONE, reserved: true },
  { permission: 'findings:update', roles: SECURITY_TEAM, reserved: true },
  { permission: 'remediation:manage', roles: SECURITY_TEAM, reserved: true },
  { permission: 'scans:run', roles: SECURITY_TEAM, reserved: true },
];

const TOUR: RoleId[] = ['owner', 'admin', 'security_analyst', 'developer', 'viewer', 'outsider', 'developer'];

export const BoundaryFigure: React.FC<{ autoplay?: boolean }> = ({ autoplay = false }) => {
  const [role, setRole] = useState<RoleId>('developer');
  const rootRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  // A one-time tour of the roles the first time the figure is seen (never under reduced motion).
  useEffect(() => {
    const el = rootRef.current;
    if (!autoplay || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers: number[] = [];
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        TOUR.forEach((r, i) =>
          timers.push(window.setTimeout(() => !touched.current && setRole(r), 400 + i * 750)),
        );
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [autoplay]);
  const groupId = useId();
  const outsider = role === 'outsider';
  const granted = GRANTS.filter((g) => g.roles.includes(role)).length;

  return (
    <div ref={rootRef} className="panel p-4 sm:p-6">
      <div role="group" aria-labelledby={`${groupId}-label`}>
        <p id={`${groupId}-label`} className="t-mono text-ink-2">
          signed in as
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={role === r.id}
              onClick={() => {
                touched.current = true;
                setRole(r.id);
              }}
              className={`btn btn-sm !min-h-9 !px-3.5 ${role === r.id ? 'btn-ink' : ''} ${
                r.id === 'outsider' ? 'border-dashed' : ''
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <p className="font-[650]" aria-live="polite">
          {outsider ? (
            <>Every organization route answers 404.</>
          ) : (
            <>
              {granted} of {GRANTS.length} permissions granted
            </>
          )}
        </p>
        <span className="chip">{outsider ? 'requireMembership' : 'requirePermission'}</span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2" aria-label={outsider ? 'Responses for a non-member' : 'Permissions for this role'}>
        {GRANTS.map((g, i) => {
          const has = !outsider && g.roles.includes(role);
          return (
            <li
              key={g.permission}
              style={{ transitionDelay: `${i * 22}ms` }}
              className={`flex items-center justify-between gap-3 rounded-[var(--r-xs)] border px-2.5 py-1.5 transition-[background-color,border-color,color,transform] duration-300 ${outsider ? '[transform:rotateX(180deg)_scaleY(-1)]' : ''} ${
                has ? 'border-signal bg-signal text-on-signal' : 'border-line text-ink-2'
              }`}
            >
              <code className="t-mono truncate">{g.permission}</code>
              <span className="t-mono shrink-0">
                {outsider ? '404' : has ? (g.reserved ? 'allow, later' : 'allow') : 'deny'}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="t-small mt-4 min-h-[3.1em] text-ink-2">
        {outsider
          ? 'Not 403: a 403 would confirm the organization exists. Unknown, foreign and malformed IDs all get the same answer.'
          : 'Code checks permissions, never role names, so changing who holds one is a one-line edit. The server refuses to start if the map and the catalogue drift apart.'}
      </p>
    </div>
  );
};
