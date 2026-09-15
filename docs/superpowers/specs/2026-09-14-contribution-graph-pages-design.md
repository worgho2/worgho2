# Contribution graph on GitHub Pages

Date: 2026-09-14. Revised 2026-09-15: renamed the model (Matrix to Plate, Cell to Block, Generator to PlateAnimationBuilder), regrouped `src/` by responsibility, moved the calendar source behind a port, and read the username and greeting from the environment so the repository works as a template.

## Goal

The profile README shows an animated 3D graph of the last year of contributions. Today the SVG is rendered by hand from a JSON snapshot and committed. This design makes it regenerate itself every day from live data, without a service to run and without daily commits, and restructures the renderer as a small builder over ports and adapters so new data sources and animations are additions rather than edits.

## Decisions

- **Where it runs:** a GitHub Actions workflow in this repo, on a daily cron.
- **Where it is served:** GitHub Pages, deployed from the workflow. The site contains `contributions.svg` and a minimal `index.html` that shows it and links to the profile.
- **Data source:** the GitHub GraphQL `contributionsCollection` calendar for `GITHUB_USERNAME` (default `worgho2`; the workflow passes the repository owner), read with the built-in `GITHUB_TOKEN`. Public contributions only; the profile setting that shows private contributions is on, so the public view already matches.
- **Keeping the cron alive:** GitHub disables scheduled workflows after 60 days without a push. On the first day of each month the workflow commits a touched file.
- **No releases:** release-please is not used in this repo. Commitlint and the pre-commit format hook stay.
- **Constant canvas:** the SVG's `viewBox`, `width` and `height` never change between runs, so the README can reserve the space without layout shift. The plate is always 53 columns wide and the canvas leaves room for a block 9 world units tall.
- **Template-ready:** nothing user-specific is hard-coded. The username comes from `GITHUB_USERNAME`, the greeting from `GREETING_TEXT` (default `welcome :)`, set as a repository variable), and `TEMPLATE.md` walks a new owner through Pages and the workflow.
- **The cycle starts empty.** At t=0 the plate has no blocks; ops play in order; the plate must be empty again at the end so the loop repeats cleanly. The old one-time fade-in is gone.
- **Language:** TypeScript, run directly by Node 24's type stripping (`node src/index.ts`), type-checked with `tsc --noEmit`. Only erasable syntax (no enums, no parameter properties). Import specifiers carry the `.ts` extension.

## The model

What is displayed is a plate of 7 rows by 53 columns. Each position holds a number; 0 means no block. A palette maps a value to the block it draws (height and three face colours). The animation is a sequence of operations on that plate: write a plate of values with a transition, wait, erase what stands with a transition. The names follow the visual model: a *plate* carries *blocks*.

```ts
new PlateAnimationBuilder()
  .write({ data: writableGithubContributionsPlate(weeks), palette: writableGithubContributionsPalette, transition: grow() })
  .delay({ duration: 1.5 })
  .erase({ transition: hole({ from: 'left' }) })
  .delay({ duration: 0.5 })
  .write({ data: writableTextPlate(greeting), palette: writableTextPalette, transition: wave() })
  .delay({ duration: 0.5 })
  .erase({ transition: hole({ from: 'right' }) })
  .delay({ duration: 0.5 })
  .build(); // -> SVG string
```

### Ports (`src/plate-animation-builder/model.ts`)

- `Plate`: `number[][]`, `ROWS = 7` by `COLS = 53` (constants in `constants.ts`, `emptyPlate()` in `helpers.ts`).
- `Palette`: `(value: number) => { height: number; faces: [top, left, right] }`.
- `Block`: `{ col, row, value, height, faces }`, what the builder works with after applying the palette.
- `WriteTransition`: `{ duration: number; keyframes: (block: Block) => Keyframe[] }` where a `Keyframe` is `{ at, height, ease }`, seconds from the op start, and `ease` is the SMIL spline of the segment that ends at that keyframe. The last keyframe is the standing height. All keyframes lie within `duration`.
- `EraseTransition`: `{ duration: number; plan: (blocks, start, scene) => Map<Block, number> }` returning the absolute time each block vanishes. A block missing from the map is an error.
- `Write`, `Erase`, `Delay`: the inputs of the three builder ops, `{ data, palette, transition }`, `{ transition }` and `{ duration }`.
- `Scene`: handed to erase transitions. `scene.shared(id, init)` returns one object per id for the whole build, so two hole sweeps drive one ellipse. `scene.render(fn)` registers markup to emit at build time, once the period is known; `fn` receives `{ period, tween, step }` and returns `{ defs?, under? }`, markup for the `<defs>` block and for the layer between the plate and the standing blocks.

