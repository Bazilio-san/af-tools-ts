import { flattenObjectPrimitiveLeafs } from "./object-utils";

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

