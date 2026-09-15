import { describe, expect, it } from 'vitest';
import { indexPage } from './index-page.ts';
import { HEIGHT, WIDTH } from './plate-animation-builder/geometry.ts';

describe('indexPage', () => {
  const html = indexPage({ username: 'worgho2', repository: 'worgho2/worgho2', svgPath: 'contributions.svg' });

  it('is a small page that shows the graph and links to the profile', () => {
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<title>worgho2</title>');
    expect(html).toContain(
      `<img src="contributions.svg" alt="3D contribution graph of worgho2" width="${WIDTH}" height="${HEIGHT}">`,
    );
    expect(html).toContain('href="https://github.com/worgho2"');
  });

  it('links to the template instructions in the repository', () => {
    expect(html).toContain('href="https://github.com/worgho2/worgho2/blob/main/TEMPLATE.md"');
    expect(html).toMatch(/TEMPLATE\.md">[^<]*instructions/i);
  });

  it('links to the instructions of a repository with another name', () => {
    const other = indexPage({ username: 'octocat', repository: 'octocat/graph', svgPath: 'contributions.svg' });
    expect(other).toContain('href="https://github.com/octocat/graph/blob/main/TEMPLATE.md"');
  });
});
