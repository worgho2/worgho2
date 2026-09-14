import { COLS, emptyMatrix, type Matrix, type Palette } from '../ports.ts';

/** Variable-width pixel font, 7 rows tall (row 0 is the back of the plate). Lowercase x-height is rows 2-6. */
export const GLYPHS: Record<string, string[]> = {
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  e: ['....', '....', '.##.', '#..#', '####', '#...', '.###'],
  l: ['#', '#', '#', '#', '#', '#', '#'],
  c: ['....', '....', '.###', '#...', '#...', '#...', '.###'],
  o: ['....', '....', '.##.', '#..#', '#..#', '#..#', '.##.'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#.#.#', '#...#'],
  ' ': ['..', '..', '..', '..', '..', '..', '..'],
  ':': ['..', '..', '#.', '..', '..', '#.', '..'], // eyes spread apart, plus a spacer column before the mouth
  ')': ['#.', '.#', '.#', '.#', '.#', '.#', '#.'],
};

/** Text centred on the plate, one column of spacing between glyphs; every pixel is a 1. */
export const textMatrix = (text: string): Matrix => {
  const glyphs = [...text].map((ch) => {
    const glyph = GLYPHS[ch];
    if (!glyph) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    return glyph;
  });
  const width = glyphs.reduce((w, g) => w + g[0].length, 0) + glyphs.length - 1;
  if (width > COLS) throw new Error(`"${text}" is ${width} columns wide, the plate has ${COLS}`);
  const m = emptyMatrix();
  let x = Math.floor((COLS - width) / 2);
  for (const glyph of glyphs) {
    glyph.forEach((line, row) => {
      [...line].forEach((c, i) => {
        if (c === '#') m[row][x + i] = 1;
      });
    });
    x += glyph[0].length + 1;
  }
  return m;
};

/** Text blocks are low, so their top faces stay readable, and share one shade. */
export const textPalette: Palette = () => ({ height: 1.0, faces: ['#30a14e', '#1f6b34', '#278641'] });
