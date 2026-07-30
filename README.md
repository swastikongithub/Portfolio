# SWASTIK // Software Engineer • Backend Developer

[![Live Portfolio](https://img.shields.io/badge/Portfolio-Live_Edition-FF4D2D?style=for-the-badge&logo=react&logoColor=white)](#)
[![GitHub](https://img.shields.io/badge/GitHub-swastikongithub-111111?style=for-the-badge&logo=github&logoColor=white)](https://github.com/swastikongithub)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

> **"Architecting reliable backend systems and clean software solutions."**

An editorial, magazine-inspired developer portfolio built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Vite 8**. Designed with a brutalist yet polished aesthetic, this application emphasizes clarity, performance, and responsive interactive design—showcasing authentic backend case studies, distributed systems engineering, and secure software architectures.

---

## 🏛️ Featured Engineering Case Studies

The portfolio features deep-dive case studies into scalable backend systems and full-stack applications:

| # | Project | Subtitle | Key Technologies | Repository |
|---|---------|----------|------------------|------------|
| **01** | **[Email Scheduler](./src/data/portfolioData.ts)** | Distributed Job Scheduling & Queue Execution Engine | `Node.js`, `TypeScript`, `Redis`, `PostgreSQL`, `Docker` | [Email-Job-Scheduler](https://github.com/swastikongithub/Email-Job-Scheduler) |
| **02** | **[Secure File Management System](./src/data/portfolioData.ts)** | Cryptographic File Storage & Role-Based Access Control Platform | `Node.js`, `Express`, `PostgreSQL`, `Cryptography`, `Docker` | [Secure-File-Management-System](https://github.com/swastikongithub/Secure-File-Management-System) |
| **03** | **[University Event Management System](./src/data/portfolioData.ts)** | Campus-Wide Event Orchestration & Registration Portal | `Java`, `Spring Boot`, `MySQL`, `React`, `Tailwind CSS` | [University-Events-Management-System-LPU-](https://github.com/swastikongithub/University-Events-Management-System-LPU-) |

---

## ✨ Key Features & UX Highlights

- **📰 Magazine-Inspired Editorial UI**: High-contrast typography, crisp brutalist grid borders, oversized numbering, and deliberate spacing inspired by editorial print design.
- **⚡ High-Performance Micro-Animations**: Smooth scroll physics powered by **Lenis**, dynamic reveal animations with **GSAP 3**, and interactive component transitions using **Framer Motion**.
- **⌘ Command Palette (`Ctrl/Cmd + K`)**: Built-in keyboard-first navigation modal allowing quick jumps across case studies, skills, education milestones, and contact links.
- **🌗 Seamless Dark / Light Mode**: Dynamic theme switching with persistent local storage preferences and smooth background color transitions.
- **📱 Fully Responsive Layouts**: Carefully calibrated grid systems that adapt effortlessly from mobile screens to ultra-wide desktop displays.

---

## 🛠️ Tech Stack & Architecture

```
Frontend Core      : React 19 • TypeScript • React Router v7
Styling Engine     : Tailwind CSS v4 • Vanilla CSS Custom Properties
Animation & Scroll : Lenis Scroll • GSAP 3 • Framer Motion
Icons & UI         : Lucide React Icons
Build Tooling      : Vite 8 • ESLint 9
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites

Ensure you have **Node.js (v18 or above)** and **npm** installed on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/swastikongithub/Portfolio.git
cd Portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

The application will launch locally at `http://localhost:5173`.

### 4. Build for Production

To generate an optimized production bundle:

```bash
npm run build
```

To preview the built production bundle locally:

```bash
npm run preview
```

---

## 📂 Project Structure

```
Portfolio/
├── public/                 # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── layout/         # Navigation, Footer, CommandPalette, ScrollProgress, PageLoader
│   │   ├── pages/          # HomePage, ProjectDetailPage (Case Studies)
│   │   ├── sections/       # HeroSection, WorkSection, AboutSection, SkillsSection, BackgroundSection, ContactSection
│   │   └── ui/             # EditorialImage & reusable UI atoms
│   ├── data/
│   │   └── portfolioData.ts # Centralized content data store (Projects, Milestones, Skills, Info)
│   ├── hooks/              # Custom React hooks (useLenis, useCommandPalette, useTheme)
│   ├── types/              # TypeScript interfaces & domain models
│   ├── App.tsx             # Root application router & layout provider
│   ├── main.tsx            # React DOM entry point
│   └── index.css           # Design tokens, custom utilities, and global styles
├── index.html              # Entry HTML template
├── package.json            # Project dependencies & scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.js          # Vite bundler configuration
```

---

## 📬 Contact & Connect

- **GitHub**: [https://github.com/swastikongithub](https://github.com/swastikongithub)
- **LinkedIn**: [https://www.linkedin.com/in/swastiksin/](https://www.linkedin.com/in/swastiksin/)
- **Twitter / X**: [https://twitter.com/swastik_singh](https://twitter.com/swastik_singh)

---

<p align="center">
  <sub>Built with precision and editorial engineering by <strong>Swastik Singh</strong>.</sub>
</p>