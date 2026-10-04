import type {
  Credential,
  EducationEntry,
  Habit,
  ProjectCaseStudy,
  RepoHistory,
  SecondTime,
  SectionLink,
} from '../types/portfolio';

/**
 * Single source of truth for the site's content.
 *
 * Project facts were audited against each project's local source code and
 * documentation on 3-4 Oct 2026 (local implementation wins over README, CV or
 * older copy). Education, training and certifications come from the CV dated
 * 18 Sep 2026, which is also the published résumé.
 */
export const PERSONAL_INFO = {
  name: 'Swastik Singh',
  firstName: 'Swastik',
  lastName: 'Singh',
  role: 'Software engineer',
  email: 'swastiksingh288@gmail.com',
  github: 'https://github.com/swastikongithub',
  githubHandle: 'swastikongithub',
  linkedin: 'https://www.linkedin.com/in/swastiksin/',
  linkedinHandle: 'swastiksin',
  instagram: 'https://www.instagram.com/swastik.mov/',
  instagramHandle: 'swastik.mov',
  portfolio: 'https://portfolio-swastiksingh.vercel.app',
  resume: '/swastik-singh-resume.pdf',
  resumeUpdated: '18 Sep 2026',
  availability: 'Open to internships and software engineering roles.',
} as const;

