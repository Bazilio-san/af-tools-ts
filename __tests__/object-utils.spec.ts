import { every } from '../src/object-utils';

const o: { [p: string]: number } = {
  a: 1,
  b: 2,
  c: 3,
};

describe('every', () => {
  test(`1`, () => {
    expect(every<{ [p: string]: number }>(o, (v, _k) => typeof v === 'number')).toBeTruthy();
  });
  test(`2`, () => {
    expect(every(o, (v, _k) => v < 4)).toBeTruthy();
  });
});
