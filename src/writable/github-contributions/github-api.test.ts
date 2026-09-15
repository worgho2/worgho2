import { describe, expect, it } from 'vitest';
import { githubCalendarFromApi, QUERY } from './github-api.ts';

const respond = (status: number, body: unknown) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});
const calendar = (weeks: unknown[]) => ({
  data: { user: { contributionsCollection: { contributionCalendar: { weeks } } } },
});

describe('githubCalendarFromApi', () => {
  it('rejects when the token is missing', async () => {
    const source = githubCalendarFromApi('worgho2', undefined, respond(200, calendar([{ contributionDays: [] }])));
    await expect(source()).rejects.toThrow(/GITHUB_TOKEN/);
  });

  it('posts the query for the login with a bearer token', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fake = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return { ok: true, status: 200, json: async () => calendar([{ contributionDays: [] }]) };
    };
    await githubCalendarFromApi('worgho2', 'tok', fake)();
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://api.github.com/graphql');
    expect(calls[0].init.method).toBe('POST');
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe('bearer tok');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.variables).toEqual({ login: 'worgho2' });
    expect(body.query).toBe(QUERY);
    expect(body.query).toContain('contributionCalendar');
  });

  it('rejects on an HTTP error', async () => {
    await expect(githubCalendarFromApi('worgho2', 'tok', respond(502, {}))()).rejects.toThrow(/HTTP 502/);
  });

  it('rejects on GraphQL errors', async () => {
    const body = { data: null, errors: [{ message: 'Could not resolve to a User' }] };
    await expect(githubCalendarFromApi('worgho2', 'tok', respond(200, body))()).rejects.toThrow(/Could not resolve/);
  });

  it('rejects a response without weeks', async () => {
    await expect(githubCalendarFromApi('worgho2', 'tok', respond(200, { data: {} }))()).rejects.toThrow(/no weeks/);
  });

  it('resolves with the weeks of the response', async () => {
    const weeks = [{ contributionDays: [{ contributionCount: 1, weekday: 0 }] }];
    await expect(githubCalendarFromApi('worgho2', 'tok', respond(200, calendar(weeks)))()).resolves.toEqual(weeks);
  });
});
