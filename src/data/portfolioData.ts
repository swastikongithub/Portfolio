import { ProjectCaseStudy, Milestone, SkillGroup, NavigationItem } from '../types/portfolio';

export const PERSONAL_INFO = {
  name: "SWASTIK",
  fullName: "Swastik Singh",
  title: "Software Engineer • Backend Developer",
  tagline: "Architecting reliable backend systems and clean software solutions.",
  intro: "A computer science engineering student and backend developer obsessed with simplicity, system reliability, and elegant engineering. Focused on building scalable architectures, clean APIs, and thoughtful developer experiences without unnecessary complexity.",
  location: "India",
  email: "swastiksingh@example.com", // Realistic fallback email; user can replace
  github: "https://github.com/swastikongithub",
  linkedin: "https://linkedin.com/in/swastik-singh",
  twitter: "https://twitter.com/swastik_singh",
  resume: "/resume.pdf"
};

export const PROJECTS: ProjectCaseStudy[] = [
  {
    id: "email-scheduler",
    number: "01",
    title: "Email Scheduler",
    subtitle: "Distributed Job Scheduling & Queue Execution Engine",
    year: "2026",
    category: "Backend Architecture",
    summary: "A robust backend system designed for ReachInbox to schedule, queue, and dispatch high-volume email campaigns reliably with automatic retries and concurrency control.",
    problem: "Scheduling thousands of outbound emails across diverse timezones without exceeding SMTP provider rate limits, while guaranteeing zero-data-loss execution during server restarts or transient network outages.",
    architecture: "Built on an asynchronous worker-queue architecture where API servers enqueue scheduled jobs into Redis/PostgreSQL storage. Separate worker processes poll and execute ready jobs using idempotent delivery handlers.",
    architectureHighlights: [
      "Decoupled API ingestion layer from email dispatch workers",
      "Persistent job state tracking with exponential backoff for retries",
      "Rate-limiting middleware protecting downstream mail servers",
      "Idempotency keys preventing duplicate email transmissions"
    ],
    technologies: ["Node.js", "TypeScript", "Redis", "PostgreSQL", "Docker", "REST API"],
    features: [
      "Precision time-based job scheduling with cron and relative delays",
      "Automated retry mechanisms with configurable exponential backoff",
      "Real-time job lifecycle tracking (Scheduled, Processing, Sent, Failed)",
      "Containerized deployment environment for reproducible execution"
    ],
    challenges: [
      "Ensuring distributed worker lock acquisition without race conditions",
      "Handling graceful worker shutdown without dropping in-flight email tasks",
      "Designing clean REST endpoints for inspecting and cancelling scheduled queues"
    ],
    learnings: [
      "Deep understanding of distributed locking and queue semantics",
      "Importance of idempotency in network-dependent outbound services",
      "Designing observability around background task processors"
    ],
    githubUrl: "https://github.com/swastikongithub/Email-Job-Scheduler"
  },
  {
    id: "secure-file-system",
    number: "02",
    title: "Secure File Management System",
    subtitle: "Cryptographic File Storage & Role-Based Access Control Platform",
    year: "2024",
    category: "Security & Backend",
    summary: "A hardened backend file management solution featuring cryptographic storage, fine-grained access permissions, and immutable audit logs for enterprise data security.",
    problem: "Standard file servers lack verifiable access trails and fine-grained encryption controls, leaving sensitive organizational files vulnerable to unauthorized internal access.",
    architecture: "Encapsulates file ingestion with client-side/server-side encryption envelopes, storing encrypted blobs while maintaining metadata and ACL tables in relational storage.",
    architectureHighlights: [
      "Role-Based Access Control (RBAC) governing read, write, and audit privileges",
      "AES-256 cryptographic file processing prior to persistence",
      "Immutable access log records for forensic compliance verification",
      "Secure token-based download link generation with expiration limits"
    ],
    technologies: ["Node.js", "Express", "PostgreSQL", "Cryptography", "Docker"],
    features: [
      "Encrypted file storage and retrieval with integrity verification",
      "Granular permission delegation across user groups and departments",
      "Complete audit trail of file creation, download, and deletion events",
      "Containerized backend with hardened environment variable management"
    ],
    challenges: [
      "Managing cryptographic key rotation and secure initialization vectors",
      "Optimizing file streaming performance without loading large files into memory",
      "Designing clean authorization middleware that is both fast and comprehensive"
    ],
    learnings: [
      "Best practices for secure file I/O and buffer management in Node.js",
      "Implementing cryptographic primitives in production applications",
      "Designing tamper-resistant logging and RBAC hierarchies"
    ],
    githubUrl: "https://github.com/swastikongithub/Secure-File-Management-System"
  },
  {
    id: "university-event-system",
    number: "03",
    title: "University Event Management System",
    subtitle: "Campus-Wide Event Orchestration & Registration Portal",
    year: "2024",
    category: "Full-Stack Web App",
    summary: "A centralized campus event platform enabling student organizations to publish events, manage registrations, issue digital tickets, and track attendee analytics.",
    problem: "University event promotion relies on scattered social media posts and manual spreadsheets, leading to low student engagement and disorganized ticketing.",
    architecture: "Full-stack application utilizing Spring Boot backend REST APIs and a responsive React frontend, supported by MySQL relational schemas for attendee management.",
    architectureHighlights: [
      "Clean RESTful domain controllers for events, clubs, and registrations",
      "QR-code ticket generation and verification workflow",
      "Automated email confirmation notifications upon successful sign-up",
      "Responsive admin dashboard for club organizers and faculty advisors"
    ],
    technologies: ["Java", "Spring Boot", "MySQL", "React", "Tailwind CSS"],
    features: [
      "Event discovery feed with category filters and search",
      "One-click student event registration and attendance tracking",
      "Organizer portal for publishing events and viewing attendee rosters",
      "Role-based authentication for students, club leaders, and administrators"
    ],
    challenges: [
      "Handling concurrent seat reservations for limited-capacity workshops",
      "Designing intuitive responsive interfaces across mobile and desktop devices",
      "Ensuring clean foreign-key relationships between students, clubs, and events"
    ],
    learnings: [
      "Full-stack integration patterns between React and Spring Boot APIs",
      "Practical database normalization and indexing in MySQL",
      "Building accessible web interfaces for diverse student communities"
    ],
    githubUrl: "https://github.com/swastikongithub/University-Events-Management-System-LPU-"
  }
];

