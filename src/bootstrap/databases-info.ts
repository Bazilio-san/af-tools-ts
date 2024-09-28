import { magenta, rs, cyan, lBlue, underline, underlineOff, yellow } from 'af-color';
import { TInfoLine } from '../interfaces';

const getDbs = (dbs: any, filter?: string[]): TInfoLine<string>[] => {
  if (!dbs || !Object.keys(dbs).length) {
    return [];
  }
  const result: ([string, string] | string)[] = [];
  Object.entries(dbs)
    .filter(([dbId]) => !filter || filter.includes(dbId))
    .forEach(([dbId, dbConfig]) => {
      const { server, host, port, database, user, label } = dbConfig as any;
      if ((!server && !host) || !database || !user) {
        return;
      }
      const lb = `${magenta}[${rs}`;
      const rb = `${magenta}]${rs}`;
      const login = `${cyan}${user}${rs}`;
      const hostPort = `${lb}${magenta}${server || host}:${port}${rb}`;
      const dbName = `${lb}${lBlue}${underline}${database}${underlineOff}${rb}`;
      const dbLabel = label ? `${yellow}${label}${rs}\t` : '';
      const descr = `${dbLabel}${login}@${hostPort}.${dbName}`;
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
