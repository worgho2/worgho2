import { describe, expect, it } from 'vitest';
import { HEIGHT, VIEW_BOX, WIDTH } from './graph/geometry.ts';
import { renderGraph } from './graph.ts';

const calendar = (cols: number) =>
  Array.from({ length: cols }, (_, col) => ({
    contributionDays: Array.from({ length: 7 }, (_, weekday) => ({
      contributionCount: (col * 7 + weekday) % 5 === 0 ? ((col + weekday) % 45) + 1 : 0,
      weekday,
    })),
  }));

describe('renderGraph', () => {
  it('renders the full cycle on the constant canvas', () => {
    const svg = renderGraph(calendar(53));
    expect(svg).toContain(`viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}"`);
    expect(svg).toContain('<clipPath id="hole"');
    expect(svg).toContain('fill="url(#pit)"');
    expect(svg.length).toBeGreaterThan(100_000);
  });

  it('renders a 52-week calendar on the same canvas', () => {
    const head = (svg: string) => svg.slice(0, svg.indexOf('>') + 1);
    expect(head(renderGraph(calendar(52)))).toBe(head(renderGraph(calendar(53))));
  });

  it('takes a different greeting', () => {
    expect(renderGraph(calendar(53), 'ol')).toContain('<svg ');
    expect(() => renderGraph(calendar(53), 'x')).toThrow(/glyph/);
  });
});
