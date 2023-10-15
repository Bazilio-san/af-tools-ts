export interface ITraverseNode {
  key: string | undefined,
  val: any,
  parents: string[],
  path: string[],
  isLeaf: boolean,
  isRoot: boolean,
  isPrimitive: boolean,
  isCyclic: boolean,
}

export const traverse = (
  val: any,
  callback: (_args: ITraverseNode) => void = () => undefined,
  parents: string[] = [],
  key: string | undefined = undefined,
  hash: WeakSet<any> = new WeakSet(),
) => {
  const isRoot = key === undefined;
  const path = isRoot ? [] : [...parents, key];
  let isPrimitive = false;
  const ret = (isLeaf = true, isCyclic = false) => {
    callback({
      key, val, parents, path, isLeaf, isPrimitive, isRoot, isCyclic,
    });
  };

  if (hash.has(val)) {
    // cyclic reference
    return ret(true, true);
  }

  if (Object(val) !== val) {
    // primitives
    isPrimitive = true;
    return ret();
  }
  hash.add(val);
  if (val instanceof Set || val instanceof Date || val instanceof RegExp || val instanceof Function) {
    return ret();
  }
  if (val instanceof Map) {
    ret(false);
    [...val.entries()].forEach(([key2, val2]) => traverse(val2, callback, path, key2, hash));
    return;
  }
  ret(false);
  Object.entries(val).forEach(([key2, val2]) => {
    traverse(val2, callback, path, key2, hash);
  });
};

export const isObject = (v: any) => v != null
  && typeof v === 'object'
  && !Array.isArray(v)
  && !(v instanceof Date)
  && !(v instanceof Set)
  && !(v instanceof Map);

export type TFlattenObjectKeysType = 'path' | 'name' | 'mixed'
export const flattenObjectPrimitiveLeafs = (obj: any, options: { keysType?: TFlattenObjectKeysType, noOverrideKeys?: boolean } = {}) => {
  const { keysType = 'mixed', noOverrideKeys = false } = options;
  const leafs: { [key: string]: string | number | boolean | null } = {};
  traverse(obj, (data) => {
    if (data.isLeaf && data.isPrimitive) {
      let keys: string[];
      if (keysType === 'path') {
        keys = [data.path.join('.')];
      } else if (keysType === 'name') {
        keys = [data.key || ''];
      } else {
        keys = [data.path.join('.'), data.key || ''];
      }
      keys = keys.filter(Boolean);
      keys.forEach((key) => {
        if (!noOverrideKeys || leafs[key] === undefined) {
          if (data.val !== undefined) {
            leafs[key] = data.val;
          }
        }
      });
    }
  });
  return leafs;
};

export const cloneDeep = <T = any> (
  obj: any,
  options: { pureObj?: boolean, skipSymbols?: boolean } = {},
  hash = new WeakMap(),
): T => {
  // https://stackoverflow.com/a/40294058/5239731
  const { pureObj = false, skipSymbols = false } = options;
  if (Object(obj) !== obj) return obj; // primitives
  if (hash.has(obj)) return hash.get(obj); // cyclic reference
  let result;
  if (obj instanceof Set) {
    result = new Set(obj); // See note about this!
  } else if (obj instanceof Map) {
    result = new Map(Array.from(obj, ([key, val]) => [key, cloneDeep(val, options, hash)]));
  } else if (obj instanceof Date) {
    result = new Date(obj);
  } else if (obj instanceof RegExp) {
    result = new RegExp(obj.source, obj.flags);
  } else if (obj instanceof Function) {
    result = obj;
  } else if (!pureObj && obj.constructor) {
    result = new obj.constructor();
  } else {
    result = Object.create(null);
  }
  hash.set(obj, result);
  const keys = [...Object.keys(obj), ...(skipSymbols ? [] : Object.getOwnPropertySymbols(obj))];
  return Object.assign(result, ...keys.map(
    (key) => ({ [key]: cloneDeep(obj[key], options, hash) }),
  ));
};

export const makePropertiesNotEnumerable = (obj: object, ...properties: string[]) => {
  properties.forEach((p) => {
    Object.defineProperty(obj, p, { enumerable: false });
  });
};

// ====================================
export const isNonEmptyObject = (value: any): boolean => {
  if (!isObject(value)) {
    return false;
  }
  return !!Object.keys(value).length;
};

