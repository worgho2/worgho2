import { describe, expect, it } from 'vitest';
import type { Cell } from '../../ports.ts';
import { LINEAR } from '../../smil.ts';
import { wave } from './wave.ts';

const cell: Cell = { col: 20, row: 3, value: 1, height: 1, faces: ['#a', '#b', '#c'] };

describe('wave', () => {
  it('overshoots by the bump and settles at the standing height', () => {
    const t = wave();
    expect(t.duration).toBeCloseTo(52 * 0.05 + 0.6);
    const [a, b, c] = t.keyframes(cell);
    expect(a.at).toBeCloseTo(1);
    expect(a.height).toBe(0);
    expect(a.ease).toBe(LINEAR);
    expect(b.at).toBeCloseTo(1.27);
    expect(b.height).toBeCloseTo(2.5);
    expect(c.at).toBeCloseTo(1.6);
    expect(c.height).toBe(1);
  });

  it('takes a custom bump', () => {
    expect(wave({ bump: 0.5 }).keyframes(cell)[1].height).toBeCloseTo(1.5);
  });
});
