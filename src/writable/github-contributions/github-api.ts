import { type GithubCalendarSource, githubCalendarWeeksOf } from './github-calendar.ts';

const GRAPHQL_URL = 'https://api.github.com/graphql';

/**
 * The GraphQL query behind the source. Exported so a saved response can be produced with the same query.
 */
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

/**
 * The part of `fetch` the source uses, so tests can hand in a fake.
 */
export type FetchLike = (
  url: string,
  init: RequestInit,
) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

/**
 * A calendar source backed by the GitHub GraphQL API. `fetchImpl` is injectable for tests.
 * The source rejects when the token is missing, the request fails, GraphQL reports errors, or the
 * response carries no weeks.
 */
export const githubCalendarFromApi = (
  login: string,
  token: string | undefined,
  fetchImpl: FetchLike = fetch,
): GithubCalendarSource => {
  return async () => {
    if (!token) {
      throw new Error('GITHUB_TOKEN is not set');
    }

    const res = await fetchImpl(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        authorization: `bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': `${login} contribution graph`,
      },
      body: JSON.stringify({ query: QUERY, variables: { login } }),
    });

    if (!res.ok) {
      throw new Error(`GraphQL request failed: HTTP ${res.status}`);
    }

    const body = (await res.json()) as { errors?: Array<{ message: string }> };

    if (Array.isArray(body.errors) && body.errors.length > 0) {
      throw new Error(`GraphQL errors: ${body.errors.map((e) => e.message).join('; ')}`);
    }

    return githubCalendarWeeksOf(body);
  };
};
