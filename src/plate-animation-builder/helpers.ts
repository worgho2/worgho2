import { COLS, ROWS } from './constants.ts';
import type { Plate } from './model.ts';

/**
 * A ROWS x COLS plate with no blocks, for writables to fill in.
 */
export const emptyPlate = (): Plate => Array.from({ length: ROWS }, () => new Array<number>(COLS).fill(0));
