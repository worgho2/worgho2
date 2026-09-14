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
