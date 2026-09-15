import { describe, expect, it } from 'vitest';
import { LINEAR } from './constants.ts';
import { HEIGHT, VIEW_BOX, WIDTH } from './geometry.ts';
import { emptyPlate } from './helpers.ts';
import type { EraseTransition, Palette, WriteTransition } from './model.ts';
import { PlateAnimationBuilder } from './plate-animation-builder.ts';

const one = (col: number, row: number, value = 1) => {
  const plate = emptyPlate();
  plate[row][col] = value;
  return plate;
};
const palette: Palette = (value) => ({ height: value, faces: ['#a', '#b', '#c'] });
const pop: WriteTransition = {
  duration: 1,
  keyframes: (block) => [
    { at: 0, height: 0, ease: LINEAR },
    { at: 1, height: block.height, ease: LINEAR },
  ],
};
const vanish: EraseTransition = { duration: 1, plan: (blocks, start) => new Map(blocks.map((b) => [b, start])) };
const never: EraseTransition = { duration: 1, plan: () => new Map() };

describe('PlateAnimationBuilder', () => {
  it('builds an SVG on the constant canvas', () => {
    const svg = new PlateAnimationBuilder()
      .write({ data: one(3, 2), palette, transition: pop })
      .erase({ transition: vanish })
      .build();
    const head = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}">`;
    expect(svg.startsWith(head)).toBe(true);
    expect(svg.trimEnd().endsWith('</svg>')).toBe(true);
  });

  it('shows a block from its first keyframe until it is erased', () => {
    const svg = new PlateAnimationBuilder()
      .write({ data: one(0, 0, 2), palette, transition: pop })
      .delay({ duration: 1 })
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

  it('draws the standing blocks back to front', () => {
    const plate = emptyPlate();
    plate[0][5] = 1;
    plate[0][0] = 1;
    plate[1][1] = 1;
    const svg = new PlateAnimationBuilder()
      .write({ data: plate, palette, transition: pop })
      .erase({ transition: vanish })
      .build();
    // the first polygon of each block group is its resting top face; back corner (0,0) first, (5,0) last
    const tops = [...svg.matchAll(/<g opacity="0">.*?<polygon points="([^"]+)"/g)].map((m) => m[1]);
    expect(tops).toHaveLength(3);
    expect(tops[0]).toMatch(/^0\.00,-12\.00 /);
    expect(tops[2]).toMatch(/^64\.95,25\.50 /);
  });

  it('keeps every keyTime inside the cycle and ordered', () => {
    const svg = new PlateAnimationBuilder()
      .write({ data: one(52, 6), palette, transition: pop })
      .delay({ duration: 2 })
      .erase({ transition: vanish })
      .delay({ duration: 0.25 })
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
      plan: (blocks, start) => new Map(blocks.map((b) => [b, start])),
    };
    const svg = new PlateAnimationBuilder()
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
      plan: (blocks, start, scene) => {
        scene.shared('pit', () =>
          scene.render((ctx) => ({ defs: `<g id="pit-defs" data-period="${ctx.period}"/>`, under: '<g id="pit"/>' })),
        );
        return new Map(blocks.map((b) => [b, start]));
      },
    };
    const svg = new PlateAnimationBuilder()
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
    const b = new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: pop });
    expect(() => b.write({ data: one(1, 1), palette, transition: pop })).toThrow(/not empty/);
  });

  it('rejects an erase on an empty plate', () => {
    expect(() => new PlateAnimationBuilder().erase({ transition: vanish })).toThrow(/empty/);
  });

  it('rejects a cycle that ends with blocks standing', () => {
    expect(() => new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: pop }).build()).toThrow(
      /not empty at the end/,
    );
  });

  it('rejects an empty cycle', () => {
    expect(() => new PlateAnimationBuilder().build()).toThrow(/nothing/);
  });

  it('rejects blocks the erase never reaches', () => {
    const b = new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: pop });
    expect(() => b.erase({ transition: never })).toThrow(/never reached/);
  });

  it('rejects a plate of the wrong size, an empty plate, or blocks taller than the canvas', () => {
    expect(() => new PlateAnimationBuilder().write({ data: [[1]], palette, transition: pop })).toThrow(/7x53/);
    expect(() => new PlateAnimationBuilder().write({ data: emptyPlate(), palette, transition: pop })).toThrow(
      /no blocks/,
    );
    expect(() => new PlateAnimationBuilder().write({ data: one(0, 0, 10), palette, transition: pop })).toThrow(
      /height/,
    );
  });

  it('rejects keyframes outside the transition duration, unordered, or taller than the canvas', () => {
    const late: WriteTransition = { duration: 1, keyframes: () => [{ at: 2, height: 1, ease: LINEAR }] };
    expect(() => new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: late })).toThrow(/duration/);
    const backwards: WriteTransition = {
      duration: 1,
      keyframes: () => [
        { at: 1, height: 1, ease: LINEAR },
        { at: 0, height: 0, ease: LINEAR },
      ],
    };
    expect(() => new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: backwards })).toThrow(
      /ordered/,
    );
    const tall: WriteTransition = { duration: 1, keyframes: () => [{ at: 0, height: 10, ease: LINEAR }] };
    expect(() => new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: tall })).toThrow(/height/);
    const none: WriteTransition = { duration: 1, keyframes: () => [] };
    expect(() => new PlateAnimationBuilder().write({ data: one(0, 0), palette, transition: none })).toThrow(
      /no keyframes/,
    );
  });

  it('rejects a negative delay', () => {
    expect(() => new PlateAnimationBuilder().delay({ duration: -1 })).toThrow(/non-negative/);
  });
});
