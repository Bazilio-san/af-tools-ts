import { every, objectsDiff } from '../src';

const o: { [p: string]: number } = {
  a: 1,
  b: 2,
  c: 3,
};

const dt = new Date();
const objectA = {
  token: {
    value: '12345.abcd',
    get exp () {
      return Number(this.value.split('.')[0]);
    },
    dt,
    num: 1234,
    num2: 1234.567,
    str: 'aaa',
    numD: 111.111, // DIFF
    srtD: 'aaa', // DIFF
    get exp2 () {
      return Number(this.value.split('.')[0]) + 1;
    },
  },
  propA: 'only A',
  propNU: null,
  objA: { a: 'a' },
  fn: (ddd: string) => {
    const x = '1';
    return x + ddd;
  },
  fnD: (ddd: string) => {
    const x = '1';
    return x + ddd;
  },
  fnD2: (ddd: string) => {
    const x = '1';
    return x + ddd;
  },
};
const objectB = {
  token: {
    value: '12345.abcd',
    get exp () {
      return Number(this.value.split('.')[0]);
    },
    dt,
    num: 1234,
    num2: 1234.567,
    str: 'aaa',
    numD: 2222.22222, // DIFF
    srtD: 'bbb', // DIFF
    get exp2 () {
      return Number(this.value.split('.')[0]) + 2; // DIFF
    },
  },
  fn: (ddd: string) => {
    const x = '1';
    return x + ddd;
  },

  propB: 'only B', // DIFF
  propNU: undefined, // DIFF
  objB: { b: 'b' }, // DIFF
  fnD: (ddd1: string) => { // DIFF
    const x = '1';
    return x + ddd1;
  },
  fnD2: (ddd: string) => {
    const x = '2';
    return x + ddd;
  },
};

describe('objects utils', () => {
  test('every [1]', () => {
    expect(every<{ [p: string]: number }>(o, (v, _k) => typeof v === 'number')).toBeTruthy();
  });
  test('every [2]', () => {
    expect(every(o, (v, _k) => v < 4)).toBeTruthy();
  });
  test('objectsDiff', () => {
    const diff = objectsDiff(objectA, objectB);
    expect(diff).toBeTruthy();
  });
});
