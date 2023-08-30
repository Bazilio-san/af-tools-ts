const obj = {
  id: '123456',
  ts: 1668860000553,
  info_json: {
    person: { personName: 'Пупкин' },
    instrument: {
      id: 9990,
      name: 'instrument name',
      type: 'opt',
    },
    signal: {
      data: {
        deviation: 57.97,
        comparisonPrice: 17.377,
      },
      rule: { threshold: 1 },
      liquidityInfo: { deals: 2 },
    },
  },
  payload: { instrumentType: 'opt', comparisonPrice: 9999 },
};
const { flattenObjectPrimitiveLeafs } = require('../dist/cjs/src/object-utils.js');

// eslint-disable-next-line no-console
console.log(flattenObjectPrimitiveLeafs(obj, { keysType: 'mixed', noOverrideKeys: true }));
