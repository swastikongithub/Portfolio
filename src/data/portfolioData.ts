import type {
  Credential,
  EducationEntry,
  ProjectCaseStudy,
  SectionLink,
  ToolGroup,
} from '../types/portfolio';

/**
 * Single source of truth for the site's content.
 *
 * Project facts come from the local source code and documentation of each
 * project; education, certifications and skills from the CV dated 18 Sep 2026.
 * To publish a new résumé, replace `public/swastik-singh-resume.pdf`
 * (or point `resume` below at a new file).
 */
export const PERSONAL_INFO = {
  name: 'Swastik Singh',
  firstName: 'Swastik',
  lastName: 'Singh',
  role: 'Software Engineer',
  headline: 'I build the parts of software that have to be right.',
  location: 'India',
  email: 'swastiksingh288@gmail.com',
  github: 'https://github.com/swastikongithub',
  linkedin: 'https://www.linkedin.com/in/swastiksin/',
  instagram: 'https://www.instagram.com/swastik.mov/',
  portfolio: 'https://portfolio-swastiksingh.vercel.app',
  resume: '/swastik-singh-resume.pdf',
  resumeUpdated: '18 Sep 2026',
  availability: 'Open to internships and software engineering roles.',
} as const;

export const SECTIONS: SectionLink[] = [
  { id: 'work', number: '01', label: 'Work' },
  { id: 'about', number: '02', label: 'About' },
  { id: 'toolkit', number: '03', label: 'Toolkit' },
  { id: 'record', number: '04', label: 'Record' },
  { id: 'contact', number: '05', label: 'Contact' },
];

