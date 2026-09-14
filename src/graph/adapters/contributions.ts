import { COLS, emptyMatrix, type Matrix, type Palette, ROWS } from '../ports.ts';

/** One week of the GraphQL `contributionCalendar`. Partial first and last weeks have fewer days. */
export type CalendarWeek = {
  contributionDays: Array<{ contributionCount: number; weekday: number }>;
};

/** Contributions per day at full block height; taller days are drawn at this height. */
export const CAP = 45;
const HEIGHT_UNIT = 0.2;

/** Counts by weekday (row, Sunday at the back) and week (column, oldest first, left-aligned). Calendars longer than `COLS` weeks keep only the most recent `COLS`. */
export const contributionsMatrix = (weeks: CalendarWeek[]): Matrix => {
  if (weeks.length === 0) throw new Error(`expected at least one week of contributions, got ${weeks.length} weeks`);
  const m = emptyMatrix();
  weeks.slice(-COLS).forEach((week, col) => {
    for (const day of week.contributionDays) {
      if (!(day.weekday >= 0 && day.weekday < ROWS))
        throw new Error(`weekday ${day.weekday} is outside 0..${ROWS - 1}`);
      m[day.weekday][col] = day.contributionCount;
    }
  });
  return m;
};

/** GitHub's green bands by count; height grows 0.2 per contribution up to the cap. */
export const contributionsPalette: Palette = (count) => {
  const faces = (): [string, string, string] => {
    if (count >= 30) return ['#216e39', '#144a26', '#1a5c30'];
    if (count >= 15) return ['#30a14e', '#1f6b34', '#278641'];
    if (count >= 5) return ['#40c463', '#2a8342', '#35a352'];
    return ['#9be9a8', '#6a9f73', '#83c48e'];
  };
  return { height: Math.min(count, CAP) * HEIGHT_UNIT, faces: faces() };
};
