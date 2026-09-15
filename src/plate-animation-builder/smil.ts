import { LINEAR } from './constants.ts';
import type { RenderContext } from './model.ts';

/**
 * Every keyTime must lie inside the cycle and come after the one before it.
 */
const checkTimes = (times: number[], period: number): void => {
  for (let i = 0; i < times.length; i++) {
    if (times[i] < 0 || times[i] > period + 1e-9) {
      throw new Error(`keyTime ${times[i]} outside the ${period}s cycle`);
    }

    if (i > 0 && times[i] < times[i - 1]) {
      throw new Error(`keyTimes not ordered: ${times.join(', ')}`);
    }
  }
};

/**
 * Animation helpers for one cycle. Every animation spans the whole period and repeats forever,
 * so all of them stay in sync without SMIL event syntax.
 */
export function smil(period: number): RenderContext {
  const k = (t: number): string => (t / period).toFixed(5);
  const common = `begin="0s" dur="${period}s" repeatCount="indefinite"`;

  return {
    period,
    /**
     * values[i] is reached at times[i]; the first value holds until times[0], the last holds after.
     */
    tween: (attr, values, times, splines, tag = 'animate', extra = '') => {
      checkTimes(times, period);

      if (values.length !== times.length || splines.length !== times.length - 1) {
        throw new Error(`tween ${attr}: ${values.length} values, ${times.length} times, ${splines.length} splines`);
      }

      const vals = [values[0], ...values, values[values.length - 1]].join(';');
      const kt = [0, ...times.map(k), 1].join(';');
      const ks = [LINEAR, ...splines, LINEAR].join(';');

      return `<${tag} attributeName="${attr}" ${extra}values="${vals}" keyTimes="${kt}" keySplines="${ks}" calcMode="spline" ${common}/>`;
    },
    /**
     * discrete: values[0] from 0, values[i] from times[i-1].
     */
    step: (attr, values, times) => {
      checkTimes(times, period);

      if (values.length !== times.length + 1) {
        throw new Error(`step ${attr}: ${values.length} values, ${times.length} times`);
      }

      const vals = [...values, values[values.length - 1]].join(';');
      const kt = [0, ...times.map(k), 1].join(';');

      return `<animate attributeName="${attr}" values="${vals}" keyTimes="${kt}" calcMode="discrete" ${common}/>`;
    },
  };
}
