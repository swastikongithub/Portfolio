import React, { useState } from 'react';

/*
 * The AI Interview Platform's role-escalation fix. Policy text is quoted from
 * supabase/migrations/0001_initial_schema.sql and 0003_fix_users_role_escalation.sql.
 * The request is the shape of a direct call to the Supabase REST interface with
 * a signed-in user's own session, which is what the migration's comment describes.
 */

type Era = 'before' | 'after';

const BEFORE = `-- 0001_initial_schema.sql
CREATE POLICY "Users can update own row"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);
-- no WITH CHECK: Postgres reuses USING,
-- so it checks which row, never what changed

GRANT ALL ON ALL TABLES IN SCHEMA public
    TO anon, authenticated, service_role;`;

const AFTER = `-- 0003_fix_users_role_escalation.sql
DROP POLICY IF EXISTS "Users can update own row"
    ON public.users;
-- no product flow needs users to update
-- this table; admins keep their own policy`;

const REQUEST = `PATCH /rest/v1/users?id=eq.<your id>
apikey: <public anon key>
Authorization: Bearer <your session>

{ "role": "admin" }`;

export const OtherDoorFigure: React.FC = () => {
  const [era, setEra] = useState<Era>('before');
  const [sent, setSent] = useState(false);

  const choose = (next: Era) => {
    setEra(next);
    setSent(false);
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-6">
        <div className="flex gap-1.5" role="group" aria-label="Schema version">
          <button type="button" aria-pressed={era === 'before'} onClick={() => choose('before')} className={`btn btn-sm !min-h-9 ${era === 'before' ? 'btn-ink' : ''}`}>
            Before 0003
          </button>
          <button type="button" aria-pressed={era === 'after'} onClick={() => choose('after')} className={`btn btn-sm !min-h-9 ${era === 'after' ? 'btn-ink' : ''}`}>
            After 0003
          </button>
        </div>
        <span className="chip">public.users, RLS enabled</span>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="border-b border-line p-4 sm:p-6 md:border-b-0 md:border-r">
          <p className="t-mono text-ink-2">the policy</p>
          <pre className="t-mono mt-3 overflow-x-auto whitespace-pre text-ink" data-lenis-prevent>
            <code>{era === 'before' ? BEFORE : AFTER}</code>
          </pre>
        </div>
        <div className="flex flex-col p-4 sm:p-6">
          <p className="t-mono text-ink-2">the request, skipping the API</p>
          <pre className="t-mono mt-3 overflow-x-auto whitespace-pre text-ink" data-lenis-prevent>
            <code>{REQUEST}</code>
          </pre>
          <div className="mt-auto pt-5">
            <button type="button" className="btn btn-sm btn-signal" onClick={() => setSent(true)}>
              Send it
            </button>
            <div className="mt-4 min-h-[5.5rem] rounded-[var(--r-sm)] border border-line bg-bg p-3" role="status" aria-live="polite">
              {!sent ? (
                <p className="t-mono text-ink-2">No request sent yet.</p>
              ) : era === 'before' ? (
                <>
                  <p className="t-mono">
                    <span className="rounded-[2px] bg-ink px-1 text-bg">1 row updated</span>
                  </p>
                  <p className="t-small mt-2 text-ink">
                    The row is yours, so USING passes, and nothing checks the new value. You are an admin now, and the
                    backend never saw the request.
                  </p>
                </>
              ) : (
                <>
                  <p className="t-mono">
                    <span className="rounded-[2px] bg-signal px-1 text-on-signal">0 rows updated</span>
                  </p>
                  <p className="t-small mt-2 text-ink">
                    No UPDATE policy applies to you, so row-level security filters the row out. Role changes now happen
                    only in the backend, with the service-role client.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
