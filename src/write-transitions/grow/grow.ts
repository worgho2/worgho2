import { COLS, EASE_OUT, LINEAR } from '../../plate-animation-builder/constants.ts';
import type { WriteTransition } from '../../plate-animation-builder/model.ts';

/**
 * Timing of the grow transition.
 */
export type GrowOptions = {
  /**
   * Seconds one block takes to reach its standing height. Defaults to 0.8.
   */
  duration?: number;
  /**
   * Seconds between the start of one column and the next. Defaults to 0.04.
   */
  stagger?: number;
};

/**
 * Blocks rise column by column, left to right, easing out at their standing height.
 */
export const grow = ({ duration = 0.8, stagger = 0.04 }: GrowOptions = {}): WriteTransition => ({
  duration: (COLS - 1) * stagger + duration,
  keyframes: (block) => [
    { at: block.col * stagger, height: 0, ease: LINEAR },
    { at: block.col * stagger + duration, height: block.height, ease: EASE_OUT },
  ],
});
