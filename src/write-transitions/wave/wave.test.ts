import { describe, expect, it } from 'vitest';
import { LINEAR } from '../../plate-animation-builder/constants.ts';
import type { Block } from '../../plate-animation-builder/model.ts';
import { wave } from './wave.ts';

const block: Block = { col: 20, row: 3, value: 1, height: 1, faces: ['#a', '#b', '#c'] };

describe('wave', () => {
  it('overshoots by the bump and settles at the standing height', () => {
    const t = wave();
    expect(t.duration).toBeCloseTo(52 * 0.05 + 0.6);
    const [a, b, c] = t.keyframes(block);
    expect(a.at).toBeCloseTo(1);
    expect(a.height).toBe(0);
    expect(a.ease).toBe(LINEAR);
    expect(b.at).toBeCloseTo(1.27);
    expect(b.height).toBeCloseTo(2.5);
    expect(c.at).toBeCloseTo(1.6);
    expect(c.height).toBe(1);
  });

  it('takes a custom bump', () => {
    expect(wave({ bump: 0.5 }).keyframes(block)[1].height).toBeCloseTo(1.5);
  });
});