export const PROJECTS: ProjectCaseStudy[] = [
  {
    slug: 'vulntrack',
    number: '01',
    title: 'VulnTrack',
    kind: 'Vulnerability management platform',
    period: 'Sep 2026 — Present',
    status: 'In development · foundation phases shipped',
    deck: 'The foundation of a multi-tenant vulnerability management platform: session security, organization-scoped access control, and an inventory modelled so advisories can be matched against it later.',
    summary:
      'Session-based auth, five-role RBAC across organizations, and an asset and software inventory normalized into Package URL identities.',
    problem:
      'A vulnerability platform is only as trustworthy as its answers to two questions: exactly what does this organization run, and who is allowed to see or change it? Before any CVE feed or scanner is worth adding, identity, tenant boundaries and the inventory have to be correct — so that is what I built first.',
    built: [
      'Session authentication: opaque 256-bit session IDs in httpOnly cookies, stored only as SHA-256 digests, with Argon2id passwords, idle and absolute expiry, and revocation of every session on password reset.',
      'Multi-tenant organizations with five roles and one central permission map. Non-members get a 404 for any organization, so the API never confirms that one exists.',
      'An organization-scoped asset inventory with typed, normalized identifiers (URL, hostname, IP/CIDR, repository, container image) and optimistic concurrency on every edit.',
      'A software inventory that normalizes npm, PyPI, Maven, Go and other packages into Package URL (purl) identities — the key vulnerability databases such as OSV use.',
    ],
    keyDecision: {
      title: 'The last owner, under a race',
      body: 'Two owners demoting each other at the same moment could both commit under MongoDB snapshot isolation, leaving an organization with no owner. Every roster change now writes to one shared version field on the organization, so concurrent transactions conflict and one retries; the policy is re-checked inside the transaction. The documented negative control: with that write removed, the concurrent test ended with zero owners in 3 of 3 runs.',
    },
    architecture: {
      intro:
        'An Express 5 API over MongoDB (a replica set, because signup, password reset and roster changes are multi-document transactions), with a React client. Every organization route runs the same chain before a controller sees the request.',
      layers: [
        { name: 'requireAuth', detail: 'Resolves the session from the cookie digest; rejects expired, idle, unverified, disabled, or pre-password-change sessions.' },
        { name: 'requireMembership', detail: 'Resolves the organization from the URL plus an active membership. Anything else is a 404.' },
        { name: 'requirePermission', detail: 'Checks the role against the central permission map. Default deny; denied writes are audited.' },
        { name: 'validate', detail: 'Zod schemas admit only primitives, strip unknown keys, and drop server-owned fields.' },
        { name: 'service', detail: 'Domain rules, hierarchy checks, transactions, audit events — all queries scoped by organization.' },
      ],
    },
    decisions: [
      {
        title: 'Server-side sessions instead of JWTs',
        body: 'The platform will hold security data for many organizations, so revocation has to be immediate. Opaque session IDs referenced by an httpOnly cookie make logout and password reset a row deletion. The trade-off is CSRF exposure, handled with an exact Origin allowlist, SameSite=Lax cookies and JSON-only request bodies.',
      },
      {
        title: 'The last owner, under a race',
        body: 'Owners can only be demoted by other owners, so a single change always leaves one behind — but two concurrent changes could each see the other as still an owner. A version field every roster transaction writes forces a write conflict; the transaction re-reads both memberships, re-evaluates the policy, and asserts the owner count afterwards.',
      },
      {
        title: 'Identity before matching',
        body: 'Software components are stored with an ecosystem-aware normalized name and version plus a derived purl. Normalization only removes differences the ecosystem itself ignores — PyPI case and separators, npm case, a SemVer "v" — and rejects anything it would have to guess, so later matching can join on exact keys.',
      },
      {
        title: '404, not 403',
        body: 'Cross-tenant, unknown and malformed IDs all return the same 404. A 403 would confirm that another organization’s asset exists.',
      },
    ],
    safeguards: [
      'Enumeration-safe signup, reset and resend responses; a dummy Argon2 verification equalizes timing for unknown accounts.',
      'Rate limits per IP and per account, including accounts that do not exist.',
      'One-time tokens are 256-bit, purpose-bound, single-use and stored only as digests.',
      'Audit log entries for authentication events, every inventory change and denied writes; the logger redacts secrets.',
      'API tests run against an in-memory MongoDB replica set: IDOR attempts, privilege escalation, CSRF, concurrency and rate limits (164 tests per the current CV).',
    ],
    scope: [
      'Not built yet: CVE/advisory ingestion, matching, findings, remediation and scanning. The data model reserves the hooks those phases need.',
      'No MFA or session-management UI yet; audit logs are append-only by convention rather than enforced by the database.',
    ],
    stack: [
      { group: 'API', items: ['Node.js 22', 'Express 5', 'Zod', 'Argon2id', 'Pino'] },
      { group: 'Data', items: ['MongoDB (replica set)', 'Mongoose'] },
      { group: 'Client', items: ['React 19', 'Vite', 'Tailwind CSS', 'GSAP'] },
      { group: 'Quality', items: ['Vitest', 'Supertest', 'mongodb-memory-server', 'Docker Compose'] },
    ],
    stackShort: ['Node.js', 'Express', 'MongoDB', 'React', 'Zod', 'Vitest'],
    links: { source: 'https://github.com/swastikongithub/VulnTrack' },
    figure: 'permission-matrix',
    figureCaption: 'Permission matrix — excerpt from the central role map (server/src/config/roles.js).',
    layout: 'figure-right',
  },
  {
    slug: 'tenora',
    number: '02',
    title: 'Tenora',
    kind: 'Multi-tenant property billing SaaS',
    period: 'Sep 2026 — Present',
    status: 'Deployed on Render · in development',
    deck: 'Workspaces, leases, meters and monthly bills for property owners — plus online payments from residents and Tenora’s own subscriptions, built around tenant isolation, idempotency and webhook-driven state.',
    summary:
      'A Django REST Framework SaaS where webhooks are the authority, idempotency is a database constraint, and two money flows never share code.',
    problem:
      'Tenora moves money in two directions: residents pay property owners, and owners pay Tenora. Both are driven by a payment provider whose webhooks can arrive twice, late or out of order — and neither flow may leak across workspaces or trust an amount the browser sent.',
    built: [
      'Tenant resolution in a DRF authentication class from the X-Tenant-ID header plus an active membership — never from a request body. Cross-tenant requests return 404.',
      'A monthly billing cycle: draft bills from leases, meter readings and the tariff in force, then review and publish. Issued bills are immutable; they change only through visible corrections. Money is integer minor units end to end.',
      'Cashfree webhooks behind provider-neutral gateway adapters: raw-body signature checks, and subscription changes only through an explicit state-transition table under row locks.',
      'Celery/Redis sweeps for webhook retries, reminders and reconciliation, guarded by PostgreSQL advisory locks so runs never overlap.',
    ],
    keyDecision: {
      title: 'Idempotency is a constraint, not a check',
      body: 'Webhook de-duplication is a unique index on the provider’s delivery ID (or a digest of the verified body); one open checkout per bill, one payment per capture and one subscription per workspace are unique constraints too. A duplicate delivery hits the database, not an if-statement that two workers can pass at once.',
    },
    architecture: {
      intro:
        'A Django 5 / DRF API on PostgreSQL, Celery workers on Redis, and a React + TypeScript client, packaged with Docker Compose. The two financial domains live in separate apps with separate gateway seams.',
      layers: [
        { name: 'apps.tenants', detail: 'Workspaces, memberships, invitations, plan limits, capability-based authorization.' },
        { name: 'apps.properties', detail: 'Properties, units, leases, meters, tariffs, billing cycles, bills, payments, receipts, resident payments.' },
        { name: 'apps.billing', detail: 'Tenora’s own subscriptions: plans, checkout, webhooks, reconciliation.' },
        { name: 'apps.platform', detail: 'Staff-only operator control plane with an audit log.' },
        { name: 'Celery beat + worker', detail: 'Webhook retry sweep, reminders, reconciliation — each under an advisory lock.' },
      ],
    },
    decisions: [
      {
        title: 'Two financial domains that never import each other',
        body: 'Owner → Tenora subscriptions and resident → owner bill payments share a vendor and nothing else: different API families, credentials, webhook routes and gateway seams. A change to one cannot quietly alter the other.',
      },
      {
        title: 'Idempotency is a constraint, not a check',
        body: 'Duplicate deliveries are rejected by unique indexes. IntegrityError is caught outside the atomic() block that raised it, because PostgreSQL marks the transaction broken otherwise.',
      },
      {
        title: 'Webhooks are the authority',
        body: 'Signatures are verified on the raw body before anything is parsed. A local subscription is never created from what the client reports — only a verified webhook creates or changes it, through a legal-transition table where CANCELED is terminal.',
      },
      {
        title: 'Fail closed',
        body: 'An unreachable provider or an unrecognized status means “unknown”, never “safe to discard”. Downgrades are refused because no proration semantics have been designed; an upgrade applies only when the new mandate’s webhook activates it.',
      },
    ],
    safeguards: [
      'The browser never supplies an amount or an outcome; only a verified capture settles a bill, through the same path as an offline payment.',
      'Plan limits on workspaces and seats are enforced under row locks; pending invitations reserve a seat.',
      'Concurrency guarantees are tested with real threads on real database connections.',
      'No card data is stored; credentials live only in the environment and are never logged.',
    ],
    scope: [
      'Render’s free tier runs no Celery worker, so scheduled jobs run through management commands in production.',
      'Known defects are listed in the README rather than hidden, including a late subscription period start.',
    ],
    stack: [
      { group: 'API', items: ['Python 3.12', 'Django 5', 'Django REST Framework', 'SimpleJWT'] },
      { group: 'Data & jobs', items: ['PostgreSQL', 'Celery', 'Redis'] },
      { group: 'Payments', items: ['Cashfree Payment Gateway', 'Cashfree Subscriptions'] },
      { group: 'Client & ops', items: ['React 19', 'TypeScript', 'TanStack Query', 'Vitest + MSW', 'Docker Compose'] },
    ],
    stackShort: ['Django REST Framework', 'PostgreSQL', 'Celery', 'Redis', 'React', 'TypeScript'],
    links: {
      source: 'https://github.com/swastikongithub/Tenora',
      live: 'https://tenora-frontend.onrender.com',
      liveNote: 'Free-tier hosting — the first request after idling can take ~30s.',
    },
    figure: 'money-flows',
    figureCaption: 'Two money flows, kept apart down to the database table — from the project README.',
    layout: 'figure-left',
  },
  {
    slug: 'ai-interview-platform',
    number: '03',
    title: 'AI Interview Platform',
    kind: 'Role-based AI hiring platform',
    period: 'Aug 2026 — Present',
    status: 'In development',
    deck: 'A four-role hiring platform where resume analysis runs as a background job, AI output is validated like any untrusted input, and Postgres row-level security is the last line of authorization.',
    summary:
      'A TypeScript monorepo with a BullMQ resume pipeline, schema-constrained Gemini output, and row-level security on the Supabase schema.',
    problem:
      'Hiring data is sensitive and has many readers: candidates may only see their own records, interviewers only what they are assigned. AI calls are slow and fallible — they cannot sit in a request path, and their output cannot be trusted to be well-formed.',
    built: [
      'A four-role platform — candidate, recruiter, interviewer, admin — as a TypeScript monorepo: an Express REST API with Supabase Auth JWTs, Zod validation and rate limiting, plus role-guarded React routes.',
      'A resume pipeline on BullMQ and Redis: uploads are hashed, and job IDs are derived from the user and the file hash so the same file is never processed twice.',
      'Google Gemini returns schema-constrained JSON (profile, ATS score, keyword gaps) that is validated again with Zod before it touches the database.',
      'Row-level security on the Supabase PostgreSQL schema, and interview start logic that locks the row and validates the state transition in the database.',
    ],
    keyDecision: {
      title: 'Closing a privilege-escalation path',
      body: 'The original update policy on the users table had no WITH CHECK clause, so Postgres reused its USING clause: it checked which row was updated, never what changed. Any signed-in user could call the Supabase REST API directly and set their own role to admin. A migration removed the policy, since no product flow needs users to update that table themselves.',
    },
    architecture: {
      intro:
        'A React + TypeScript client and an Express + TypeScript API over Supabase (Postgres, Auth, RLS), with a BullMQ worker on Redis for AI work. The API checks roles and ownership; RLS enforces the same rules at the database.',
      layers: [
        { name: 'React client', detail: 'Role dashboards behind a RoleGuard; TanStack Query for server state.' },
        { name: 'Express API', detail: 'Supabase JWT verification, requireRole, Zod request schemas, rate limiting, request IDs.' },
        { name: 'BullMQ worker', detail: 'Parses PDFs and calls Gemini outside the request path, two jobs at a time.' },
        { name: 'Supabase Postgres', detail: 'Row-level security on every table; status enums and transition functions for interviews.' },
      ],
    },
    decisions: [
      {
        title: 'Closing a privilege-escalation path',
        body: 'Migration 0003 drops an RLS update policy that let any authenticated user rewrite their own role through the REST API. Role changes are admin-only actions performed by the backend with the service-role client.',
      },
      {
        title: 'Job IDs scoped to the user',
        body: 'Deterministic job IDs make re-uploads idempotent — but two users uploading the same template résumé would collide onto one job and strand one profile in “processing”. IDs are resume-{user}-{hash}.',
      },
      {
        title: 'AI output is untrusted input',
        body: 'Gemini is called with a response schema and the result is validated with Zod. On failure the profile moves to a “failed” state, keeps every manually entered field, and can be reprocessed.',
      },
      {
        title: 'Transitions in the database',
        body: 'Starting an interview locks its row (SELECT … FOR UPDATE) and rejects anything not in the ready state; a partial unique index allows only one active or completed session per interview.',
      },
    ],
    safeguards: [
      'Uploads are PDF-only with a 5 MB limit; an unchanged file returns the existing report without new AI calls.',
      'API ownership checks mirror RLS: another candidate’s interview returns the same 404 the database would.',
      'Tests cover authentication, RLS, the résumé/ATS pipeline and the interview domain with Vitest and Supertest.',
    ],
    scope: [
      'AI is used for résumé extraction and ATS reports; interview evaluation scores are entered by interviewers.',
      'Practice interviews currently use a fixed question set.',
    ],
    stack: [
      { group: 'API', items: ['TypeScript', 'Node.js', 'Express', 'Zod'] },
      { group: 'Data & jobs', items: ['Supabase (Postgres, Auth, RLS)', 'BullMQ', 'Redis'] },
      { group: 'AI', items: ['Google Gemini API', 'pdf-parse'] },
      { group: 'Client & quality', items: ['React', 'TanStack Query', 'Tailwind CSS', 'Vitest', 'Supertest', 'Docker'] },
    ],
    stackShort: ['TypeScript', 'Express', 'Supabase', 'BullMQ', 'Gemini', 'React'],
    links: { source: 'https://github.com/swastikongithub/AI-Interview-Platform' },
    figure: 'resume-pipeline',
    figureCaption: 'The résumé pipeline, stage by stage — from the upload route and queue service.',
    layout: 'figure-wide',
  },
];

