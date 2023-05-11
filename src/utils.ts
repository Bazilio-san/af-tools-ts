import * as os from 'os';
import * as crypto from 'crypto';

let instanceKey: string;

export const getInstanceKey = () => {
  if (!instanceKey) {
    const data = `${os.hostname()}${__dirname}${process.env.NODE_CONFIG_ENV || process.env.NODE_ENV}`;
    instanceKey = crypto.createHash('md5').update(data).digest('hex');
  }
  return instanceKey;
};

export const sleep = async (timeOut: number) => new Promise((resolve) => {
  const timer = setTimeout(() => {
    clearTimeout(timer);
    resolve(true);
  }, timeOut);
});

export const rn = (x: number, digits: number = 2) => {
  const p = 10 ** digits;
  return Math.round(Number(x) * p) / p;
};

export const rnpc = (x: number, digits: number = 2) => rn(x * 100, digits);

const mb = (bytes: number): string => `${rn(bytes / 1024 / 1024)} mb`;

export const memUsage = (): string => {
  const { heapUsed, rss } = process.memoryUsage();
  return `MEM: ${mb(heapUsed)} / ${mb(rss)}`;
};

export const getBool = (v: any, def = false): boolean => {
  if (v == null) {
    return def;
  }
  if (typeof v === 'string') {
    if (/^(false|0|no|нет)$/i.test(v)) {
      return false;
    }
    if (/^(true|1|yes|да)$/i.test(v)) {
      return true;
    }
    return def;
  }
  if (typeof v === 'boolean') {
    return v;
  }
  if (typeof v === 'number') {
    return !!v;
  }
  return !!v;
};

export const floatEnv = (name: string, def: number) => {
  let v = process.env[name];
  if (!v) {
    return def;
  }
  v = v.replace(/_/g, '');
  const val = parseFloat(v);
  return val || val === 0 ? val : def;
};

export const intEnv = (name: string, def: number) => Math.ceil(floatEnv(name, def));

export const strEnv = (name: string, def: string) => process.env[name] || def;

export const boolEnv = (name: string, def = false) => getBool(process.env[name], def);

export const repeat = <T = any> (what: T, count: number): T[] => [...Array(count).keys()].map(() => what);

export const throttle = (func: Function, limit: number): Function => {
  let timer: any;
  let lastRan: number = 0;
  return function t (...args: any[]) {
    // @ts-ignore
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};
