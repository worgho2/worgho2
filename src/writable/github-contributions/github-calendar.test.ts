import { describe, expect, it } from 'vitest';
import { githubCalendarWeeksOf } from './github-calendar.ts';

const calendar = (weeks: unknown[]) => ({
  data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } },
});

describe('githubCalendarWeeksOf', () => {
  it('returns the weeks array of a GraphQL response body', () => {
    const weeks = [{ contributionDays: [] }, { contributionDays: [] }];
    expect(githubCalendarWeeksOf(calendar(weeks))).toBe(weeks);
  });

  it('throws when the calendar is missing or empty', () => {
    expect(() => githubCalendarWeeksOf({})).toThrow(/no weeks/);
    expect(() => githubCalendarWeeksOf(null)).toThrow(/no weeks/);
    expect(() => githubCalendarWeeksOf({ data: { user: null } })).toThrow(/no weeks/);
    expect(() => githubCalendarWeeksOf(calendar([]))).toThrow(/no weeks/);
  });

  it('throws when a week is missing contributionDays', () => {
    expect(() => githubCalendarWeeksOf(calendar([{ nope: true }]))).toThrow(/contributionDays/);
  });
});
