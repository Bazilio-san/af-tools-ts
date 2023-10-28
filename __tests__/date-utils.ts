import { Interval } from 'luxon';
import { getInterval, millisTo } from '../src';

console.log(millisTo.human.loc.Z(Date.now()));

console.log(getInterval(0, 345_000, 'ru'));

const f = Interval
  .fromDateTimes(new Date(0), new Date(345_456))
  .toDuration()
  .valueOf();

console.log(f);
