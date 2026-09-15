import {
  BASE,
  CELL,
  EASE_IN,
  GRID_H,
  GRID_W,
  LINEAR,
  PITCH,
  PLATE_CLIP_ID,
  S,
} from '../../plate-animation-builder/constants.ts';
import { blockFaces, f2, painter, proj, pts } from '../../plate-animation-builder/geometry.ts';
import type { Block, EraseTransition, RenderContext, Scene } from '../../plate-animation-builder/model.ts';

/**
 * The edge of the plate the hole enters from.
 */
export type HoleFrom = 'left' | 'right';

/**
 * Direction and timing of the hole transition.
 */
export type HoleOptions = {
  /**
   * The edge the hole enters from; it exits at the opposite one.
   */
  from: HoleFrom;
  /**
   * Seconds the hole takes to cross the plate. Defaults to 5.
   */
  sweep?: number;
  /**
   * Seconds a block takes to drop out of sight once the hole reaches it. Defaults to 0.5.
   */
  fall?: number;
};

/**
 * One crossing of the plate.
 */
type Sweep = {
  /**
   * Seconds into the cycle the crossing starts.
   */
  start: number;
  /**
   * +1 left to right, -1 right to left.
   */
  dir: 1 | -1;
  /**
   * Seconds the crossing takes.
   */
  sweep: number;
};

/**
 * The one pit of a build, shared by every hole erase so a single ellipse plays all the sweeps.
 */
type Pit = {
  /**
   * Every crossing planned so far, in the order the erases were added.
   */
  sweeps: Sweep[];
};

/**
 * Clip path id of the pit, shaped like the hole at every moment of the cycle.
 */
export const HOLE_CLIP_ID = 'hole';
/**
 * radius at the start of a sweep
 */
const R0 = 4.2;
/**
 * radius at the end; it grows as it eats (must stay > 3.95 to cover all 7 rows)
 */
const R1 = 5.5;
/**
 * parked off the left edge
 */
const X0 = -R1 - 1;
/**
 * parked off the right edge
 */
const X1 = GRID_W + R1 + 1;
/**
 * the sweep runs along the middle row
 */
const Y = GRID_H / 2;
/**
 * px: the tallest the screen ellipse gets
 */
const MAX_RY = R1 * S * 0.5 * Math.SQRT2;

/**
 * Hole position and radius `t` seconds into a sweep.
 */
const at = (t: number, { dir, sweep }: Sweep) => {
  const k = Math.min(1, Math.max(0, t / sweep));
  const [xa, xb] = dir > 0 ? [X0, X1] : [X1, X0];

  return {
    cx: xa + (xb - xa) * k,
    cy: Y,
    r: R0 + (R1 - R0) * k,
  };
};

/**
 * A world circle at plate height projects to an axis-aligned screen ellipse.
 */
const ellipse = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  const [sx, sy] = proj([cx, cy, BASE]);

  return {
    cx: sx,
    cy: sy,
    rx: r * S * 0.866 * Math.SQRT2,
    ry: r * S * 0.5 * Math.SQRT2,
  };
};

/**
 * One pit element per build, driven by every sweep: park, sweep, drift to the next start, sweep, park.
 */
const pitOf = (scene: Scene): Pit =>
  scene.shared<Pit>('hole', () => {
    const pit: Pit = {
      sweeps: [],
    };

    scene.render((ctx) => {
      const sweeps = [...pit.sweeps].sort((a, b) => a.start - b.start);
      const times = sweeps.flatMap((s) => [s.start, s.start + s.sweep]);
      const shapes = sweeps.flatMap((s) => [ellipse(at(0, s)), ellipse(at(s.sweep, s))]);
      const first = shapes[0];
      const splines = times.slice(1).map(() => LINEAR);

      const element = (extra: string) => {
        const anims = (['cx', 'cy', 'rx', 'ry'] as const)
          .map((attr) =>
            ctx.tween(
              attr,
              shapes.map((e) => f2(e[attr])),
              times,
              splines,
            ),
          )
          .join('');

        return `<ellipse cx="${f2(first.cx)}" cy="${f2(first.cy)}" rx="${f2(first.rx)}" ry="${f2(first.ry)}"${extra ? ` ${extra}` : ''}>${anims}</ellipse>`;
      };

      return {
        defs:
          `<clipPath id="${HOLE_CLIP_ID}" clip-path="url(#${PLATE_CLIP_ID})">${element('')}</clipPath>` +
          '<radialGradient id="pit" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#0d1117"/><stop offset="0.85" stop-color="#161b22"/><stop offset="1" stop-color="#30363d"/></radialGradient>',
        under: `<g clip-path="url(#${PLATE_CLIP_ID})">${element('fill="url(#pit)"')}</g>`,
      };
    });

    return pit;
  });

/**
 * Copies of the blocks that drop through the pit, visible only inside the hole clip.
 */
const fallingCopies = (ctx: RenderContext, blocks: Block[], fallAt: Map<Block, number>, fall: number): string => {
  const copies = [...blocks].sort(painter).map((c) => {
    const t0 = fallAt.get(c)!;
    const t1 = t0 + fall;
    // px: block height plus hole half-height, so it fully exits the hole
    const drop = c.height * S + MAX_RY + 8;

    const body = blockFaces(c.col, c.row, c.height)
      .map((f, i) => `<polygon points="${pts(f)}" fill="${c.faces[i]}"/>`)
      .join('');

    const show = ctx.step('visibility', ['hidden', 'visible', 'hidden'], [t0, t1]);

    const move = ctx.tween(
      'transform',
      ['0 0', `0 ${f2(drop)}`],
      [t0, t1],
      [EASE_IN],
      'animateTransform',
      'type="translate" ',
    );

    return `<g visibility="hidden">${show}${move}${body}</g>`;
  });

  return `<g clip-path="url(#${HOLE_CLIP_ID})">${copies.join('')}</g>`;
};

/**
 * A hole.io-style pit sweeps across the plate and every block drops through it when its centre is inside.
 */
export const hole = ({ from, sweep = 5.0, fall = 0.5 }: HoleOptions): EraseTransition => ({
  duration: sweep + fall,
  plan: (blocks, start, scene) => {
    const s: Sweep = {
      start,
      dir: from === 'left' ? 1 : -1,
      sweep,
    };

    pitOf(scene).sweeps.push(s);

    const fallAt = new Map<Block, number>();

    for (const b of blocks) {
      const bx = b.col * PITCH + CELL / 2;
      const by = b.row * PITCH + CELL / 2;

      for (let t = 0; t <= sweep; t += 0.01) {
        const h = at(t, s);

        if (Math.hypot(bx - h.cx, by - h.cy) <= h.r - 0.2) {
          fallAt.set(b, start + t);
          break;
        }
      }
    }

    scene.render((ctx) => ({ under: fallingCopies(ctx, blocks, fallAt, fall) }));

    return fallAt;
  },
});