export const SECTIONS: SectionLink[] = [
  { id: 'work', label: 'Work' },
  { id: 'reels', label: 'Reels' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const PROJECTS: ProjectCaseStudy[] = [
  {
    slug: 'lpu-reserve',
    title: 'LPU Reserve',
    kind: 'Campus resource and facility booking',
    period: 'Since Sep 2026',
    status: 'Live demo on Railway, still in development',
    invariant: 'One slot holds one booking.',
    mechanism: 'EXCLUDE USING gist (resource_id WITH =, period WITH &&)',
    twice: '500 students, one lab, the same instant.',
    deck: 'Every bookable thing at Lovely Professional University in one place: rooms, labs, courts, cameras, 3D printers, vehicles. The timetable is respected automatically, and double-booking is structurally impossible.',
    summary:
      'A Django and PostgreSQL booking platform where classes, maintenance and bookings share one ledger, and the database refuses every overlap.',
    problem:
      'When a popular lab slot opens, hundreds of people click at once. The naive check-then-insert lets two of them through: both read "free" before either writes. A transaction does not help under READ COMMITTED, and there is no row to lock for a slot that does not exist yet. And a booking is not the only thing that takes a room: timetabled classes and maintenance windows must block it too.',
    built: [
      'A booking engine whose guarantee lives in PostgreSQL: exclusion constraints on a tstzrange period refuse any second overlapping claim, however many requests race.',
      'One ledger for every claim on a room\'s time. Bookings, timetabled classes and maintenance windows are rows in the same table, so a single constraint guards all three.',
      'Rules as data: opening hours, lead times, blackouts, role and department quotas and multi-step approval chains, changed in a console without a deploy.',
      'QR check-in from a booking pass or the door, a grace period, an auto-release sweep for no-shows and a progressive restriction ladder for repeat offenders.',
      'Nine modules in a modular monolith: catalogue with natural-language search, timetable import, maintenance, consumables, utilisation analytics, notifications, iCal and a REST API.',
    ],
    story: {
      title: 'The first run failed',
      body: 'The first 500-attempt stress test did not double-book, but about 160 attempts died with 40P01 deadlock detected. An exclusion check also examines in-progress rows, so two simultaneous inserts can wait on each other. The fix is two measures that carry no part of the correctness argument: retry the claim from its savepoint on 40P01, and queue claims for the same resource behind a transaction-scoped advisory lock. A second test removes both, and PostgreSQL alone still lets exactly one booking through.',
    },
    architecture: {
      intro:
        'A modular monolith: one Django app per module, business rules in services.py, server-rendered templates with htmx and a DRF API beside them. Redis is only the Celery broker, so a Redis outage delays notifications but cannot cause a double booking.',
      layers: [
        { name: 'rules.validate_request', detail: 'Role, restriction, slot size, duration, lead time, window, opening hours, blackouts, capacity. Every refusal is a sentence a student can act on.' },
        { name: 'friendly pre-check', detail: 'Reads the ledger to explain a conflict ("a timetabled class runs 09:00 to 10:00"). For the message only; correctness never depends on it.' },
        { name: 'SELECT … FOR UPDATE', detail: 'Locks only the requester\'s own row, so quota arithmetic is exact for one person\'s concurrent clicks. Different people never wait on each other here.' },
        { name: 'claim', detail: 'Booking and BookingSlot inserted in one savepoint, behind pg_advisory_xact_lock. SQLSTATE 23P01 becomes "slot unavailable".' },
        { name: 'after commit', detail: 'Approval chain rows, accessory reservations, the audit record and notifications.' },
      ],
    },
    decisions: [
      {
        title: 'A constraint, not a check',
        body: 'Correctness lives in the database index, at insert time, for every transaction including uncommitted ones. Nothing in application code can race past it, and no lock has to be managed. Cancelled, rejected and released bookings drop out of the constraint\'s WHERE clause, so freeing time needs no cleanup job.',
      },
      {
        title: 'One ledger for all claims',
        body: 'Separate tables cannot share an exclusion constraint, so classes, maintenance and bookings are all written to BookingSlot. A timetabled class is never offered as free, and that holds in the database, not just in the calendar.',
      },
      {
        title: 'Throughput aids are not proofs',
        body: 'The advisory lock and the deadlock retry make a stampede fast. They are documented and tested as optional: remove them and the guarantee still holds, you only pay in deadlock timeouts.',
      },
      {
        title: 'Rules and workflows as data',
        body: 'Policies resolve most-specific-wins across campus, block, type and resource. Approval chains are chosen by resource, requester role, attendees and duration, and edited in a builder that answers "who approves this?" before anyone books.',
      },
    ],
    safeguards: [
      'An append-only audit log enforced by a PostgreSQL trigger: UPDATE and DELETE are rejected.',
      'TOTP MFA for privileged roles, with single-use codes and MFA as a property of the session.',
      'A security review with 14 findings, each first committed as a failing proof and now a regression test.',
      'A strict Content-Security-Policy with no inline JavaScript, and object-level checks on every page and endpoint.',
      'Playwright journeys and axe-core checks on every student page, in light and dark themes.',
    ],
    limits: [
      'Production runs on a Railway trial plan without the Celery Beat or backup services, so scheduled sweeps (including no-show release) do not run there yet, and email is not configured.',
      'The 500-user load test ran against a production-like stack on one 4-core machine. Sustained-load and latency targets are not yet measured on a deployed environment.',
      'Tenancy is an institution foreign key on every record, without PostgreSQL row-level security; only one institution is served today.',
      'Hindi and Punjabi translations cover 4 of 63 templates.',
    ],
    facts: [
      { value: '500 → 1', label: 'simultaneous attempts on one slot, one booking', source: 'tests/test_concurrency.py' },
      { value: '559', label: 'test functions, from unit to Playwright journeys', source: 'tests/' },
      { value: '12', label: 'architecture decision records', source: 'docs/adr/' },
      { value: '14 / 14', label: 'security findings closed, each with a test', source: 'docs/security-review.md' },
    ],
    homeFact: 0,
    stack: [
      { group: 'Backend', items: ['Python 3.12', 'Django 5.2', 'Django REST Framework', 'drf-spectacular'] },
      { group: 'Data & jobs', items: ['PostgreSQL 16', 'btree_gist', 'Celery', 'Redis'] },
      { group: 'Interface', items: ['Django templates', 'htmx', 'strict CSP'] },
      { group: 'Quality & ops', items: ['pytest', 'Playwright', 'axe-core', 'Locust', 'OWASP ZAP', 'Docker', 'GitHub Actions', 'Railway'] },
    ],
    stackShort: ['Django', 'PostgreSQL', 'Celery', 'Redis', 'htmx', 'Playwright'],
    links: {
      source: 'https://github.com/swastikongithub/Django-EduRev-P20',
      live: 'https://django-edurev-p20-production.up.railway.app',
      liveNote: 'Demo campus with fictional data. Student demo accounts are listed in the README.',
    },
    figure: 'ledger',
    figureCaption: 'A lab\'s day on the shared ledger: class, maintenance and bookings in one table, one constraint.',
  },
  {
    slug: 'vulntrack',
    title: 'VulnTrack',
    kind: 'Vulnerability management platform',
    period: 'Since Sep 2026',
    status: 'In development: matching shipped, findings next',
    invariant: 'An organization never loses its last owner.',
    mechanism: '$inc: { rosterVersion: 1 }  // inside every roster transaction',
    twice: 'Two owners demoting each other at the same moment.',
    deck: 'A multi-tenant platform that knows exactly what each organization runs, pulls public advisories from NVD and OSV, and explains which of its software is potentially affected and why.',
    summary:
      'Session security, five-role RBAC, a purl-normalized software inventory, NVD and OSV ingestion, and a matching engine that never guesses.',
    problem:
      'A vulnerability platform is only as trustworthy as its answers to three questions: who may see this organization\'s data, exactly what does it run, and is that version affected? Each answer has a failure mode that looks fine in a demo: a 403 that confirms another tenant exists, a package named two ways, a version compared as a string.',
    built: [
      'Server-side sessions: opaque 256-bit IDs stored only as SHA-256 digests, Argon2id passwords, idle and absolute expiry, and every session revoked on password reset.',
      'Multi-tenant organizations with five roles and one central permission map. Non-members get a 404 for any organization, so the API never confirms one exists.',
      'An asset and software inventory that normalizes npm, PyPI, Maven, Go and other packages into Package URL identities, with optimistic concurrency on every edit.',
      'An ingestion worker for NVD and OSV: fetch, validate the provider\'s shape, normalize, validate again, store. Locked per source, cursor-based and idempotent.',
      'A pure matching engine with one version comparator per ecosystem and OSV range evaluation. Four outcomes, each with a confidence and a reason a person can check.',
    ],
    story: {
      title: 'The last owner, under a race',
      body: 'Two owners demoting each other at the same instant could both commit under MongoDB snapshot isolation, leaving an organization with no owner. Every roster change now writes one shared version field on the organization, so concurrent transactions conflict and one retries, and the policy is re-checked inside the transaction. The documented negative control: with that write removed, the concurrent test ended with zero owners in 3 of 3 runs.',
    },
    architecture: {
      intro:
        'An Express 5 API over a MongoDB replica set (signup, password reset and roster changes are multi-document transactions), with a React client. Every organization route runs the same chain before a controller sees the request.',
      layers: [
        { name: 'requireAuth', detail: 'Resolves the session from the cookie digest; rejects expired, idle, unverified, disabled or pre-password-change sessions.' },
        { name: 'requireMembership', detail: 'Resolves the organization from the URL plus an active membership. Anything else is a 404.' },
        { name: 'requirePermission', detail: 'Checks the role against the central permission map. Default deny; denied writes are audited.' },
        { name: 'validate', detail: 'Zod schemas admit only primitives, strip unknown keys and drop server-owned fields.' },
        { name: 'service', detail: 'Domain rules, hierarchy checks, transactions and audit events, every query scoped by organization.' },
      ],
    },
    decisions: [
      {
        title: '404, not 403',
        body: 'Cross-tenant, unknown and malformed IDs all return the same 404. A 403 would confirm that another organization\'s asset exists. Even a filter like ?assetId=<foreign id> returns an empty list, not an error.',
      },
      {
        title: 'Identity before versions',
        body: 'Inventory and advisories are normalized with the same function, so matching is an indexed equality join on ecosystem:name, not a fuzzy comparison. Normalization removes only differences the ecosystem itself ignores.',
      },
      {
        title: 'Never compare versions as strings',
        body: '1.9.0 < 1.10.0 is true for versions and false for strings, and the tests assert both. A version that will not parse under its scheme becomes "undetermined", never "not affected".',
      },
      {
        title: 'The catalogue is global, matches are private',
        body: 'Advisories are shared by every tenant and no organization role can write to them. That an organization runs an affected package is private: two organizations with identical inventories get separate rows.',
      },
    ],
    safeguards: [
      'Enumeration-safe signup, reset and resend; a dummy Argon2 verification equalizes timing for unknown accounts.',
      'Exact Origin allowlist, SameSite=Lax cookies and JSON-only bodies against CSRF.',
      'Ingestion fetches only fixed hosts, caps response size, refuses redirects and treats advisory text as hostile.',
      'CVSS v2 and v3 scores recomputed from the vector, so a wrong source score cannot change severity.',
      'API tests on an in-memory MongoDB replica set for IDOR, privilege escalation, CSRF, concurrency and rate limits.',
    ],
    limits: [
      'Not built yet: findings, remediation workflow, risk scoring and scanning. A match is a potential link awaiting review.',
      'No scheduler yet: ingestion and matching run from a CLI or the UI, ready for a later queue.',
      'Matching recomputes a whole organization each run, and CPE matching is product-level.',
      'No MFA yet; audit logs are append-only by convention rather than enforced by the database.',
    ],
    facts: [
      { value: '5', label: 'roles, one permission map, default deny', source: 'server/src/config/roles.js' },
      { value: '2', label: 'advisory sources, NVD and OSV, one normalized model', source: 'services/intelligence/adapters/' },
      { value: '4', label: 'match outcomes, none of them a silent guess', source: 'docs/matching/matching.md' },
      { value: '26', label: 'API and unit test files', source: 'server/tests/' },
    ],
    homeFact: 1,
    stack: [
      { group: 'API', items: ['Node.js 22', 'Express 5', 'Zod', 'Argon2id', 'Pino'] },
      { group: 'Data', items: ['MongoDB replica set', 'Mongoose'] },
      { group: 'Intelligence', items: ['NVD CVE API 2.0', 'OSV', 'Package URL', 'CVSS v2 to v4'] },
      { group: 'Client & quality', items: ['React 19', 'Vite', 'Tailwind CSS', 'GSAP', 'Vitest', 'Supertest', 'mongodb-memory-server'] },
    ],
    stackShort: ['Node.js', 'Express', 'MongoDB', 'React', 'Zod', 'Vitest'],
    links: { source: 'https://github.com/swastikongithub/VulnTrack' },
    figure: 'boundary',
    figureCaption: 'The permission map, excerpted from server/src/config/roles.js. Pick a role.',
  },
  {
    slug: 'tenora',
    title: 'Tenora',
    kind: 'Multi-tenant property billing SaaS',
    period: 'Since Sep 2026',
    status: 'Live on Render, still in development',
    invariant: 'A webhook changes state once.',
    mechanism: 'external_event_id = models.CharField(unique=True)',
    twice: 'The same payment webhook, delivered twice.',
    deck: 'Workspaces, leases, meters and monthly bills for property owners, online payments from residents, and Tenora\'s own subscriptions, built around tenant isolation, idempotency and webhook-driven state.',
    summary:
      'A Django REST Framework SaaS where webhooks are the authority, idempotency is a database constraint, and two money flows never share code.',
    problem:
      'Tenora moves money in two directions: residents pay property owners, and owners pay Tenora. Both are driven by a payment provider whose webhooks can arrive twice, late or out of order, and neither flow may leak across workspaces or trust an amount the browser sent.',
    built: [
      'Tenant resolution in a DRF authentication class from the X-Tenant-ID header plus an active membership, never from a request body. Cross-tenant requests return 404.',
      'A monthly billing cycle: draft bills from leases, meter readings and the tariff in force, then review and publish. Issued bills are immutable and change only through visible corrections.',
      'Cashfree webhooks behind provider-neutral gateway adapters, with raw-body signature checks and subscription changes only through an explicit transition table.',
      'Celery and Redis sweeps for webhook retries, reminders and reconciliation, each under a PostgreSQL advisory lock so runs never overlap.',
    ],
    story: {
      title: 'Idempotency is a constraint, not a check',
      body: 'Webhook de-duplication is a unique index on the provider\'s event ID. One open checkout per bill, one payment per capture and one subscription per workspace are unique constraints too. A duplicate delivery hits the database, not an if-statement that two workers can pass at the same time. IntegrityError is caught outside the atomic() block that raised it, because PostgreSQL marks that transaction broken.',
    },
    architecture: {
      intro:
        'A Django 5 and DRF API on PostgreSQL, Celery workers on Redis, and a React and TypeScript client, packaged with Docker Compose. The two financial domains live in separate apps with separate gateway seams.',
      layers: [
        { name: 'apps.tenants', detail: 'Workspaces, memberships, invitations, plan limits and capability-based authorization.' },
        { name: 'apps.properties', detail: 'Properties, units, leases, meters, tariffs, billing cycles, bills, payments, receipts and resident payments.' },
        { name: 'apps.billing', detail: 'Tenora\'s own subscriptions: plans, checkout, webhooks and reconciliation.' },
        { name: 'apps.platform', detail: 'A staff-only operator control plane with an audit log.' },
        { name: 'Celery beat + worker', detail: 'Webhook retry sweep, reminders and reconciliation, each under an advisory lock.' },
      ],
    },
    decisions: [
      {
        title: 'Two money flows that never import each other',
        body: 'Owner-to-Tenora subscriptions and resident-to-owner bill payments share a vendor and nothing else: different API families, credentials, webhook routes and gateway seams. A change to one cannot quietly alter the other.',
      },
      {
        title: 'Webhooks are the authority',
        body: 'Signatures are verified on the raw body before anything is parsed. A local subscription is never created from what the client reports; only a verified webhook creates or changes it, through a transition table where CANCELED is terminal.',
      },
      {
        title: 'The browser never names a price',
        body: 'The server fixes the amount, creates the provider order, and only a verified capture settles a bill, through the same path an offline payment uses. Money is integer minor units end to end.',
      },
      {
        title: 'Fail closed',
        body: 'An unreachable provider or an unrecognized status means "unknown", never "safe to discard". Downgrades are refused because no proration semantics have been designed, and an upgrade applies only when the new mandate\'s webhook activates it.',
      },
    ],
    safeguards: [
      'Plan limits on workspaces and seats enforced under row locks; pending invitations reserve a seat.',
      'Concurrency guarantees tested with real threads on real database connections.',
      'No card data is stored; credentials live only in the environment and are never logged.',
      'Provider adapters tested against recorded fixtures, including signature verification with known vectors.',
    ],
    limits: [
      'Render\'s free tier runs no Celery worker, so scheduled jobs run through management commands in production.',
      'Known defects are listed in the README rather than hidden, including a subscription period that can start a cycle late.',
      'Settlement reaches one merchant account; routing payouts to individual owners would need a split-payments product.',
    ],
    facts: [
      { value: '961', label: 'backend tests, no network, real threads for races', source: 'apps/**/tests' },
      { value: '557', label: 'frontend tests against MSW-stubbed endpoints', source: 'README.md' },
      { value: '2', label: 'money flows that share a vendor and nothing else', source: 'apps.billing, apps.properties' },
      { value: '1', label: 'terminal state: CANCELED never comes back', source: 'apps/billing/services.py' },
    ],
    homeFact: 0,
    stack: [
      { group: 'API', items: ['Python 3.12', 'Django 5', 'Django REST Framework', 'SimpleJWT'] },
      { group: 'Data & jobs', items: ['PostgreSQL', 'Celery', 'Redis'] },
      { group: 'Payments', items: ['Cashfree Payment Gateway', 'Cashfree Subscriptions'] },
      { group: 'Client & ops', items: ['React 19', 'TypeScript', 'TanStack Query', 'Vitest + MSW', 'Docker Compose', 'Render'] },
    ],
    stackShort: ['Django REST Framework', 'PostgreSQL', 'Celery', 'Redis', 'React', 'TypeScript'],
    links: {
      source: 'https://github.com/swastikongithub/Tenora',
      live: 'https://tenora-frontend.onrender.com',
      liveNote: 'Free-tier hosting: the first request after idling can take about 30 seconds.',
    },
    figure: 'state-machine',
    figureCaption: 'The subscription state machine from apps/billing/services.py. Deliver the webhooks yourself.',
  },
  {
    slug: 'ai-interview-platform',
    title: 'AI Interview Platform',
    kind: 'Role-based AI hiring platform',
    period: 'Since Aug 2026',
    status: 'In development',
    invariant: 'Nobody can make themselves an admin.',
    mechanism: 'DROP POLICY "Users can update own row" ON public.users;',
    twice: 'One request through the API, another straight to the database.',
    deck: 'A four-role hiring platform where résumé analysis runs as a background job, AI output is validated like any untrusted input, and Postgres row-level security is the last line of authorization.',
    summary:
      'A TypeScript monorepo with a BullMQ résumé pipeline, schema-constrained Gemini output, and row-level security on the Supabase schema.',
    problem:
      'Hiring data has many readers: candidates may only see their own records, interviewers only what they are assigned. And a Supabase project has two doors, the backend API and the database\'s own REST interface, so every rule has to hold at both. AI calls are slow and fallible: they cannot sit in a request path, and their output cannot be trusted to be well-formed.',
    built: [
      'Four roles (candidate, recruiter, interviewer, admin) in a TypeScript monorepo: an Express REST API with Supabase Auth JWTs, Zod validation and rate limiting, plus role-guarded React routes.',
      'A résumé pipeline on BullMQ and Redis: uploads are hashed, and job IDs are derived from the user and the file hash, so the same file is never processed twice.',
      'Gemini returns schema-constrained JSON (profile, ATS score, keyword gaps) that is validated again with Zod before it touches the database.',
      'An interview domain whose start logic locks the row and validates the state transition inside Postgres.',
    ],
    story: {
      title: 'Closing the other door',
      body: 'The original update policy on the users table had no WITH CHECK clause, so Postgres reused its USING clause: it checked which row was updated, never what changed. With the blanket grants from the first migration, any signed-in user could call the Supabase REST API directly and set their own role to admin, bypassing the backend entirely. Migration 0003 drops the policy, because no product flow needs users to update that table themselves.',
    },
    architecture: {
      intro:
        'A React and TypeScript client and an Express and TypeScript API over Supabase (Postgres, Auth, RLS), with a BullMQ worker on Redis for AI work. The API checks roles and ownership; RLS enforces the same rules at the database.',
      layers: [
        { name: 'React client', detail: 'Role dashboards behind a RoleGuard; TanStack Query for server state.' },
        { name: 'Express API', detail: 'Supabase JWT verification, requireRole, Zod request schemas, rate limiting and request IDs.' },
        { name: 'BullMQ worker', detail: 'Parses PDFs and calls Gemini outside the request path, two jobs at a time.' },
        { name: 'Supabase Postgres', detail: 'Row-level security on every table; status enums and a transition function for interviews.' },
      ],
    },
    decisions: [
      {
        title: 'Job IDs scoped to the user',
        body: 'Deterministic job IDs make re-uploads idempotent. But two people uploading the same template résumé would collide onto one job and strand one profile in "processing". IDs are resume-{user}-{hash}.',
      },
      {
        title: 'AI output is untrusted input',
        body: 'Gemini is called with a response schema and the result is validated with Zod. On failure the profile moves to "failed", keeps every manually entered field, and can be reprocessed.',
      },
      {
        title: 'Transitions in the database',
        body: 'Starting an interview locks its row (SELECT … FOR UPDATE) and refuses anything not in the ready state; a partial unique index allows one active or completed session per interview.',
      },
      {
        title: 'The API mirrors RLS',
        body: 'Ownership checks in the API return the same 404 the database would for another candidate\'s interview, so neither door says more than the other.',
      },
    ],
    safeguards: [
      'Uploads are PDF-only with a 5 MB limit; an unchanged file returns the existing report without a new AI call.',
      'Role changes are admin-only actions performed by the backend with the service-role client.',
      'Tests cover authentication, RLS, the résumé and ATS pipeline and the interview domain with Vitest and Supertest.',
    ],
    limits: [
      'AI is used for résumé extraction and ATS reports; interview evaluation scores are entered by interviewers.',
      'Practice interviews currently use a fixed question set.',
      'The test suite is smaller than the other projects\' (48 backend tests).',
    ],
    facts: [
      { value: '4', label: 'roles behind RLS and a RoleGuard', source: 'supabase/migrations/0001' },
      { value: '2', label: 'BullMQ jobs at a time, outside the request path', source: 'resumeQueue.service.ts' },
      { value: '5 MB', label: 'PDF limit; the same file is never analysed twice', source: 'resume.routes.ts' },
      { value: '48', label: 'backend tests: auth, RLS, ATS, interviews', source: 'apps/backend/tests' },
    ],
    homeFact: 3,
    stack: [
      { group: 'API', items: ['TypeScript', 'Node.js', 'Express', 'Zod'] },
      { group: 'Data & jobs', items: ['Supabase (Postgres, Auth, RLS)', 'BullMQ', 'Redis'] },
      { group: 'AI', items: ['Google Gemini API', 'pdf-parse'] },
      { group: 'Client & quality', items: ['React', 'TanStack Query', 'Tailwind CSS', 'Vitest', 'Supertest', 'Docker'] },
    ],
    stackShort: ['TypeScript', 'Express', 'Supabase', 'BullMQ', 'Gemini', 'React'],
    links: { source: 'https://github.com/swastikongithub/AI-Interview-Platform' },
    figure: 'other-door',
    figureCaption: 'The policy from migration 0001, and what migration 0003 did about it.',
  },
];

export const getProject = (slug: string | undefined) => PROJECTS.find((p) => p.slug === slug);

/** How the work above was done, each backed by something in the repositories. */
/**
 * Each system meeting its second time, as the home page tells it. Every outcome
 * is the project's documented behaviour (see the case studies for the files).
 */
export const SECOND_TIMES: SecondTime[] = [
  {
    slug: 'lpu-reserve',
    event: '500 students press Book on the same lab slot at the same instant.',
    gate: 'EXCLUDE USING gist',
    first: { label: 'one of the 500', outcome: 'booked', passes: true },
    second: { label: 'the other 499', outcome: '499 refusals: SQLSTATE 23P01, translated to SlotUnavailable' },
    stamp: '23P01',
  },
  {
    slug: 'vulntrack',
    event: 'Two owners demote each other at the same moment.',
    gate: 'rosterVersion + 1',
    first: { label: 'owner A demotes B', outcome: 'committed', passes: true },
    second: { label: 'owner B demotes A', outcome: 'write conflict on the version field; on the retry B is no longer an owner, so the policy says no' },
    stamp: '403',
  },
  {
    slug: 'tenora',
    event: 'The payment provider delivers the same webhook twice.',
    gate: 'unique external_event_id',
    first: { label: 'delivery 1', outcome: 'stored and processed', passes: true },
    second: { label: 'delivery 2, same event', outcome: 'the unique index refuses the insert; the stored event is already processed, so nothing changes' },
    stamp: 'IntegrityError',
  },
  {
    slug: 'ai-interview-platform',
    event: 'Someone tries to make themselves an admin: once through the API, once straight to the database.',
    gate: 'requireRole, then RLS',
    first: { label: 'through the API', outcome: 'refused by requireRole', passes: false },
    second: { label: 'through Supabase REST', outcome: 'no update policy exists, so the update matches nothing' },
    stamp: '0 rows',
  },
];

/**
 * What `git log` on each main branch shows, 9 Sep to 4 Oct 2026. Counted, not
 * estimated: `git log --date=short --pretty=%ad | uniq -c` in each repository.
 */
export const HISTORY: RepoHistory[] = [
  {
    slug: 'tenora',
    days: { '2026-09-09': 6, '2026-09-12': 13, '2026-09-13': 1, '2026-09-15': 3, '2026-09-16': 11 },
    milestones: [
      { date: '2026-09-09', message: 'Initial public release of Tenora' },
      { date: '2026-09-12', message: 'feat: add operator control mutations and audit log' },
      { date: '2026-09-16', message: "fix: don't fail a Cashfree checkout on a concurrent idempotency conflict" },
    ],
  },
  {
    slug: 'ai-interview-platform',
    days: { '2026-09-11': 4, '2026-09-13': 1, '2026-09-15': 1 },
    milestones: [{ date: '2026-09-11', message: 'fix: close role-escalation vulnerability and harden demo/queue/upload paths' }],
    note: 'History restarts at a clean baseline on 11 Sep; the work began in August.',
  },
  {
    slug: 'vulntrack',
    days: { '2026-09-16': 3, '2026-09-17': 4, '2026-09-18': 1, '2026-09-22': 2, '2026-09-23': 1 },
    milestones: [
      { date: '2026-09-17', message: 'feat: implement organization and RBAC' },
      { date: '2026-09-23', message: 'feat: implement vulnerability matching' },
    ],
  },
  {
    slug: 'lpu-reserve',
    days: { '2026-09-30': 5, '2026-10-01': 34, '2026-10-02': 15, '2026-10-03': 8, '2026-10-04': 2 },
    milestones: [
      { date: '2026-09-30', message: 'Booking engine: atomic slot claims, domain services and the 500-attempt proof' },
      { date: '2026-10-01', message: 'Security QA: close the lockout race, Unicode-digit 500s and audit gaps' },
      { date: '2026-10-02', message: 'Nightly encrypted database backups to a private bucket' },
      { date: '2026-10-04', message: 'Landing: public landing page at / for signed-out visitors' },
    ],
  },
];

export const HISTORY_RANGE = { from: '2026-09-09', to: '2026-10-04' } as const;

export const HABITS: Habit[] = [
  {
    title: 'Let the database say no',
    evidence: 'Exclusion constraints, unique indexes, a version field, a dropped RLS policy.',
  },
  {
    title: 'Prove the race, then argue',
    evidence: '500 threads behind a barrier in LPU Reserve; zero owners in 3 of 3 runs without VulnTrack\'s lock.',
  },
  {
    title: 'Write the decision down',
    evidence: '12 ADRs in LPU Reserve; a spec per stage in Tenora, written before the code.',
  },
  {
    title: 'List the edges',
    evidence: 'docs/known-issues.md, "Status and known gaps", "Not in this phase".',
  },
  {
    title: 'Show up daily',
    evidence: '45 numbered posts in 56 days on Instagram, 21 Nov 2025 to 15 Jan 2026.',
  },
  {
    title: 'Study the misses',
    evidence: '"The reel that blew up wasn’t the lesson. The ones that didn’t were." (Post 35)',
  },
];

export const EDUCATION: EducationEntry[] = [
  {
    period: 'Aug 2023 - present',
    institution: 'Lovely Professional University',
    place: 'Phagwara, Punjab',
    qualification: 'B.Tech, Computer Science and Engineering',
    result: 'CGPA 7.1 / 10',
  },
  {
    period: 'Mar 2022',
    institution: 'Nav Bharti Sr. Sec. School',
    place: 'New Delhi',
    qualification: 'Intermediate (Class XII)',
    result: '75%',
  },
  {
    period: 'Mar 2021',
    institution: 'Mahavir Senior Model School',
    place: 'New Delhi',
    qualification: 'Matriculation (Class X)',
    result: '70%',
  },
];

export const TRAINING: Credential[] = [
  {
    date: 'Jul 2025',
    title: 'Data Structures & Algorithms',
    issuer: 'CipherSchools',
    note: 'A 70-hour program on arrays, stacks, queues, linked lists and trees, with complexity analysis.',
  },
];

export const CERTIFICATIONS: Credential[] = [
  { date: 'May 2026', title: 'The Bits and Bytes of Computer Networking', issuer: 'Google' },
  { date: 'Apr 2026', title: 'Master Generative AI & Generative AI Tools' },
  { date: 'Nov 2025', title: 'Privacy and Security in Online Social Media', issuer: 'NPTEL (Elite)' },
  { date: 'Oct 2024', title: 'Fundamentals of Network Communication', issuer: 'University of Colorado' },
];
