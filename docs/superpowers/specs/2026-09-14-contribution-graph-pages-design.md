# Contribution graph on GitHub Pages

Date: 2026-09-14

## Goal

The profile README shows an animated 3D graph of the last year of contributions. Today the SVG is rendered by hand from a JSON snapshot and committed. This design makes it regenerate itself every day from live data, without a service to run and without daily commits, and restructures the renderer as a small builder over ports and adapters so new data sources and animations are additions rather than edits.

## Decisions

- **Where it runs:** a GitHub Actions workflow in this repo, on a daily cron.
- **Where it is served:** GitHub Pages, deployed from the workflow. The site contains only `contributions.svg`, no index page.
- **Data source:** the GitHub GraphQL `contributionsCollection` calendar for `worgho2`, read with the built-in `GITHUB_TOKEN`. Public contributions only; the profile setting that shows private contributions is on, so the public view already matches.
- **Keeping the cron alive:** GitHub disables scheduled workflows after 60 days without a push. On the first day of each month the workflow commits a touched file.
- **No releases:** release-please is not used in this repo. Commitlint and the pre-commit format hook stay.
- **Constant canvas:** the SVG's `viewBox`, `width` and `height` never change between runs, so the README can reserve the space without layout shift. The plate is always 53 columns wide and the canvas leaves room for a block 9 world units tall.
- **The cycle starts empty.** At t=0 the plate has no blocks; ops play in order; the plate must be empty again at the end so the loop repeats cleanly. The old one-time fade-in is gone.
- **Language:** TypeScript, run directly by Node 24's type stripping (`node src/generate.ts`), type-checked with `tsc --noEmit`. Only erasable syntax (no enums, no parameter properties). Import specifiers carry the `.ts` extension.

## The model

What is displayed is a matrix of 7 rows by 53 columns. Each cell holds a number; 0 means no block. A palette maps a cell's number to the block it draws (height and three face colours). The animation is a sequence of operations on that plate: write a matrix with a transition, wait, erase what stands with a transition.

```ts
new Generator()
  .write({ data: contributionsMatrix(weeks), palette: contributionsPalette, transition: grow() })
  .delay(1.5)
  .erase({ transition: hole({ from: 'left' }) })
  .delay(0.5)
  .write({ data: textMatrix('welcome :)'), palette: textPalette, transition: wave() })
  .delay(0.5)
  .erase({ transition: hole({ from: 'right' }) })
  .delay(0.5)
  .build(); // -> SVG string
```

### Ports (`src/graph/ports.ts`)

- `Matrix`: `number[][]`, `ROWS = 7` by `COLS = 53`.
- `Palette`: `(value: number) => { height: number; faces: [top, left, right] }`.
- `Cell`: `{ col, row, value, height, faces }`, what the builder works with after applying the palette.
- `WriteTransition`: `{ duration: number; keyframes: (cell: Cell) => Keyframe[] }` where a `Keyframe` is `{ at, height, ease }`, seconds from the op start, and `ease` is the SMIL spline of the segment that ends at that keyframe. The last keyframe is the standing height. All keyframes lie within `duration`.
- `EraseTransition`: `{ duration: number; plan: (cells, start, scene) => Map<Cell, number> }` returning the absolute time each cell vanishes. A cell missing from the map is an error.
- `Scene`: handed to erase transitions. `scene.shared(id, init)` returns one object per id for the whole build, so two hole sweeps drive one ellipse. `scene.render(fn)` registers markup to emit at build time, once the period is known; `fn` receives `{ period, tween, step }` and returns `{ defs?, under? }`, markup for the `<defs>` block and for the layer between the plate and the standing blocks.

### Builder (`src/graph/generator.ts`)

- `write` requires an empty plate, validates the matrix shape and that every keyframe height fits the canvas, applies the palette, and advances the cursor by the transition's duration.
- `delay(seconds)` advances the cursor.
- `erase` requires a standing layer, runs the transition's plan, fails if any block is never reached, and advances the cursor.
- `build` fails if blocks are still standing. The period is the cursor. It emits: the constant canvas, `<defs>` with the plate clip path plus transition defs, the plate, the transitions' under-layers, then every standing block. A standing block is a group that is invisible until its first keyframe, visible until its fall time, and whose three faces tween through the keyframe heights, hold at the standing height, and flatten while hidden.
- Every SMIL animation spans the whole period and repeats forever, so all animations stay in sync (`src/graph/smil.ts`).

