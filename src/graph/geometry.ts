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
