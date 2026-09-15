import { describe, expect, it } from 'vitest';
import { ROWS } from '../../plate-animation-builder/constants.ts';
import { glyphs } from './glyphs.ts';

const printableAscii = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) => String.fromCharCode(0x20 + i));

describe('glyphs', () => {
  it('covers every printable ASCII character', () => {
    const missing = printableAscii.filter((ch) => !glyphs[ch] || glyphs[ch].length === 0);
    expect(missing).toEqual([]);
  });

  it('is exactly one plate tall, rectangular, and drawn with # and . only', () => {
    for (const [ch, glyph] of Object.entries(glyphs)) {
      expect(glyph, `glyph ${JSON.stringify(ch)}`).toHaveLength(ROWS);
      const width = glyph[0].length;
      expect(width, `glyph ${JSON.stringify(ch)}`).toBeGreaterThan(0);
      for (const line of glyph) {
        expect(line, `glyph ${JSON.stringify(ch)}`).toMatch(new RegExp(`^[#.]{${width}}$`));
      }
    }
  });

  it('draws something for every character but the space', () => {
    for (const [ch, glyph] of Object.entries(glyphs)) {
      const inked = glyph.join('').includes('#');
      expect(inked, `glyph ${JSON.stringify(ch)}`).toBe(ch !== ' ');
    }
  });

  it('gives every character its own shape', () => {
    const seen = new Map<string, string>();
    for (const [ch, glyph] of Object.entries(glyphs)) {
      const key = glyph.join('/');
      expect(seen.get(key), `glyph ${JSON.stringify(ch)} repeats ${JSON.stringify(seen.get(key))}`).toBeUndefined();
      seen.set(key, ch);
    }
  });

  it('keeps lowercase letters at the x-height, rows 2-6, unless they have an ascender or a dot', () => {
    for (const ch of 'acegmnopqrsuvwxyz') {
      expect(glyphs[ch].slice(0, 2).join(''), `glyph ${JSON.stringify(ch)}`).not.toContain('#');
      expect(glyphs[ch][2], `glyph ${JSON.stringify(ch)}`).toContain('#');
    }
    // the dotted letters carry their dot at row 0, a gap at row 1, and start their stem at the x-height
    for (const ch of 'ij') {
      expect(glyphs[ch][0], `glyph ${JSON.stringify(ch)}`).toContain('#');
      expect(glyphs[ch][1], `glyph ${JSON.stringify(ch)}`).not.toContain('#');
      expect(glyphs[ch][2], `glyph ${JSON.stringify(ch)}`).toContain('#');
    }
    for (const ch of 'bdfhklt') {
      expect(glyphs[ch][0], `glyph ${JSON.stringify(ch)}`).toContain('#');
    }
  });

  it('draws capitals and digits at full height', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
      expect(glyphs[ch][0], `glyph ${JSON.stringify(ch)}`).toContain('#');
      expect(glyphs[ch][ROWS - 1], `glyph ${JSON.stringify(ch)}`).toContain('#');
    }
  });
});
