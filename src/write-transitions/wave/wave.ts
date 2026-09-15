import { COLS, LINEAR } from '../../plate-animation-builder/constants.ts';
import type { Spline, WriteTransition } from '../../plate-animation-builder/model.ts';

/**
 * Timing and shape of the wave transition.
 */
export type WaveOptions = {
  /**
   * Seconds one block takes to rise, overshoot and settle. Defaults to 0.6.
   */
  duration?: number;
  /**
   * Seconds between the start of one column and the next. Defaults to 0.05.
   */
  stagger?: number;
  /**
   * World units a block overshoots its standing height by. Defaults to 1.5.
   */
  bump?: number;
};

/**
 * Ease-out of the rise, slowing as the block reaches its peak.
 */
const WAVE_UP: Spline = '0.2 0.8 0.3 1';
/**
 * Ease-in-out of the settle, so the block lands softly.
 */
const WAVE_DOWN: Spline = '0.4 0 0.2 1';

/**
 * Blocks rise column by column, overshoot by `bump`, and settle at their standing height.
 */
export const wave = ({ duration = 0.6, stagger = 0.05, bump = 1.5 }: WaveOptions = {}): WriteTransition => ({
  duration: (COLS - 1) * stagger + duration,
  keyframes: (block) => {
    const t = block.col * stagger;
    return [
      { at: t, height: 0, ease: LINEAR },
      { at: t + 0.45 * duration, height: block.height + bump, ease: WAVE_UP },
      { at: t + duration, height: block.height, ease: WAVE_DOWN },
    ];
  },
});
