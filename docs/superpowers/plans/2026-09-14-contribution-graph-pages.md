# Contribution Graph on GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A daily GitHub Actions workflow renders the animated 3D contribution graph from live GraphQL data with a builder over ports and adapters, publishes it to GitHub Pages, and the profile README loads it from there.

**Architecture:** The plate is a 7x53 matrix. `Generator` chains `write({ data, palette, transition })`, `delay(s)`, `erase({ transition })` and `build()` into one SVG whose SMIL animations span a single repeating period. Data adapters produce matrices (contributions, text), palettes map values to blocks, write transitions produce per-cell height keyframes, and erase transitions plan when each block vanishes and may add scene markup (the hole). `generate.ts` fetches the calendar with the built-in token and writes `dist/contributions.svg`; one workflow runs it daily and deploys to Pages.

**Tech Stack:** TypeScript run natively by Node 24 type stripping (`.ts` import specifiers, erasable syntax only), `tsc --noEmit` for typecheck, Vitest, Biome, pnpm 10.28.1, GitHub Actions (`actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`).

Spec: `docs/superpowers/specs/2026-09-14-contribution-graph-pages-design.md`.

## Global Constraints

- Node `>=24`, pnpm `10.28.1`. Run everything with `pnpm`. Node runs `.ts` files directly; never add `tsx` or a build step.
- Every relative import ends in `.ts`. Use `import type` for type-only imports (`verbatimModuleSyntax`). No enums, no parameter properties, no namespaces (`erasableSyntaxOnly`).
- Biome formats and lints (`pnpm lint` must pass before every commit). `pnpm typecheck` and `pnpm test` must pass before every commit from Task 1 on.
- Commit messages are Conventional Commits, checked by commitlint. Allowed types: `feat fix perf revert docs style chore refactor test build ci wip`. Every commit message ends with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- The pre-commit hook formats staged files. After every commit check `git status --short` shows nothing unexpected.
- Plate: `ROWS = 7`, `COLS = 53`. Canvas: `MAX_HEIGHT = 9` world units, `viewBox="-119.12 -130.00 835.77 599.00"`, `width="836"`, `height="599"`.
- The cycle starts and ends with an empty plate.
- Login `worgho2`. Pages URL `https://worgho2.github.io/worgho2/contributions.svg`. Public contributions via `GITHUB_TOKEN`; no PAT.
- No release-please, no changelog, no version bumps. `_dev/` and `dist/` stay gitignored; nothing in `_dev/` is modified.

## File Structure

| File | Responsibility |
|---|---|
| `tsconfig.json` | Node-native TS settings, typecheck only. |
| `src/graph/ports.ts` | `ROWS`, `COLS`, `emptyMatrix`, and every port type. |
| `src/graph/geometry.ts` | Projection, box faces, plate, painter order, canvas constants. |
| `src/graph/smil.ts` | `smil(period)` returning `tween` and `step` helpers; spline constants. |
| `src/graph/generator.ts` | The `Generator` builder. |
| `src/graph/adapters/contributions.ts` | `contributionsMatrix`, `contributionsPalette`, `CalendarWeek` type. |
| `src/graph/adapters/text.ts` | Pixel font, `textMatrix`, `textPalette`. |
| `src/graph/adapters/transitions/grow.ts` | `grow()` write transition. |
| `src/graph/adapters/transitions/wave.ts` | `wave()` write transition. |
| `src/graph/adapters/transitions/hole.ts` | `hole({ from })` erase transition with the shared pit. |
| `src/graph.ts` | `renderGraph(weeks, greeting?)`: the chain from the spec. |
| `src/calendar.ts` | `fetchCalendar`, `weeksOf`. |
| `src/generate.ts` | CLI writing `dist/contributions.svg`. |
| `src/**/*.test.ts` | Vitest next to each unit. |
| `.github/workflows/ci.yml` | lint, typecheck, test on PRs. |
| `.github/workflows/contributions.yml` | Daily generate, Pages deploy, monthly keep-alive. |
| `.keepalive` | Date file touched by the monthly commit. |
| `README.md` | `<img>` at the Pages URL with the fixed size. |

---

### Task 0: Commit the tooling reset

The working tree already holds the deletion of the old portfolio packages and the new Biome, lefthook, commitlint and CI setup, plus the spec and this plan, all uncommitted. Everything after this builds on it.

- [ ] **Step 1: Confirm the tree**

Run: `git status --short | grep -v ' D packages/'; pnpm lint`
Expected: deletions of `.env.example`, `.npmrc`, `.prettierrc.json`, `.prettierignore`, `.vscode/*`, `infra/*`, `sst*`, `tsconfig.json`, `CHANGELOG.md`, `.github/workflows/release.yml`; modifications of `ci.yml`, `.gitignore`, `.nvmrc`, `LICENSE`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`; untracked `biome.json`, `commitlint.config.mjs`, `lefthook.yml`, `docs/`. Lint clean.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: keep only the contribution graph and its tooling

Drop the SST portfolio, the url-shortener and sudoku-solver packages, Prettier
and release-please. Add Biome, lefthook, commitlint and a pull-request CI that
lints, mirroring the tic-tac-toe-mcp-game setup. Add the design spec and plan
for generating the graph on GitHub Pages.

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git status --short
```

Expected: empty status.

---

### Task 1: TypeScript tooling, ports and geometry

**Files:**
- Create: `tsconfig.json`, `src/graph/ports.ts`, `src/graph/geometry.ts`
- Test: `src/graph/geometry.test.ts`
- Modify: `package.json` (scripts, dev dependencies), `.github/workflows/ci.yml` (typecheck and test steps)

**Interfaces:**
- Produces from `ports.ts`: `ROWS`, `COLS`, `emptyMatrix(): Matrix`, types `Matrix`, `Faces`, `Palette`, `Spline`, `Cell`, `Keyframe`, `WriteTransition`, `EraseTransition`, `Fragment`, `RenderContext`, `Scene`, `WriteInput`, `EraseInput`.
- Produces from `geometry.ts`: `CELL`, `GAP`, `PITCH`, `BASE`, `MARGIN`, `S`, `MAX_HEIGHT`, `GRID_W`, `GRID_H`, `proj`, `f2`, `pts`, `faces`, `cellFaces(col, row, height)`, `plateFaces`, `painter`, `VIEW_BOX`, `WIDTH`, `HEIGHT`.

- [ ] **Step 1: Add dependencies and scripts**

Run: `pnpm add -D typescript@^5.9.3 @types/node@^24.10.0 vitest@^5.0.0`

Edit `package.json` so `scripts` reads:

```json
  "scripts": {
    "generate": "node src/generate.ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "prepare": "lefthook install"
  },
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["es2024"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Add typecheck and test to CI**

In `.github/workflows/ci.yml`, after the `Lint and format check` step, add:

```yaml
      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test
```

- [ ] **Step 4: Write the ports**

Create `src/graph/ports.ts`:

```ts
export const ROWS = 7;
export const COLS = 53;

/** ROWS x COLS numbers; 0 means no block. Adapters decide what a non-zero value means. */
export type Matrix = number[][];

export const emptyMatrix = (): Matrix => Array.from({ length: ROWS }, () => new Array<number>(COLS).fill(0));

/** Colours of the three visible faces of a block. */
export type Faces = [top: string, left: string, right: string];

/** Maps a matrix value to the block it draws. */
export type Palette = (value: number) => { height: number; faces: Faces };

/** SMIL keySplines control points, e.g. '0.2 0.8 0.2 1'. */
export type Spline = string;

/** A block on the plate, after the palette has been applied. */
export type Cell = { col: number; row: number; value: number; height: number; faces: Faces };

/** Height of a block `at` seconds after the op starts; `ease` shapes the segment that ends here. */
export type Keyframe = { at: number; height: number; ease: Spline };

export type WriteTransition = {
  /** Seconds the op takes; every keyframe lies within it. */
  duration: number;
  /** Height over time for one block. The last keyframe is the standing height. */
  keyframes: (cell: Cell) => Keyframe[];
};

/** Markup a transition contributes at build time. */
export type Fragment = { defs?: string; under?: string };

/** Animation helpers for one cycle, handed to render callbacks once the period is known. */
export type RenderContext = {
  period: number;
  tween: (attr: string, values: string[], times: number[], splines: Spline[], tag?: string, extra?: string) => string;
  step: (attr: string, values: string[], times: number[]) => string;
};

export type Scene = {
  /** Returns the object registered under `id`, creating it with `init` on first use. */
  shared: <T>(id: string, init: () => T) => T;
  /** Registers markup to emit at build time. Fragments are emitted in registration order. */
  render: (fn: (ctx: RenderContext) => Fragment) => void;
};

