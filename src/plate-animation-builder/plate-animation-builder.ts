import { COLS, FLATTEN, LINEAR, MAX_HEIGHT, PLATE_CLIP_ID, PLATE_SHADE, ROWS } from './constants.ts';
import { blockFaces, HEIGHT, painter, plateFaces, pts, VIEW_BOX, WIDTH } from './geometry.ts';
import type {
  Block,
  Delay,
  Erase,
  Fragment,
  Layer,
  Palette,
  Plate,
  RenderContext,
  Scene,
  Write,
  WriteTransition,
} from './model.ts';
import { smil } from './smil.ts';

/**
 * Builds the animated plate. Ops run in order; the plate starts empty and must end empty so the
 * loop repeats cleanly. `build()` returns the SVG document as a string.
 */
export class PlateAnimationBuilder {
  private layers: Layer[] = [];
  private standing: Layer | null = null;
  private cursor = 0;
  private shared = new Map<string, unknown>();
  private renders: Array<(ctx: RenderContext) => Fragment> = [];
  private scene: Scene = {
    shared: <T>(id: string, init: () => T): T => {
      if (!this.shared.has(id)) this.shared.set(id, init());
      return this.shared.get(id) as T;
    },
    render: (fn) => {
      this.renders.push(fn);
    },
  };

  /**
   * Applies the palette to every non-zero value of a ROWS x COLS plate. Rejects a plate of the wrong
   * shape, a plate with no blocks, and a block taller than the canvas.
   */
  private static blocksOf(data: Plate, palette: Palette): Block[] {
    if (data.length !== ROWS || data.some((r) => r.length !== COLS)) {
      throw new Error(`write: the plate must be ${ROWS}x${COLS}`);
    }

    const blocks: Block[] = [];

    data.forEach((values, row) => {
      values.forEach((value, col) => {
        if (value === 0) return;
        const { height, faces } = palette(value);

        if (!(height > 0 && height <= MAX_HEIGHT)) {
          throw new Error(`write: block height ${height} at ${col},${row} is outside (0, ${MAX_HEIGHT}]`);
        }

        blocks.push({ col, row, value, height, faces });
      });
    });

    if (blocks.length === 0) {
      throw new Error('write: the plate has no blocks');
    }

    return blocks;
  }

  /**
   * Every block needs at least one keyframe, in order, inside the transition's duration and no taller
   * than the canvas.
   */
  private static checkKeyframes(blocks: Block[], transition: WriteTransition) {
    for (const block of blocks) {
      const kfs = transition.keyframes(block);

      if (kfs.length === 0) {
        throw new Error(`write: no keyframes for block ${block.col},${block.row}`);
      }

      for (let i = 0; i < kfs.length; i++) {
        const { at, height } = kfs[i];

        if (at < 0 || at > transition.duration + 1e-9) {
          throw new Error(`write: keyframe at ${at}s is outside the ${transition.duration}s duration`);
        }

        if (i > 0 && at < kfs[i - 1].at) {
          throw new Error('write: keyframes are not ordered');
        }

        if (height < 0 || height > MAX_HEIGHT) {
          throw new Error(`write: keyframe height ${height} is outside [0, ${MAX_HEIGHT}]`);
        }
      }
    }
  }

  /**
   * A standing block: hidden until its first keyframe, visible until its fall, faces tweening through the keyframes.
   */
  private static standingBlock(ctx: RenderContext, layer: Layer, block: Block): string {
    const kfs = layer.transition.keyframes(block);
    const fall = layer.fallAt.get(block)!;
    const show = layer.start + kfs[0].at;
    const times = [...kfs.map((kf) => layer.start + kf.at), fall, Math.min(fall + FLATTEN, ctx.period)];
    const heights = [...kfs.map((kf) => kf.height), kfs[kfs.length - 1].height, 0];
    const splines = [...kfs.slice(1).map((kf) => kf.ease), LINEAR, LINEAR];

    const polys = [0, 1, 2]
      .map((i) => {
        const values = heights.map((h) => pts(blockFaces(block.col, block.row, h)[i]));
        const rest = pts(blockFaces(block.col, block.row, 0)[i]);
        return `<polygon points="${rest}" fill="${block.faces[i]}">${ctx.tween('points', values, times, splines)}</polygon>`;
      })
      .join('');

    return `<g opacity="0">${ctx.step('opacity', ['0', '1', '0'], [show, fall])}${polys}</g>`;
  }

  /**
   * Places a plate of values on the empty plate with a transition.
   */
  write(input: Write): this {
    if (this.standing) {
      throw new Error('write: the plate is not empty; erase it first');
    }

    const blocks = PlateAnimationBuilder.blocksOf(input.data, input.palette);

    PlateAnimationBuilder.checkKeyframes(blocks, input.transition);

    const layer: Layer = {
      start: this.cursor,
      blocks,
      transition: input.transition,
      fallAt: new Map(),
    };

    this.layers.push(layer);
    this.standing = layer;
    this.cursor += input.transition.duration;

    return this;
  }

  /**
   * Holds the current state for `duration` seconds.
   */
  delay(input: Delay): this {
    if (!(input.duration >= 0)) {
      throw new Error(`delay: expected a non-negative number of seconds, got ${input.duration}`);
    }

    this.cursor += input.duration;

    return this;
  }

  /**
   * Removes everything standing with a transition.
   */
  erase(input: Erase): this {
    const layer = this.standing;

    if (!layer) {
      throw new Error('erase: the plate is empty');
    }

    const fallAt = input.transition.plan(layer.blocks, this.cursor, this.scene);
    const missed = layer.blocks.filter((b) => !fallAt.has(b));

    if (missed.length > 0) {
      throw new Error(`erase: ${missed.length} blocks are never reached by the transition`);
    }

    layer.fallAt = fallAt;
    this.standing = null;
    this.cursor += input.transition.duration;

    return this;
  }

  /**
   * Emits the SVG document: the constant canvas, `<defs>` with the plate clip path and the transitions'
   * defs, the plate, the transitions' under-layers, then every standing block back to front. Fails when
   * nothing was written or blocks are still standing.
   */
  build(): string {
    if (this.layers.length === 0) {
      throw new Error('build: nothing to draw');
    }

    if (this.standing) {
      throw new Error('build: the plate is not empty at the end of the cycle; erase it so the loop repeats cleanly');
    }

    const ctx = smil(this.cursor);
    const fragments = this.renders.map((fn) => fn(ctx));
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

    for (const layer of this.layers) {
      for (const block of [...layer.blocks].sort(painter))
        out.push(PlateAnimationBuilder.standingBlock(ctx, layer, block));
    }

    out.push('</svg>');

    return `${out.filter((line) => line !== '').join('\n')}\n`;
  }
}
