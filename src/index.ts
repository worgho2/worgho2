// Renders dist/contributions.svg and the dist/index.html page that shows it.
//   pnpm generate                 fetches the live calendar for GITHUB_USERNAME using GITHUB_TOKEN
//   pnpm generate calendar.json   renders a saved GraphQL response instead (no token needed)
// GITHUB_USERNAME defaults to worgho2, GREETING_TEXT to 'welcome :)' and GITHUB_REPOSITORY (set by
// Actions) to GITHUB_USERNAME/GITHUB_USERNAME; the page links to that repository's TEMPLATE.md.
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { hole } from './erase-transitions/hole/hole.ts';
import { indexPage } from './index-page.ts';
import type { Write } from './plate-animation-builder/model.ts';
import { PlateAnimationBuilder } from './plate-animation-builder/plate-animation-builder.ts';
import { githubCalendarFromApi } from './writable/github-contributions/github-api.ts';
import type { GithubCalendarSource, GithubCalendarWeek } from './writable/github-contributions/github-calendar.ts';
import { githubCalendarFromFile } from './writable/github-contributions/github-calendar-file.ts';
import {
  writableGithubContributionsPalette,
  writableGithubContributionsPlate,
} from './writable/github-contributions/github-contributions.ts';
import { writableTextPalette, writableTextPlate } from './writable/text/text.ts';
import { grow } from './write-transitions/grow/grow.ts';
import { wave } from './write-transitions/wave/wave.ts';

const OUT = 'dist/contributions.svg';
const INDEX = 'dist/index.html';

/**
 * What the profile animation shows: a year of contributions and a greeting.
 */
export type ContributionsAnimation = {
  /**
   * The calendar to draw, oldest week first.
   */
  weeks: GithubCalendarWeek[];
  /**
   * The text written after the contributions are erased.
   */
  greeting: string;
};

/**
 * The profile animation: the contributions grow in, a hole eats them left to right, the greeting
 * waves up, the hole eats it right to left, and the cycle repeats.
 */
export const contributionsAnimation = ({ weeks, greeting }: ContributionsAnimation): string => {
  const writeGithubContributions: Write = {
    data: writableGithubContributionsPlate(weeks),
    palette: writableGithubContributionsPalette,
    transition: grow(),
  };

  const writeGreeting: Write = {
    data: writableTextPlate(greeting),
    palette: writableTextPalette,
    transition: wave(),
  };

  return new PlateAnimationBuilder()
    .write(writeGithubContributions)
    .delay({ duration: 1.5 })
    .erase({ transition: hole({ from: 'left' }) })
    .delay({ duration: 0.5 })
    .write(writeGreeting)
    .delay({ duration: 0.5 })
    .erase({ transition: hole({ from: 'right' }) })
    .delay({ duration: 0.5 })
    .build();
};

/**
 * The CLI: picks the calendar source, renders, writes `dist/` and prints a JSON summary.
 */
async function main(): Promise<void> {
  const inPath = process.argv[2];
  const username = process.env.GITHUB_USERNAME || 'worgho2';
  const greeting = process.env.GREETING_TEXT || 'welcome :)';
  const repository = process.env.GITHUB_REPOSITORY || `${username}/${username}`;

  const calendar: GithubCalendarSource = inPath
    ? githubCalendarFromFile(inPath)
    : githubCalendarFromApi(username, process.env.GITHUB_TOKEN);

  const weeks = await calendar();
  const svg = contributionsAnimation({ weeks, greeting });

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg);
  writeFileSync(INDEX, indexPage({ username, repository, svgPath: basename(OUT) }));

  const summary = {
    out: OUT,
    index: INDEX,
    source: inPath ?? `graphql:${username}`,
    username,
    repository,
    greeting,
    weeks: weeks.length,
    activeDays: weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length,
    bytes: Buffer.byteLength(svg),
  };

  console.log(JSON.stringify(summary, null, 2));
}

if (import.meta.main) {
  main().catch((err: unknown) => {
    console.error(`generate failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  });
}
