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
