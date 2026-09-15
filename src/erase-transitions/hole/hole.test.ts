import { describe, expect, it } from 'vitest';
import { COLS, ROWS } from '../../plate-animation-builder/constants.ts';
import type { Block, Fragment, RenderContext, Scene } from '../../plate-animation-builder/model.ts';
import { smil } from '../../plate-animation-builder/smil.ts';
import { hole } from './hole.ts';

const faces: Block['faces'] = ['#a', '#b', '#c'];
const fullPlate = (): Block[] => {
  const blocks: Block[] = [];
  for (let col = 0; col < COLS; col++)
    for (let row = 0; row < ROWS; row++) blocks.push({ col, row, value: 1, height: 1, faces });
  return blocks;
};
const fakeScene = () => {
  const shared = new Map<string, unknown>();
  const renders: Array<(ctx: RenderContext) => Fragment> = [];
  const scene: Scene = {
    shared: <T>(id: string, init: () => T): T => {
      if (!shared.has(id)) shared.set(id, init());
      return shared.get(id) as T;
    },
    render: (fn) => {
      renders.push(fn);
    },
  };
  return { scene, renders };
};
const fallOf = (fallAt: Map<Block, number>, blocks: Block[], col: number, row: number) =>
  fallAt.get(blocks.find((c) => c.col === col && c.row === row)!)!;

describe('hole', () => {
  it('reaches every block on a full plate, left to right, within the sweep', () => {
    const blocks = fullPlate();
    const fallAt = hole({ from: 'left' }).plan(blocks, 10, fakeScene().scene);
    expect(fallAt.size).toBe(blocks.length);
    for (const t of fallAt.values()) {
      expect(t).toBeGreaterThanOrEqual(10);
      expect(t).toBeLessThanOrEqual(15);
    }
    expect(fallOf(fallAt, blocks, 0, 3)).toBeLessThan(fallOf(fallAt, blocks, 52, 3));
    expect(fallOf(fallAt, blocks, 0, 0)).toBeLessThan(fallOf(fallAt, blocks, 52, 6));
  });

  it('sweeps right to left when from is right', () => {
    const blocks = fullPlate();
    const fallAt = hole({ from: 'right' }).plan(blocks, 0, fakeScene().scene);
    expect(fallAt.size).toBe(blocks.length);
    expect(fallOf(fallAt, blocks, 52, 3)).toBeLessThan(fallOf(fallAt, blocks, 0, 3));
  });

  it('lasts one sweep plus one fall', () => {
    expect(hole({ from: 'left' }).duration).toBeCloseTo(5.5);
    expect(hole({ from: 'left', sweep: 2, fall: 0.25 }).duration).toBeCloseTo(2.25);
  });

  it('renders one shared pit for two sweeps plus falling copies per erase', () => {
    const { scene, renders } = fakeScene();
    const blocks = fullPlate().slice(0, 7);
    hole({ from: 'left' }).plan(blocks, 0, scene);
    hole({ from: 'right' }).plan(blocks, 6, scene);
    const frags = renders.map((fn) => fn(smil(20)));
    expect(frags).toHaveLength(3);
    expect(frags[0].defs).toContain('<clipPath id="hole" clip-path="url(#plate)">');
    expect(frags[0].defs).toContain('<radialGradient id="pit"');
    expect(frags[0].under).toContain('fill="url(#pit)"');
    expect(frags[0].under?.match(/<animate /g)).toHaveLength(4); // cx, cy, rx, ry of one ellipse
    expect(frags[1].under).toContain('<g clip-path="url(#hole)">');
    expect(frags[1].under?.match(/<animateTransform/g)).toHaveLength(7);
    expect(frags[2].under?.match(/<animateTransform/g)).toHaveLength(7);
  });
});
