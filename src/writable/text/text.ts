import { COLS } from '../../plate-animation-builder/constants.ts';
import { emptyPlate } from '../../plate-animation-builder/helpers.ts';
import type { Palette, Plate } from '../../plate-animation-builder/model.ts';
import { glyphs } from './glyphs.ts';

/**
 * Text centred on the plate, one column of spacing between glyphs; every pixel is a 1.
 * Throws for a character without a glyph or text wider than the plate.
 */
export const writableTextPlate = (text: string): Plate => {
  const textGlyphs = [...text].map((ch) => {
    const glyph = glyphs[ch];

    if (!glyph || glyph.length === 0) {
      throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    }

    return glyph;
  });

  const width = textGlyphs.reduce((w, g) => w + g[0].length, 0) + textGlyphs.length - 1;

  if (width > COLS) {
    throw new Error(`"${text}" is ${width} columns wide, the plate has ${COLS}`);
  }

  const plate = emptyPlate();

  let x = Math.floor((COLS - width) / 2);

  for (const glyph of textGlyphs) {
    glyph.forEach((line, row) => {
      [...line].forEach((c, i) => {
        if (c === '#') plate[row][x + i] = 1;
      });
    });

    x += glyph[0].length + 1;
  }

  return plate;
};

/**
 * Text blocks are low, so their top faces stay readable, and share one shade.
 */
export const writableTextPalette: Palette = () => ({
  height: 1.0,
  faces: ['#30a14e', '#1f6b34', '#278641'],
});
