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
      // 2022-05-15 16:56 UTC
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
    // '2022-05-15T19:56:42.349' (время локальное)
    locT: (millis?: number): string | null => `'${loc$(millis).toISO({ includeOffset: false })}'`,
    // '2022-05-15' (время локальное)
    locDate: (millis?: number) => `'${loc$(millis).toFormat('yyyy-MM-dd')}'`,
    // '2022-05-15T19:56:42.349'::timestamptz (UTC)
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
