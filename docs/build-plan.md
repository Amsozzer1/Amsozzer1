# amsozzer.com — Build Plan

Version 3 · 2026-09-19 · build started (foundation, design system, pages, SEO). Demos, scroll motion, blog content and published numbers come later.

Design source: the "Ahmed Sozzer — Engineering Portfolio" canvas (claude.ai/artifact/BwuWqpPdt9nrJHBWzpfDLE, rev 1789782315-169d). Blog design: the separate "Ahmed Sozzer — Blogs" canvas (claude.ai/artifact/QuwjpwT2Ej4B9kdXZTka9n).

Every version number and limit below was checked against primary sources on 2026-09-19. Things marked **verify** still need a hands-on test.

---

## 1. Settled decisions

| Area             | Decision                                                                                                                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Repo             | `Amsozzer1/Amsozzer1` (this repo, public). `README.md` stays the GitHub profile README; the site code sits beside it on purpose, so visitors can see the whole setup.                                                                                        |
| Generator        | Astro 7, fully static output, no adapter. Zero JavaScript by default.                                                                                                                                                                                        |
| Hosting          | Cloudflare Workers with static assets (Cloudflare's recommendation for new projects instead of Pages).                                                                                                                                                       |
| Deploy           | GitHub Actions only. Every push runs the checks; `main` deploys after they pass; pull requests get a preview URL. No Cloudflare git builds.                                                                                                                  |
| Domain           | Nameservers move to Cloudflare (zone already added, DNS imported, AI crawlers set to allow). The registration **stays at Squarespace for now**: Squarespace can't transfer straight to Cloudflare and a 60-day wait isn't worth it. Revisit later.           |
| Email            | iCloud+ custom domain (already paid for) for `ahmed@amsozzer.com`, catch-all on, everything forwarded to Gmail.                                                                                                                                              |
| Crawlers         | Everything allowed, including AI training bots. All Cloudflare bot/AI blocking off.                                                                                                                                                                          |
| Canonical GitHub | `Amsozzer1`.                                                                                                                                                                                                                                                 |
| Résumé           | Typst, built from `resume.json`, which `/experience` reads too. Chosen over LaTeX on 2026-09-20: the LaTeX PDF was hand-maintained and had drifted, and XeLaTeX's `ffi` ligatures kept "efficiency" and "traffic" out of its text layer, where an ATS looks. |
| Job title        | Official "Engineer II"; shown as "Full Stack Engineer". Résumé/LinkedIn: "Full Stack Engineer (Engineer II)".                                                                                                                                                |
| Positioning      | Forward Deployed Engineer (settled on the canvas 18 Sep).                                                                                                                                                                                                    |
| Face on the site | No headshot on the site. The photo is only used on external profiles (GitHub, LinkedIn, dev.to, Bluesky, Gravatar), which Ahmed sets himself.                                                                                                                |
| Numbers          | Benchmark and MNIST figures are parked. Pages read them from one data file so the numbers pass is a data edit, not a code change. Content in general comes after the site works.                                                                             |
| Demos            | Designed as static UI shells only (no WASM build, no model training). Ahmed brings the finished demos later and they get wired in.                                                                                                                           |
| Tests            | **None.** No Vitest, no Playwright, no axe scripts, no custom check scripts. Quality comes from ESLint, Prettier, Stylelint, `astro check`, html-validate, link checking and Lighthouse CI.                                                                  |
| Blog             | Low priority. The collection, post layout and `/writing` index exist; posts come later.                                                                                                                                                                      |
| Scroll motion    | Later. The page is complete and static without it.                                                                                                                                                                                                           |
| AMS-X footage    | Not filmed yet. The page ships with a "footage coming soon" slot.                                                                                                                                                                                            |
| Security posture | Sensible, not paranoid: standard security headers, no hardening work that makes the code harder to read.                                                                                                                                                     |

---

## 2. Code standards

Taken from the conventions in the Harmony / Nu repos Ahmed works in, adapted to Astro.

**Hard rules (lint-enforced, zero warnings)**

- TypeScript `strict`. No `any`, no `@ts-ignore` / `@ts-nocheck`, no `eslint-disable` (ESLint `noInlineConfig: true`).
- No `console.*`.
- No inline `style` attributes in source. No `!important`.
- No raw colors, sizes or fonts outside the design tokens (Stylelint `color-no-hex` everywhere except the generated tokens file).
- Import alias `@src/*`; no relative imports that climb out of `src/`.

**Structure**

- Components: PascalCase `.astro` files. One component per file.
- A component gets its own folder only when it has helpers or subcomponents:
  - `_components/` for subcomponents
  - `_helpers/` for logic, with files prefixed by the camelCase component name:
    - `mnist.functions.ts`: pure logic (math, parsing, derivation).
    - `mnist.events.ts`: DOM event handlers.
    - `mnist.resolvers.ts`: loading data (fetching weights, instantiating WASM).
    - `mnist.consts.ts`: constants.
- Default export = the main component or custom element only. Everything else is a named export.
- Views stay thin: markup and wiring. Logic lives in `_helpers`.

**Style**

- Arrow functions. Single quotes, semicolons, trailing commas, `x => x` without parens, 2-space indent, 100-column Prettier width.
- `interface` for component props, `type` for data shapes. Types come from the data, not the other way round.
- Validate only at boundaries: content collections (Zod, which Astro requires) and `resume.json` (JSON Resume schema). No defensive checks for states that can't happen.
- Comments explain _why_, never _what_, and only where the code is genuinely complicated. No changelog comments, no commented-out code, no header comment per file or route; git keeps the history.
- Anything unfinished gets a one-line `@TODO:` marker in the file where the gap is, using Ahmed's own words for what's missing (`// @TODO: …` in TS, `{/* @TODO: … */}` in Astro markup, `/* @TODO: … */` in CSS). Searching for `@TODO` lists everything left to do.
- Plain CSS only. No Sass, no Bootstrap, no Tailwind.
- No abstraction until something is used twice.
- Scripts are plain TypeScript run directly by Node 24 (built-in type stripping), with no `tsx` or `ts-node` dependency.

`AGENTS.md` (with `CLAUDE.md` importing it, same pattern as the Nu repos) will hold these rules so every future agent session follows them.

---

## 3. Toolchain

| Tool         | Version / setting                                                                       | Notes                                                                                                                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node         | 24 LTS via nvm (`.nvmrc` = `24`)                                                        | Node 22 also works if it is ≥ 22.22.3, but 24 is the target. Move to 26 after it becomes LTS on 2026-10-28.                                                                                                                                                                             |
| pnpm         | 12.x (`packageManager` field)                                                           | `minimumReleaseAge: 4320` (3 days), `allowBuilds` for esbuild + workerd. (Yarn would also work; pnpm chosen for speed and strict installs.)                                                                                                                                             |
| Astro        | 7.3.x                                                                                   | `compressHTML: true` (7's default `'jsx'` eats spaces between inline elements), `build.format: 'file'`, `trailingSlash: 'never'`, `build.inlineStylesheets: 'never'`, `vite.build.assetsInlineLimit: 0`, `vite.build.cssCodeSplit: false` (one CSS file — **verify** Astro honours it). |
| TypeScript   | 6.0.3, pinned                                                                           | TypeScript 7 has no compiler API yet, which breaks `astro check` and typescript-eslint.                                                                                                                                                                                                 |
| ESLint       | 10 flat config                                                                          | typescript-eslint 8.70 (`strict` + `stylistic`), eslint-plugin-astro 3.2, eslint-plugin-jsx-a11y-x 0.2 (the maintained fork that supports ESLint 10).                                                                                                                                   |
| Prettier     | 3.9 + prettier-plugin-astro 1.0                                                         | `astroCompressHTML` must match Astro's `compressHTML`.                                                                                                                                                                                                                                  |
| Stylelint    | 17 + stylelint-config-standard 40 + stylelint-config-html/astro                         | `color-no-hex`, `color-named: never`, `declaration-no-important`, raw `rgb()/hsl()` banned outside tokens.                                                                                                                                                                              |
| HTML         | html-validate 11                                                                        |                                                                                                                                                                                                                                                                                         |
| Links        | lychee 0.24                                                                             |                                                                                                                                                                                                                                                                                         |
| Résumé       | Typst 0.15.1                                                                            | Installed locally with Homebrew; in CI with `typst-community/setup-typst`.                                                                                                                                                                                                              |
| Fonts        | fontTools 4.65 (`pyftsubset`, run with `uvx`), @capsizecss/unpack + @capsizecss/metrics |                                                                                                                                                                                                                                                                                         |
| Images       | sharp 0.35 (Astro's default)                                                            |                                                                                                                                                                                                                                                                                         |
| Social cards | Satori 0.33 → sharp PNG                                                                 | Satori can't read `.woff2`; it gets the original `.otf` files.                                                                                                                                                                                                                          |
| Deploy       | Wrangler 4 via `cloudflare/wrangler-action@v4`                                          |                                                                                                                                                                                                                                                                                         |
| Deps         | Renovate (free GitHub app)                                                              | Weekly, grouped, 3-day minimum age, auto-merge dev-dependency patch/minor after checks pass.                                                                                                                                                                                            |

---

## 4. Repository layout

```
/
├─ README.md                      GitHub profile README (unchanged role)
├─ AGENTS.md  CLAUDE.md           rules for agents (section 2)
├─ docs/build-plan.md             this file
├─ .nvmrc  package.json  pnpm-lock.yaml  pnpm-workspace.yaml
├─ astro.config.ts  tsconfig.json  wrangler.jsonc
├─ eslint.config.ts  prettier.config.ts  stylelint.config.ts  .htmlvalidate.json
├─ lighthouserc.json  renovate.json
├─ .github/workflows/
│   ├─ ci.yml                     every push and PR: checks → build → preview / deploy
│   └─ weekly.yml                 external links + production smoke test
├─ fonts/
│   ├─ masters/                   original OTF files + their OFL licences (inputs; also used by Satori and Typst)
│   ├─ unicodes.txt               the exact character set the site uses
│   ├─ subset.sh                  pyftsubset commands, one per face/weight
│   └─ rename.py                  renames the Monaspace subset (reserved-name rule)
├─ resume/
│   └─ resume.typ                 the résumé layout; reads src/data/resume.json
├─ scripts/
│   ├─ build-tokens.ts            src/design/tokens.ts → src/styles/tokens.css
│   ├─ build-font-fallbacks.ts    metric-matched fallback @font-face rules
│   └─ indexnow.ts                post-deploy ping of changed URLs
├─ worker/
│   ├─ index.ts                   routes /r/* to links, everything else to static assets
│   ├─ links.ts  links.consts.ts  per-company short links
│   └─ schema.sql                 D1 table for link visits
├─ public/
│   ├─ _headers  _redirects
│   ├─ favicon.ico  icon.svg  apple-touch-icon.png  site.webmanifest  icon-192.png  icon-512.png
│   ├─ speculationrules.json
│   ├─ fonts/OFL-*.txt            font licences (OFL condition 2)
│   └─ <indexnow-key>.txt
├─ src/
│   ├─ design/tokens.ts           colors, type scale, spacing, motion — single source
│   ├─ data/
│   │   ├─ site.ts                name, links, sameAs, knowsAbout, availability
│   │   ├─ facts.ts               every number shown on the site (parked values flagged)
│   │   └─ resume.json            JSON Resume 1.3.1 — /experience, /resume.json, PDF, JSON-LD
│   ├─ content.config.ts          writing collection schema
│   ├─ content/writing/*.md
│   ├─ assets/fonts/*.woff2       subset output (Vite hashes them)
│   ├─ assets/images/
│   ├─ styles/
│   │   ├─ index.css              imports the rest; the only stylesheet
│   │   ├─ tokens.css             generated
│   │   ├─ fonts.css              @font-face + generated fallbacks
│   │   ├─ reset.css  base.css  layout.css  motion.css  print.css
│   ├─ layouts/
│   │   ├─ Base.astro             html/head/body, skip link, header, main, footer
│   │   └─ Post.astro
│   ├─ components/
│   │   ├─ seo/Head.astro  seo/JsonLd.astro
│   │   ├─ Header.astro  Footer.astro  Nav.astro  Availability.astro
│   │   ├─ Band.astro  AmberRule.astro  SectionHeading.astro  Kicker.astro
│   │   ├─ ProjectRow.astro  JobEntry.astro  StackList.astro  Terminal.astro
│   │   ├─ ArrowLink.astro  Footnote.astro  NextProject.astro  ResumeLink.astro
│   │   ├─ marks/  Tape.astro  Tack.astro  Stamp.astro  CropMarks.astro  Scribble.astro
│   │   └─ demos/
│   │       ├─ PlusWebPlayground/   PlusWebPlayground.astro  _components/  _helpers/
│   │       ├─ MnistPad/            MnistPad.astro  _helpers/
│   │       └─ AmsxSwap/            AmsxSwap.astro  _helpers/
│   ├─ lib/
│   │   ├─ seo/graph.ts           JSON-LD node builders (schema-dts types)
│   │   ├─ seo/meta.ts            title/description/canonical helpers
│   │   ├─ dates.ts               git last-modified lookup
│   │   └─ og/card.tsx            Satori card template
│   └─ pages/                     see section 7
```

**Single sources of truth → where they end up**

| Source                 | Feeds                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------ |
| `src/design/tokens.ts` | `tokens.css`, social cards, `theme-color` meta                                       |
| `src/data/site.ts`     | header, footer, JSON-LD Person/WebSite, `rel="me"` links, `llms.txt`, `security.txt` |
| `src/data/resume.json` | `/experience`, `/resume.json`, the PDF, JSON-LD work history, `llms.txt`             |
| `src/data/facts.ts`    | every figure on every page and social card                                           |
| `src/content/writing/` | posts, `/writing`, feeds, sitemap, JSON-LD BlogPosting                               |
| git history            | `dateModified` everywhere (sitemap, JSON-LD, visible "updated" dates)                |

---

## 5. Design system

### 5.1 Color tokens

Values from the canvas, with the contrast fixes (WCAG 2.2 AA: 4.5:1 for text, 3:1 for focus rings and meaningful graphics).

| Token                         | Value                   | Use                                             |
| ----------------------------- | ----------------------- | ----------------------------------------------- |
| `--ground-paper`              | `#F4F3EF`               | hero, graph paper base                          |
| `--ground-grid`               | `#E6E4DE`               | graph-paper lines (28px)                        |
| `--ground-body`               | `#E9E7E1`               | body bands                                      |
| `--ground-stone`              | `#DDDAD2`               | stepped section                                 |
| `--ground-ink`                | `#0A0A0A`               | bands, terminals, footer                        |
| `--text`                      | `#0A0A0A`               | headings                                        |
| `--text-body`                 | `#35342F`               | body copy                                       |
| `--text-secondary`            | `#46443E`               | nav, secondary                                  |
| `--text-caption`              | `#5E5C57`               | captions (4.78:1 on stone — thinnest pass)      |
| `--text-on-ink`               | `#F2F1EC`               | text on black                                   |
| `--text-on-ink-muted`         | `#9A978F`               | replaces `#55534D` and `#6E6C66` (6.79:1)       |
| `--text-on-ink-subtle`        | `#8A8880`               | replaces `#3A3937` and `#33332F` (5.58:1)       |
| `--rule-light` / `--rule-ink` | `#C9C6BE` / `#2A2A28`   | decorative rules only                           |
| `--amber`                     | `#E2A100`               | fills only on light; text only on black (8.8:1) |
| `--link-underline-prose`      | `#8A5A00`               | underline for links inside paragraphs           |
| `--crop`                      | `#A3A099`               | crop marks (decorative)                         |
| `--tape`                      | `rgb(226 161 0 / 0.62)` | tape marks                                      |

Fixes applied to the canvas:

- AMS-X "n" becomes black on an amber fill (like "import."), never amber text on light.
- Stack-line separators (`/`, `·`) are `aria-hidden` and decorative; the stack line becomes a `<ul>`.
- Error red in the editor must pass 4.5:1 on its black background (**verify** when chosen).

**Focus ring**

- On light grounds: `outline: 3px solid var(--text)`, `outline-offset: 2px`, plus a 3px amber halo outside it (box-shadow).
- On black grounds: amber outline with a paper-colored halo.
- The outline carries the contrast, because Windows high-contrast mode drops the halo.
- Applies to `a`, `button`, `input`, `textarea`, `summary`, `[tabindex]`.

### 5.2 Type

**Faces**

| Role        | Face                                                   | Files shipped                                    | Notes                                                                                                                                                      |
| ----------- | ------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display     | Redaction 2.001 (redaction.us zip, OFL 1.1 + LGPL 2.1) | Regular 400, Bold (declared `500 700`)           | Only Bold is preloaded. It has no arrow glyphs, so a 1–2 KB arrow patch face (Uncut Sans arrows, `unicode-range: U+2190-2199`) joins the Redaction family. |
| Body        | Uncut Sans 1.3.4 (OFL)                                 | Regular 400, Semibold 600 (**open**: 600 vs 700) | Static files; its variable font has a nonstandard italic axis.                                                                                             |
| Data / code | Monaspace Xenon 1.400 (OFL, reserved names)            | Regular, Bold, Italic                            | Subset about 90% and renamed, e.g. to "AMS Mono". No letter-spacing on it, because Chrome turns texture healing off when letter-spacing is set.            |
| 404 page    | Redaction 70 or 100 (a "degraded" grade, 20–25 KB)     | one file, loaded only on /404                    | "This page was redacted."                                                                                                                                  |

**Font pipeline (`pnpm fonts`, run locally, output committed)**

1. `fonts/subset.sh` runs `pyftsubset` per file with `--unicodes-file=fonts/unicodes.txt --layout-features+=tnum,case --name-IDs+=13,14 --desubroutinize --flavor=woff2`, plus `--no-hinting` for Redaction.
2. `fonts/rename.py` renames the Xenon subset.
3. `scripts/build-font-fallbacks.ts` computes `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` from the subset files (capsize's method) for:
   - Georgia, Times New Roman and Noto Serif (Redaction)
   - Helvetica Neue, Arial and Roboto (Uncut Sans)
   - Menlo, Courier New and Noto Sans Mono (Xenon)
4. It writes those rules into `fonts.css`.

`font-display: swap`. Every text element gets an explicit unitless `line-height`, because Safari ignores the vertical overrides. `font-synthesis: none`. Licences are served at `/fonts/OFL-*.txt`.

**Scale** (rem, fluid between 390px and 1440px with `clamp()`, 12px floor)

| Step                 | Phone → desktop | Face           | Tracking  |
| -------------------- | --------------- | -------------- | --------- |
| Display (landing)    | 48 → 88px       | Redaction Bold | −0.0189em |
| Display (project h1) | 62 → 108px      | Redaction Bold | −0.0189em |
| Section h2           | 32 → 52px       | Redaction      | −0.0147em |
| Sub h3               | 24 → 36px       | Redaction      | −0.0126em |
| Lead                 | 19 → 22px       | Uncut Sans     | 0         |
| Body                 | 16.5 → 18px     | Uncut Sans     | 0         |
| Small                | 15 → 16px       | Uncut Sans     | 0         |
| Mono label           | 12.5 → 13px     | Xenon          | 0         |
| Mono floor           | 12px            | Xenon          | 0         |

Headings use `text-wrap: balance`, paragraphs `text-wrap: pretty`, and comparison figures `font-variant-numeric: tabular-nums`.

### 5.3 Layout

- Desktop reference 1440 wide with a 96px gutter; phone 390 with a 24px gutter. Everything in between is fluid (grid + `clamp()`), and it works down to 320px.
- No fixed heights. The "84 header + 802 hero + 14 band = one viewport" rule becomes `min-height: calc(100svh - header)` capped at 802px. The primary CTA and contents links must sit inside a 1440×760 viewport.
- Text is in normal flow (grid/flex). Only the marks are absolutely positioned.
- `overflow-x: clip` (never `hidden`) on bands, so panels can crop past the right edge without breaking scroll animations or causing sideways scroll.
- Rules, not boxes: 3px major break, 2px figure, 1px table rows.
- Header is not sticky.

### 5.4 Marks

All marks are `aria-hidden="true"` with `pointer-events: none`. Each placement is positioned by a class in the page's styles, never an inline style.

| Mark       | Component         | Rules                                                                                                                        |
| ---------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Tape       | `Tape.astro`      | 148×33 (phone 100–104×26), rotated 24–31°, half on/half off, lands last                                                      |
| Thumb tack | `Tack.astro`      | centered on a panel's top edge; used where tape already appears twice                                                        |
| Stamp      | `Stamp.astro`     | rare; only "one dependency, coffee" (landing) and "closed source? not any more" (AMS-X). Real text, placed in reading order. |
| Crop marks | `CropMarks.astro` | 15px L, inset 26px                                                                                                           |
| Scribble   | `Scribble.astro`  | inline SVG, 2.2px stroke, must land within ~12px of its target                                                               |

Up to 4–5 marks per screen on desktop, 2 on phones. One crooked artifact per screen. Marks are hidden in Windows high-contrast mode.

---

## 6. Motion

Everything is CSS; no JavaScript on `/`, `/experience` or `/writing/*`.

**Scroll-driven (Chrome/Edge 115+, Safari 26+; Firefox gets the finished page)**

- Each `Band` is a static wrapper that owns `view-timeline: --band block`. Its children animate against it; the wrapper itself is never transformed.
- All starting states (offset, transparent) live inside `@supports (animation-timeline: view())` and `@media (prefers-reduced-motion: no-preference)`. Without support, everything is simply visible.
- **Slap** (objects: terminals, panels, stat blocks):
  - Scale 1.055→1, translateY 26→0, rotate rest+2.6°→rest.
  - The shadow is a pseudo-element fading 0.20→0.
  - Easing `1−(1−t)^5` as a 14-stop `linear()`.
  - Window: cover 14svh → 34svh, the canvas prototype's value (**open**: canvas notes say 0.18, prototype does 0.20).
- **Slide** (text): translateX ±64→0 from the side the text is anchored to, opacity 0→1.
  - Easing `cubic-bezier(.3333, 1, .6667, 1)`, which is exactly `1−(1−t)^3`.
  - Window 52svh, with a 5.5svh stagger per line via `:nth-child`.
  - Opacity reaches 1 within the first 30% of the window, so focused or anchored text is never faint.
- **Display type is wiped, not moved:** `clip-path: inset()` from the anchored edge plus 22px travel, line by line.
- **Mark lands last:** window 30→44svh, scale 1.14→1, rotate rest−7°→rest, easing `cubic-bezier(.25, 1, .5, 1)`.
- **Safety:**
  - Anything inside `:focus-within` or `:target` is forced to its end state.
  - The print stylesheet removes all animation.
  - The footer and the last band are excluded, since they can't scroll far enough to finish.

**Hero:** the same curves on a 620ms clock (plain `@keyframes`, no scroll). The first display line starts at delay 0 so the largest-paint metric isn't delayed.

**Page transitions** (Chrome/Edge 126+, Safari 18.2+):

- `@view-transition { navigation: auto }` inside a reduced-motion guard.
- The project title is the only shared element: the same `view-transition-name` on the landing row and the project page's h1.
- The amber band sweep is done with clip-path on the old and new page snapshots; `<html data-page>` sets the direction, and going back plays the same function reversed.
- Reduced motion: a 120ms cross-fade.
- No Astro `ClientRouter`.

**Instant navigation:** the `Speculation-Rules` header points at `/speculationrules.json` (prefetch, moderate eagerness, same-origin, excluding `/resume.pdf` and `/r/*`). This is Chrome only and adds no JavaScript. **Verify** CSP doesn't block the rules file.

---

## 7. Pages and routes

Header on every page: wordmark · `projects` (`/#projects`) · `writing` · `experience` · `contact` (mailto) · `resume ↓` (`/resume.pdf`) · "austin, tx" with the availability dot "open to full-time". The same words are used everywhere (nav, section headings, anchors, footer).

| Route               | Content                                                                                                                                                                                                                                                                                         | JSON-LD                                              | Notes                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `/`                 | Hero (visually-hidden h1 "Ahmed Sozzer — Forward Deployed Engineer"; the tagline "I write the layer most people import." as a real `<p>`, not hidden from screen readers), contents anchors, `#projects` (3 rows), `#experience`, `#education`, `#toolkit`, footer ("Open to full-time roles.") | ProfilePage + Person + WebSite                       | Name-first title                                |
| `/projects/plusweb` | What it is → proof (Express comparison as a real `<table>`) → playground → write-up link → next project                                                                                                                                                                                         | WebPage + SoftwareSourceCode + BreadcrumbList        | `'wasm-unsafe-eval'` CSP on this route only     |
| `/projects/ams-x`   | What it is → the swap state machine → **footage coming soon** slot → where it is → next                                                                                                                                                                                                         | same                                                 |                                                 |
| `/projects/mnist`   | What it is → drawing pad (the real network) → layer table → training run → next                                                                                                                                                                                                                 | same                                                 | Firebase links removed                          |
| `/experience`       | h1 "Ahmed Sozzer — Experience" (visually hidden, display line as `<p>`), jobs, education as beat 04 (degree, ASEE paper, talks), skills                                                                                                                                                         | ProfilePage + Person (work history) + BreadcrumbList | Print stylesheet                                |
| `/writing`          | Posts, newest first, plus "Open threads"                                                                                                                                                                                                                                                        | CollectionPage + BreadcrumbList                      |                                                 |
| `/writing/<slug>`   | Post; published and updated dates visible                                                                                                                                                                                                                                                       | BlogPosting + BreadcrumbList                         | First post: "The bottleneck was not the router" |
| `/now`              | What Ahmed is doing this month; availability with a date                                                                                                                                                                                                                                        | WebPage                                              | Updated date visible                            |
| `/uses`             | Hardware and software                                                                                                                                                                                                                                                                           | WebPage                                              | Content from Ahmed                              |
| `/colophon`         | Stack, versions, font credits and licences, Lighthouse numbers written by CI, commit SHA                                                                                                                                                                                                        | WebPage                                              |                                                 |
| `/accessibility`    | WCAG 2.2 AA target, test matrix, known limits, contact                                                                                                                                                                                                                                          | WebPage                                              |                                                 |
| `/404`              | "This page was redacted" in a degraded Redaction; links home, projects, writing, experience                                                                                                                                                                                                     | none (noindex)                                       |                                                 |
| `/about`            | Later: community college → Illinois → the paper → reselling/printing → "noticing when a person is doing a machine's job"                                                                                                                                                                        | ProfilePage                                          | Parked until content exists                     |

**Machine routes (all generated at build)**

| Route                       | Content                                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `/sitemap.xml`              | Hand-written endpoint: canonical 200 pages only, per-page `<lastmod>` from git. No `priority`/`changefreq`.                 |
| `/robots.txt`               | `User-agent: *` / `Allow: /` / `Disallow: /r/` / `Sitemap: https://amsozzer.com/sitemap.xml`                                |
| `/feed.xml`                 | RSS 2.0, full post HTML (`@astrojs/rss`)                                                                                    |
| `/feed.json`                | JSON Feed 1.1, served as `application/feed+json`                                                                            |
| `/llms.txt`                 | `# Ahmed Sozzer`, one-line summary, links to experience, projects, writing, `resume.json`, `resume.pdf`                     |
| `/.well-known/security.txt` | Contact, Expires (build date + 180 days), Preferred-Languages, Canonical. The monthly scheduled deploy keeps Expires fresh. |
| `/resume.json`              | `resume.json` as served JSON                                                                                                |
| `/resume.pdf`               | Typst output, `Content-Disposition: inline; filename="ahmed-sozzer-resume.pdf"`                                             |
| `/og/<page>.png`            | 1200×630 social cards; posts also get 16:9, 4:3 and 1:1 crops for Google                                                    |
| `/site.webmanifest`, icons  | favicon.ico (32), icon.svg, apple-touch-icon (180), 192 and 512                                                             |
| `/<key>.txt`                | IndexNow key                                                                                                                |

**Redirects (`public/_redirects`, free, no Worker)**

```
/gh        https://github.com/Amsozzer1               301
/li        https://www.linkedin.com/in/amsozzer1       301
/cv        /resume.pdf                                 302
/call      https://cal.com/amsozzer                    302
/projects  /#projects                                  301
/resume    /experience                                 301
```

**Per-company links:** `/r/<company>` goes through a small Worker. It records the visit in a D1 table (time, slug, country, referrer host, user agent), then 302-redirects to `/`. Unknown slugs also go to `/` (no open redirect). Pages are `noindex`. `pnpm links:report` prints visits per company, excluding link-preview bots (LinkedInBot, Slackbot and so on).

---

## 8. SEO and structured data

**Head contract.** `Base.astro` requires a typed `seo` prop, so no page can skip it. `Head.astro` renders:

- `<title>`, meta description, canonical (absolute, no trailing slash)
- `og:title`, `og:description`, `og:type` (`profile` on /, `article` on posts, `website` elsewhere), `og:url`, `og:image` with width, height and alt, `og:site_name`
- `twitter:card = summary_large_image`, `twitter:image:alt`
- `theme-color`, `color-scheme: light`, `robots: max-image-preview:large`, `text-scale: scale`
- feed `alternate` links, `rel="me"` links, preload of the Redaction Bold subset
- exactly one `<script type="application/ld+json">`
- the Cloudflare Web Analytics beacon (manual snippet; the only third-party script)

**Titles**

- `/`: "Ahmed Sozzer — Forward Deployed Engineer · Austin, TX"
- Pages: page-specific first, name last. Examples:
  - "PlusWeb — an Express-style HTTP framework in C++17 · Ahmed Sozzer"
  - "MNIST in the browser — a convnet with no runtime · Ahmed Sozzer"

**JSON-LD graph** (`src/lib/seo/graph.ts`, typed with schema-dts 2.0)

- Stable ids: `https://amsozzer.com/#person`, `https://amsozzer.com/#website`, `<page url>#webpage`.
- Every page's graph includes the same Person node (built from `site.ts`, so it never drifts), plus its own WebPage node with `isPartOf → #website` and `about`/`author → #person`.
- **Person:**
  - `name` "Ahmed Sozzer", `alternateName` ["Ahmed M. Sozzer", "amsozzer"]
  - `jobTitle` "Full Stack Engineer", with `description` as one plain FDE sentence
  - `address` Austin, TX, US (city and region only)
  - `worksFor` FYCLabs, `alumniOf` University of Illinois Urbana-Champaign (with its Wikidata `sameAs`)
  - `knowsAbout`: C++17, HTTP servers, POSIX sockets, MQTT, React, React Native, Next.js, TypeScript, PostgreSQL, GraphQL, GCP
  - `sameAs`: GitHub, LinkedIn, ORCID `0009-0005-3599-6156`, dev.to, Bluesky once claimed
  - `identifier`: ORCID
  - No `image`, because there's no photo on the site.
- Projects use **SoftwareSourceCode** (codeRepository, programmingLanguage, license, runtimePlatform, dateModified). No SoftwareApplication: Google requires real ratings for that, and fake ones are penalized.
- Posts use **BlogPosting** (Google doesn't list TechArticle), with headline, datePublished, dateModified, author → #person and the three image crops.
- **BreadcrumbList** on every page except `/`. Google shows breadcrumbs on desktop only.
- **Skip:** FAQPage, ratings, microdata, anything not visible on the page.

**Validation**

- schema-dts types at compile time.
- `scripts/checks/jsonld.ts` over the built pages: exactly one block per page, valid JSON, ids resolve, required fields present.
- @adobe/structured-data-validator 1.7 with a vendored schema.org 30.1 vocabulary.
- Google's Rich Results Test by hand once per template, then Search Console reports.

**Discovery**

- Search Console Domain property (DNS TXT); Bing Webmaster Tools imported from Search Console.
- IndexNow ping on every production deploy (reaches Bing, Yandex, Seznam, Naver, Yep, Internet Archive, Amazon).
- Cloudflare Crawler Hints on.
- dev.to imports `/feed.xml` with "RSS source as canonical" on. No Hashnode, since its API now costs $5/mo; claim the handle only.
- Monthly check: Bing's "AI Performance" report, Cloudflare AI Crawl Control, and a manual ChatGPT/Claude/Perplexity search.

---

## 9. The demos

Now: the three demos are built as static, designed UI shells only. The rest of this section is the plan for when the finished demos arrive.

### 9.1 PlusWeb playground

**In the PlusWeb repo**

1. Split `utils` so string helpers (`split`) don't pull in `<fstream>`.
2. Add a CMake target `plusweb_router` containing only the trie and route-key logic, with no sockets, thread pool or JSON library.
3. Add `wasm/api.cpp` with three `extern "C"` functions:
   - `pw_reset()`
   - `pw_add(method, pattern) → route id or error`
   - `pw_match(method, path) → "status\troute id\tparams"`
     Status codes come from C++, never from JavaScript.
4. Emscripten 6.0.9 build (link with `em++`) with these flags:
   - `-Oz -flto -fno-exceptions -fno-rtti`
   - `-sEXPORT_ES6 -sENVIRONMENT=web -sFILESYSTEM=0 -sDYNAMIC_EXECUTION=0`
   - exported functions plus the UTF-8 helpers
     A second build with `-sENVIRONMENT=node` is used only for tests.
5. Shared fixtures `fixtures/router/*.tsv` (route table, request, expected status/route/params) run by GoogleTest against the native library and by `node:test` against the WASM build. This makes it impossible for the playground to disagree with the real server.
6. CI job with `emscripten-core/setup-emsdk` pinned to 6.0.9. On a tag it publishes a release with the `.mjs`, the `.wasm` and `build-info.json` (commit, compiler version).
7. Size budget: `.wasm` ≤ 100 KB raw / 40 KB brotli; glue ≤ 25 KB.

**On the site**

- `pnpm vendor:plusweb <tag>` copies a release into `vendor/plusweb/`. Builds stay deterministic and diffs reviewable.
- The editor is a `<textarea>` with a highlight layer behind it. No CodeMirror (85–140 KB, and it injects styles) and no Monaco (no phone support).
- `plusWeb.functions.ts` reads the handlers between the fixed boilerplate:
  - a paren-matching parser for `app.get/post/put/patch/del`, `res.status()`, `res.json()`, `res.send()` and `req.param()`
  - produces diagnostics with line numbers, prefixed "error:" or "warning:"
  - the route table is derived from the code, never stored
- Routing runs the real C++. Handler bodies are read, not executed, and the page says so.
- Timing readout: repeat 2,000-lookup batches until at least 50ms has passed, take the median of 5 runs, and report ns per lookup "in this browser". Never a hard-coded number.
- **Accessibility:**
  - Route buttons' names include their visible text.
  - Lint summary via `aria-describedby`, announced at most once, 800ms after typing stops.
  - Only the response panel is a live region.
  - Trie-walk steps say "matched" / "not reached" in text.
  - Inputs are ≥16px on phones.
  - In high-contrast mode the textarea shows its own text.
- WASM loads with a dynamic import on first interaction. **Verify** after deploy that `.wasm` is served as `application/wasm`.
- JS budget for this route: ≤ 30 KB gzipped.

### 9.2 MNIST pad

**In the `digit_recognition` repo**

- Retrain with Keras 3.15 / TensorFlow 2.21:
  - conv32 → conv64 (3×3, no bias) → dense 64 → 10
  - Adam, batch 128, up to 15 epochs with early stopping
  - light augmentation (translate, rotate, zoom)
    Expected ≥ 99%. The displayed figure is part of the parked numbers pass.
- Export three files:
  - `weights.f16.bin`: float16, about 238 KB, 4-byte aligned
  - `manifest.json`: tensor names, shapes, offsets
  - `metrics.json`: test accuracy, epochs, parameter count (121,834)
- Rename the repo to something descriptive, e.g. `mnist-in-the-browser`.

**On the site**

- One `<canvas>` with Pointer Events and pointer capture. `touch-action: none` on the canvas only, so the page still scrolls and zooms.
- Preprocessing (`mnist.functions.ts`), the step that decides accuracy:
  1. bounding box
  2. scale the longer side to 20px with a box filter
  3. paste into 28×28
  4. shift the center of mass to (14, 14)
  5. scale to 0–1
- A hand-written forward pass on the main thread, about 2ms. No Worker, WASM or TF.js.
- Weights load on the first pointerdown or when the pad scrolls into view, from a content-hashed file (immutable cache).
- Shows:
  - the top prediction in text
  - every digit's percentage
  - a 28×28 "what the network sees" preview
- **Accessibility:**
  - "Try a sample digit" buttons 0–9 (real MNIST test images).
  - A keyboard cursor: arrows move, Space paints.
  - Clear and undo.
  - Result announced in one `role="status"` line when a stroke ends.
- JS budget for this route: ≤ 10 KB gzipped (plus the lazy weights).

### 9.3 AMS-X

- **Footage slot:** a `<figure>` at 16:9 on black with taped corners and the caption "A full swap cycle, filmed — coming soon." No broken video element.
- **Swap state machine:**
  - The source of truth is an `<ol>` of the steps retract → select → feed → sense → resume. Each step lists actor, MQTT message and guard.
  - An SVG diagram is drawn from the same data.
  - A Play/Pause button and step buttons; it never starts on its own.
  - The current step has `aria-current="step"`.
  - Durations are shown only once measured (parked with the numbers).
- **When footage exists:**
  - H.264 MP4 (`libx264 -crf 24 -preset veryslow -an -movflags +faststart`), optional AV1 version, AVIF poster preloaded on that page.
  - `muted playsinline loop`, autoplaying only when motion is allowed, with a visible pause button. iPhone Low Power Mode shows the poster.
  - A step-by-step text description under the video.
  - The state machine follows the video's playback time.
  - Check the footage for flashing faster than 3 per second.
- **Video hosting:** test whether a Worker static-assets MP4 answers range requests with 206. If it doesn't, the video goes in R2 behind a `/media/*` Worker route on the same domain. Nothing is built for this until the footage exists.

### 9.4 Benchmark section (parked numbers, working layout)

- Real `<table>` with a caption, column and row headers; CSS bars are `aria-hidden`; every value printed.
- Methodology as a popover footnote (no JavaScript).
- All values and ratios come from `facts.ts`, later from the published benchmark JSON.
- **Harness, when the numbers pass happens:**
  - Tools: oha (closed-loop throughput, plus fixed-rate with latency correction for p99).
  - Setup: Express 5.2.1 on Node 24 with `NODE_ENV=production`, identical headers, on the OptiPlex with pinned cores, memory measured as PSS.
  - Publish: raw JSON and an `env.json`.

---

## 10. Résumé pipeline

Typst, from one source of truth. `resume.json` feeds both the PDF and the site.

**Content moves**

- `resume.tex` → `src/data/resume.json` (JSON Resume 1.3.1).
- Changelog and "ORIGINAL (v2)" comments aren't carried over; git keeps them.
- Open content questions in the old file:
  - Holiday Channel title says iOS but no bullet does.
  - Plainform Prints stays off (Ahmed's call).

**Build and checks**

- `resume/resume.typ` reads it with `json()`. Single column, real text, clickable links, title and language set, icons marked as decoration.
- Build command: `typst compile --root . --font-path fonts/masters --ignore-system-fonts --pdf-standard ua-1,a-2a resume/resume.typ dist/resume.pdf`. The output is a tagged, accessible PDF, identical on the Mac and in CI.
- Runs on every push inside `ci.yml` (it takes about a second, so there's no "only if changed" logic). Deployed with the site.
- The PDF is no longer committed back to the repo by a bot: fewer "build: resume.pdf" commits in the history people will read. Every link (site, README, LinkedIn) points at `https://amsozzer.com/resume.pdf`, which is always the latest.
- The email on the résumé switches to `ahmed@amsozzer.com` once mail is verified working.

---

## 11. Hosting and edge

**`wrangler.jsonc`**

- `name: "amsozzer"`, `main: "worker/index.ts"`, current `compatibility_date`.
- `workers_dev: false` (no public `*.workers.dev` copy); `preview_urls: true`.
- Custom domain `amsozzer.com`.
- `assets`:
  - `directory: "./dist"`, `binding: "ASSETS"`
  - `not_found_handling: "404-page"`, `html_handling: "auto-trailing-slash"`
  - `run_worker_first: ["/r/*"]` (plus `/media/*` later if needed)
- D1 binding `DB`.

**`public/_headers`**

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; media-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Speculation-Rules: "/speculationrules.json"
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/projects/plusweb
  ! Content-Security-Policy
  Content-Security-Policy: <same policy with 'wasm-unsafe-eval' added to script-src>
/feed.json
  Content-Type: application/feed+json; charset=utf-8
/speculationrules.json
  Content-Type: application/speculationrules+json
/resume.pdf
  Content-Disposition: inline; filename="ahmed-sozzer-resume.pdf"
https://:version.:subdomain.workers.dev/*
  X-Robots-Tag: noindex
```

- `'unsafe-inline'` for styles covers Shiki's inline token colors and Astro's font/image styles. The site's own code never writes inline styles (lint-enforced).
- There are no inline scripts at all (`assetsInlineLimit: 0`). JSON-LD blocks aren't executed, so CSP doesn't affect them.
- HSTS is set in the Cloudflare zone (6 months, include subdomains, no preload), because `_headers` doesn't cover redirects.
- **Verify** the preview noindex rule on the first preview.

**Cloudflare zone settings (day one)**

| Setting                                | Value                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Email Address Obfuscation              | **Off** (on by default; it rewrites `ahmed@amsozzer.com` and injects JS) |
| Bot Fight Mode                         | **Off**                                                                  |
| AI traffic: Search / Agent / Training  | **Allow** on all pages                                                   |
| Managed robots.txt / Content Signals   | **Off**                                                                  |
| Legacy "Block AI bots"                 | Never on (blocking Training also blocks Googlebot and Bingbot)           |
| Rocket Loader, Zaraz, Cloudflare Fonts | Off                                                                      |
| Speed Brain                            | Off (our own Speculation-Rules header replaces it)                       |
| Crawler Hints                          | On                                                                       |
| Always Use HTTPS                       | Off, replaced by the redirect rules below                                |
| HSTS                                   | 6 months, include subdomains, no preload                                 |
| Web Analytics                          | Site added; manual snippet token goes in `site.ts`                       |
| DMARC Management                       | On                                                                       |

**Redirect rules (4 of the 10 free Single Redirects, in this order)**

1. `www.amsozzer.com`, any scheme → `https://amsozzer.com` + path (301)
2. `mnist` / `plusweb` / `ams-x` `.amsozzer.com` → `https://amsozzer.com/projects/<name>` (301)
3. any other subdomain except `lab` → `https://amsozzer.com/` (302)
4. `http://` anything → `https://` same host + path (301)

Every old or vanity URL reaches its page in one hop.

**DNS records (after the move)**

| Name              | Type                 | Value                                                                                                               | Proxy    |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------- | -------- |
| `amsozzer.com`    | Worker custom domain | (created by Wrangler)                                                                                               | yes      |
| `*`               | AAAA                 | `100::` (redirect-only placeholder)                                                                                 | yes      |
| `lab`             | CNAME                | `<tunnel-id>.cfargotunnel.com` (later)                                                                              | yes      |
| `amsozzer.com`    | MX                   | `mx01.mail.icloud.com` (10), `mx02.mail.icloud.com` (10)                                                            | DNS only |
| `amsozzer.com`    | TXT                  | `apple-domain=<token from Apple>`                                                                                   |          |
| `amsozzer.com`    | TXT                  | `v=spf1 include:icloud.com ~all` (the only SPF record)                                                              |          |
| `sig1._domainkey` | CNAME                | `sig1.dkim.amsozzer.com.at.icloudmailadmin.com`                                                                     | DNS only |
| `_dmarc`          | TXT                  | `v=DMARC1; p=none; sp=reject; rua=<Cloudflare DMARC address>` → `p=quarantine` after ~2 weeks → `p=reject` after ~6 |          |
| `amsozzer.com`    | TXT                  | `google-site-verification=…` (never delete)                                                                         |          |
| `_atproto`        | TXT                  | `did=did:plc:…` (Bluesky handle `@amsozzer.com`)                                                                    |          |

Deleted: the Mailgun MX, `include:mailgun.org` SPF, and the old DMARC record that reports to Mailgun/OnDMARC.

---

## 12. Domain and email move

Can happen any time; the only cost is a one-day wait. Today mail flows through Squarespace forwarding; the order below keeps mail working throughout.

1. **Now:** Squarespace → turn on the domain lock (currently off) and auto-renew (expires 2027-03-13).
2. **iCloud** (iPhone Settings → Apple Account → iCloud → iCloud Mail → Custom Email Domain, or icloud.com):
   - Add `amsozzer.com` and create `ahmed@amsozzer.com`.
   - Turn on "Allow all incoming".
   - Copy the DNS records Apple shows.
3. **Squarespace:** turn DNSSEC off. Wait at least 24 hours (the DS record's cache time).
4. **Cloudflare:**
   - Add the site (Free plan).
   - Replace the imported Mailgun records with the iCloud ones from step 2.
   - Apply the zone settings from section 11.
5. **Squarespace:** switch the nameservers to Cloudflare's two. Squarespace forwarding stops here; iCloud takes over.
6. **Test mail:**
   - Send to `ahmed@amsozzer.com` and to a made-up address from another account.
   - Both should arrive (catch-all), and "Show original" should read SPF, DKIM and DMARC PASS with `d=amsozzer.com`.
7. **Forward to Gmail:** iCloud Mail settings → forward all incoming mail to Gmail. **Verify** it applies to custom-domain addresses.
8. **Sending as `ahmed@amsozzer.com`:**
   - Until January 2027: Gmail's "Send mail as" works through iCloud's SMTP server (`smtp.mail.me.com:587`, app-specific password). That path is properly authenticated, unlike sending through Gmail's own servers.
   - After Gmail removes the feature: send from the iPhone Mail app, or add the iCloud account to the Gmail app over IMAP (Google keeps supporting that).
9. **DNSSEC back on:** turn on DNSSEC in Cloudflare, then add the DS record it shows at Squarespace (the registration stays there).
10. **Registrar transfer:** skipped for now. Keep the Squarespace lock and auto-renew on.
11. **Per-company addresses:** the catch-all means `acme@amsozzer.com` works for any application, showing which companies write back.

---

## 13. CI/CD

**`.github/workflows/ci.yml`** (pull requests and pushes to `main`; also monthly on a schedule so `security.txt` never expires)

| Job          | Runs                                                                                                                                                                                                                                                                                                                                                                                                   | Needs              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| `verify`     | checkout (full history for git dates) → Node from `.nvmrc` → pnpm install (frozen) → `prettier --check` · `eslint --max-warnings 0` · `stylelint` · `astro check` → `astro build` → html-validate → lychee (internal links, offline) → upload `dist`                                                                                                                                                   | —                  |
| `lighthouse` | Lighthouse CI on `/`, `/experience` and a project page: accessibility = 1, SEO ≥ 0.92, best practices ≥ 0.95, performance ≥ 0.9. The SEO floor is 0.92 rather than 1 because the Lighthouse bundled with `@lhci/cli` 0.15.1 is 12.6.1 (June 2025), which predates the January 2026 commit that taught the `robots-txt` audit about `Content-Signal`. Raise it back when LHCI ships a newer Lighthouse. | verify             |
| `deploy`     | main: `wrangler deploy` the exact built `dist`, then IndexNow ping. PRs: `wrangler versions upload --preview-alias pr-<n>` and a comment with the URL.                                                                                                                                                                                                                                                 | verify, lighthouse |

The résumé is compiled inside `ci.yml`'s `verify` job, before `pnpm build`, so it travels to production inside the same `dist` artifact as the rest of the site.

**`.github/workflows/weekly.yml`** (Mondays at an odd minute): lychee on external links; opens an issue on failure.

**Repo settings**

- Ruleset on `main`: pull requests only, `verify` + `lighthouse` must pass, squash merges, no force-push.
- Secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in a `production` environment limited to `main`.
- Workflow permissions: read by default; `pull-requests: write` only on the preview-comment step.
- Actions: current Node-24 majors (`actions/checkout@v7`, `actions/setup-node@v7`, `pnpm/action-setup@v6`, `cloudflare/wrangler-action@v4`, `lycheeverse/lychee-action@v2`, `treosh/lighthouse-ci-action@12`).
- Renovate keeps all of the above current.

---

## 14. Quality gates (no tests)

No test code is written. What keeps the site honest:

- **ESLint** (zero warnings, including accessibility rules on Astro markup), **Prettier**, **Stylelint** (a linter for CSS: it blocks raw colors and `!important` outside the tokens file), **`astro check`** (TypeScript).
- **html-validate** on the built HTML: valid markup, accessibility rules, no inline styles, no autoplay.
- **lychee**: no broken links, internal on every push, external weekly.
- **Lighthouse CI**: accessibility must score 1.0; SEO and best practices ≥ 0.95.
- **Manual pass before launch**: keyboard only, VoiceOver on Mac and iPhone, 200% zoom, Windows high-contrast. Results go on `/accessibility`.

| Budget                                             | Limit                     |
| -------------------------------------------------- | ------------------------- |
| HTML per page                                      | ≤ 15 KB gzipped           |
| CSS                                                | one file, ≤ 20 KB gzipped |
| First-party JS on `/`, `/experience`, `/writing/*` | 0 bytes                   |
| Fonts on first view                                | ≤ 100 KB woff2            |
| Lighthouse (desktop)                               | LCP < 1.2 s, CLS 0        |

---

## 15. Accessibility checklist (WCAG 2.2 AA)

- [ ] Two-color focus ring on every focusable element (5.1).
- [ ] Links inside paragraphs keep an underline in `--link-underline-prose`; the current nav item has `aria-current="page"` plus a visible marker that isn't color alone.
- [ ] All text tokens pass 4.5:1; no amber text on light grounds.
- [ ] Type in rem with a 12px floor; `meta text-scale`.
- [ ] No fixed heights; code blocks scroll inside themselves (Shiki adds `tabindex="0"`); the phone nav wraps below 390px.
- [ ] One h1 per page, and it carries the name; logical h2/h3 outline.
- [ ] Landmarks: `<header>`, `<nav aria-label="Primary">`, `<main id="main">`, `<footer>`, plus a skip link.
- [ ] The tagline is real, readable text (not `aria-hidden`).
- [ ] Arrows in `aria-hidden` spans. Full link names ("PlusWeb source on GitHub", "Résumé (PDF)"). No `target="_blank"` on internal links.
- [ ] Marks: `aria-hidden`, `pointer-events: none`; hidden in forced-colors mode.
- [ ] Filled buttons get a border in forced-colors mode; data bars stay visible.
- [ ] `prefers-contrast: more` darkens captions and thickens rules.
- [ ] Touch targets ≥ 44px on phones.
- [ ] Tables have a caption and headers; label/value pairs use `<dl>`; stack lines are `<ul>`.
- [ ] Nothing starts moving by itself for more than 5 seconds without a pause control.
- [ ] Every demo is usable by keyboard and screen reader (9.1, 9.2, 9.3).
- [ ] Contact link in the same place on every page.
- [ ] The PDF résumé is tagged PDF/UA-1.
- [ ] `/accessibility` page published.

---

## 16. Build order

Each phase ends when its "done when" holds and CI is green.

**Phase 0 — now (mostly Ahmed, no site code)**

- [ ] Squarespace: domain lock on, auto-renew on.
- [ ] Claim `cal.com/amsozzer`.
- [ ] Confirm the iCloud+ plan is active.

**Phase 1 — foundation**

- `.nvmrc`, `package.json`, pnpm, Astro 7 (static), strict `tsconfig` with `@src/*`, the lint/format/style configs from section 3, html-validate config.
- `AGENTS.md` + `CLAUDE.md` with the code standards.
- `.gitignore` for `dist/`, `.astro/`, `node_modules/`.
- `wrangler.jsonc` (previews only; no custom domain yet).
- `ci.yml` with `verify`, `lighthouse` and `deploy` (preview on PRs).
- Base layout with a placeholder page.
- **Done when:** a PR gets green checks and a preview URL comment; lint and typecheck have zero warnings.

**Phase 2 — design system**

- `tokens.ts` → `tokens.css`.
- Font pipeline: download masters and licences, subset, rename, fallbacks.
- `reset`, `base`, `layout`, `print` CSS.
- `Band`, `AmberRule`, `SectionHeading`, `Kicker`, `Terminal`, `ArrowLink`, `Footnote`, `StackList`.
- All marks; focus ring; graph paper. `motion.css` is left as a `@TODO` for the later motion phase.
- **Done when:** fonts load with no layout shift and every page reads correctly with no motion at all.

**Phase 3 — data**

- `site.ts`, `facts.ts` (parked values marked), `resume.json` ported from `resume.tex`.
- `content.config.ts` for writing.
- Git date helper.
- **Done when:** every figure on the canvas has a home in `facts.ts`.

**Phase 4 — pages**

- `Header`, `Nav`, `Availability`, `Footer`, `Base` layout.
- `/` (all sections), `/experience`, the three project pages without their demos, `/writing` + first post (from the Blogs canvas), `/now`, `/uses`, `/colophon`, `/accessibility`, `/404`.
- **Done when:** every route renders from 320 to 1440 with no overflow, Lighthouse accessibility is 1.0, and the heading outlines match section 15.

**Phase 5 — SEO and machine routes**

- `Head`, `JsonLd`, the graph builders.
- Social card endpoint (Satori → sharp) plus article crops.
- `sitemap.xml`, `feed.xml`, `feed.json`, `robots.txt`, `llms.txt`, `security.txt`, `resume.json` endpoint.
- Favicons + manifest, `speculationrules.json`, `rel="me"`.
- **Done when:** the JSON-LD check passes, the Rich Results Test is clean for `/`, a project and a post, and both feeds validate.

**Phase 6 — résumé PDF**

- `resume.typ` producing `public/resume.pdf`, tagged PDF/UA-1, on one page.
- **Done:** Typst picked on 2026-09-20; `resume.tex`, `Makefile` and `tex.yml` removed.

**Phase 7 — demos**

- Now: each project page gets its demo as a designed, static UI shell (MNIST pad, PlusWeb playground, AMS-X state machine and footage slot), marked `@TODO`.
- Later, when Ahmed brings the finished demos: wire in the real MNIST model and the PlusWeb WASM router (sections 9.1–9.2).
- **Done when (later):** each demo works by mouse, touch, keyboard and screen reader within its JS budget.

**Phase 8 — edge**

- `_headers`, `_redirects`, the `/r/*` Worker + D1 table + `links:report`, the analytics snippet, preview noindex.
- **Done when:** a preview passes the smoke checks from section 13.

**Phase 9 — quality gates complete**

- Lighthouse assertions, `weekly.yml`, Renovate, the repo ruleset.
- **Done when:** a PR with a lint error, a broken link or an accessibility regression is blocked.

**Phase 10 — launch**

- Section 12 steps (minus the registrar transfer), custom domain in Wrangler, the four redirect rules, zone settings.
- Search Console + Bing, sitemap submitted, IndexNow.
- UptimeRobot (free keyword monitors on `/`, `/resume.pdf`, the MNIST weights) and a Checkly browser check on the demos.
- **Done when:** production passes the weekly smoke test and mail tests pass.

**Phase 11 — off-site identity (Ahmed, with a checklist)**

- **GitHub profile:** name "Ahmed Sozzer", company FYCLabs, website `https://amsozzer.com`, add dev.to + Bluesky links.
- **Pins:** PlusWeb, AMS, MNIST, firmware, and two more.
- **Repos:**
  - Each repo's homepage points to its project page; add topics and 1280×640 social previews (same card pipeline).
  - `CITATION.cff` with ORCID on PlusWeb.
  - LICENSE on AMS.
  - Archive the two WhatsApp-clone repos.
  - Remove the `vercel.app` homepage.
- **Old `amsozzer` account:** point its bio at Amsozzer1 (or empty it).
- **Profile README:** add a short "this repo builds amsozzer.com" section with CI and Lighthouse badges.
- **ORCID:** fill in the existing record (education, employment, the ASEE paper, website).
- **LinkedIn:** Featured → site, PlusWeb, résumé; website in contact info; CLEAR identity verification; title "Full Stack Engineer (Engineer II)".
- **dev.to:** profile website, GitHub, bio; RSS import with canonical.
- **Bluesky:** handle `@amsozzer.com`.
- **Same photo everywhere:** GitHub, dev.to, Bluesky, Gravatar.

**Phase 12 — later (parked)**

- Numbers pass: benchmark harness and figures, MNIST accuracy, AMS-X durations.
- AMS-X footage (+ R2 only if needed).
- `/about`.
- More posts.
- Pagefind search once there are ~25 posts.
- `lab.amsozzer.com` tunnel.
- Google Scholar profile (needs a university email to be listed).

---

## 17. Open items

| Item                                                                                          | Owner                            | Blocks              |
| --------------------------------------------------------------------------------------------- | -------------------------------- | ------------------- |
| Motion window: 0.18 (notes) vs 0.20 (prototype)                                               | Ahmed                            | Phase 2 tuning only |
| Uncut Sans second weight: 600 vs 700                                                          | Ahmed                            | Phase 2             |
| AMS-X step names (retract/select/feed/sense/resume vs the canvas timeline) and real durations | Ahmed                            | 7c durations only   |
| Published figures still unmeasured (MNIST accuracy, AMS-X durations, landing transcript)      | Ahmed, later                     | Phase 12            |
| Holiday Channel title "Full Stack & iOS Developer" with no iOS bullet                         | Ahmed                            | Phase 3             |
| `/uses`, `/now`, first post text                                                              | Ahmed (drafts from the canvases) | Phase 4 content     |
| Registrar transfer (Squarespace → Cloudflare)                                                 | later                            | nothing             |
| ASEE paper DOI (a permanent ID for published papers; lets ORCID import it)                    | Claude looks it up               | Phase 11            |
| Does iCloud forwarding cover custom-domain addresses?                                         | test in Phase 10                 | Phase 10            |
| Do Workers static assets answer MP4 range requests with 206?                                  | test when footage exists         | Phase 12            |
