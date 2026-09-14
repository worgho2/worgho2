import { describe, expect, it } from 'vitest';
import { textMatrix, textPalette } from './text.ts';

describe('textMatrix', () => {
  it('centres a one-column glyph on the plate', () => {
    const m = textMatrix('l');
    for (const row of m) expect(row.filter((v) => v !== 0)).toHaveLength(1);
    expect(m.map((row) => row[26])).toEqual([1, 1, 1, 1, 1, 1, 1]);
  });

  it('renders the greeting inside the plate', () => {
    const m = textMatrix('welcome :)');
    expect(m).toHaveLength(7);
    expect(m.every((row) => row.length === 53)).toBe(true);
    expect(m.flat().filter((v) => v === 1).length).toBeGreaterThan(40);
    // lowercase letters use rows 2-6; only the tall 'l' and ')' reach row 0
    expect(m[0].filter((v) => v !== 0).length).toBeLessThan(m[4].filter((v) => v !== 0).length);
  });

  it('rejects unknown glyphs and text wider than the plate', () => {
    expect(() => textMatrix('x')).toThrow(/glyph/);
    expect(() => textMatrix('l'.repeat(28))).toThrow(/wide/);
  });
});

describe('textPalette', () => {
  it('gives every text block the same height and shade', () => {
    expect(textPalette(1)).toEqual({ height: 1, faces: ['#30a14e', '#1f6b34', '#278641'] });
  });
});
