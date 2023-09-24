import { flattenObjectPrimitiveLeafs } from './object-utils';

export const removeHTML = (s: string) => String(s).replace(/<\/?[^>]+>/ig, '');
/**
 * Replacing {place_name} substitution places with the values of properties of the same name from obj
 */
export const fillBracketTemplate = (template: string, obj: any): string => {
  const flattened = flattenObjectPrimitiveLeafs(obj);
  template = template.replace(/{([\w]+)}/g, (place: any, placeName: any) => {
    const val = flattened[String(placeName)];
    return val === undefined ? place : val;
  });
  return template;
};

export const center = (title: string, width: number): string => {
  const spaces = width - title.length;
  const leftSpaces = Math.floor(spaces / 2);
  const rightSpaces = spaces - leftSpaces;
  return ' '.repeat(leftSpaces) + title + ' '.repeat(rightSpaces);
};

export const padR = (str: any, strLength: number, padSymbol: string = ' ') => {
  str = String(str || '');
  if (str.length < strLength) {
    str += padSymbol.repeat(Math.min(Math.max(0, strLength - str.length), 10000));
  }
  return str;
};

export const padL = (str: any, strLength: number, padSymbol: string = ' ') => {
  str = String(str == null ? '' : str);
  if (str.length < strLength) {
    str = padSymbol.repeat(Math.min(Math.max(0, strLength - str.length), 10000)) + str;
  }
  return str;
};

// eslint-disable-next-line no-control-regex
export const removeAnsiColors = (str: string) => str.replace(/\x1b\[(\d+;)?\d+m/g, '');

// eslint-disable-next-line no-control-regex
export const clearESC = (str: string) => str.replace(/\x1b\[[\d;]+m/ig, '');