### Builder (`src/plate-animation-builder/plate-animation-builder.ts`)

- `write` requires an empty plate, validates the plate shape and that every keyframe height fits the canvas, applies the palette, and advances the cursor by the transition's duration.
- `delay({ duration })` advances the cursor.
- `erase` requires a standing layer, runs the transition's plan, fails if any block is never reached, and advances the cursor.
- `build` fails if blocks are still standing. The period is the cursor. It emits: the constant canvas, `<defs>` with the plate clip path plus transition defs, the plate, the transitions' under-layers, then every standing block. A standing block is a group that is invisible until its first keyframe, visible until its fall time, and whose three faces tween through the keyframe heights, hold at the standing height, and flatten while hidden.
- Every SMIL animation spans the whole period and repeats forever, so all animations stay in sync (`src/plate-animation-builder/smil.ts`).

### Adapters

Writables (`src/writable/`) are things that can be written on the plate; each exports a plate function and a palette.

- `github-contributions/`: `writableGithubContributionsPlate(weeks)` places counts by weekday and week, left-aligned, and calendars longer than 53 weeks keep the most recent 53. `writableGithubContributionsPalette` clamps height at 45 contributions (0.2 world units each) and uses the four GitHub green bands by count. Where the weeks come from is this writable's concern, behind a port: `GithubCalendarSource = () => Promise<GithubCalendarWeek[]>` (`github-calendar.ts`, with the response validator `githubCalendarWeeksOf`). Two adapters implement it, `githubCalendarFromApi(login, token, fetchImpl?)` (`github-api.ts`) and `githubCalendarFromFile(path)` (`github-calendar-file.ts`); the CLI injects one of them.
- `text/`: `writableTextPlate(text)` centres the 7-row pixel font on the plate and throws for a character without a glyph; `writableTextPalette` gives height 1 and the fixed text shade. `glyphs.ts` covers every printable ASCII character; capitals, digits and ascenders use all 7 rows, other lowercase letters sit at rows 2-6, descenders are tucked into the x-height.

Write transitions (`src/write-transitions/`) and erase transitions (`src/erase-transitions/`), one folder each:

- `grow/`: blocks rise column by column with an ease-out.
- `wave/`: blocks rise column by column, overshoot by a bump, and settle.
- `hole/`: `hole({ from })`. A pit sweeps across the plate along the middle row, growing as it goes; each block falls when its centre is inside the pit, and a copy of it drops through a clip path shaped like the pit. Both sweeps share one ellipse element registered through `scene.shared('hole')`.

### Geometry (`src/plate-animation-builder/geometry.ts`)

Isometric projection, box faces, plate, painter order and the canvas constants `VIEW_BOX`, `WIDTH`, `HEIGHT`, computed from the 53-column plate and a block of `MAX_HEIGHT = 9` at the back corner. Result: `viewBox="-119.12 -130.00 835.77 599.00"`, 836 by 599.

## Layout

```
src/plate-animation-builder/model.ts                        ports: Plate, Block, Palette, transitions, Scene, Write/Erase/Delay
src/plate-animation-builder/constants.ts                    ROWS, COLS, world sizes, clip id, splines
src/plate-animation-builder/helpers.ts                      emptyPlate()
src/plate-animation-builder/geometry.ts                     projection, faces, plate, canvas constants
src/plate-animation-builder/smil.ts                         tween/step helpers for one cycle
src/plate-animation-builder/plate-animation-builder.ts      the builder
src/plate-animation-builder/index.ts                        barrel
src/writable/github-contributions/github-calendar.ts        GithubCalendarWeek, the GithubCalendarSource port, response validation
src/writable/github-contributions/github-api.ts             source adapter: GraphQL fetch
src/writable/github-contributions/github-calendar-file.ts   source adapter: saved response on disk
src/writable/github-contributions/github-contributions.ts   calendar -> plate, contributions palette
src/writable/text/glyphs.ts                                 the pixel font
src/writable/text/text.ts                                   text -> plate, text palette
src/write-transitions/grow/grow.ts
src/write-transitions/wave/wave.ts
src/erase-transitions/hole/hole.ts
src/index-page.ts                                           indexPage(username, svgPath): the Pages root page
src/index.ts                                                contributionsAnimation({ weeks, greeting }) and the CLI
src/**/*.test.ts                                            Vitest, next to the unit under test
TEMPLATE.md                                                 how to use the repository as a template
.github/workflows/ci.yml                                    lint, typecheck, test on pull requests
.github/workflows/contributions.yml                         daily generate + Pages deploy + monthly keep-alive
.keepalive                                                  the file the monthly commit touches
tsconfig.json
```