export type EraseTransition = {
  /** Seconds the op takes; every block has vanished by then. */
  duration: number;
  /** Absolute time each block vanishes. A block missing from the map is an error. */
  plan: (cells: Cell[], start: number, scene: Scene) => Map<Cell, number>;
};

export type WriteInput = { data: Matrix; palette: Palette; transition: WriteTransition };
export type EraseInput = { transition: EraseTransition };
```

- [ ] **Step 5: Write the failing geometry test**

Create `src/graph/geometry.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cellFaces, HEIGHT, MAX_HEIGHT, painter, plateFaces, proj, pts, VIEW_BOX, WIDTH } from './geometry.ts';

describe('geometry', () => {
  it('sizes the canvas for a 53-week plate and the tallest block', () => {
    expect(VIEW_BOX).toBe('-119.12 -130.00 835.77 599.00');
    expect(WIDTH).toBe(836);
    expect(HEIGHT).toBe(599);
  });

  it('projects isometrically', () => {
    expect(proj([0, 0, 0])).toEqual([0, 0]);
    const [x, y] = proj([1, 0, 0]);
    expect(x).toBeCloseTo(10.392);
    expect(y).toBeCloseTo(6);
    expect(proj([0, 0, 1])).toEqual([0, -12]);
  });

  it('keeps the tallest block inside the canvas', () => {
    const minY = Number(VIEW_BOX.split(' ')[1]);
    for (const [, y] of cellFaces(0, 0, MAX_HEIGHT)[0].map(proj)) expect(y).toBeGreaterThanOrEqual(minY);
  });

  it('has a four-point plate top', () => {
    expect(plateFaces[0]).toHaveLength(4);
  });

  it('orders blocks back to front', () => {
    const sorted = [
      { col: 5, row: 0 },
      { col: 0, row: 0 },
      { col: 2, row: 2 },
    ].sort(painter);
    expect(sorted).toEqual([
      { col: 0, row: 0 },
      { col: 2, row: 2 },
      { col: 5, row: 0 },
    ]);
  });

  it('formats polygon points with two decimals', () => {
    expect(
      pts([
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ]),
    ).toBe('0.00,0.00 10.39,6.00 0.00,12.00 -10.39,6.00');
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `pnpm test`
Expected: FAIL, `Failed to load url ./geometry.ts`.

- [ ] **Step 7: Write the geometry**

Create `src/graph/geometry.ts`:

```ts
import { COLS, ROWS } from './ports.ts';

export const CELL = 1.0; // footprint of one block
export const GAP = 0.25; // spacing between blocks
export const PITCH = CELL + GAP;
export const BASE = 1.0; // plate thickness
export const MARGIN = 1.0; // plate margin around the grid
export const S = 12; // px per world unit
export const MAX_HEIGHT = 9.0; // tallest block the canvas is sized for, in world units
const PAD = 10; // px of canvas around the scene

export const GRID_W = COLS * PITCH - GAP;
export const GRID_H = ROWS * PITCH - GAP;

export type Point3 = [number, number, number];
export type Point2 = [number, number];
export type Quad = [Point3, Point3, Point3, Point3];

export const proj = ([x, y, z]: Point3): Point2 => [(x - y) * 0.866 * S, ((x + y) * 0.5 - z) * S];
export const f2 = (v: number): string => v.toFixed(2);
export const pts = (quad: Quad): string =>
  quad
    .map(proj)
    .map((q) => q.map(f2).join(','))
    .join(' ');

/** Top, left (+y) and right (+x) faces of a box, in that order. */
export const faces = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): [Quad, Quad, Quad] => [
  [
    [x0, y0, z1],
    [x1, y0, z1],
    [x1, y1, z1],
    [x0, y1, z1],
  ],
  [
    [x0, y1, z0],
    [x1, y1, z0],
    [x1, y1, z1],
    [x0, y1, z1],
  ],
  [
    [x1, y0, z0],
    [x1, y1, z0],
    [x1, y1, z1],
    [x1, y0, z1],
  ],
];

/** Faces of the block at a grid position, `height` world units above the plate. */
export const cellFaces = (col: number, row: number, height: number): [Quad, Quad, Quad] => {
  const x0 = col * PITCH;
  const y0 = row * PITCH;
  return faces(x0, y0, BASE, x0 + CELL, y0 + CELL, BASE + height);
};

export const plateFaces = faces(-MARGIN, -MARGIN, 0, GRID_W + MARGIN, GRID_H + MARGIN, BASE);

/** Sort order from the back of the plate to the front, so nearer blocks are drawn last. */
export const painter = (a: { col: number; row: number }, b: { col: number; row: number }): number =>
  a.col + a.row - (b.col + b.row);

// The canvas never depends on the data: the full plate plus the tallest block in the back corner.
const canvas = (() => {
  const points = [...plateFaces.flat(), ...cellFaces(0, 0, MAX_HEIGHT).flat()].map(proj);
  const xs = points.map((q) => q[0]);
  const ys = points.map((q) => q[1]);
  const minX = Math.min(...xs) - PAD;
  const minY = Math.min(...ys) - PAD;
  const w = Math.max(...xs) - minX + PAD;
  const h = Math.max(...ys) - minY + PAD;
  return { viewBox: `${f2(minX)} ${f2(minY)} ${f2(w)} ${f2(h)}`, width: Math.round(w), height: Math.round(h) };
})();

export const VIEW_BOX = canvas.viewBox;
export const WIDTH = canvas.width;
export const HEIGHT = canvas.height;
```

- [ ] **Step 8: Verify**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm test`
Expected: all clean, `6 passed`. If Biome flags a rule, rewrite the flagged line rather than suppressing it.

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json .github/workflows/ci.yml src/graph/ports.ts src/graph/geometry.ts src/graph/geometry.test.ts
git commit -m "feat: add the graph ports and the constant-canvas geometry

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: SMIL helpers and the Generator builder

**Files:**
- Create: `src/graph/smil.ts`, `src/graph/generator.ts`
- Test: `src/graph/smil.test.ts`, `src/graph/generator.test.ts`

**Interfaces:**
- Consumes: everything from Task 1.
- Produces: `smil(period): RenderContext`; constants `LINEAR`, `EASE_OUT`, `EASE_IN`; `class Generator` with `write(input: WriteInput): this`, `delay(seconds: number): this`, `erase(input: EraseInput): this`, `build(): string`; `PLATE_CLIP_ID = 'plate'`.

- [ ] **Step 1: Write the failing SMIL test**

Create `src/graph/smil.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { LINEAR, smil } from './smil.ts';

describe('smil', () => {
  const ctx = smil(10);

  it('tween holds before the first time and after the last', () => {
    const a = ctx.tween('points', ['A', 'B'], [2, 4], ['0.2 0.8 0.2 1']);
    expect(a).toContain('values="A;A;B;B"');
    expect(a).toContain('keyTimes="0;0.20000;0.40000;1"');
    expect(a).toContain(`keySplines="${LINEAR};0.2 0.8 0.2 1;${LINEAR}"`);
    expect(a).toContain('calcMode="spline" begin="0s" dur="10s" repeatCount="indefinite"');
  });

  it('tween accepts a tag and extra attributes', () => {
    const a = ctx.tween('transform', ['0 0', '0 5'], [1, 2], [LINEAR], 'animateTransform', 'type="translate" ');
    expect(a).toMatch(/^<animateTransform attributeName="transform" type="translate" values=/);
  });

  it('step switches values at the given times', () => {
    const a = ctx.step('opacity', ['0', '1', '0'], [3, 7]);
    expect(a).toContain('values="0;1;0;0" keyTimes="0;0.30000;0.70000;1" calcMode="discrete"');
  });

  it('rejects unordered or out-of-cycle times', () => {
    expect(() => ctx.step('opacity', ['0', '1', '0'], [7, 3])).toThrow(/not ordered/);
    expect(() => ctx.step('opacity', ['0', '1'], [11])).toThrow(/outside/);
  });

  it('rejects mismatched lengths', () => {
    expect(() => ctx.tween('x', ['A'], [1, 2], [LINEAR])).toThrow(/values/);
    expect(() => ctx.step('x', ['A'], [1, 2])).toThrow(/values/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run src/graph/smil.test.ts`
Expected: FAIL, `Failed to load url ./smil.ts`.

- [ ] **Step 3: Write the SMIL helpers**

Create `src/graph/smil.ts`:

```ts
import type { RenderContext, Spline } from './ports.ts';

/** '0 0 1 1' is a straight line: linear between different values, a hold between equal ones. */
export const LINEAR: Spline = '0 0 1 1';
export const EASE_OUT: Spline = '0.2 0.8 0.2 1';
export const EASE_IN: Spline = '0.5 0 1 1';

const checkTimes = (times: number[], period: number): void => {
  for (let i = 0; i < times.length; i++) {
    if (times[i] < 0 || times[i] > period + 1e-9) throw new Error(`keyTime ${times[i]} outside the ${period}s cycle`);
    if (i > 0 && times[i] < times[i - 1]) throw new Error(`keyTimes not ordered: ${times.join(', ')}`);
  }
};

/**
 * Animation helpers for one cycle. Every animation spans the whole period and repeats forever,
 * so all of them stay in sync without SMIL event syntax.
 */
export function smil(period: number): RenderContext {
  const k = (t: number): string => (t / period).toFixed(5);
  const common = `begin="0s" dur="${period}s" repeatCount="indefinite"`;
  return {
    period,
    // values[i] is reached at times[i]; the first value holds until times[0], the last holds after.
    tween: (attr, values, times, splines, tag = 'animate', extra = '') => {
      checkTimes(times, period);
      if (values.length !== times.length || splines.length !== times.length - 1) {
        throw new Error(`tween ${attr}: ${values.length} values, ${times.length} times, ${splines.length} splines`);
      }
      const vals = [values[0], ...values, values[values.length - 1]].join(';');
      const kt = [0, ...times.map(k), 1].join(';');
      const ks = [LINEAR, ...splines, LINEAR].join(';');
      return `<${tag} attributeName="${attr}" ${extra}values="${vals}" keyTimes="${kt}" calcMode="spline" keySplines="${ks}" ${common}/>`;
    },
    // discrete: values[0] from 0, values[i] from times[i-1].
    step: (attr, values, times) => {
      checkTimes(times, period);
      if (values.length !== times.length + 1) {
        throw new Error(`step ${attr}: ${values.length} values, ${times.length} times`);
      }
      const vals = [...values, values[values.length - 1]].join(';');
      const kt = [0, ...times.map(k), 1].join(';');
      return `<animate attributeName="${attr}" values="${vals}" keyTimes="${kt}" calcMode="discrete" ${common}/>`;
    },
  };
}
```

- [ ] **Step 4: Run the SMIL tests**

Run: `pnpm vitest run src/graph/smil.test.ts`
Expected: `5 passed`.

- [ ] **Step 5: Write the failing Generator test**

Create `src/graph/generator.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { HEIGHT, VIEW_BOX, WIDTH } from './geometry.ts';
import { Generator } from './generator.ts';
import { type EraseTransition, emptyMatrix, type Palette, type WriteTransition } from './ports.ts';
import { LINEAR } from './smil.ts';

const one = (col: number, row: number, value = 1) => {
  const m = emptyMatrix();
  m[row][col] = value;
  return m;
};
const palette: Palette = (value) => ({ height: value, faces: ['#a', '#b', '#c'] });
const pop: WriteTransition = {
  duration: 1,
  keyframes: (cell) => [
    { at: 0, height: 0, ease: LINEAR },
    { at: 1, height: cell.height, ease: LINEAR },
  ],
};
const vanish: EraseTransition = { duration: 1, plan: (cells, start) => new Map(cells.map((c) => [c, start])) };
const never: EraseTransition = { duration: 1, plan: () => new Map() };

describe('Generator', () => {
  it('builds an SVG on the constant canvas', () => {
    const svg = new Generator().write({ data: one(3, 2), palette, transition: pop }).erase({ transition: vanish }).build();
    const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}">`;
    expect(svg.startsWith(head)).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('shows a block from its first keyframe until it is erased', () => {
    const svg = new Generator()
      .write({ data: one(0, 0, 2), palette, transition: pop })
      .delay(1)
      .erase({ transition: vanish })
      .build();
    // period = 1 (write) + 1 (delay) + 1 (erase); visible from 0 s, erased at 2 s
    expect(svg).toContain('attributeName="opacity" values="0;1;0;0" keyTimes="0;0.00000;0.66667;1"');
    // plate clip polygon + 3 plate faces + 3 block faces
    expect(svg.match(/<polygon /g)).toHaveLength(7);
    // each face tweens: 0 (hold) -> 0 -> 2 (standing) -> 2 (hold until fall) -> 0 (flatten) -> hold
    expect(svg.match(/attributeName="points"/g)).toHaveLength(3);
    expect(svg).toContain('keyTimes="0;0.00000;0.33333;0.66667;0.83333;1"');
  });

  it('keeps every keyTime inside the cycle and ordered', () => {
    const svg = new Generator()
      .write({ data: one(52, 6), palette, transition: pop })
      .delay(2)
      .erase({ transition: vanish })
      .delay(0.25)
      .build();
    const lists = [...svg.matchAll(/keyTimes="([^"]+)"/g)].map((m) => m[1].split(';').map(Number));
    expect(lists.length).toBeGreaterThan(0);
    for (const ts of lists) {
      expect(ts[0]).toBe(0);
      expect(ts[ts.length - 1]).toBe(1);
      for (let i = 1; i < ts.length; i++) expect(ts[i]).toBeGreaterThanOrEqual(ts[i - 1]);
    }
  });

  it('lets erase transitions share state and add scene markup once the period is known', () => {
    const pit: EraseTransition = {
      duration: 1,
      plan: (cells, start, scene) => {
        scene.shared('pit', () =>
          scene.render((ctx) => ({ defs: `<g id="pit-defs" data-period="${ctx.period}"/>`, under: '<g id="pit"/>' })),
        );
        return new Map(cells.map((c) => [c, start]));
      },
    };
    const svg = new Generator()
      .write({ data: one(1, 1), palette, transition: pop })
      .erase({ transition: pit })
      .write({ data: one(2, 2), palette, transition: pop })
      .erase({ transition: pit })
      .build();
    expect(svg).toContain('<g id="pit-defs" data-period="4"/>');
    expect(svg.match(/<g id="pit"\/>/g)).toHaveLength(1);
    expect(svg.indexOf('<g id="pit-defs"')).toBeLessThan(svg.indexOf('</defs>'));
    expect(svg.indexOf('<g id="pit"/>')).toBeLessThan(svg.indexOf('<g opacity="0">'));
  });

  it('rejects a write on a non-empty plate', () => {
    const g = new Generator().write({ data: one(0, 0), palette, transition: pop });
    expect(() => g.write({ data: one(1, 1), palette, transition: pop })).toThrow(/not empty/);
  });

  it('rejects an erase on an empty plate', () => {
    expect(() => new Generator().erase({ transition: vanish })).toThrow(/empty/);
  });

  it('rejects a cycle that ends with blocks standing', () => {
    expect(() => new Generator().write({ data: one(0, 0), palette, transition: pop }).build()).toThrow(
      /not empty at the end/,
    );
  });

  it('rejects an empty cycle', () => {
    expect(() => new Generator().build()).toThrow(/nothing/);
  });

  it('rejects blocks the erase never reaches', () => {
    const g = new Generator().write({ data: one(0, 0), palette, transition: pop });
    expect(() => g.erase({ transition: never })).toThrow(/never reached/);
  });

  it('rejects a matrix of the wrong size, an empty matrix, or blocks taller than the canvas', () => {
    expect(() => new Generator().write({ data: [[1]], palette, transition: pop })).toThrow(/7x53/);
    expect(() => new Generator().write({ data: emptyMatrix(), palette, transition: pop })).toThrow(/no blocks/);
    expect(() => new Generator().write({ data: one(0, 0, 10), palette, transition: pop })).toThrow(/height/);
  });

  it('rejects keyframes outside the transition duration', () => {
    const late: WriteTransition = { duration: 1, keyframes: () => [{ at: 2, height: 1, ease: LINEAR }] };
    expect(() => new Generator().write({ data: one(0, 0), palette, transition: late })).toThrow(/duration/);
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `pnpm vitest run src/graph/generator.test.ts`
Expected: FAIL, `Failed to load url ./generator.ts`.

- [ ] **Step 7: Write the Generator**

Create `src/graph/generator.ts`:

```ts
import { cellFaces, HEIGHT, MAX_HEIGHT, painter, plateFaces, pts, VIEW_BOX, WIDTH } from './geometry.ts';
import {
  type Cell,
  COLS,
  type EraseInput,
  type Fragment,
  type Matrix,
  type Palette,
  type RenderContext,
  ROWS,
  type Scene,
  type WriteInput,
  type WriteTransition,
} from './ports.ts';
import { LINEAR, smil } from './smil.ts';

/** Clip path id of the plate top, available to every transition. */
export const PLATE_CLIP_ID = 'plate';
const PLATE_SHADE = ['#ebedf0', '#c9ccd1', '#d8dbe0'];
const FLATTEN = 0.5; // s a vanished block takes to return to zero height, while hidden

type Layer = { start: number; cells: Cell[]; transition: WriteTransition; fallAt: Map<Cell, number> };

const cellsOf = (data: Matrix, palette: Palette): Cell[] => {
  if (data.length !== ROWS || data.some((r) => r.length !== COLS)) {
    throw new Error(`write: the matrix must be ${ROWS}x${COLS}`);
  }
  const cells: Cell[] = [];
  data.forEach((values, row) => {
    values.forEach((value, col) => {
      if (value === 0) return;
      const { height, faces } = palette(value);
      if (!(height > 0 && height <= MAX_HEIGHT)) {
        throw new Error(`write: block height ${height} at ${col},${row} is outside (0, ${MAX_HEIGHT}]`);
      }
      cells.push({ col, row, value, height, faces });
    });
  });
  if (cells.length === 0) throw new Error('write: the matrix has no blocks');
  return cells;
};

const checkKeyframes = (cells: Cell[], transition: WriteTransition): void => {
  for (const cell of cells) {
    const kfs = transition.keyframes(cell);
    if (kfs.length === 0) throw new Error(`write: no keyframes for block ${cell.col},${cell.row}`);
    for (let i = 0; i < kfs.length; i++) {
      const { at, height } = kfs[i];
      if (at < 0 || at > transition.duration + 1e-9) throw new Error(`write: keyframe at ${at}s is outside the ${transition.duration}s duration`);
      if (i > 0 && at < kfs[i - 1].at) throw new Error('write: keyframes are not ordered');
      if (height < 0 || height > MAX_HEIGHT) throw new Error(`write: keyframe height ${height} is outside [0, ${MAX_HEIGHT}]`);
    }
  }
};

/** A standing block: hidden until its first keyframe, visible until its fall, faces tweening through the keyframes. */
const standingBlock = (ctx: RenderContext, layer: Layer, cell: Cell): string => {
  const kfs = layer.transition.keyframes(cell);
  const fall = layer.fallAt.get(cell)!;
  const show = layer.start + kfs[0].at;
  const times = [...kfs.map((kf) => layer.start + kf.at), fall, Math.min(fall + FLATTEN, ctx.period)];
  const heights = [...kfs.map((kf) => kf.height), kfs[kfs.length - 1].height, 0];
  const splines = [...kfs.slice(1).map((kf) => kf.ease), LINEAR, LINEAR];
  const polys = [0, 1, 2]
    .map((i) => {
      const values = heights.map((h) => pts(cellFaces(cell.col, cell.row, h)[i]));
      const rest = pts(cellFaces(cell.col, cell.row, 0)[i]);
      return `<polygon points="${rest}" fill="${cell.faces[i]}">${ctx.tween('points', values, times, splines)}</polygon>`;
    })
    .join('');
  return `<g opacity="0">${ctx.step('opacity', ['0', '1', '0'], [show, fall])}${polys}</g>`;
};

/**
 * Builds the animated plate. Ops run in order; the plate starts empty and must end empty so the
 * loop repeats cleanly. `build()` returns the SVG document as a string.
 */
export class Generator {
  #layers: Layer[] = [];
  #standing: Layer | null = null;
  #cursor = 0;
  #shared = new Map<string, unknown>();
  #renders: Array<(ctx: RenderContext) => Fragment> = [];
  #scene: Scene = {
    shared: <T>(id: string, init: () => T): T => {
      if (!this.#shared.has(id)) this.#shared.set(id, init());
      return this.#shared.get(id) as T;
    },
    render: (fn) => {
      this.#renders.push(fn);
    },
  };

  /** Places a matrix on the empty plate with a transition. */
  write({ data, palette, transition }: WriteInput): this {
    if (this.#standing) throw new Error('write: the plate is not empty; erase it first');
    const cells = cellsOf(data, palette);
    checkKeyframes(cells, transition);
    const layer: Layer = { start: this.#cursor, cells, transition, fallAt: new Map() };
    this.#layers.push(layer);
    this.#standing = layer;
    this.#cursor += transition.duration;
    return this;
  }

  /** Holds the current state for `seconds`. */
  delay(seconds: number): this {
    if (!(seconds >= 0)) throw new Error(`delay: expected a non-negative number of seconds, got ${seconds}`);
    this.#cursor += seconds;
    return this;
  }

  /** Removes everything standing with a transition. */
  erase({ transition }: EraseInput): this {
    const layer = this.#standing;
    if (!layer) throw new Error('erase: the plate is empty');
    const fallAt = transition.plan(layer.cells, this.#cursor, this.#scene);
    const missed = layer.cells.filter((c) => !fallAt.has(c));
    if (missed.length > 0) throw new Error(`erase: ${missed.length} blocks are never reached by the transition`);
    layer.fallAt = fallAt;
    this.#standing = null;
    this.#cursor += transition.duration;
    return this;
  }

  build(): string {
    if (this.#layers.length === 0) throw new Error('build: nothing to draw');
    if (this.#standing) throw new Error('build: the plate is not empty at the end of the cycle; erase it so the loop repeats cleanly');
    const ctx = smil(this.#cursor);
    const fragments = this.#renders.map((fn) => fn(ctx));
    const out: string[] = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}">`);
    out.push('<defs>');
    out.push(`<clipPath id="${PLATE_CLIP_ID}"><polygon points="${pts(plateFaces[0])}"/></clipPath>`);
    out.push(...fragments.map((f) => f.defs ?? ''));
    out.push('</defs>');
    plateFaces.forEach((f, i) => out.push(`<polygon points="${pts(f)}" fill="${PLATE_SHADE[i]}"/>`));
    out.push(...fragments.map((f) => f.under ?? ''));
    for (const layer of this.#layers) {
      for (const cell of [...layer.cells].sort(painter)) out.push(standingBlock(ctx, layer, cell));
    }
    out.push('</svg>');
    return `${out.filter((line) => line !== '').join('\n')}\n`;
  }
}
```

- [ ] **Step 8: Verify**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm test`
Expected: all clean, `22 passed` (6 geometry, 5 smil, 11 generator).

- [ ] **Step 9: Commit**

```bash
git add src/graph/smil.ts src/graph/smil.test.ts src/graph/generator.ts src/graph/generator.test.ts
git commit -m "feat: add the Generator builder and SMIL helpers

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Data adapters (contributions and text)

**Files:**
- Create: `src/graph/adapters/contributions.ts`, `src/graph/adapters/text.ts`
- Test: `src/graph/adapters/contributions.test.ts`, `src/graph/adapters/text.test.ts`

**Interfaces:**
- Produces: `CalendarWeek` type, `contributionsMatrix(weeks: CalendarWeek[]): Matrix`, `contributionsPalette: Palette`, `CAP = 45`; `textMatrix(text: string): Matrix`, `textPalette: Palette`, `GLYPHS`.

- [ ] **Step 1: Write the failing contributions test**

Create `src/graph/adapters/contributions.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { CAP, contributionsMatrix, contributionsPalette } from './contributions.ts';

const week = (counts: number[], firstWeekday = 0) => ({
  contributionDays: counts.map((contributionCount, i) => ({ contributionCount, weekday: firstWeekday + i })),
});

describe('contributionsMatrix', () => {
  it('places counts by weekday (row) and week (column), left-aligned', () => {
    const m = contributionsMatrix([week([0, 1, 2, 3, 4, 5, 6]), week([9], 3)]);
    expect(m).toHaveLength(7);
    expect(m[0]).toHaveLength(53);
    expect(m[4][0]).toBe(4);
    expect(m[3][1]).toBe(9);
    expect(m[0][1]).toBe(0);
    expect(m[6][52]).toBe(0);
  });

  it('accepts a full 53-week calendar', () => {
    const m = contributionsMatrix(Array.from({ length: 53 }, () => week([1, 1, 1, 1, 1, 1, 1])));
    expect(m.flat().filter((v) => v === 1)).toHaveLength(7 * 53);
  });

  it('rejects no weeks, more than 53 weeks, or a bad weekday', () => {
    expect(() => contributionsMatrix([])).toThrow(/weeks/);
    expect(() => contributionsMatrix(Array.from({ length: 54 }, () => week([1])))).toThrow(/weeks/);
    expect(() => contributionsMatrix([week([1], 7)])).toThrow(/weekday/);
  });
});

describe('contributionsPalette', () => {
  it('scales height by count and clamps at the cap', () => {
    expect(contributionsPalette(1).height).toBeCloseTo(0.2);
    expect(contributionsPalette(CAP).height).toBeCloseTo(9);
    expect(contributionsPalette(120).height).toBeCloseTo(9);
  });

  it('picks the colour band by count', () => {
    expect(contributionsPalette(4).faces[0]).toBe('#9be9a8');
    expect(contributionsPalette(5).faces[0]).toBe('#40c463');
    expect(contributionsPalette(15).faces[0]).toBe('#30a14e');
    expect(contributionsPalette(30).faces[0]).toBe('#216e39');
    expect(contributionsPalette(120).faces).toEqual(contributionsPalette(30).faces);
  });
});
```

- [ ] **Step 2: Write the failing text test**

Create `src/graph/adapters/text.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { textMatrix, textPalette } from './text.ts';

describe('textMatrix', () => {
  it('centres a one-column glyph on the plate', () => {
    const m = textMatrix('l');
    for (const row of m) expect(row.filter((v) => v !== 0)).toHaveLength(1);
    expect(m.map((row) => row[26])).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it('renders the greeting inside the plate', () => {
    const m = textMatrix('welcome :)');
    expect(m).toHaveLength(7);
    expect(m.every((row) => row.length === 53)).toBe(true);
    expect(m.flat().filter((v) => v === 1).length).toBeGreaterThan(40);
    // lowercase letters use rows 2-6; only the tall 'l' and ')' reach row 0
    expect(m[0].filter((v) => v !== 0).length).toBeLessThan(m[4].filter((v) => v !== 0).length);
  });

  it('rejects unknown glyphs and text wider than the plate', () => {
    expect(() => textMatrix('x')).toThrow(/glyph/);
    expect(() => textMatrix('l'.repeat(28))).toThrow(/wide/);
  });
});

describe('textPalette', () => {
  it('gives every text block the same height and shade', () => {
    expect(textPalette(1)).toEqual({ height: 1, faces: ['#30a14e', '#1f6b34', '#278641'] });
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm vitest run src/graph/adapters`
Expected: FAIL, both files fail to load their module.

- [ ] **Step 4: Write the contributions adapter**

Create `src/graph/adapters/contributions.ts`:

```ts
import { COLS, emptyMatrix, type Matrix, type Palette, ROWS } from '../ports.ts';

/** One week of the GraphQL `contributionCalendar`. Partial first and last weeks have fewer days. */
export type CalendarWeek = {
  contributionDays: Array<{ contributionCount: number; weekday: number }>;
};

/** Contributions per day at full block height; taller days are drawn at this height. */
export const CAP = 45;
const HEIGHT_UNIT = 0.2;

/** Counts by weekday (row, Sunday at the back) and week (column, oldest first, left-aligned). */
export const contributionsMatrix = (weeks: CalendarWeek[]): Matrix => {
  if (weeks.length === 0 || weeks.length > COLS) throw new Error(`expected 1 to ${COLS} weeks, got ${weeks.length}`);
  const m = emptyMatrix();
  weeks.forEach((week, col) => {
    for (const day of week.contributionDays) {
      if (!(day.weekday >= 0 && day.weekday < ROWS)) throw new Error(`weekday ${day.weekday} is outside 0..${ROWS - 1}`);
      m[day.weekday][col] = day.contributionCount;
    }
  });
  return m;
};

/** GitHub's green bands by count; height grows 0.2 per contribution up to the cap. */
export const contributionsPalette: Palette = (count) => {
  const faces = (): [string, string, string] => {
    if (count >= 30) return ['#216e39', '#144a26', '#1a5c30'];
    if (count >= 15) return ['#30a14e', '#1f6b34', '#278641'];
    if (count >= 5) return ['#40c463', '#2a8342', '#35a352'];
    return ['#9be9a8', '#6a9f73', '#83c48e'];
  };
  return { height: Math.min(count, CAP) * HEIGHT_UNIT, faces: faces() };
};
```

- [ ] **Step 5: Write the text adapter**

Create `src/graph/adapters/text.ts`:

```ts
import { COLS, emptyMatrix, type Matrix, type Palette } from '../ports.ts';

/** Variable-width pixel font, 7 rows tall (row 0 is the back of the plate). Lowercase x-height is rows 2-6. */
export const GLYPHS: Record<string, string[]> = {
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  e: ['....', '....', '.##.', '#..#', '####', '#...', '.###'],
  l: ['#', '#', '#', '#', '#', '#', '#'],
  c: ['....', '....', '.###', '#...', '#...', '#...', '.###'],
  o: ['....', '....', '.##.', '#..#', '#..#', '#..#', '.##.'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#...#'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
  ':': ['..', '..', '#.', '..', '..', '#.', '..'], // eyes spread apart, plus a spacer column before the mouth
  ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
};

/** Text centred on the plate, one column of spacing between glyphs; every pixel is a 1. */
export const textMatrix = (text: string): Matrix => {
  const glyphs = [...text].map((ch) => {
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    return glyph;
  });
  const width = glyphs.reduce((w, g) => w + g[0].length, 0) + glyphs.length - 1;
  if (width > COLS) throw new Error(`"${text}" is ${width} columns wide, the plate has ${COLS}`);
  const m = emptyMatrix();
  let x = Math.floor((COLS - width) / 2);
  for (const glyph of glyphs) {
    glyph.forEach((line, row) => {
      [...line].forEach((c, i) => {
        if (c === '#') m[row][x + i] = 1;
      });
    });
    x += glyph[0].length + 1;
  }
  return m;
};

/** Text blocks are low, so their top faces stay readable, and share one shade. */
export const textPalette: Palette = () => ({ height: 1.0, faces: ['#30a14e', '#1f6b34', '#278641'] });
```

- [ ] **Step 6: Verify**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm test`
Expected: all clean, `31 passed`.

- [ ] **Step 7: Commit**

```bash
git add src/graph/adapters/contributions.ts src/graph/adapters/contributions.test.ts src/graph/adapters/text.ts src/graph/adapters/text.test.ts
git commit -m "feat: add the contributions and text data adapters

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Transitions (grow, wave, hole)

**Files:**
- Create: `src/graph/adapters/transitions/grow.ts`, `wave.ts`, `hole.ts`
- Test: `src/graph/adapters/transitions/grow.test.ts`, `wave.test.ts`, `hole.test.ts`

**Interfaces:**
- Produces: `grow(options?: { duration?, stagger? }): WriteTransition`; `wave(options?: { duration?, stagger?, bump? }): WriteTransition`; `hole(options: { from: 'left' | 'right'; sweep?, fall? }): EraseTransition`; `HOLE_CLIP_ID = 'hole'`.

- [ ] **Step 1: Write the failing grow and wave tests**

Create `src/graph/adapters/transitions/grow.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Cell } from '../../ports.ts';
import { EASE_OUT, LINEAR } from '../../smil.ts';
import { grow } from './grow.ts';

const cell: Cell = { col: 10, row: 3, value: 7, height: 1.4, faces: ['#a', '#b', '#c'] };

describe('grow', () => {
  it('rises after a per-column stagger and lasts for the whole plate', () => {
    const t = grow();
    expect(t.duration).toBeCloseTo(52 * 0.04 + 0.8);
    const [a, b] = t.keyframes(cell);
    expect(a.at).toBeCloseTo(0.4);
    expect(a.height).toBe(0);
    expect(a.ease).toBe(LINEAR);
    expect(b.at).toBeCloseTo(1.2);
    expect(b.height).toBe(1.4);
    expect(b.ease).toBe(EASE_OUT);
  });

  it('takes custom timing', () => {
    const t = grow({ duration: 1, stagger: 0.1 });
    expect(t.duration).toBeCloseTo(52 * 0.1 + 1);
    expect(t.keyframes(cell)[1].at).toBeCloseTo(2);
  });
});
```

Create `src/graph/adapters/transitions/wave.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import type { Cell } from '../../ports.ts';
import { LINEAR } from '../../smil.ts';
import { wave } from './wave.ts';

const cell: Cell = { col: 20, row: 3, value: 1, height: 1, faces: ['#a', '#b', '#c'] };

describe('wave', () => {
  it('overshoots by the bump and settles at the standing height', () => {
    const t = wave();
    expect(t.duration).toBeCloseTo(52 * 0.05 + 0.6);
    const [a, b, c] = t.keyframes(cell);
    expect(a.at).toBeCloseTo(1);
    expect(a.height).toBe(0);
    expect(a.ease).toBe(LINEAR);
    expect(b.at).toBeCloseTo(1.27);
    expect(b.height).toBeCloseTo(2.5);
    expect(c.at).toBeCloseTo(1.6);
    expect(c.height).toBe(1);
  });

  it('takes a custom bump', () => {
    expect(wave({ bump: 0.5 }).keyframes(cell)[1].height).toBeCloseTo(1.5);
  });
});
```

- [ ] **Step 2: Write the failing hole test**

Create `src/graph/adapters/transitions/hole.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { type Cell, COLS, type Fragment, type RenderContext, ROWS, type Scene } from '../../ports.ts';
import { smil } from '../../smil.ts';
import { hole } from './hole.ts';

const faces: Cell['faces'] = ['#a', '#b', '#c'];
const fullPlate = (): Cell[] => {
  const cells: Cell[] = [];
  for (let col = 0; col < COLS; col++) for (let row = 0; row < ROWS; row++) cells.push({ col, row, value: 1, height: 1, faces });
  return cells;
};
const fakeScene = () => {
  const shared = new Map<string, unknown>();
  const renders: Array<(ctx: RenderContext) => Fragment> = [];
  const scene: Scene = {
    shared: <T>(id: string, init: () => T): T => {
      if (!shared.has(id)) shared.set(id, init());
      return shared.get(id) as T;
    },
    render: (fn) => {
      renders.push(fn);
    },
  };
  return { scene, renders };
};
const fallOf = (fallAt: Map<Cell, number>, cells: Cell[], col: number, row: number) =>
  fallAt.get(cells.find((c) => c.col === col && c.row === row)!)!;

describe('hole', () => {
  it('reaches every block on a full plate, left to right, within the sweep', () => {
    const cells = fullPlate();
    const fallAt = hole({ from: 'left' }).plan(cells, 10, fakeScene().scene);
    expect(fallAt.size).toBe(cells.length);
    for (const t of fallAt.values()) {
      expect(t).toBeGreaterThanOrEqual(10);
      expect(t).toBeLessThanOrEqual(15);
    }
    expect(fallOf(fallAt, cells, 0, 3)).toBeLessThan(fallOf(fallAt, cells, 52, 3));
    expect(fallOf(fallAt, cells, 0, 0)).toBeLessThan(fallOf(fallAt, cells, 52, 6));
  });

  it('sweeps right to left when from is right', () => {
    const cells = fullPlate();
    const fallAt = hole({ from: 'right' }).plan(cells, 0, fakeScene().scene);
    expect(fallAt.size).toBe(cells.length);
    expect(fallOf(fallAt, cells, 52, 3)).toBeLessThan(fallOf(fallAt, cells, 0, 3));
  });

  it('lasts one sweep plus one fall', () => {
    expect(hole({ from: 'left' }).duration).toBeCloseTo(5.5);
    expect(hole({ from: 'left', sweep: 2, fall: 0.25 }).duration).toBeCloseTo(2.25);
  });

  it('renders one shared pit for two sweeps plus falling copies per erase', () => {
    const { scene, renders } = fakeScene();
    const cells = fullPlate().slice(0, 7);
    hole({ from: 'left' }).plan(cells, 0, scene);
    hole({ from: 'right' }).plan(cells, 6, scene);
    const frags = renders.map((fn) => fn(smil(20)));
    expect(frags).toHaveLength(3);
    expect(frags[0].defs).toContain('<clipPath id="hole" clip-path="url(#plate)">');
    expect(frags[0].defs).toContain('<radialGradient id="pit"');
    expect(frags[0].under).toContain('fill="url(#pit)"');
    expect(frags[0].under?.match(/<animate /g)).toHaveLength(4); // cx, cy, rx, ry of one ellipse
    expect(frags[1].under).toContain('<g clip-path="url(#hole)">');
    expect(frags[1].under?.match(/<animateTransform/g)).toHaveLength(7);
    expect(frags[2].under?.match(/<animateTransform/g)).toHaveLength(7);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm vitest run src/graph/adapters/transitions`
Expected: FAIL, three files fail to load their module.

- [ ] **Step 4: Write grow and wave**

Create `src/graph/adapters/transitions/grow.ts`:

```ts
import { COLS, type WriteTransition } from '../../ports.ts';
import { EASE_OUT, LINEAR } from '../../smil.ts';

export type GrowOptions = { duration?: number; stagger?: number };

/** Blocks rise column by column, left to right, easing out at their standing height. */
export const grow = ({ duration = 0.8, stagger = 0.04 }: GrowOptions = {}): WriteTransition => ({
  duration: (COLS - 1) * stagger + duration,
  keyframes: (cell) => [
    { at: cell.col * stagger, height: 0, ease: LINEAR },
    { at: cell.col * stagger + duration, height: cell.height, ease: EASE_OUT },
  ],
});
```

Create `src/graph/adapters/transitions/wave.ts`:

```ts
import { COLS, type WriteTransition } from '../../ports.ts';
import { LINEAR } from '../../smil.ts';

export type WaveOptions = { duration?: number; stagger?: number; bump?: number };

const WAVE_UP = '0.2 0.8 0.3 1';
const WAVE_DOWN = '0.4 0 0.2 1';

/** Blocks rise column by column, overshoot by `bump`, and settle at their standing height. */
export const wave = ({ duration = 0.6, stagger = 0.05, bump = 1.5 }: WaveOptions = {}): WriteTransition => ({
  duration: (COLS - 1) * stagger + duration,
  keyframes: (cell) => {
    const t = cell.col * stagger;
    return [
      { at: t, height: 0, ease: LINEAR },
      { at: t + 0.45 * duration, height: cell.height + bump, ease: WAVE_UP },
      { at: t + duration, height: cell.height, ease: WAVE_DOWN },
    ];
  },
});
```

- [ ] **Step 5: Write the hole**

Create `src/graph/adapters/transitions/hole.ts`:

```ts
import { BASE, CELL, cellFaces, f2, GRID_H, GRID_W, painter, PITCH, proj, pts, S } from '../../geometry.ts';
import { PLATE_CLIP_ID } from '../../generator.ts';
import type { Cell, EraseTransition, RenderContext, Scene } from '../../ports.ts';
import { EASE_IN, LINEAR } from '../../smil.ts';

export type HoleFrom = 'left' | 'right';
export type HoleOptions = { from: HoleFrom; sweep?: number; fall?: number };

export const HOLE_CLIP_ID = 'hole';
const R0 = 4.2; // radius at the start of a sweep
const R1 = 5.5; // radius at the end; it grows as it eats (must stay > 3.95 to cover all 7 rows)
const X0 = -R1 - 1; // parked off the left edge
const X1 = GRID_W + R1 + 1; // parked off the right edge
const Y = GRID_H / 2; // the sweep runs along the middle row
const MAX_RY = R1 * S * 0.5 * Math.SQRT2; // px: the tallest the screen ellipse gets

type Sweep = { start: number; dir: 1 | -1; sweep: number };
type Layer = { sweeps: Sweep[] };

/** Hole position and radius `t` seconds into a sweep. */
const at = (t: number, { dir, sweep }: Sweep) => {
  const k = Math.min(1, Math.max(0, t / sweep));
  const [xa, xb] = dir > 0 ? [X0, X1] : [X1, X0];
  return { cx: xa + (xb - xa) * k, cy: Y, r: R0 + (R1 - R0) * k };
};

/** A world circle at plate height projects to an axis-aligned screen ellipse. */
const ellipse = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  const [sx, sy] = proj([cx, cy, BASE]);
  return { cx: sx, cy: sy, rx: r * S * 0.866 * Math.SQRT2, ry: r * S * 0.5 * Math.SQRT2 };
};

/** One pit element per build, driven by every sweep: park, sweep, drift to the next start, sweep, park. */
const layerOf = (scene: Scene): Layer =>
  scene.shared<Layer>('hole', () => {
    const layer: Layer = { sweeps: [] };
    scene.render((ctx) => {
      const sweeps = [...layer.sweeps].sort((a, b) => a.start - b.start);
      const times = sweeps.flatMap((s) => [s.start, s.start + s.sweep]);
      const shapes = sweeps.flatMap((s) => [ellipse(at(0, s)), ellipse(at(s.sweep, s))]);
      const first = shapes[0];
      const splines = times.slice(1).map(() => LINEAR);
      const element = (extra: string) => {
        const anims = (['cx', 'cy', 'rx', 'ry'] as const)
          .map((attr) => ctx.tween(attr, shapes.map((e) => f2(e[attr])), times, splines))
          .join('');
        return `<ellipse cx="${f2(first.cx)}" cy="${f2(first.cy)}" rx="${f2(first.rx)}" ry="${f2(first.ry)}" ${extra}>${anims}</ellipse>`;
      };
      return {
        defs:
          `<clipPath id="${HOLE_CLIP_ID}" clip-path="url(#${PLATE_CLIP_ID})">${element('')}</clipPath>` +
          '<radialGradient id="pit" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0d1117"/><stop offset="0.85" stop-color="#161b22"/><stop offset="1" stop-color="#30363d"/></radialGradient>',
        under: `<g clip-path="url(#${PLATE_CLIP_ID})">${element('fill="url(#pit)"')}</g>`,
      };
    });
    return layer;
  });

/** Copies of the blocks that drop through the pit, visible only inside the hole clip. */
const fallingCopies = (ctx: RenderContext, cells: Cell[], fallAt: Map<Cell, number>, fall: number): string => {
  const copies = [...cells]
    .filter((c) => fallAt.has(c))
    .sort(painter)
    .map((c) => {
      const t0 = fallAt.get(c)!;
      const t1 = t0 + fall;
      const drop = c.height * S + MAX_RY + 8; // px: block height plus hole half-height, so it fully exits the hole
      const body = cellFaces(c.col, c.row, c.height)
        .map((f, i) => `<polygon points="${pts(f)}" fill="${c.faces[i]}"/>`)
        .join('');
      const show = ctx.step('visibility', ['hidden', 'visible', 'hidden'], [t0, t1]);
      const move = ctx.tween('transform', ['0 0', `0 ${f2(drop)}`], [t0, t1], [EASE_IN], 'animateTransform', 'type="translate" ');
      return `<g visibility="hidden">${show}${move}${body}</g>`;
    });
  return `<g clip-path="url(#${HOLE_CLIP_ID})">${copies.join('')}</g>`;
};

/** A hole.io-style pit sweeps across the plate and every block drops through it when its centre is inside. */
export const hole = ({ from, sweep = 5.0, fall = 0.5 }: HoleOptions): EraseTransition => ({
  duration: sweep + fall,
  plan: (cells, start, scene) => {
    const s: Sweep = { start, dir: from === 'left' ? 1 : -1, sweep };
    layerOf(scene).sweeps.push(s);
    const fallAt = new Map<Cell, number>();
    for (const c of cells) {
      const bx = c.col * PITCH + CELL / 2;
      const by = c.row * PITCH + CELL / 2;
      for (let t = 0; t <= sweep; t += 0.01) {
        const h = at(t, s);
        if (Math.hypot(bx - h.cx, by - h.cy) <= h.r - 0.2) {
          fallAt.set(c, start + t);
          break;
        }
      }
    }
    scene.render((ctx) => ({ under: fallingCopies(ctx, cells, fallAt, fall) }));
    return fallAt;
  },
});
```

- [ ] **Step 6: Verify**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm test`
Expected: all clean, `39 passed`.

- [ ] **Step 7: Commit**

```bash
git add src/graph/adapters/transitions
git commit -m "feat: add the grow, wave and hole transitions

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: The chain, the calendar fetcher and the CLI

**Files:**
- Create: `src/graph.ts`, `src/calendar.ts`, `src/generate.ts`
- Test: `src/graph.test.ts`, `src/calendar.test.ts`
- Modify: `.gitignore` (add `dist/`)

**Interfaces:**
- Produces: `renderGraph(weeks: CalendarWeek[], greeting = 'welcome :)'): string`; `fetchCalendar(login, token, fetchImpl = fetch): Promise<unknown>`; `weeksOf(body: unknown): CalendarWeek[]`; `pnpm generate [calendar.json]`.

- [ ] **Step 1: Write the failing chain test**

Create `src/graph.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { renderGraph } from './graph.ts';
import { HEIGHT, VIEW_BOX, WIDTH } from './graph/geometry.ts';

const calendar = (cols: number) =>
  Array.from({ length: cols }, (_, col) => ({
    contributionDays: Array.from({ length: 7 }, (_, weekday) => ({
      contributionCount: (col * 7 + weekday) % 5 === 0 ? ((col + weekday) % 45) + 1 : 0,
      weekday,
    })),
  }));

describe('renderGraph', () => {
  it('renders the full cycle on the constant canvas', () => {
    const svg = renderGraph(calendar(53));
    expect(svg).toContain(`viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}"`);
    expect(svg).toContain('<clipPath id="hole"');
    expect(svg).toContain('fill="url(#pit)"');
    expect(svg.length).toBeGreaterThan(100_000);
  });

  it('renders a 52-week calendar on the same canvas', () => {
    const head = (svg: string) => svg.slice(0, svg.indexOf('>') + 1);
    expect(head(renderGraph(calendar(52)))).toBe(head(renderGraph(calendar(53))));
  });

  it('takes a different greeting', () => {
    expect(renderGraph(calendar(53), 'ol')).toContain('<svg ');
    expect(() => renderGraph(calendar(53), 'x')).toThrow(/glyph/);
  });
});
```

- [ ] **Step 2: Write the failing calendar test**

Create `src/calendar.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { fetchCalendar, weeksOf } from './calendar.ts';

const respond = (status: number, body: unknown) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
const calendar = (weeks: unknown[]) => ({
  data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } },
});

describe('fetchCalendar', () => {
  it('rejects when the token is missing', async () => {
    await expect(fetchCalendar('worgho2', undefined, respond(200, calendar([{}])))).rejects.toThrow(/GITHUB_TOKEN/);
  });

  it('posts the query for the login with a bearer token', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fake = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return { ok: true, status: 200, json: async () => calendar([{}]) };
    };
    await fetchCalendar('worgho2', 'tok', fake);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.github.com/graphql');
    expect(calls[0].init.method).toBe('POST');
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('bearer tok');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.variables).toEqual({ login: 'worgho2' });
    expect(body.query).toContain('contributionCalendar');
  });

  it('rejects on an HTTP error', async () => {
    await expect(fetchCalendar('worgho2', 'tok', respond(502, {}))).rejects.toThrow(/HTTP 502/);
  });

  it('rejects on GraphQL errors', async () => {
    const body = { data: null, errors: [{ message: 'Could not resolve to a User' }] };
    await expect(fetchCalendar('worgho2', 'tok', respond(200, body))).rejects.toThrow(/Could not resolve/);
  });

  it('resolves with the response body', async () => {
    const body = calendar([{ contributionDays: [] }]);
    await expect(fetchCalendar('worgho2', 'tok', respond(200, body))).resolves.toEqual(body);
  });
});

describe('weeksOf', () => {
  it('returns the weeks array', () => {
    const weeks = [{ contributionDays: [] }, { contributionDays: [] }];
    expect(weeksOf(calendar(weeks))).toBe(weeks);
  });

  it('throws when the calendar is missing or empty', () => {
    expect(() => weeksOf({})).toThrow(/no weeks/);
    expect(() => weeksOf({ data: { user: null } })).toThrow(/no weeks/);
    expect(() => weeksOf(calendar([]))).toThrow(/no weeks/);
  });
});
```

- [ ] **Step 3: Run them to verify they fail**

Run: `pnpm vitest run src/graph.test.ts src/calendar.test.ts`
Expected: FAIL, both fail to load their module.

- [ ] **Step 4: Write the chain**

Create `src/graph.ts`:

```ts
import { type CalendarWeek, contributionsMatrix, contributionsPalette } from './graph/adapters/contributions.ts';
import { textMatrix, textPalette } from './graph/adapters/text.ts';
import { grow } from './graph/adapters/transitions/grow.ts';
import { hole } from './graph/adapters/transitions/hole.ts';
import { wave } from './graph/adapters/transitions/wave.ts';
import { Generator } from './graph/generator.ts';

/**
 * The profile animation: the contributions grow in, a hole eats them left to right,
 * a greeting waves up, the hole eats it right to left, and the cycle repeats.
 */
export const renderGraph = (weeks: CalendarWeek[], greeting = 'welcome :)'): string =>
  new Generator()
    .write({ data: contributionsMatrix(weeks), palette: contributionsPalette, transition: grow() })
    .delay(1.5)
    .erase({ transition: hole({ from: 'left' }) })
    .delay(0.5)
    .write({ data: textMatrix(greeting), palette: textPalette, transition: wave() })
    .delay(0.5)
    .erase({ transition: hole({ from: 'right' }) })
    .delay(0.5)
    .build();
```

- [ ] **Step 5: Write the calendar fetcher**

Create `src/calendar.ts`:

```ts
import type { CalendarWeek } from './graph/adapters/contributions.ts';

const GRAPHQL_URL = 'https://api.github.com/graphql';

export const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }
    }
  }
}`;

type FetchLike = (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/**
 * Fetches the raw GraphQL response for a login. `fetchImpl` is injectable for tests.
 * Throws when the token is missing, the request fails, or GraphQL reports errors.
 */
export async function fetchCalendar(login: string, token: string | undefined, fetchImpl: FetchLike = fetch): Promise<unknown> {
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const res = await fetchImpl(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'worgho2/worgho2 contribution graph',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: HTTP ${res.status}`);
  const body = (await res.json()) as { errors?: Array<{ message: string }> };
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    throw new Error(`GraphQL errors: ${body.errors.map((e) => e.message).join('; ')}`);
  }
  return body;
}

/** Extracts the weeks array from a GraphQL response body, or throws if there is none. */
export function weeksOf(body: unknown): CalendarWeek[] {
  const weeks = (body as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { weeks?: unknown } } } } })
    ?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks) || weeks.length === 0) throw new Error('calendar has no weeks');
  return weeks as CalendarWeek[];
}
```

- [ ] **Step 6: Write the CLI and ignore its output**

Append to `.gitignore`:

```
# Generated output
dist/
```

Create `src/generate.ts`:

```ts
// Renders dist/contributions.svg.
//   pnpm generate                 fetches the live calendar for LOGIN using GITHUB_TOKEN
//   pnpm generate calendar.json   renders a saved GraphQL response instead (no token needed)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fetchCalendar, weeksOf } from './calendar.ts';
import { renderGraph } from './graph.ts';

const LOGIN = 'worgho2';
const OUT = 'dist/contributions.svg';

async function main(): Promise<void> {
  const inPath = process.argv[2];
  const body: unknown = inPath ? JSON.parse(readFileSync(inPath, 'utf8')) : await fetchCalendar(LOGIN, process.env.GITHUB_TOKEN);
  const weeks = weeksOf(body);
  const svg = renderGraph(weeks);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg);
  const summary = {
    out: OUT,
    source: inPath ?? `graphql:${LOGIN}`,
    weeks: weeks.length,
    activeDays: weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length,
    bytes: Buffer.byteLength(svg),
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err: unknown) => {
  console.error(`generate failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
```

- [ ] **Step 7: Verify tests and both CLI modes**

Run: `pnpm lint:fix && pnpm lint && pnpm typecheck && pnpm test`
Expected: all clean, `49 passed`.

Run: `pnpm generate _dev/contributions-3d/contributions.json && head -c 120 dist/contributions.svg`
Expected: a summary with `"weeks": 53`, `activeDays` matching the number of days with contributions, `bytes` in the hundreds of kilobytes, and an `<svg …>` line with `viewBox="-119.12 -130.00 835.77 599.00" width="836" height="599"`.

Run: `GITHUB_TOKEN=$(gh auth token) pnpm generate`
Expected: a summary with `"source": "graphql:worgho2"`.

Run: `env -u GITHUB_TOKEN pnpm generate; echo "exit $?"`
Expected: `generate failed: GITHUB_TOKEN is not set`, `exit 1`.

Run: `GITHUB_TOKEN=bad pnpm generate; echo "exit $?"`
Expected: `generate failed: GraphQL request failed: HTTP 401`, `exit 1`.

- [ ] **Step 8: Visual check with headless Chrome**

Run, from the repo root (the scratchpad path is the session's; any writable directory works):

```bash
OUT=/tmp/claude-1000/-home-worgho2-Projects-obf-software-worgho2/be83aa4b-4785-4ce1-b601-a86610090bef/scratchpad
for ms in 1500 4000 9000 13000 17000; do
  google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --window-size=900,650 \
    --virtual-time-budget=$ms --screenshot=$OUT/frame-$ms.png "file://$PWD/dist/contributions.svg" 2>/dev/null
done
ls -la $OUT/frame-*.png
```

Then Read each PNG. Expected, in order: bars part-way through growing in from the left; the full graph standing; the hole mid-sweep with bars gone on its left; the greeting standing in green blocks; the hole sweeping back from the right. If `--virtual-time-budget` does not advance SMIL and every frame shows the empty plate, open the SVG in Chrome via the browser tools instead and watch one cycle.

- [ ] **Step 9: Commit**

```bash
git add .gitignore src/graph.ts src/graph.test.ts src/calendar.ts src/calendar.test.ts src/generate.ts
git commit -m "feat: add the generate command that renders the profile graph

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Daily workflow, Pages and keep-alive

**Files:**
- Create: `.github/workflows/contributions.yml`, `.keepalive`

- [ ] **Step 1: Create the keep-alive file**

Run: `date -u +%Y-%m-%d > .keepalive && cat .keepalive`
Expected: today's date.

- [ ] **Step 2: Write the workflow**

Create `.github/workflows/contributions.yml`:

```yaml
name: Contributions

on:
  schedule:
    # Daily. An odd minute avoids the top-of-hour queue; GitHub may still run it late.
    - cron: '17 3 * * *'
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - src/**
      - package.json
      - pnpm-lock.yaml
      - .github/workflows/contributions.yml

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  publish:
    name: Generate and deploy
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v7
        with:
          fetch-depth: 1

      - name: Setup pnpm
        uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node
        uses: actions/setup-node@v7
        with:
          node-version-file: .nvmrc
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate the SVG
        run: pnpm generate
        env:
          GITHUB_TOKEN: ${{ github.token }}

      - name: Configure Pages
        uses: actions/configure-pages@v6

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist

      - name: Deploy to Pages
        id: deployment
        uses: actions/deploy-pages@v5

      # GitHub disables scheduled workflows after 60 days without a push. Once a month, push one.
      - name: Keep the schedule alive
        if: github.event_name == 'schedule'
        run: |
          if [ "$(date -u +%d)" != "01" ]; then
            echo "Not the first day of the month; nothing to do."
            exit 0
          fi
          date -u +%Y-%m-%d > .keepalive
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add .keepalive
          git commit -m "chore: keep the scheduled workflow alive"
          git push
```

- [ ] **Step 3: Commit and push**

```bash
pnpm lint
git add .github/workflows/contributions.yml .keepalive
git commit -m "ci: generate the contribution graph daily and deploy it to GitHub Pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 4: Enable Pages with the Actions source**

Run: `gh api -X POST repos/worgho2/worgho2/pages -f build_type=workflow`
Expected: a JSON object with `"build_type": "workflow"`. If it returns 409, Pages already exists: run `gh api -X PUT repos/worgho2/worgho2/pages -f build_type=workflow` instead. If it returns 403 or 404, stop and ask the user to set Settings → Pages → Source to "GitHub Actions" in the browser, then continue.

- [ ] **Step 5: Run the workflow and verify the URL**

The push in Step 3 already triggered the workflow (it touched the workflow file). Check it, and if Pages was enabled only after it ran, dispatch it again:

```bash
gh run list --workflow=contributions.yml --limit 3
gh workflow run contributions.yml
sleep 120
gh run list --workflow=contributions.yml --limit 1
```

Expected: the latest run is `completed success`. If still `in_progress`, wait and list again. On failure, `gh run view --log-failed` on that run id and fix before continuing.

Run: `curl -sI https://worgho2.github.io/worgho2/contributions.svg | grep -i -E '^(HTTP|content-type|content-length|cache-control)'`
Expected: `HTTP/2 200`, `content-type: image/svg+xml`, a content-length in the hundreds of kilobytes, and a `cache-control` header.

---

### Task 7: Point the README at Pages

Only after Task 6 Step 5 shows the URL serving.

**Files:**
- Modify: `README.md`
- Delete: `contributions.svg`

- [ ] **Step 1: Update the README**

Replace the whole content of `README.md` with:

```html
<img src="https://worgho2.github.io/worgho2/contributions.svg" alt="3D contribution graph" width="836" height="599">
```

- [ ] **Step 2: Remove the committed SVG**

Run: `git rm -q contributions.svg && pnpm lint && git status --short`
Expected: lint clean; status shows `D  contributions.svg` and ` M README.md`.

- [ ] **Step 3: Commit and push**

```bash
git add README.md
git commit -m "docs: load the contribution graph from GitHub Pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git push origin main
```

- [ ] **Step 4: Verify on the profile**

Open `https://github.com/worgho2`. The graph renders at 836 by 599, starts from an empty plate and grows in, then cycles. If the image is broken, check that the Pages URL still serves and that the README URL matches it character for character.

---

## Self-review notes

- Spec coverage: ports, builder, adapters, transitions, geometry, SMIL (Tasks 1-4); chain, CLI modes and failure behaviour (Task 5); workflow triggers, permissions, steps, keep-alive, Pages source, CI steps (Tasks 1 and 6); README with the fixed size (Task 7); tests next to every unit plus the visual check (Tasks 1-5).
- Names used across tasks: `ROWS`, `COLS`, `emptyMatrix`, port types (Task 1) are consumed everywhere; `PLATE_CLIP_ID`, `Generator` (Task 2) are consumed by the hole and the chain; `CalendarWeek` (Task 3) is consumed by `calendar.ts` and `graph.ts` (Task 5); `grow`, `wave`, `hole` (Task 4) are consumed by the chain (Task 5); `pnpm generate` (Task 1's script) is consumed by the workflow (Task 6).
- Test counts per task assume every earlier test still passes: 6, 22, 31, 39, 49.
