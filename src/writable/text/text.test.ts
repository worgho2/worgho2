import { describe, expect, it } from 'vitest';
import { writableTextPalette, writableTextPlate } from './text.ts';

describe('writableTextPlate', () => {
  it('centres a one-column glyph on the plate', () => {
    const m = writableTextPlate('l');
    for (const row of m) expect(row.filter((v) => v !== 0)).toHaveLength(1);
    expect(m.map((row) => row[26])).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it('leaves one empty column between glyphs', () => {
    const m = writableTextPlate('ll');
    // width 3: 'l', gap, 'l', centred at column 25
    for (const row of m) expect(row.slice(25, 28)).toEqual([1, 0, 1]);
  });

  it('renders the greeting inside the plate', () => {
    const m = writableTextPlate('welcome :)');
    expect(m).toHaveLength(7);
    expect(m.every((row) => row.length === 53)).toBe(true);
    expect(m.flat().filter((v) => v === 1).length).toBeGreaterThan(40);
    // lowercase letters use rows 2-6; only the tall 'l' and ')' reach row 0
    expect(m[0].filter((v) => v !== 0).length).toBeLessThan(m[4].filter((v) => v !== 0).length);
  });

  it('rejects characters without a glyph', () => {
    expect(() => writableTextPlate('é')).toThrow(/glyph/);
    expect(() => writableTextPlate('a\nb')).toThrow(/glyph/);
  });

  it('rejects text wider than the plate', () => {
    expect(() => writableTextPlate('l'.repeat(28))).toThrow(/wide/);
  });
});

describe('writableTextPalette', () => {
  it('gives every text block the same height and shade', () => {
    expect(writableTextPalette(1)).toEqual({ height: 1, faces: ['#30a14e', '#1f6b34', '#278641'] });
  });
});
