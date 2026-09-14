import { describe, expect, it } from 'vitest';
import { LINEAR, smil } from './smil.ts';

describe('smil', () => {
  const ctx = smil(10);

  it('tween holds before the first time and after the last', () => {
    const a = ctx.tween('points', ['A', 'B'], [2, 4], ['0.2 0.8 0.2 1']);
    expect(a).toContain('values="A;A;B;B"');
    expect(a).toContain('keyTimes="0;0.20000;0.40000;1"');
    expect(a).toContain(`keySplines="${LINEAR};0.2 0.8 0.2 1;${LINEAR}"`);
    expect(a).toContain('calcMode="spline" begin="0s" dur="10s" repeatCount="indefinite"');
  });

  it('tween accepts a tag and extra attributes', () => {
    const a = ctx.tween('transform', ['0 0', '0 5'], [1, 2], [LINEAR], 'animateTransform', 'type="translate" ');
    expect(a).toMatch(/^<animateTransform attributeName="transform" type="translate" values=/);
  });

  it('step switches values at the given times', () => {
    const a = ctx.step('opacity', ['0', '1', '0'], [3, 7]);
    expect(a).toContain('values="0;1;0;0" keyTimes="0;0.30000;0.70000;1" calcMode="discrete"');
  });

  it('rejects unordered or out-of-cycle times', () => {
    expect(() => ctx.step('opacity', ['0', '1', '0'], [7, 3])).toThrow(/not ordered/);
    expect(() => ctx.step('opacity', ['0', '1'], [11])).toThrow(/outside/);
  });

  it('rejects mismatched lengths', () => {
    expect(() => ctx.tween('x', ['A'], [1, 2], [LINEAR])).toThrow(/values/);
    expect(() => ctx.step('x', ['A'], [1, 2])).toThrow(/values/);
  });
});
