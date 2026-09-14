import type { CalendarWeek } from './graph/adapters/contributions.ts';

const GRAPHQL_URL = 'https://api.github.com/graphql';

export const QUERY = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }
    }
  }
}`;

type FetchLike = (
  url: string,
  init: RequestInit,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/**
 * Fetches the raw GraphQL response for a login. `fetchImpl` is injectable for tests.
 * Throws when the token is missing, the request fails, or GraphQL reports errors.
 */
export async function fetchCalendar(
  login: string,
  token: string | undefined,
  fetchImpl: FetchLike = fetch,
): Promise<unknown> {
  if (!token) throw new Error('GITHUB_TOKEN is not set');
  const res = await fetchImpl(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'worgho2/worgho2 contribution graph',
    },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GraphQL request failed: HTTP ${res.status}`);
  const body = (await res.json()) as { errors?: Array<{ message: string }> };
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    throw new Error(`GraphQL errors: ${body.errors.map((e) => e.message).join('; ')}`);
  }
  return body;
}

/** Extracts the weeks array from a GraphQL response body, or throws if there is none. */
export function weeksOf(body: unknown): CalendarWeek[] {
  const weeks = (
    body as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { weeks?: unknown } } } } }
  )?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
  if (!Array.isArray(weeks) || weeks.length === 0) throw new Error('calendar has no weeks');
  if (weeks.some((w) => !Array.isArray((w as { contributionDays?: unknown })?.contributionDays)))
    throw new Error('calendar week is missing contributionDays');
  return weeks as CalendarWeek[];
}
