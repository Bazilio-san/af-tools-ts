import { DateTime, ToISOTimeOptions, Interval } from 'luxon';

export const START_OF_ERA_ISO = '1970-01-01T00:00:00.000Z';

const humanizeDuration = require('humanize-duration');

let localTimezone: string = '';
try {
  // @ts-ignore
  const config = require('config');
  ({ localTimezone } = config);
} catch (err) {
  //
}
export const LOCAL_TIMEZONE = localTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

export const LOCAL_TIMEZONE_OFFSET_MILLIS = DateTime.now().setZone(LOCAL_TIMEZONE).offset * 60_000;

const utc$ = (millis?: number): DateTime => DateTime.fromMillis(millis == null ? Date.now() : millis).setZone('UTC');
const loc$ = (millis?: number): DateTime => DateTime.fromMillis(millis == null ? Date.now() : millis).setZone(LOCAL_TIMEZONE);

export const millisTo = {
  // 2023-03-18_18-43-15_UTC
  fileNameZ: (millis?: number): string => utc$(millis).toFormat('yyyy-MM-dd_HH-mm-ss_z'),
  human: {
    utc: {
      // 2022-05-15 16:56:42
      _: (millis?: number): string => utc$(millis).toFormat('yyyy-MM-dd HH:mm:ss'),
      // 2022-05-15 16:56:42 UTC
      z: (millis?: number): string => utc$(millis).toFormat('yyyy-MM-dd HH:mm:ss z'),
      // 2022-05-15 16:56
      mm: (millis?: number): string => utc$(millis).toFormat('yyyy-MM-dd HH:mm'),
      // 2022-05-15 16:56 UTC
      mmz: (millis?: number): string => utc$(millis).toFormat('yyyy-MM-dd HH:mm z'),
      // 2022-05-15
      date: (millis?: number): string => utc$(millis).toFormat('yyyy-MM-dd'),
      time: (millis?: number): string => utc$(millis).toFormat('HH:mm:ss'),
      timeMs: (millis?: number): string => utc$(millis).toFormat('HH:mm:ss.SSS'),
    },
    // 2022-05-15 19:56:42
    loc: {
      // 2022-05-15 19:56:42
      _: (millis?: number): string => loc$(millis).toFormat('yyyy-MM-dd HH:mm:ss'),
      // 2022-05-15 19:56:42 Europe/Moscow
      z: (millis?: number): string => loc$(millis).toFormat('yyyy-MM-dd HH:mm:ss z'),
      // 2022-05-15 19:56:42 +3
      Z: (millis?: number): string => loc$(millis).toFormat('yyyy-MM-dd HH:mm:ss Z'),
      // 2022-05-15
      date: (millis?: number): string => loc$(millis).toFormat('yyyy-MM-dd'),
    },
  },
  iso: {
    // 2022-05-15T19:56:42.349+03:00
    _: (millis?: number, options?: ToISOTimeOptions): string | null => DateTime.fromMillis(millis == null ? Date.now() : millis).toISO(options),
    // 2022-05-15T16:56:42.349Z
    z: (millis?: number, options?: ToISOTimeOptions): string | null => utc$(millis).toISO(options),
    // 2022-05-15T19:56:42.349
    loc: (millis: number): string | null => loc$(millis).toISO({ includeOffset: false }),
  },
  db: {
    // '2022-05-15T16:56:42.349Z'
    isoZ: (millis?: number): string | null => `'${utc$(millis).toISO({ includeOffset: true })}'`,
    // '2022-05-15T19:56:42.349' (время локальное)
    locT: (millis?: number): string | null => `'${loc$(millis).toISO({ includeOffset: false })}'`,
    // '2022-05-15' (время локальное)
    locDate: (millis?: number) => `'${loc$(millis).toFormat('yyyy-MM-dd')}'`,
    // '2022-05-15T16:56:42.349'::timestamptz (UTC)
    pgUtc: (millis?: number): string | null => `'${utc$(millis).toISO()}'::timestamptz`,
  },
  letterTime: (ts_: number | undefined | null): string => (ts_ ? `${millisTo.human.loc._(ts_)} MSK / ${millisTo.human.utc.z(ts_)}` : '-'),
};