### Adapters (`src/graph/adapters/`)

- `contributions.ts`: `contributionsMatrix(weeks)` places counts by weekday and week, left-aligned, and rejects calendars longer than 53 weeks. `contributionsPalette` clamps height at 45 contributions (0.2 world units each) and uses the four GitHub green bands by count.
- `text.ts`: `textMatrix(text)` centres the 7-row pixel font on the plate; `textPalette` gives height 1 and the fixed text shade.
- `transitions/grow.ts`: blocks rise column by column with an ease-out.
- `transitions/wave.ts`: blocks rise column by column, overshoot by a bump, and settle.
- `transitions/hole.ts`: `hole({ from })`. A pit sweeps across the plate along the middle row, growing as it goes; each block falls when its centre is inside the pit, and a copy of it drops through a clip path shaped like the pit. Both sweeps share one ellipse element registered through `scene.shared('hole')`.

### Geometry (`src/graph/geometry.ts`)

Isometric projection, box faces, plate, painter order and the canvas constants `VIEW_BOX`, `WIDTH`, `HEIGHT`, computed from the 53-column plate and a block of `MAX_HEIGHT = 9` at the back corner. Result: `viewBox="-119.12 -130.00 835.77 599.00"`, 836 by 599.

## Layout

```
src/graph/ports.ts                         types, ROWS, COLS, emptyMatrix()
src/graph/geometry.ts                      projection, faces, plate, canvas constants
src/graph/smil.ts                          tween/step helpers for one cycle
src/graph/generator.ts                     the builder
src/graph/adapters/contributions.ts        calendar -> matrix, contributions palette
src/graph/adapters/text.ts                 text -> matrix, text palette, pixel font
src/graph/adapters/transitions/grow.ts
src/graph/adapters/transitions/wave.ts
src/graph/adapters/transitions/hole.ts
src/graph.ts                               renderGraph(weeks): the chain above
src/calendar.ts                            GraphQL fetch and response validation
src/generate.ts                            CLI: fetch or read a JSON file, render, write dist/contributions.svg
src/**/*.test.ts                           Vitest, next to the unit under test
.github/workflows/ci.yml                   lint, typecheck, test on pull requests
.github/workflows/contributions.yml        daily generate + Pages deploy + monthly keep-alive
.keepalive                                 the file the monthly commit touches
tsconfig.json
```

`dist/` is gitignored. `_dev/` stays gitignored and keeps the STL generator, previews and the JSON snapshot. `contributions.svg` at the repo root is deleted once the README points at Pages.

## Generator CLI

`pnpm generate` runs `src/generate.ts`. Two modes:

- `pnpm generate` (no arguments): queries GraphQL for the login `worgho2` using `GITHUB_TOKEN` from the environment. Fails with a non-zero exit on a missing token, an HTTP error, a GraphQL `errors` array, or a calendar with no weeks.
- `pnpm generate path/to/calendar.json`: renders from a saved GraphQL response, for local iteration without a token. This is the shape already in `_dev/contributions-3d/contributions.json`.

Both modes write `dist/contributions.svg` and print a JSON summary.

## Workflow: contributions.yml

Triggers:

- `schedule`: daily at 03:17 UTC (an odd minute avoids the top-of-hour queue).
- `workflow_dispatch`.
- `push` to `main` when `src/**`, `package.json`, `pnpm-lock.yaml` or the workflow file changes.

Permissions: `contents: write`, `pages: write`, `id-token: write`. Concurrency group `pages`, no cancel-in-progress.

Steps, one job:

1. Checkout.
2. Setup pnpm and Node from `.nvmrc`, install with `--frozen-lockfile`.
3. `pnpm generate` with `GITHUB_TOKEN: ${{ github.token }}`.
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

Every module has a Vitest file next to it: geometry constants and projection; SMIL helper output; the builder with a one-cell matrix and stub transitions, asserting emitted keyTimes, ordering, scene fragments and every error path; each adapter and transition in isolation; the full chain on a generated 53-week calendar and a 52-week one. The rendered file is checked visually with headless Chrome screenshots at a few points in the cycle.

## One-time manual steps

1. Repository settings, Pages: set the source to "GitHub Actions".
2. Run the contributions workflow once by hand so the URL serves before the README change is pushed.

## Out of scope

Private contributions, a custom domain, an index page, an STL pipeline, and any service that renders on request.
