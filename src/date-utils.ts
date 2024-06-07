import { DateTime, ToISOTimeOptions, Interval } from 'luxon';
import { getConfig } from './get-config';

export const START_OF_ERA_ISO = '1970-01-01T00:00:00.000Z';

const humanizeDuration = require('humanize-duration');

const config: any = getConfig();
const { localTimezone = '' } = config || {};

export type TLang = 'ru' | 'en';

const defaultLanguage = 'en';

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
    // '2024-06-07T23:23:00.000Z'::timestamptz
    pgUtc: (millis?: number): string => `'${utc$(millis).toISO()}'::timestamptz`,
    // '2022-05-15T16:56 UTC'::timestamptz
    pgUtcMm: (millis?: number): string => `'${utc$(millis).toFormat('yyyy-MM-dd HH:mm z')}'::timestamptz`,
  },
  letterTime: (ts_: number | undefined | null): string => (ts_ ? `${millisTo.human.loc._(ts_)} MSK / ${millisTo.human.utc.z(ts_)}` : '-'),
};

export const getInterval = (start: DateTime | Date | number, finish?: DateTime | Date | number, language: string = defaultLanguage): string => {
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
  return humanizeDuration(formatted, { language });
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

type TTimeUnits = { ms: string, s: string, m: string, h: string, d: string }

type TTimeUnitsLng = { [lng: string]: { short: TTimeUnits, middle: TTimeUnits } }

const tdb: TTimeUnitsLng = {
  ru: {
    short: { ms: 'мс', s: 'с', m: 'м', h: 'ч', d: 'д' },
    middle: { ms: 'миллис.', s: ' сек.', m: ' мин.', h: ' ч.', d: ' дн.' },
  },
  en: {
    short: { ms: 'ms', s: 's', m: 'm', h: 'h', d: 'd' },
    middle: { ms: 'millis.', s: ' sec.', m: ' min.', h: ' hr', d: ' days' },
  },
};
tdb['en-us'] = tdb.en;

type TTimeParamFromMillisOptions = {
  roundTo?: 'd' | 'h' | 'm' | 's' | 'biggest' | '',
  lng?: TLang,
}

export const getTimeParamFromMillis = (millis: number, options?: TTimeParamFromMillisOptions): string => {
  const roundTo = options?.roundTo || '';
  const lng = options?.lng || defaultLanguage;
  let seconds = millis < 1000 ? 0 : Math.floor(millis / 1000);
  const tl = (timeUnit: TTimeUnit) => tdb[lng]?.short[timeUnit] || timeUnit;

  if (roundTo === 's') {
    return `${seconds} ${tl('s')}`;
  }
  millis %= 1000;
  let minutes = seconds < 60 ? 0 : Math.floor(seconds / 60);
  if (roundTo === 'm') {
    return `${minutes} ${tl('m')}`;
  }
  seconds %= 60;
  let hours = minutes < 60 ? 0 : Math.floor(minutes / 60);
  if (roundTo === 'h') {
    return `${hours} ${tl('h')}`;
  }
  minutes %= 60;
  const days = hours < 24 ? 0 : Math.floor(hours / 24);
  if (roundTo === 'd') {
    return `${days} ${tl('d')}`;
  }
  hours %= 24;
  if (roundTo === 'biggest') {
    if (days) {
      return `${days} ${tl('d')}`;
    }
    if (hours) {
      return `${hours} ${tl('h')}`;
    }
    if (minutes) {
      return `${minutes} ${tl('m')}`;
    }
    if (seconds) {
      return `${seconds} ${tl('s')}`;
    }
    return `${millis} ${tl('ms')}`;
  }
  if (millis) {
    return `${millis + seconds * 1000 + minutes * 60_000 + hours * 60 * 60_000 + days * 24 * 60 * 60_000} ${tl('ms')}`;
  }
  if (seconds) {
    return `${seconds + minutes * 60 + hours * 60 * 60 + days * 24 * 60 * 60} ${tl('s')}`;
  }
  if (minutes) {
    return `${minutes + hours * 60 + days * 24 * 60} ${tl('m')}`;
  }
  if (hours) {
    return `${hours + days * 24} ${tl('h')}`;
  }
  return `${days} ${tl('d')} `;
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

export const durationMillisToHHMMSS = (millis: number): string => Interval
  .fromDateTimes(new Date(0), new Date(millis))
  .toDuration().toFormat('hh:mm:ss');

interface IHumanizeDurationSecOptions {
  zero?: string,
  showLeadZeros?: boolean,
  lng?: TLang,
  delim?: string,
}

/**
 * Return string like 3 мин 29 с.
 */
export const humanizeDurationSec = (seconds: number | string, options: IHumanizeDurationSecOptions = {}) => {
  const { zero = '0', showLeadZeros = false, lng = defaultLanguage, delim = ' ' } = options;

  const l = Object.keys(tdb).includes(lng) ? lng : defaultLanguage;
  const n = tdb[l].middle;
  seconds = Math.round((typeof seconds === 'number' ? seconds : parseFloat(seconds)) || 0);
  if (!seconds) {
    return zero;
  }
  let minutes = Math.floor(seconds / 60);
  seconds %= 60;
  let hours = Math.floor(minutes / 60);
  minutes %= 60;
  const days = Math.floor(hours / 24);
  hours %= 24;
  const arr = [`${days}${n.d}`, `${hours}${n.h}`, `${minutes}${n.m}`, `${seconds}${n.s}`];
  if (!showLeadZeros) {
    if (!days) {
      arr.shift();
      if (!hours) {
        arr.shift();
        if (!minutes) {
          arr.shift();
        }
      }
    }
  }
  return arr.join(delim);
};

// https://stackoverflow.com/questions/3143070/regex-to-match-an-iso-8601-datetime-string
const isoRE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2][1-9]|[1-3]0|3[01])T(?:[0-1][0-9]|2[0-3])(?::[0-6]\d)(?::[0-6]\d)?(?:\.\d{3})?(?:[+-][0-2]\d:[0-5]\d|Z)?$/im;
const tzRE = /^.+?([+-][0-2]\d:[0-5]\d|Z)?$/im;

export const isISO = (v: string) => isoRE.test(v);

export const getTimeOffsetFromISO = (v: string) => (tzRE.exec(v) || [])[1];

/**
 * Нормализует дату, преобразовывая из текстового ISO формата в JS date.
 * Выводит ошибку в консоль, если строковое значение не соответствует ISO формату.
 */
export const normalizeJSDate = (v: any, errorCallback?: (v: string) => void, errorPrefix?: string) => {
  if (typeof v === 'object') {
    return v; // Date || null
  }
  if (typeof v === 'number') {
    return new Date(v);
  }
  if (typeof v === 'string' && isISO(v)) {
    return new Date(Date.parse(v));
  }
  if (typeof errorCallback === 'function') {
    errorCallback(`${errorPrefix || ''}Wrong date: ${v} / type: ${typeof v}`);
  }
  return null;
};
