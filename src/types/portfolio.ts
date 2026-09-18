export type ProjectSlug = 'vulntrack' | 'tenora' | 'ai-interview-platform';

/** Which data figure (drawn from the project's real code/docs) a project shows. */
export type ProjectFigure = 'permission-matrix' | 'money-flows' | 'resume-pipeline';

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

export interface ProjectCaseStudy {
  slug: ProjectSlug;
  number: string;
  title: string;
  kind: string;
  period: string;
  status: string;
  /** One-sentence standfirst, shown under the title. */
  deck: string;
  /** Short summary for the command palette, contents and metadata. */
  summary: string;
  problem: string;
  /** The 3–4 strongest pieces of work, shown on the home page spread. */
  built: string[];
  /** The one decision featured on the home page. */
  keyDecision: Decision;
  architecture: { intro: string; layers: ArchitectureLayer[] };
  decisions: Decision[];
  safeguards: string[];
  /** What is deliberately not built yet, or known gaps. */
  scope: string[];
  stack: StackGroup[];
  stackShort: string[];
  links: { source: string; live?: string; liveNote?: string };
  figure: ProjectFigure;
  figureCaption: string;
  /** Spread composition on the home page, varied so the three don't repeat. */
  layout: 'figure-right' | 'figure-left' | 'figure-wide';
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

export interface ToolEntry {
  name: string;
  /** Case-study numbers the tool was used in; empty = from CV/coursework. */
  usedIn: string[];
}

export interface ToolGroup {
  discipline: string;
  tools: ToolEntry[];
}

export interface SectionLink {
  id: string;
  number: string;
  label: string;
}
