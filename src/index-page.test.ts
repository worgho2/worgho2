import { describe, expect, it } from 'vitest';
import { indexPage } from './index-page.ts';
import { HEIGHT, WIDTH } from './plate-animation-builder/geometry.ts';

describe('indexPage', () => {
  it('is a small page that shows the graph and links to the profile', () => {
    const html = indexPage('worgho2', 'contributions.svg');
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<title>worgho2</title>');
    expect(html).toContain(
      `<img src="contributions.svg" alt="3D contribution graph of worgho2" width="${WIDTH}" height="${HEIGHT}">`,
    );
    expect(html).toContain('href="https://github.com/worgho2"');
  });
});
