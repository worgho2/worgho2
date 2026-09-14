import { describe, expect, it } from 'vitest';
import { CAP, contributionsMatrix, contributionsPalette } from './contributions.ts';

const week = (counts: number[], firstWeekday = 0) => ({
  contributionDays: counts.map((contributionCount, i) => ({ contributionCount, weekday: firstWeekday + i })),
});

describe('contributionsMatrix', () => {
  it('places counts by weekday (row) and week (column), left-aligned', () => {
    const m = contributionsMatrix([week([0, 1, 2, 3, 4, 5, 6]), week([9], 3)]);
    expect(m).toHaveLength(7);
    expect(m[0]).toHaveLength(53);
    expect(m[4][0]).toBe(4);
    expect(m[3][1]).toBe(9);
    expect(m[0][1]).toBe(0);
    expect(m[6][52]).toBe(0);
  });

  it('accepts a full 53-week calendar', () => {
    const m = contributionsMatrix(Array.from({ length: 53 }, () => week([1, 1, 1, 1, 1, 1, 1])));
    expect(m.flat().filter((v) => v === 1)).toHaveLength(7 * 53);
  });

  it('keeps the most recent 53 weeks of a longer calendar, and rejects no weeks or a bad weekday', () => {
    const weeks = Array.from({ length: 54 }, () => week([1, 1, 1, 1, 1, 1, 1]));
    weeks[0] = week([9, 9, 9, 9, 9, 9, 9]);
    weeks[53] = week([7, 7, 7, 7, 7, 7, 7]);
    const m = contributionsMatrix(weeks);
    expect(m.flat().filter((v) => v === 9)).toHaveLength(0);
    expect(m[0][52]).toBe(7);
    expect(() => contributionsMatrix([])).toThrow(/weeks/);
    expect(() => contributionsMatrix([week([1], 7)])).toThrow(/weekday/);
  });
});

describe('contributionsPalette', () => {
  it('scales height by count and clamps at the cap', () => {
    expect(contributionsPalette(1).height).toBeCloseTo(0.2);
    expect(contributionsPalette(CAP).height).toBeCloseTo(9);
    expect(contributionsPalette(120).height).toBeCloseTo(9);
  });

  it('picks the colour band by count', () => {
    expect(contributionsPalette(4).faces[0]).toBe('#9be9a8');
    expect(contributionsPalette(5).faces[0]).toBe('#40c463');
    expect(contributionsPalette(15).faces[0]).toBe('#30a14e');
    expect(contributionsPalette(30).faces[0]).toBe('#216e39');
    expect(contributionsPalette(120).faces).toEqual(contributionsPalette(30).faces);
  });
});
