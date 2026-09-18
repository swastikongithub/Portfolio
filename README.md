# Swastik Singh — Portfolio

Personal portfolio of Swastik Singh, a Computer Science and Engineering student at Lovely Professional
University. Live at **[portfolio-swastiksingh.vercel.app](https://portfolio-swastiksingh.vercel.app)**.

The site is set like a technical journal: a masthead cover, a table of contents that doubles as navigation,
and three case studies laid out as editorial spreads, each with a figure taken from the project's own code
or documentation.

| # | Case study | What it is | Source |
|---|---|---|---|
| 01 | VulnTrack | Multi-tenant vulnerability management platform (foundation phases) | [GitHub](https://github.com/swastikongithub/VulnTrack) |
| 02 | Tenora | Multi-tenant property billing SaaS | [GitHub](https://github.com/swastikongithub/Tenora) |
| 03 | AI Interview Platform | Role-based AI hiring platform | [GitHub](https://github.com/swastikongithub/AI-Interview-Platform) |

## Stack

- **React 19 + TypeScript + Vite**, React Router data router (`/`, `/projects/:slug`, 404)
- **Tailwind CSS v4** with CSS-variable design tokens (light and dark themes, plus an inverted plate)
- **GSAP + ScrollTrigger** for all choreography; **Lenis** as the single smooth-scroll engine, driven by
  GSAP's ticker
- No WebGL: the identity is typographic, and a canvas would not add meaning

## Content

All copy lives in `src/data/portfolioData.ts` (projects, toolkit, education, certifications, contact).
The résumé is served from `public/swastik-singh-resume.pdf`; replace that file to publish a new one.

## Motion and accessibility

- `prefers-reduced-motion: reduce` disables Lenis, scrubbed and entrance animation, and the page-turn
  transition. Content renders in its final state.
- Split headings keep an unsplit accessible string; links are never split.
- Command palette (`Ctrl/⌘ K`) is an accessible combobox. The mobile Index sheet traps focus and returns
  focus on close. `G` toggles the layout grid.
- `index.html` contains a static cover that is shown when JavaScript is unavailable.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint       # ESLint (TypeScript + React hooks)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build
```

`vercel.json` rewrites deep links such as `/projects/tenora` to the SPA.

## Contact

[swastiksingh288@gmail.com](mailto:swastiksingh288@gmail.com) ·
[GitHub](https://github.com/swastikongithub) ·
[LinkedIn](https://www.linkedin.com/in/swastiksin/) ·
[Instagram](https://www.instagram.com/swastik.mov/)
