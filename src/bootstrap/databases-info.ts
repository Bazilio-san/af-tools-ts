import { magenta, rs, cyan, lBlue, underline, underlineOff } from 'af-color';
import { TInfoLine } from '../interfaces';

const getDbs = (dbs: any, filter?: string[]): TInfoLine<string>[] => {
  if (!dbs || !Object.keys(dbs).length) {
    return [];
  }
  const result: ([string, string] | string)[] = [];
  Object.entries(dbs)
    .filter(([dbId]) => !filter || filter.includes(dbId))
    .forEach(([dbId, dbConfig]) => {
      const { server: s, host: h, port: p, database: d, user: u } = dbConfig as any;
      if ((!s && !h) || !d || !u) {
        return;
      }
      const descr = `${cyan}${u}${rs}@${magenta}[${s || h}:${p}].[${lBlue}${underline}${d}${underlineOff}${magenta}]`;
      result.push([`  ${underline}${dbId}${underlineOff}`, descr]);
    });
  return result;
};

export const databasesInfo = (cfg: any, filter?: string[]): TInfoLine<string>[] => {
  let result: TInfoLine<string>[] = [];
  const { database, db } = cfg;

  if (database) {
    result = getDbs(database, filter);
  } else if (db) {
    result = getDbs(db?.mssql?.dbs, filter);
    result.push(...getDbs(db?.postgres?.dbs, filter));
  }
  if (result.length) {
    result.unshift('Databases');
  }
  return result;
};
