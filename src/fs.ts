import * as fs from 'fs';
import * as fsPath from 'path';

export interface IFileInfo {
  name: string,
  dir: string,
  path: string,
  size: number,
  created: number
}

export const normalizePath = (path: string) => fsPath.normalize(fsPath.resolve(path)).replace(/\\/g, '/');

export const getFiles = (dir: string, filter?: (fi: IFileInfo) => boolean): IFileInfo[] => {
  dir = fs.realpathSync(dir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return [];
  }
  const files: IFileInfo[] = [];
  fs.readdirSync(dir).forEach((name) => {
    const path = normalizePath(`${dir}/${name}`);
    const syncObj = fs.statSync(path);
    if (!syncObj.isDirectory()) {
      const fi = { name, dir: normalizePath(dir), path, size: syncObj.size, created: syncObj.ctimeMs };
      if (!filter || filter(fi)) {
        files.push(fi);
      }
    }
  });
  return files;
};

export const getFilesR = (dir: string, files?: IFileInfo[], filter?: (fi: IFileInfo) => boolean) => {
  dir = fs.realpathSync(dir);

  const files_ = files || [];
  fs.readdirSync(dir).forEach((name) => {
    const path = normalizePath(`${dir}/${name}`);
    const syncObj = fs.statSync(path);

    if (syncObj.isDirectory()) {
      getFilesR(path, files_);
    } else {
      const fi = { name, dir: normalizePath(dir), path, size: syncObj.size, created: syncObj.ctimeMs };
      if (!filter || filter(fi)) {
        files_.push(fi);
      }
    }
  });
  return files_;
};
