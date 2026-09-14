import { describe, expect, it } from 'vitest';
import { HEIGHT, WIDTH } from './graph/geometry.ts';
import { indexHtml } from './index.ts';

describe('indexHtml', () => {
  it('is a small page that shows the graph and links to the profile', () => {
    const html = indexHtml('worgho2', 'contributions.svg');
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<title>worgho2</title>');
    expect(html).toContain(
      `<img src="contributions.svg" alt="3D contribution graph of worgho2" width="${WIDTH}" height="${HEIGHT}">`,
    );
    expect(html).toContain('href="https://github.com/worgho2"');
  });
});
