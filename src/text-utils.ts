export const removeHTML = (s: string) => String(s).replace(/<\/?[^>]+>/ig, '');
