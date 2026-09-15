import type { Color, Spline } from './model.ts';

/**
 * Rows on the plate, one per weekday.
 */
export const ROWS = 7;
/**
 * Columns on the plate, one per week of a GitHub year.
 */
export const COLS = 53;
/**
 * Colours of the plate's top, left and right faces.
 */
export const PLATE_SHADE: Color[] = ['#ebedf0', '#c9ccd1', '#d8dbe0'];
/**
 * Seconds a vanished block takes to return to zero height, while hidden.
 */
export const FLATTEN = 0.5;
/**
 * Footprint of one block, in world units.
 */
export const CELL = 1.0;
/**
 * Spacing between blocks, in world units.
 */
export const GAP = 0.25;
/**
 * Distance between the same corner of two neighbouring blocks.
 */
export const PITCH = CELL + GAP;
/**
 * Plate thickness, in world units.
 */
export const BASE = 1.0;
/**
 * Plate margin around the grid, in world units.
 */
export const MARGIN = 1.0;
/**
 * Pixels per world unit.
 */
export const S = 12;
/**
 * Tallest block the canvas is sized for, in world units.
 */
export const MAX_HEIGHT = 9.0;
/**
 * Pixels of canvas around the scene.
 */
export const PAD = 10;
/**
 * Width of the grid of blocks, in world units.
 */
export const GRID_W = COLS * PITCH - GAP;
/**
 * Depth of the grid of blocks, in world units.
 */
export const GRID_H = ROWS * PITCH - GAP;
/**
 * Clip path id of the plate top, available to every transition.
 */
export const PLATE_CLIP_ID = 'plate';
/**
 * '0 0 1 1' is a straight line: linear between different values, a hold between equal ones.
 */
export const LINEAR: Spline = '0 0 1 1';
/**
 * '0.2 0.8 0.2 1' is a gentle ease-out: fast at first, slow at the end.
 */
export const EASE_OUT: Spline = '0.2 0.8 0.2 1';
/**
 * '0.5 0 1 1' is a gentle ease-in: slow at first, fast at the end.
 */
export const EASE_IN: Spline = '0.5 0 1 1';