export const extend = (obj: any, ...args: any[]): any => {
  args.forEach((obj2) => {
    Object.entries(obj2).forEach(([key, value]) => {
      obj[key] = value;
    });
  });
  return obj;
};

export const mergeDeep = (target: any, ...sources: any[]): any => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  return mergeDeep(target, ...sources);
};

export const mergeByPath = (json: any, path: string, value: any): any => {
  const p: string[] = path.split('.');
  let obj = json;
  p.forEach((segment, i) => {
    if (typeof obj[segment] !== 'object') {
      obj[segment] = {};
    }
    if (p.length - 1 === i) {
      obj[segment] = value;
    } else {
      obj = obj[segment];
    }
  });
  return json;
};

export const freezeDeep = (obj: any) => {
  const propNames = Object.getOwnPropertyNames(obj);
  propNames.forEach((name) => {
    const prop = obj[name];
    if (typeof prop === 'object' && prop !== null) freezeDeep(prop);
  });
  return Object.freeze(obj);
};

export const each = (obj: any, iteratee: Function) => {
  Object.entries(obj).forEach(([key, value]) => {
    iteratee(value, key, obj);
  });
};

export const map = (obj: any, iteratee: Function): any => Object.entries(obj).map(([key, value]) => iteratee(value, key, obj));

export const pickBy = (obj: any, iteratee: Function): any => {
  const ret: any = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (iteratee(value, key, obj)) {
      ret[key] = value;
    }
  });
  return ret;
};

/**
 * Compare two items
 * @param item1
 * @param item2
 * @return {boolean}
 */
export const compare = (item1: any, item2: any): boolean => {
  // Get the object type
  const itemType = Object.prototype.toString.call(item1);
  // If an object or array, compare recursively
  if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
    // eslint-disable-next-line no-use-before-define
    if (!isEqual(item1, item2)) {
      return false;
    }
  } else { // Otherwise, do a simple comparison
    // If the two items are not the same type, return false
    if (itemType !== Object.prototype.toString.call(item2)) {
      return false;
    }
    // Else if it's a function, convert to a string and compare
    // Otherwise, just compare
    if (itemType === '[object Function]') {
      if (item1.toString() !== item2.toString()) {
        return false;
      }
    } else if (item1 !== item2) {
      return false;
    }
  }
  return true;
};

export const isEqual = (value: any, other: any): boolean => {
  // Get the value type
  if (value === other) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) {
    return false;
  }
  // If items are not an object or array, return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) {
    return false;
  }
  // Compare the length of the length of the two items
  const valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
  const otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) {
    return false;
  }

  // Compare properties
  if (type === '[object Array]') {
    for (let i = 0; i < valueLen; i++) {
      // noinspection PointlessBooleanExpressionJS
      if (compare(value[i], other[i]) === false) {
        return false;
      }
    }
  } else {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in value) {
      // eslint-disable-next-line no-prototype-builtins
      if (value.hasOwnProperty(key)) {
        // noinspection PointlessBooleanExpressionJS
        if (compare(value[key], other[key]) === false) {
          return false;
        }
      }
    }
  }
  // If nothing failed, return true
  return true;
};

export const baseGet = (object: any, path: string | string[]): any | undefined => {
  const p: string[] = Array.isArray(path) ? path : String(path).split('.');
  let index = 0;
  const { length } = p;
  while (object != null && index < length) {
    object = object[`${p[index++]}`];
  }
  return (index && index === length) ? object : undefined;
};

export const get = (object: any, path: string | string[], defaultValue: any): any | undefined => {
  if (typeof path === 'string') {
    path = path.trim();
    if (!path) {
      return object;
    }
  } else if (Array.isArray(path) && !path.length) {
    return object;
  }
  const result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
};

export const isObjectCircular = (obj: any): boolean => {
  try {
    JSON.stringify(obj);
  } catch (err: Error | any) {
    return (err.toString() === 'TypeError: Converting circular structure to JSON');
  }
  return false;
};

const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any): any => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export const stringifySafe = (obj: any): any => JSON.stringify(obj, getCircularReplacer());
export const sanitize = (obj: any): any => JSON.parse(JSON.stringify(obj, getCircularReplacer()));
