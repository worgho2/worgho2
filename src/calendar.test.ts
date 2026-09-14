import { describe, expect, it } from 'vitest';
import { fetchCalendar, weeksOf } from './calendar.ts';

const respond = (status: number, body: unknown) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
const calendar = (weeks: unknown[]) => ({
  data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } },
});

describe('fetchCalendar', () => {
  it('rejects when the token is missing', async () => {
    await expect(fetchCalendar('worgho2', undefined, respond(200, calendar([{}])))).rejects.toThrow(/GITHUB_TOKEN/);
  });

  it('posts the query for the login with a bearer token', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fake = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return { ok: true, status: 200, json: async () => calendar([{}]) };
    };
    await fetchCalendar('worgho2', 'tok', fake);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.github.com/graphql');
    expect(calls[0].init.method).toBe('POST');
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('bearer tok');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.variables).toEqual({ login: 'worgho2' });
    expect(body.query).toContain('contributionCalendar');
  });

  it('rejects on an HTTP error', async () => {
    await expect(fetchCalendar('worgho2', 'tok', respond(502, {}))).rejects.toThrow(/HTTP 502/);
  });

  it('rejects on GraphQL errors', async () => {
    const body = { data: null, errors: [{ message: 'Could not resolve to a User' }] };
    await expect(fetchCalendar('worgho2', 'tok', respond(200, body))).rejects.toThrow(/Could not resolve/);
  });

  it('resolves with the response body', async () => {
    const body = calendar([{ contributionDays: [] }]);
    await expect(fetchCalendar('worgho2', 'tok', respond(200, body))).resolves.toEqual(body);
  });
});

describe('weeksOf', () => {
  it('returns the weeks array', () => {
    const weeks = [{ contributionDays: [] }, { contributionDays: [] }];
    expect(weeksOf(calendar(weeks))).toBe(weeks);
  });

  it('throws when the calendar is missing or empty', () => {
    expect(() => weeksOf({})).toThrow(/no weeks/);
    expect(() => weeksOf({ data: { user: null } })).toThrow(/no weeks/);
    expect(() => weeksOf(calendar([]))).toThrow(/no weeks/);
  });

  it('throws when a week is missing contributionDays', () => {
    expect(() => weeksOf(calendar([{ nope: true }]))).toThrow(/contributionDays/);
  });
});
