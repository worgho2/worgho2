import { describe, expect, it } from 'vitest';
import { EASE_OUT, LINEAR } from '../../plate-animation-builder/constants.ts';
import type { Block } from '../../plate-animation-builder/model.ts';
import { grow } from './grow.ts';

const block: Block = { col: 10, row: 3, value: 7, height: 1.4, faces: ['#a', '#b', '#c'] };

describe('grow', () => {
  it('rises after a per-column stagger and lasts for the whole plate', () => {
    const t = grow();
    expect(t.duration).toBeCloseTo(52 * 0.04 + 0.8);
    const [a, b] = t.keyframes(block);
    expect(a.at).toBeCloseTo(0.4);
    expect(a.height).toBe(0);
    expect(a.ease).toBe(LINEAR);
    expect(b.at).toBeCloseTo(1.2);
    expect(b.height).toBe(1.4);
    expect(b.ease).toBe(EASE_OUT);
  });

  it('takes custom timing', () => {
    const t = grow({ duration: 1, stagger: 0.1 });
    expect(t.duration).toBeCloseTo(52 * 0.1 + 1);
    expect(t.keyframes(block)[1].at).toBeCloseTo(2);
  });
});
