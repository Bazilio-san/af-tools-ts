import { magenta, rs, cyan, lBlue, underline, underlineOff } from 'af-color';

export const databasesInfo = (cfg: any): ([string, string] | string)[] => {
  const { database } = cfg;
  const result: ([string, string] | string)[] = [];
  if (!database) {
    return result;
  }
  Object.entries(database).forEach(([dbId, dbConfig]) => {
    const { server: s, host: h, port: p, database: d, user: u } = dbConfig as any;
    if ((!s && !h) || !d || !u) {
      return;
    }
    const descr = `${cyan}${u}${rs}@${magenta}[${s || h}:${p}].[${lBlue}${underline}${d}${underlineOff}${magenta}]`;
    result.push([`  ${underline}${dbId}${underlineOff}`, descr]);
  });
  if (result.length) {
    result.unshift('Databases');
  }
  return result;
};