`dist/` is gitignored. `_dev/` stays gitignored and keeps the STL generator, previews and the JSON snapshot. `contributions.svg` at the repo root is deleted once the README points at Pages.

## CLI

`pnpm generate` runs `src/index.ts`, the composition root. It reads `GITHUB_USERNAME` (default `worgho2`) and `GREETING_TEXT` (default `welcome :)`), picks a calendar source and injects it into the writable. Two modes:

- `pnpm generate` (no arguments): `githubCalendarFromApi`, querying GraphQL for `GITHUB_USERNAME` with `GITHUB_TOKEN`. Fails with a non-zero exit on a missing token, an HTTP error, a GraphQL `errors` array, or a calendar with no weeks.
- `pnpm generate path/to/calendar.json`: `githubCalendarFromFile`, rendering a saved GraphQL response for local iteration without a token. This is the shape already in `_dev/contributions-3d/contributions.json`. Fails on an unreadable file, invalid JSON, or a body without weeks.

Both modes write `dist/contributions.svg` and `dist/index.html` and print a JSON summary. The module only runs the CLI when it is the entry point (`import.meta.main`), so tests import `contributionsAnimation` from it.

## Workflow: contributions.yml

Triggers:

- `schedule`: daily at 03:17 UTC (an odd minute avoids the top-of-hour queue).
- `workflow_dispatch`.
- `push` to `main` when `src/**`, `package.json`, `pnpm-lock.yaml` or the workflow file changes.

Permissions: `contents: write`, `pages: write`, `id-token: write`. Concurrency group `pages`, no cancel-in-progress.

Steps, one job:

1. Checkout.
2. Setup pnpm and Node from `.nvmrc`, install with `--frozen-lockfile`.
3. `pnpm generate` with `GITHUB_TOKEN: ${{ github.token }}`, `GITHUB_USERNAME: ${{ github.repository_owner }}` and `GREETING_TEXT: ${{ vars.GREETING_TEXT }}` (an optional repository variable; GitHub forbids the `GITHUB_` prefix on variables, which is why the username is derived from the owner instead).
4. Upload `dist/` with `actions/upload-pages-artifact`.
5. Deploy with `actions/deploy-pages`.
6. Keep-alive, only when the run is a scheduled run and the day of the month is 1: write the current date into `.keepalive`, commit as the github-actions bot with message `chore: keep the scheduled workflow alive`, push to `main`.

A failure in any step fails the run and leaves the previously deployed SVG in place. The push in step 6 does not touch the paths the `push` trigger lists, so it does not loop.

## README

```html
<img src="https://worgho2.github.io/worgho2/contributions.svg" alt="3D contribution graph" width="836" height="599">
```

## CI

`ci.yml` runs `pnpm lint`, `pnpm typecheck` and `pnpm test`.

## Testing

Every module has a Vitest file next to it: geometry constants and projection; SMIL helper output; the builder with a one-block plate and stub transitions, asserting emitted keyTimes, painter order, scene fragments and every error path; each writable, source adapter and transition in isolation (the API adapter with an injected fetch, the file adapter with a temp file); the font for coverage of printable ASCII, shape and uniqueness; the full chain on a generated 53-week calendar and a 52-week one; and the CLI as a subprocess rendering a saved calendar into a temp directory and failing without a token. The rendered file is checked visually with headless Chrome screenshots at a few points in the cycle.

## One-time manual steps

1. Repository settings, Pages: set the source to "GitHub Actions".
2. Run the contributions workflow once by hand so the URL serves before the README change is pushed.

## Out of scope

Private contributions, a custom domain, an STL pipeline, and any service that renders on request.
