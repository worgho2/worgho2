import { BASE, CELL, GRID_H, GRID_W, MARGIN, MAX_HEIGHT, PAD, PITCH, S } from './constants.ts';

/**
 * A point in world units: x runs along the columns, y along the rows, z up.
 */
export type Point3 = [number, number, number];
/**
 * A point on the canvas, in pixels.
 */
export type Point2 = [number, number];
/**
 * The four corners of a face, in drawing order.
 */
export type Quad = [Point3, Point3, Point3, Point3];

/**
 * Isometric projection: x recedes to the right, y to the left, z straight up.
 */
export const proj = ([x, y, z]: Point3): Point2 => [(x - y) * 0.866 * S, ((x + y) * 0.5 - z) * S];
/**
 * A number with two decimals, the precision every coordinate is emitted with.
 */
export const f2 = (v: number): string => v.toFixed(2);
/**
 * A face as a `points` attribute value.
 */
export const pts = (quad: Quad): string =>
  quad
    .map(proj)
    .map((q) => q.map(f2).join(','))
    .join(' ');

/**
 * Top, left (+y) and right (+x) faces of a box, in that order.
 */
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

/**
 * Faces of the block at a grid position, `height` world units above the plate.
 */
export const blockFaces = (col: number, row: number, height: number): [Quad, Quad, Quad] => {
  const x0 = col * PITCH;
  const y0 = row * PITCH;
  return faces(x0, y0, BASE, x0 + CELL, y0 + CELL, BASE + height);
};

/**
 * Faces of the plate: the grid plus its margin, `BASE` world units thick.
 */
export const plateFaces = faces(-MARGIN, -MARGIN, 0, GRID_W + MARGIN, GRID_H + MARGIN, BASE);

/**
 * Sort order from the back of the plate to the front, so nearer blocks are drawn last.
 */
export const painter = (a: { col: number; row: number }, b: { col: number; row: number }): number =>
  a.col + a.row - (b.col + b.row);

/**
 * The canvas never depends on the data: the full plate plus the tallest block in the back corner.
 */
const canvas = (() => {
  const points = [...plateFaces.flat(), ...blockFaces(0, 0, MAX_HEIGHT).flat()].map(proj);
  const xs = points.map((q) => q[0]);
  const ys = points.map((q) => q[1]);
  const minX = Math.min(...xs) - PAD;
  const minY = Math.min(...ys) - PAD;
  const w = Math.max(...xs) - minX + PAD;
  const h = Math.max(...ys) - minY + PAD;
  return { viewBox: `${f2(minX)} ${f2(minY)} ${f2(w)} ${f2(h)}`, width: Math.round(w), height: Math.round(h) };
})();

/**
 * The SVG `viewBox`, constant across runs.
 */
export const VIEW_BOX = canvas.viewBox;
/**
 * Canvas width in pixels, constant across runs.
 */
export const WIDTH = canvas.width;
/**
 * Canvas height in pixels, constant across runs.
 */
export const HEIGHT = canvas.height;
