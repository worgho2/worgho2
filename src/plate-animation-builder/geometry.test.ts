import { describe, expect, it } from 'vitest';
import { MAX_HEIGHT } from './constants.ts';
import { blockFaces, HEIGHT, painter, plateFaces, proj, pts, VIEW_BOX, WIDTH } from './geometry.ts';

describe('geometry', () => {
  it('sizes the canvas for a 53-week plate and the tallest block', () => {
    expect(VIEW_BOX).toBe('-119.12 -130.00 835.77 599.00');
    expect(WIDTH).toBe(836);
    expect(HEIGHT).toBe(599);
  });

  it('projects isometrically', () => {
    expect(proj([0, 0, 0])).toEqual([0, 0]);
    const [x, y] = proj([1, 0, 0]);
    expect(x).toBeCloseTo(10.392);
    expect(y).toBeCloseTo(6);
    expect(proj([0, 0, 1])).toEqual([0, -12]);
  });

  it('keeps the tallest block inside the canvas', () => {
    const minY = Number(VIEW_BOX.split(' ')[1]);
    for (const [, y] of blockFaces(0, 0, MAX_HEIGHT)[0].map(proj)) expect(y).toBeGreaterThanOrEqual(minY);
  });

  it('has a four-point plate top', () => {
    expect(plateFaces[0]).toHaveLength(4);
  });

  it('orders blocks back to front', () => {
    const sorted = [
      { col: 5, row: 0 },
      { col: 0, row: 0 },
      { col: 2, row: 2 },
    ].sort(painter);
    expect(sorted).toEqual([
      { col: 0, row: 0 },
      { col: 2, row: 2 },
      { col: 5, row: 0 },
    ]);
  });

  it('formats polygon points with two decimals', () => {
    expect(
      pts([
        [0, 0, 0],
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ]),
    ).toBe('0.00,0.00 10.39,6.00 0.00,12.00 -10.39,6.00');
  });
});
