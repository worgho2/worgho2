import { describe, expect, it } from 'vitest';
import { Generator } from './generator.ts';
import { HEIGHT, VIEW_BOX, WIDTH } from './geometry.ts';
import { type EraseTransition, emptyMatrix, type Palette, type WriteTransition } from './ports.ts';
import { LINEAR } from './smil.ts';

const one = (col: number, row: number, value = 1) => {
  const m = emptyMatrix();
  m[row][col] = value;
  return m;
};
const palette: Palette = (value) => ({ height: value, faces: ['#a', '#b', '#c'] });
const pop: WriteTransition = {
  duration: 1,
  keyframes: (cell) => [
    { at: 0, height: 0, ease: LINEAR },
    { at: 1, height: cell.height, ease: LINEAR },
  ],
};
const vanish: EraseTransition = { duration: 1, plan: (cells, start) => new Map(cells.map((c) => [c, start])) };
const never: EraseTransition = { duration: 1, plan: () => new Map() };

describe('Generator', () => {
  it('builds an SVG on the constant canvas', () => {
    const svg = new Generator()
      .write({ data: one(3, 2), palette, transition: pop })
      .erase({ transition: vanish })
      .build();
    const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}">`;
    expect(svg.startsWith(head)).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('shows a block from its first keyframe until it is erased', () => {
    const svg = new Generator()
      .write({ data: one(0, 0, 2), palette, transition: pop })
      .delay(1)
      .erase({ transition: vanish })
      .build();
    // period = 1 (write) + 1 (delay) + 1 (erase); visible from 0 s, erased at 2 s
    expect(svg).toContain('attributeName="opacity" values="0;1;0;0" keyTimes="0;0.00000;0.66667;1"');
    // plate clip polygon + 3 plate faces + 3 block faces
    expect(svg.match(/<polygon /g)).toHaveLength(7);
    // each face tweens: 0 (hold) -> 0 -> 2 (standing) -> 2 (hold until fall) -> 0 (flatten) -> hold
    expect(svg.match(/attributeName="points"/g)).toHaveLength(3);
    expect(svg).toContain('keyTimes="0;0.00000;0.33333;0.66667;0.83333;1"');
  });

  it('keeps every keyTime inside the cycle and ordered', () => {
    const svg = new Generator()
      .write({ data: one(52, 6), palette, transition: pop })
      .delay(2)
      .erase({ transition: vanish })
      .delay(0.25)
      .build();
    const lists = [...svg.matchAll(/keyTimes="([^"]+)"/g)].map((m) => m[1].split(';').map(Number));
    expect(lists.length).toBeGreaterThan(0);
    for (const ts of lists) {
      expect(ts[0]).toBe(0);
      expect(ts[ts.length - 1]).toBe(1);
      for (let i = 1; i < ts.length; i++) expect(ts[i]).toBeGreaterThanOrEqual(ts[i - 1]);
    }
  });

  it('clamps the flatten hold to the end of the cycle when the erase is short', () => {
    const vanishFast: EraseTransition = {
      duration: 0.1,
      plan: (cells, start) => new Map(cells.map((c) => [c, start])),
    };
    const svg = new Generator()
      .write({ data: one(0, 0), palette, transition: pop })
      .erase({ transition: vanishFast })
      .build();
    const lists = [...svg.matchAll(/keyTimes="([^"]+)"/g)].map((m) => m[1].split(';').map(Number));
    expect(lists.length).toBeGreaterThan(0);
    for (const ts of lists) {
      expect(ts[0]).toBe(0);
      expect(ts[ts.length - 1]).toBe(1);
      for (let i = 1; i < ts.length; i++) expect(ts[i]).toBeGreaterThanOrEqual(ts[i - 1]);
    }
  });

  it('lets erase transitions share state and add scene markup once the period is known', () => {
    const pit: EraseTransition = {
      duration: 1,
      plan: (cells, start, scene) => {
        scene.shared('pit', () =>
          scene.render((ctx) => ({ defs: `<g id="pit-defs" data-period="${ctx.period}"/>`, under: '<g id="pit"/>' })),
        );
        return new Map(cells.map((c) => [c, start]));
      },
    };
    const svg = new Generator()
      .write({ data: one(1, 1), palette, transition: pop })
      .erase({ transition: pit })
      .write({ data: one(2, 2), palette, transition: pop })
      .erase({ transition: pit })
      .build();
    expect(svg).toContain('<g id="pit-defs" data-period="4"/>');
    expect(svg.match(/<g id="pit"\/>/g)).toHaveLength(1);
    expect(svg.indexOf('<g id="pit-defs"')).toBeLessThan(svg.indexOf('</defs>'));
    expect(svg.indexOf('<g id="pit"/>')).toBeLessThan(svg.indexOf('<g opacity="0">'));
  });

  it('rejects a write on a non-empty plate', () => {
    const g = new Generator().write({ data: one(0, 0), palette, transition: pop });
    expect(() => g.write({ data: one(1, 1), palette, transition: pop })).toThrow(/not empty/);
  });

  it('rejects an erase on an empty plate', () => {
    expect(() => new Generator().erase({ transition: vanish })).toThrow(/empty/);
  });

  it('rejects a cycle that ends with blocks standing', () => {
    expect(() => new Generator().write({ data: one(0, 0), palette, transition: pop }).build()).toThrow(
      /not empty at the end/,
    );
  });

  it('rejects an empty cycle', () => {
    expect(() => new Generator().build()).toThrow(/nothing/);
  });

  it('rejects blocks the erase never reaches', () => {
    const g = new Generator().write({ data: one(0, 0), palette, transition: pop });
    expect(() => g.erase({ transition: never })).toThrow(/never reached/);
  });

  it('rejects a matrix of the wrong size, an empty matrix, or blocks taller than the canvas', () => {
    expect(() => new Generator().write({ data: [[1]], palette, transition: pop })).toThrow(/7x53/);
    expect(() => new Generator().write({ data: emptyMatrix(), palette, transition: pop })).toThrow(/no blocks/);
    expect(() => new Generator().write({ data: one(0, 0, 10), palette, transition: pop })).toThrow(/height/);
  });

  it('rejects keyframes outside the transition duration', () => {
    const late: WriteTransition = { duration: 1, keyframes: () => [{ at: 2, height: 1, ease: LINEAR }] };
    expect(() => new Generator().write({ data: one(0, 0), palette, transition: late })).toThrow(/duration/);
  });

  it('rejects a negative delay', () => {
    expect(() => new Generator().delay(-1)).toThrow(/non-negative/);
  });
});
