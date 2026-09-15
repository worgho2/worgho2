import { readFile } from 'node:fs/promises';
import { type GithubCalendarSource, githubCalendarWeeksOf } from './github-calendar.ts';

/**
 * A calendar source backed by a saved GraphQL response on disk, for local iteration without a token.
 * The source rejects when the file cannot be read, is not JSON, or carries no weeks.
 */
export const githubCalendarFromFile = (path: string): GithubCalendarSource => {
  return async () => {
    let body: unknown;

    try {
      body = JSON.parse(await readFile(path, 'utf8'));
    } catch (err: unknown) {
      throw new Error(`cannot read the calendar at ${path}: ${err instanceof Error ? err.message : String(err)}`);
    }

    return githubCalendarWeeksOf(body);
  };
};