export const MILESTONES: Milestone[] = [
  {
    id: "edu-cse",
    year: "2022 — PRES",
    title: "B.Tech in Computer Science & Engineering",
    organization: "University Engineering Program",
    description: "Specializing in Backend Engineering, Distributed Systems, Operating Systems, and Data Structures & Algorithms. Maintained consistent academic excellence while leading technical initiatives.",
    category: "Education",
    highlight: "System Architecture Focus"
  },
  {
    id: "achieve-hackathon",
    year: "2024",
    title: "National Technical Problem Solving",
    organization: "University & Inter-College Competitions",
    description: "Demonstrated advanced algorithmic problem solving and backend API design across multiple hackathons and software engineering coding challenges.",
    category: "Achievement",
    highlight: "Problem Solving"
  },
  {
    id: "cert-web",
    year: "2024",
    title: "Web Development Fundamentals & System Design",
    organization: "Coursera & Advanced Engineering Studies",
    description: "Completed rigorous coursework in full-stack web development, REST API design, database normalization, and secure system communication.",
    category: "Certification",
    highlight: "Verified Skillset"
  }
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: "Backend",
    skills: ["Java", "Spring Boot", "Node.js", "Express", "Python", "RESTful APIs", "Microservices"]
  },
  {
    category: "Cloud & DevOps",
    skills: ["AWS", "Docker", "Git", "Linux", "CI/CD Pipelines", "Containerization"]
  },
  {
    category: "Database & Storage",
    skills: ["PostgreSQL", "Redis", "MySQL", "MongoDB", "SQL Optimization"]
  },
  {
    category: "Frontend & Core",
    skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript", "HTML5 / CSS3", "System Design"]
  }
];

export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: "WORK", href: "#work" },
  { label: "ABOUT", href: "#about" },
  { label: "SKILLS", href: "#skills" },
  { label: "BACKGROUND", href: "#background" },
  { label: "CONTACT", href: "#contact" },
  { label: "RESUME", href: "/resume.pdf", isExternal: true }
];
