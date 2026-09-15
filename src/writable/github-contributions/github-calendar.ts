/**
 * One week of the GraphQL `contributionCalendar`. Partial first and last weeks have fewer days.
 */
export type GithubCalendarWeek = {
  /**
   * One entry per day of the week, with `weekday` 0 (Sunday) to 6 (Saturday).
   */
  contributionDays: Array<{ contributionCount: number; weekday: number }>;
};

/**
 * A port for obtaining the calendar. The writable does not care whether the weeks come from the
 * live GraphQL API or from a saved response; the composition root picks the adapter.
 */
export type GithubCalendarSource = () => Promise<GithubCalendarWeek[]>;

/**
 * Extracts the weeks array from a GraphQL response body, or throws if there is none.
 */
export const githubCalendarWeeksOf = (body: unknown): GithubCalendarWeek[] => {
  const weeks = (
    body as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { weeks?: unknown } } } } } | null
  )?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;

  if (!Array.isArray(weeks) || weeks.length === 0) {
    throw new Error('calendar has no weeks');
  }

  if (weeks.some((w) => !Array.isArray((w as { contributionDays?: unknown })?.contributionDays))) {
    throw new Error('calendar week is missing contributionDays');
  }

  return weeks as GithubCalendarWeek[];
};