export const getProject = (slug: string | undefined) => PROJECTS.find((p) => p.slug === slug);

export const TOOL_GROUPS: ToolGroup[] = [
  {
    discipline: 'Languages',
    tools: [
      { name: 'TypeScript', usedIn: ['02', '03'] },
      { name: 'JavaScript', usedIn: ['01'] },
      { name: 'Python', usedIn: ['02'] },
      { name: 'SQL', usedIn: ['02', '03'] },
      { name: 'Java', usedIn: [] },
      { name: 'C++', usedIn: [] },
    ],
  },
  {
    discipline: 'Backend',
    tools: [
      { name: 'Node.js', usedIn: ['01', '03'] },
      { name: 'Express', usedIn: ['01', '03'] },
      { name: 'Django REST Framework', usedIn: ['02'] },
      { name: 'Celery', usedIn: ['02'] },
      { name: 'BullMQ', usedIn: ['03'] },
      { name: 'Spring Boot', usedIn: [] },
      { name: 'Socket.IO', usedIn: [] },
    ],
  },
  {
    discipline: 'Data',
    tools: [
      { name: 'PostgreSQL', usedIn: ['02', '03'] },
      { name: 'MongoDB', usedIn: ['01'] },
      { name: 'Redis', usedIn: ['02', '03'] },
      { name: 'Supabase', usedIn: ['03'] },
      { name: 'MySQL', usedIn: [] },
    ],
  },
  {
    discipline: 'Frontend',
    tools: [
      { name: 'React', usedIn: ['01', '02', '03'] },
      { name: 'Tailwind CSS', usedIn: ['01', '03'] },
      { name: 'Next.js', usedIn: [] },
    ],
  },
  {
    discipline: 'Practice',
    tools: [
      { name: 'Session & JWT auth', usedIn: ['01', '02', '03'] },
      { name: 'RBAC & multi-tenancy', usedIn: ['01', '02'] },
      { name: 'Row Level Security', usedIn: ['03'] },
      { name: 'Webhooks & idempotency', usedIn: ['02'] },
      { name: 'Job queues', usedIn: ['02', '03'] },
    ],
  },
  {
    discipline: 'Tooling',
    tools: [
      { name: 'Vitest', usedIn: ['01', '02', '03'] },
      { name: 'Docker', usedIn: ['01', '02', '03'] },
      { name: 'Google Gemini API', usedIn: ['03'] },
      { name: 'Git & GitHub', usedIn: [] },
      { name: 'Postman', usedIn: [] },
    ],
  },
];

export const EDUCATION: EducationEntry[] = [
  {
    period: 'Aug 2023 — Present',
    institution: 'Lovely Professional University',
    place: 'Phagwara, Punjab',
    qualification: 'Bachelor of Technology, Computer Science and Engineering',
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
    note: '70-hour program: arrays, stacks, queues, linked lists and trees, with complexity analysis.',
  },
];

export const CERTIFICATIONS: Credential[] = [
  { date: 'May 2026', title: 'The Bits and Bytes of Computer Networking', issuer: 'Google' },
  { date: 'Apr 2026', title: 'Master Generative AI & Generative AI Tools' },
  { date: 'Nov 2025', title: 'Privacy and Security in Online Social Media', issuer: 'NPTEL (Elite)' },
  { date: 'Oct 2024', title: 'Fundamentals of Network Communication', issuer: 'University of Colorado' },
];
