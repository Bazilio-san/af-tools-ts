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
