# Swastik Singh — Portfolio

Personal portfolio of Swastik Singh, a Computer Science and Engineering student at Lovely Professional
University. Live at **[portfolio-swastiksingh.vercel.app](https://portfolio-swastiksingh.vercel.app)**.

The thesis is *everything works once*: each project is built around one guarantee that has to survive the
second time something happens, and each guarantee is enforced in the database.

| Case study | The guarantee | Source |
|---|---|---|
| LPU Reserve | One slot holds one booking (PostgreSQL exclusion constraints, 500 concurrent attempts → 1 booking in CI) | [GitHub](https://github.com/swastikongithub/Django-EduRev-P20) |
| VulnTrack | An organization never loses its last owner (roster version field, NVD/OSV ingestion, matching) | [GitHub](https://github.com/swastikongithub/VulnTrack) |
| Tenora | A webhook changes state once (unique external event id, legal-transition table) | [GitHub](https://github.com/swastikongithub/Tenora) |
| AI Interview Platform | Nobody can make themselves an admin (RLS policy fix, BullMQ resume pipeline) | [GitHub](https://github.com/swastikongithub/AI-Interview-Platform) |

## Structure

- **Home** tells one story, in chapters:
  1. *The claim*: a live 3D run of LPU Reserve's concurrency test converging on the full stop of the headline.
  2. *The dive* through that slot into a dark stage.
  3. *Everything happens twice*: the headline duplicates and the copy is refused. Then each system meets its
     duplicate on one wire, with the project's real answer (`23P01`, the last-owner refusal, `IntegrityError`, 0 rows).
  4. *Four systems*: the pinned work explorer.
  5. *The record*: a git graph of all 115 commits on the four main branches (9 Sep to 4 Oct 2026). It
     scrolls past a playhead while a counter adds them up.
  6. *swastik.mov*, the second craft, in the palette and type of the reels themselves (a warm room after dark,
     Anton and Instrument Serif):
     - **The cut**: "Everything works once." is struck through, then *except on camera*. A slate counts takes up
       to the question on Post 25, next to that reel.
     - **The edit**: all 56 posts in the order they were made, as an editing timeline. A picture track holds the
       covers and a second track's bars are views. Scrolling moves the playhead and the monitor shows the clip
       under it.
     - **Ten of the most watched**: a treemap where each tile's area is its view count, with silent previews. One
       political reel stays in the archive but is not featured.
     - **One calendar, two crafts**: every post and every commit since Nov 2025, one square per day.
  7. *Who made it*: a portrait, a photo from the Himachal trip, and habits from both crafts that tick in as checks.
  8. *Write to me*.
- **Case studies** (`/projects/:slug`) are the deep layer: a scroll-driven scene of the mechanism, a
  hands-on figure, the problem, what was built, the story, the request path, decisions, safeguards, known
  limits and the stack. They are lazy-loaded.

## Stack

- **React 19 + TypeScript + Vite**, React Router data router (`/`, lazy `/projects/:slug`, 404)
- **Tailwind CSS v4** with CSS-variable tokens (light, dark, and a fixed dark "stage")
- **GSAP + ScrollTrigger** (plus ScrambleText, Text and MotionPath) for choreography; **Lenis** as the single
  smooth-scroll engine, driven by GSAP's ticker
- **Three.js** for one WebGL subsystem, the *instrument* (`src/lib/instrument/`)

## The instrument (WebGL)

One renderer, one canvas, one scene. The canvas is moved into whichever host is on screen (the hero or the
work explorer) and aimed at a DOM anchor, so 3D systems can converge on a DOM element. Four modes abstract a
real mechanism from each project: `race` (exclusion constraint as a rippling membrane), `boundary` (tenant
volume that turns outsiders away), `dedupe` (twin events, the second refused at a unique index) and
`pipeline` (resume stations, re-uploads leave at the hash).

- One instanced draw for all agents; positions are closed-form functions of time and a seed (deterministic)
- Renders only while something moves; paused offscreen and in hidden tabs; disposed on unmount
- DPR capped (1.5 on phones, 2 elsewhere); phones get a scaled-down composition
- Three.js is a separate chunk loaded after first paint
- `prefers-reduced-motion`: a single static frame, no pointer motion, no pinning
- No WebGL: the explorer becomes a plain list with the same words; the hero shows the final counts

## Pointer and touch (the interaction language)

The pointer is one more client of the system, not a decorative cursor. One **pointer field**
(`src/lib/interaction/pointerField.ts`) listens passively on the window, reads only event coordinates
(coalesced events for velocity), and classifies clicks into impulses: click, double, stampede (rapid
clicks). Clicks on links, buttons or text selections are never impulses: the control wins.

| Input | Response |
|---|---|
| slow movement | presses a dimple into the membrane; agents nearby are pushed aside and settle back |
| fast movement | a directional wake trails the pointer across the membrane |
| over a control | the field goes quiet; the control leans toward the pointer (`[data-magnetic]`) |
| near project navigation | the index anticipates the pointer (`useProximity`, `--near`) |
| click / tap on a system | sends your own request, with a real outcome per project: refused `23P01` (LPU Reserve), `404` (VulnTrack), stored or duplicate (Tenora), queued or same file (AI Interview) |
| double click | a sharper shockwave |
| stampede | concurrent requests and an interference pattern; still one booking |
| mode change | a transition wave crosses the membrane |

Outcomes appear as a short label at the 3D impact point (`ImpactLabels`) and in a polite live region.
Every number (radius, viscosity, ripple amplitude and frequency, impulse strength, smoothing, quality
tiers) lives in `src/lib/interaction/config.ts`. Touch gets taps only (no drag capture, scrolling is
untouched); reduced motion turns the field off; without WebGL nothing is drawn and the DOM layout stands
on its own.

## Reels and media

`src/data/reels.ts` holds every post on the public grid of instagram.com/swastik.mov as read on 4 Oct 2026. Dates
come from post timestamps, views from the Reels tab that day, and captions are first lines in the author's words.
Media lives in `public/media/reels/`:

- `covers/` and `thumbs/`: WebP covers for all 56 posts (about 1.5 MB together)
- `<code>.preview.mp4`: six-second silent loops for the ten featured reels (about 210 KB each)
- `<code>.mp4`: those ten reels in full, with sound, re-encoded to 960px H.264 (about 20 MB together)

Nothing downloads until it can be seen. A preview gets its source only when it nears the viewport and is asked
to play. Full reels load only when someone opens the player, an accessible dialog with Escape, arrow keys and
focus return. Reduced motion and Save-Data keep every preview as a still cover.

## The cursor

On fine pointers with motion allowed, the cursor is a precise dot plus a ring with a little mass that
stretches along its velocity (`src/components/layout/Cursor.tsx`, tuning in `interaction/config.ts`).
Over a control the ring locks onto its box as four signal brackets. Over running text it becomes an
I-beam. Over a live system (`[data-cursor]`) it opens into a crosshair and says what a click sends
("click: one more attempt", "click: deliver an event"). A click leaves a ring behind. Text fields
keep the native cursor. Touch devices and reduced motion keep the system cursor entirely.

## Content

All copy lives in `src/data/portfolioData.ts` (including `SECOND_TIMES` and `HISTORY`, the commit counts per day from each repository's `git log`); project facts were audited against each project's local
source and docs, and every number names the file it comes from. The resume is served from
`public/swastik-singh-resume.pdf`.

## Accessibility

Semantic headings and landmarks; every canvas is decorative with the information repeated in text (the
explorer's legend describes what each visual shows). Split headings keep an unsplit accessible string.
The command palette (`Ctrl/⌘ K`) is an accessible combobox, the mobile menu traps and returns focus, and
reduced motion gets a complete, static experience.

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
