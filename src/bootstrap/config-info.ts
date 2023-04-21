/*
Вывод стартовой диагностики в консоль
*/
import { echo } from 'af-echo-ts';
import { lBlue, cyan, yellow } from 'af-color';
import { IConfigSource } from 'config';
import { Debug } from '../debug';
import { infoBlock } from './info-block';

const YAML = require('json-to-pretty-yaml');

let config: any;
try {
  // @ts-ignore
  config = require('config');
} catch (err) {
  //
}

export const configInfo = (arg: { cfg: any, debugId?: string, dotEnvResult?: any }) => {
  const { cfg, debugId, dotEnvResult } = arg;
  if (!Debug(debugId || 'config-info').enabled || !config) {
    return;
  }
  const configSrc: IConfigSource[] = config.util.getConfigSources();
  const customEnvSrc = configSrc.find((o) => o.name.includes('custom-environment-variables'))?.original || '';
  const envsUsed: any = {};
  [...customEnvSrc.matchAll(/^ *[^\s:]+: ([A-Z_\d]+)/img)].map((arr) => arr[1]).forEach((name) => {
    if (process.env[name] !== undefined) {
      envsUsed[name] = process.env[name];
    }
  });
  if (dotEnvResult) {
    if (!dotEnvResult.error && dotEnvResult.parsed) {
      Object.entries(dotEnvResult.parsed).forEach(([k, v]) => {
        envsUsed[k] = v;
      });
    }
  }
  const [, configDir = ''] = /^(.+?)([^\\/]+)$/.exec(configSrc[0].name) || [];

  infoBlock({
    echo,
    title: 'СONFIG SOURCES',
    padding: 0,
    valueColor: lBlue,
    info: [
      ['CONFIG DIR', configDir],
      ...configSrc.map((v) => v.name.replace(configDir, '')),
    ],
  });
  infoBlock({ echo, title: 'ACTUAL SOURCES', info: YAML.stringify(cfg).trim(), valueColor: cyan });
  infoBlock({ echo, title: 'Using .env', info: YAML.stringify(envsUsed).trim(), titleColor: yellow, valueColor: yellow });
};