export const getInterval = (start: DateTime | Date | number, finish?: DateTime | Date | number): string => {
  if (!finish) {
    finish = Date.now();
  }
  if (typeof start === 'number') {
    start = new Date(start);
  }
  if (typeof finish === 'number') {
    finish = new Date(finish);
  }
  const formatted = Interval
    .fromDateTimes(start, finish)
    .toDuration()
    .valueOf();
  return humanizeDuration(formatted);
};

export const timeParamRE = /^(\d+)\s*(years?|y|months?|mo|weeks?|w|days?|d|hours?|h|minutes?|min|m|seconds?|sec|s|milliseconds?|millis|ms|)$/i;

export const getTimeParamMillis = (val: string | number): number => {
  const [, nn, dhms] = timeParamRE.exec(String(val) || '') || [];
  if (!nn) {
    return 0;
  }
  let sec = 0;

  switch (dhms.toLowerCase()) {
    case 'y':
    case 'year':
    case 'years':
      sec = 365 * 24 * 3600 * +nn;
      break;
    case 'mo':
    case 'month':
    case 'months':
      sec = 30 * 24 * 3600 * +nn;
      break;
    case 'w':
    case 'week':
    case 'weeks':
      sec = 7 * 24 * 3600 * +nn;
      break;
    case 'd':
    case 'day':
    case 'days':
      sec = 24 * 3600 * +nn;
      break;
    case 'h':
    case 'hour':
    case 'hours':
      sec = 3600 * +nn;
      break;
    case 'm':
    case 'min':
    case 'minute':
    case 'minutes':
      sec = 60 * +nn;
      break;
    case 's':
    case 'sec':
    case 'second':
    case 'seconds':
      sec = +nn;
      break;
    case 'ms':
    case 'millis':
    case 'millisecond':
    case 'milliseconds':
      return +nn;
    default:
      return +nn;
  }
  return sec * 1000;
};

export type TTimeUnit = 'd' | 'h' | 'm' | 's' | 'ms';

export const getTimeParamFromMillis = (millis: number, roundTo: 'd' | 'h' | 'm' | 's' | 'biggest' | '' = ''): string => {
  let seconds = millis < 1000 ? 0 : Math.floor(millis / 1000);
  if (roundTo === 's') {
    return `${seconds} s`;
  }
  millis %= 1000;
  let minutes = seconds < 60 ? 0 : Math.floor(seconds / 60);
  if (roundTo === 'm') {
    return `${minutes} m`;
  }
  seconds %= 60;
  let hours = minutes < 60 ? 0 : Math.floor(minutes / 60);
  if (roundTo === 'h') {
    return `${hours} h`;
  }
  minutes %= 60;
  const days = hours < 24 ? 0 : Math.floor(hours / 24);
  if (roundTo === 'd') {
    return `${days} d`;
  }
  hours %= 24;
  if (roundTo === 'biggest') {
    if (days) {
      return `${days} d`;
    }
    if (hours) {
      return `${hours} h`;
    }
    if (minutes) {
      return `${minutes} m`;
    }
    if (seconds) {
      return `${seconds} s`;
    }
    return `${millis} ms`;
  }
  if (millis) {
    return `${millis + seconds * 1000 + minutes * 60_000 + hours * 60 * 60_000 + days * 24 * 60 * 60_000} ms`;
  }
  if (seconds) {
    return `${seconds + minutes * 60 + hours * 60 * 60 + days * 24 * 60 * 60} s`;
  }
  if (minutes) {
    return `${minutes + hours * 60 + days * 24 * 60} m`;
  }
  if (hours) {
    return `${hours + days * 24} h`;
  }
  return `${days} d`;
};

export const isoToMillis = (str: string, zone: string = 'UTC') => {
  if (!str) {
    return null;
  }
  const dt = DateTime.fromISO(str, { zone });
  if (!dt.isValid) {
    return null;
  }
  return dt.toMillis();
};
