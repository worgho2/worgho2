import { cellFaces, HEIGHT, MAX_HEIGHT, PLATE_CLIP_ID, painter, plateFaces, pts, VIEW_BOX, WIDTH } from './geometry.ts';
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
      if (at < 0 || at > transition.duration + 1e-9)
        throw new Error(`write: keyframe at ${at}s is outside the ${transition.duration}s duration`);
      if (i > 0 && at < kfs[i - 1].at) throw new Error('write: keyframes are not ordered');
      if (height < 0 || height > MAX_HEIGHT)
        throw new Error(`write: keyframe height ${height} is outside [0, ${MAX_HEIGHT}]`);
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
    if (this.#standing)
      throw new Error('build: the plate is not empty at the end of the cycle; erase it so the loop repeats cleanly');
    const ctx = smil(this.#cursor);
    const fragments = this.#renders.map((fn) => fn(ctx));
    const out: string[] = [];
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}">`);
    out.push('<defs>');
    out.push(`<clipPath id="${PLATE_CLIP_ID}"><polygon points="${pts(plateFaces[0])}"/></clipPath>`);
    out.push(...fragments.map((f) => f.defs ?? ''));
    out.push('</defs>');
    plateFaces.forEach((f, i) => {
      out.push(`<polygon points="${pts(f)}" fill="${PLATE_SHADE[i]}"/>`);
    });
    out.push(...fragments.map((f) => f.under ?? ''));
    for (const layer of this.#layers) {
      for (const cell of [...layer.cells].sort(painter)) out.push(standingBlock(ctx, layer, cell));
    }
    out.push('</svg>');
    return `${out.filter((line) => line !== '').join('\n')}\n`;
  }
}
