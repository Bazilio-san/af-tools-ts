import fs from 'fs';
import path from 'path';

let config: any;

try {
  const hasConfig = process.env.NODE_CONFIG_DIR || fs.existsSync(path.normalize(path.join(process.cwd(), 'config')));
  if (hasConfig) {
    config = require('config');
  }
} catch (err) {
  //
}

export const getConfig = (): any => config;
