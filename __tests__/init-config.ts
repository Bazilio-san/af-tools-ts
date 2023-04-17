import './dotenv';
import * as configModule from 'config';
import { AccessPoints } from 'af-consul';
import { IAccessPoints } from 'af-consul/dist/types/interfaces';

export const config: any = configModule.util.toObject();

const accessPoints = { ...config.accessPoints };
config.accessPoints = new AccessPoints(config.accessPoints as IAccessPoints);
Object.entries(accessPoints).forEach(([accessPointKey, value]) => {
  const aps = config.accessPoints as any;
  if (!aps[accessPointKey]) {
    aps[accessPointKey] = value;
  }
});

const writableKeys = ['accessPoints'];
Object.keys(config).forEach((key) => {
  if (!writableKeys.includes(key) && typeof config[key] === 'object') {
    configModule.util.makeImmutable(config[key]);
  }
});
