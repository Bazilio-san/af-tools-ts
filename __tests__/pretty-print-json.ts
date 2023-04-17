import { FormatOptions, prettyPrintJson } from "../src";

const obj = {
  id: '123456',
  ts: 1668860000553,
  info_json: {
    person: {
      personName: 'Пупкин',
    },
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
      rule: {
        threshold: 1,
      },
      liquidityInfo: {
        deals: 2,
      },
    },
  },
  payload: { instrumentType: 'opt', comparisonPrice: 9999 },
};

const prettyPrintJsonOptions: FormatOptions = { linkUrls: true, indent: 2 };
const html = prettyPrintJson.toHtml(obj, prettyPrintJsonOptions);
console.log(html)
