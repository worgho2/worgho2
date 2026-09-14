import { COLS, type WriteTransition } from '../../ports.ts';
import { LINEAR } from '../../smil.ts';

export type WaveOptions = { duration?: number; stagger?: number; bump?: number };

const WAVE_UP = '0.2 0.8 0.3 1';
const WAVE_DOWN = '0.4 0 0.2 1';

/** Blocks rise column by column, overshoot by `bump`, and settle at their standing height. */
export const wave = ({ duration = 0.6, stagger = 0.05, bump = 1.5 }: WaveOptions = {}): WriteTransition => ({
  duration: (COLS - 1) * stagger + duration,
  keyframes: (cell) => {
    const t = cell.col * stagger;
    return [
      { at: t, height: 0, ease: LINEAR },
      { at: t + 0.45 * duration, height: cell.height + bump, ease: WAVE_UP },
      { at: t + duration, height: cell.height, ease: WAVE_DOWN },
    ];
  },
});
