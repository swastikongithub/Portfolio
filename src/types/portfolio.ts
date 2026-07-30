export interface ProjectCaseStudy {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  problem: string;
  architecture: string;
  architectureHighlights: string[];
  technologies: string[];
  features: string[];
  challenges: string[];
  learnings: string[];
  githubUrl?: string;
  liveUrl?: string;
  year: string;
  category: string;
}

export type MilestoneCategory = 'Education' | 'Patent' | 'Achievement' | 'Certification';

export interface Milestone {
  id: string;
  year: string;
  title: string;
  organization: string;
  description: string;
  category: MilestoneCategory;
  highlight?: string;
}

export type SkillCategory = 'Backend' | 'Cloud & DevOps' | 'Database & Storage' | 'Frontend & Core';

export interface SkillGroup {
  category: SkillCategory;
  skills: string[];
}

export interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
}
