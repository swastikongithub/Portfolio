export type ProjectSlug = 'lpu-reserve' | 'vulntrack' | 'tenora' | 'ai-interview-platform';

/** Which interactive system figure (built from the project's real code) a project shows. */
export type ProjectFigure = 'ledger' | 'boundary' | 'state-machine' | 'other-door';

export interface Decision {
  title: string;
  body: string;
}

export interface ArchitectureLayer {
  name: string;
  detail: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

/** A number that can be traced to a file in the project. */
export interface Fact {
  value: string;
  label: string;
  /** Where the number comes from (file, test or document). */
  source: string;
}

export interface ProjectCaseStudy {
  slug: ProjectSlug;
  title: string;
  kind: string;
  period: string;
  status: string;
  /** The sentence the system is built to keep true. */
  invariant: string;
  /** How it is enforced, in the project's own terms (shown in mono). */
  mechanism: string;
  /** What "happens twice" in this system: the situation the invariant survives. */
  twice: string;
  /** One-sentence standfirst under the title. */
  deck: string;
  /** Short summary for the command palette and metadata. */
  summary: string;
  problem: string;
  /** The strongest pieces of work, shown on the home chapter. */
  built: string[];
  /** The one story worth telling in full. */
  story: Decision;
  architecture: { intro: string; layers: ArchitectureLayer[] };
  decisions: Decision[];
  safeguards: string[];
  /** What is deliberately not built yet, or known gaps. */
  limits: string[];
  facts: Fact[];
  /** Index into `facts` of the one number shown on the home page. */
  homeFact: number;
  stack: StackGroup[];
  stackShort: string[];
  links: { source: string; live?: string; liveNote?: string };
  figure: ProjectFigure;
  figureCaption: string;
}

export interface EducationEntry {
  period: string;
  institution: string;
  place: string;
  qualification: string;
  result?: string;
}

export interface Credential {
  date: string;
  title: string;
  issuer?: string;
  note?: string;
}

export interface SectionLink {
  id: string;
  label: string;
}

export interface Habit {
  title: string;
  /** A real file or practice that shows it. */
  evidence: string;
}

/** One repository's commits on its main branch, per day (from `git log`). */
export interface RepoHistory {
  slug: ProjectSlug;
  /** ISO date → commits that day. */
  days: Record<string, number>;
  /** Commit subjects worth reading, verbatim, keyed by the day they landed. */
  milestones: { date: string; message: string }[];
  /** Context a reader needs to read the lane honestly. */
  note?: string;
}

/** "The second time" scene for one project: the duplicate, and what the system does with each copy. */
export interface SecondTime {
  slug: ProjectSlug;
  /** What happens twice, as a sentence. */
  event: string;
  /** The guard both copies hit, in the project's own terms (short, mono). */
  gate: string;
  first: { label: string; outcome: string; passes: boolean };
  second: { label: string; outcome: string };
}
