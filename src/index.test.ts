import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contributionsAnimation } from './index.ts';
import { HEIGHT, VIEW_BOX, WIDTH } from './plate-animation-builder/geometry.ts';

const calendar = (cols: number) =>
  Array.from({ length: cols }, (_, col) => ({
    contributionDays: Array.from({ length: 7 }, (_, weekday) => ({
      contributionCount: (col * 7 + weekday) % 5 === 0 ? ((col + weekday) % 45) + 1 : 0,
      weekday,
    })),
  }));

describe('contributionsAnimation', () => {
  it('renders the full cycle on the constant canvas', () => {
    const svg = contributionsAnimation({ weeks: calendar(53), greeting: 'welcome :)' });
    expect(svg).toContain(`viewBox="${VIEW_BOX}" width="${WIDTH}" height="${HEIGHT}"`);
    expect(svg).toContain('<clipPath id="hole"');
    expect(svg).toContain('fill="url(#pit)"');
    expect(svg.length).toBeGreaterThan(100_000);
  });

  it('renders a 52-week calendar on the same canvas', () => {
    const head = (svg: string) => svg.slice(0, svg.indexOf('>') + 1);
    const greeting = 'welcome :)';
    expect(head(contributionsAnimation({ weeks: calendar(52), greeting }))).toBe(
      head(contributionsAnimation({ weeks: calendar(53), greeting })),
    );
  });

  it('takes a different greeting', () => {
    expect(contributionsAnimation({ weeks: calendar(53), greeting: 'Hello, World!' })).toContain('<svg ');
    expect(() => contributionsAnimation({ weeks: calendar(53), greeting: 'olá' })).toThrow(/glyph/);
  });
});

describe('cli', () => {
  const entry = fileURLToPath(new URL('./index.ts', import.meta.url));
  const run = (args: string[], env: Record<string, string>) => {
    const cwd = mkdtempSync(join(tmpdir(), 'contributions-cli-'));
    const result = spawnSync(process.execPath, [entry, ...args], {
      cwd,
      env: { PATH: process.env.PATH, ...env },
      encoding: 'utf8',
    });
    return { cwd, ...result };
  };

  it('renders a saved calendar into dist with the username and greeting from the environment', () => {
    const body = { data: { user: { contributionsCollection: { contributionCalendar: { weeks: calendar(53) } } } } };
    const dir = mkdtempSync(join(tmpdir(), 'contributions-calendar-'));
    const calendarPath = join(dir, 'calendar.json');
    writeFileSync(calendarPath, JSON.stringify(body));

    const { cwd, status, stdout, stderr } = run([calendarPath], { GITHUB_USERNAME: 'someone', GREETING_TEXT: 'hi' });

    expect(stderr).not.toMatch(/failed/);
    expect(status).toBe(0);
    expect(JSON.parse(stdout)).toMatchObject({
      out: 'dist/contributions.svg',
      index: 'dist/index.html',
      source: calendarPath,
      weeks: 53,
    });
    expect(readFileSync(join(cwd, 'dist/contributions.svg'), 'utf8')).toContain('<svg ');
    expect(readFileSync(join(cwd, 'dist/index.html'), 'utf8')).toContain('<title>someone</title>');
  });

  it('fails without a token when no calendar file is given', () => {
    const { cwd, status, stderr } = run([], {});
    expect(status).toBe(1);
    expect(stderr).toMatch(/generate failed: GITHUB_TOKEN is not set/);
    expect(existsSync(join(cwd, 'dist'))).toBe(false);
  });
});
