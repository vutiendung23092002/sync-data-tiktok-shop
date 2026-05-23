import { vnTimeToUTCTimestampMiliseconds } from "./time-helper.js";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getLarkDateFilterRange(from, to, dayPadding = 1) {
  const padding = dayPadding * ONE_DAY_IN_MS;

  return {
    timestampFrom: vnTimeToUTCTimestampMiliseconds(from) - padding,
    timestampTo: vnTimeToUTCTimestampMiliseconds(to) + padding,
  };
}

