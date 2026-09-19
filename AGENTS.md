# Agent guidelines

This repo is two things: Ahmed's GitHub profile README (`README.md`, leave it alone unless asked) and the source of amsozzer.com, a static Astro 7 site deployed to Cloudflare Workers. The full plan is `docs/build-plan.md`.

## Non-negotiables

- TypeScript strict. No `any`, no `@ts-ignore` / `@ts-nocheck`, no `eslint-disable` (inline config is turned off).
- No `console.*`.
- No inline `style` attributes, no `!important`, no raw colors or sizes outside `src/design/tokens.ts`. Use the CSS custom properties from `src/styles/tokens.css`.
- Plain CSS only. No Sass, Tailwind or Bootstrap.
- Zero JavaScript on pages without a demo. Demos are the only islands, as plain TypeScript custom elements.
- Import through `@src/*`, never with relative paths that leave `src/`.
- No tests. Quality comes from ESLint, Prettier, Stylelint, `astro check`, html-validate, lychee and Lighthouse CI.
- Accessibility is WCAG 2.2 AA at minimum: real landmarks, one h1 per page, visible focus, text alternatives, no information by color alone.

## Structure

- Components are PascalCase `.astro` files, one per file.
- A component gets a folder only when it has subcomponents (`_components/`) or logic (`_helpers/`).
- Helper files are prefixed with the camelCase component name: `mnistPad.functions.ts` (pure logic), `mnistPad.events.ts` (DOM handlers), `mnistPad.resolvers.ts` (loading data), `mnistPad.consts.ts`.
- Default export = the main component or element. Everything else is a named export.
- Data lives in `src/data/`; every number shown on the site comes from `src/data/facts.ts`.

## Style

- Arrow functions. Single quotes, semicolons, trailing commas, `x => x`. Prettier decides formatting.
- `interface` for component props, `type` for data shapes.
- Validate only at boundaries (content collection schemas).
- Comments only explain _why_, and only where the code is genuinely complicated. No file headers, no narration, no commented-out code.
- Anything unfinished gets a one-line marker where the gap is: `// @TODO: …`, `{/* @TODO: … */}` in Astro markup, `/* @TODO: … */` in CSS. Use Ahmed's words for what is missing.
- No abstraction until something is used twice.

## Commands

```bash
nvm use                 # Node 24
pnpm dev                # local server
pnpm build              # static build into dist/
pnpm check              # astro check (types)
pnpm lint               # ESLint + Stylelint, zero warnings
pnpm format:check       # Prettier
pnpm validate:html      # html-validate on dist/
pnpm tokens             # regenerate src/styles/tokens.css
pnpm fonts              # subset fonts and regenerate fallbacks
```

Scripts in `scripts/` are plain TypeScript run directly by Node 24.
