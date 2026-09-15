import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { githubCalendarFromFile } from './github-calendar-file.ts';

const dir = mkdtempSync(join(tmpdir(), 'github-calendar-'));
const file = (name: string, content: string) => {
  const path = join(dir, name);
  writeFileSync(path, content);
  return path;
};
const calendar = (weeks: unknown[]) => ({
  data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } },
});

describe('githubCalendarFromFile', () => {
  it('resolves with the weeks of a saved GraphQL response', async () => {
    const weeks = [{ contributionDays: [{ contributionCount: 3, weekday: 2 }] }];
    const path = file('calendar.json', JSON.stringify(calendar(weeks)));
    await expect(githubCalendarFromFile(path)()).resolves.toEqual(weeks);
  });

  it('rejects a file that is not a calendar', async () => {
    await expect(githubCalendarFromFile(file('weeks.json', '[]'))()).rejects.toThrow(/no weeks/);
  });

  it('rejects a file that is not JSON', async () => {
    await expect(githubCalendarFromFile(file('bad.json', '{'))()).rejects.toThrow(/bad\.json/);
  });

  it('rejects a missing file', async () => {
    await expect(githubCalendarFromFile(join(dir, 'missing.json'))()).rejects.toThrow(/missing\.json/);
  });
});
