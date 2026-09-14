// Renders dist/contributions.svg.
//   pnpm generate                 fetches the live calendar for LOGIN using GITHUB_TOKEN
//   pnpm generate calendar.json   renders a saved GraphQL response instead (no token needed)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fetchCalendar, weeksOf } from './calendar.ts';
import { renderGraph } from './graph.ts';

const LOGIN = 'worgho2';
const OUT = 'dist/contributions.svg';

async function main(): Promise<void> {
  const inPath = process.argv[2];
  const body: unknown = inPath
    ? JSON.parse(readFileSync(inPath, 'utf8'))
    : await fetchCalendar(LOGIN, process.env.GITHUB_TOKEN);
  const weeks = weeksOf(body);
  const svg = renderGraph(weeks);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, svg);
  const summary = {
    out: OUT,
    source: inPath ?? `graphql:${LOGIN}`,
    weeks: weeks.length,
    activeDays: weeks.flatMap((w) => w.contributionDays).filter((d) => d.contributionCount > 0).length,
    bytes: Buffer.byteLength(svg),
  };
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err: unknown) => {
  console.error(`generate failed: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
