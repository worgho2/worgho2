import { type CalendarWeek, contributionsMatrix, contributionsPalette } from './graph/adapters/contributions.ts';
import { textMatrix, textPalette } from './graph/adapters/text.ts';
import { grow } from './graph/adapters/transitions/grow.ts';
import { hole } from './graph/adapters/transitions/hole.ts';
import { wave } from './graph/adapters/transitions/wave.ts';
import { Generator } from './graph/generator.ts';

/**
 * The profile animation: the contributions grow in, a hole eats them left to right,
 * a greeting waves up, the hole eats it right to left, and the cycle repeats.
 */
export const renderGraph = (weeks: CalendarWeek[], greeting = 'welcome :)'): string =>
  new Generator()
    .write({ data: contributionsMatrix(weeks), palette: contributionsPalette, transition: grow() })
    .delay(1.5)
    .erase({ transition: hole({ from: 'left' }) })
    .delay(0.5)
    .write({ data: textMatrix(greeting), palette: textPalette, transition: wave() })
    .delay(0.5)
    .erase({ transition: hole({ from: 'right' }) })
    .delay(0.5)
    .build();
