/**
 * ROWS x COLS numbers; 0 means no block. Writables decide what a non-zero value means.
 */
export type Plate = number[][];

/**
 * A color that can be used to style elements.
 */
export type Color =
  | `#${string}`
  | `rgb(${number},${number},${number})`
  | `rgba(${number},${number},${number},${number})`;

/**
 * Colours of the three visible faces of a block.
 */
export type Faces = [top: Color, left: Color, right: Color];

/**
 * A block on the plate, after the palette has been applied.
 */
export type Block = {
  /**
   * Column on the plate, 0 at the left edge.
   */
  col: number;
  /**
   * Row on the plate, 0 at the back edge.
   */
  row: number;
  /**
   * The plate value the block was drawn from.
   */
  value: number;
  /**
   * Standing height in world units, within (0, MAX_HEIGHT].
   */
  height: number;
  /**
   * Colours of the top, left and right faces.
   */
  faces: Faces;
};

/**
 * Maps a plate value to the block it draws.
 */
export type Palette = (value: number) => {
  /**
   * Standing height in world units, within (0, MAX_HEIGHT].
   */
  height: number;
  /**
   * Colours of the top, left and right faces.
   */
  faces: Faces;
};

/**
 * SMIL keySplines control points, e.g. '0.2 0.8 0.2 1'.
 */
export type Spline = string;

/**
 * Height of a block `at` seconds after the op starts; `ease` shapes the segment that ends here.
 */
export type Keyframe = {
  /**
   * Seconds after the op starts.
   */
  at: number;
  /**
   * Height in world units at that moment, within [0, MAX_HEIGHT].
   */
  height: number;
  /**
   * Spline of the segment that ends at this keyframe; ignored on the first keyframe.
   */
  ease: Spline;
};

/**
 * Markup a transition contributes at build time.
 */
export type Fragment = {
  /**
   * Markup for the `<defs>` block: clip paths, gradients, anything referenced by id.
   */
  defs?: string;
  /**
   * Markup drawn between the plate and the standing blocks.
   */
  under?: string;
};

/**
 * Animation helpers for one cycle, handed to render callbacks once the period is known.
 */
export type RenderContext = {
  /**
   * Seconds one cycle takes; every animation spans it and repeats.
   */
  period: number;
  /**
   * An `<animate>` (or `tag`) that reaches values[i] at times[i], easing each segment with splines[i - 1].
   * `extra` is inserted verbatim among the attributes.
   */
  tween: (attr: string, values: string[], times: number[], splines: Spline[], tag?: string, extra?: string) => string;
  /**
   * A discrete `<animate>` that shows values[0] from 0 and switches to values[i] at times[i - 1].
   */
  step: (attr: string, values: string[], times: number[]) => string;
};

/**
 * A scene in the animation.
 */
export type Scene = {
  /**
   * Returns the object registered under `id`, creating it with `init` on first use.
   */
  shared: <T>(id: string, init: () => T) => T;
  /**
   * Registers markup to emit at build time. Fragments are emitted in registration order.
   */
  render: (fn: (ctx: RenderContext) => Fragment) => void;
};

/**
 * A port for writing transitions.
 */
export interface WriteTransition {
  /**
   * Seconds the op takes; every keyframe lies within it.
   */
  duration: number;
  /**
   * Height over time for one block. The last keyframe is the standing height.
   */
  keyframes: (block: Block) => Keyframe[];
}

/**
 * A port for erasing transitions.
 */
export interface EraseTransition {
  /**
   * Seconds the op takes; every block has vanished by then.
   */
  duration: number;
  /**
   * Absolute time each block vanishes. A block missing from the map is an error.
   */
  plan: (blocks: Block[], start: number, scene: Scene) => Map<Block, number>;
}

/**
 * One write and the erase that follows it, as the builder keeps them until `build()`.
 */
export type Layer = {
  /**
   * Seconds into the cycle the write starts.
   */
  start: number;
  /**
   * The blocks the write puts on the plate.
   */
  blocks: Block[];
  /**
   * How the blocks rise.
   */
  transition: WriteTransition;
  /**
   * Absolute time each block vanishes; filled in by the erase that follows the write.
   */
  fallAt: Map<Block, number>;
};

/**
 * A port for writing
 */
export interface Write {
  /**
   * What to draw, ROWS x COLS values.
   */
  data: Plate;
  /**
   * How a value becomes a block.
   */
  palette: Palette;
  /**
   * How the blocks rise.
   */
  transition: WriteTransition;
}

/**
 * A port for erasing
 */
export interface Erase {
  /**
   * How the standing blocks vanish.
   */
  transition: EraseTransition;
}

/**
 * A port for holding the current state
 */
export interface Delay {
  /**
   * Seconds to hold; nothing moves.
   */
  duration: number;
}
