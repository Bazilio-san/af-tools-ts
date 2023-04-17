import { yellow } from 'af-color';
import { echo } from 'af-echo-ts';
import { config } from './init-config';
import { configInfo, consulInfo, databasesInfo, infoBlock, nodeConfigEnvInfo } from '../src';
import dotEnvResult from './dotenv';

export const cfg: any = config;

const startupInfo = () => {
  configInfo({ dotEnvResult, cfg, debugId: 'test-config-info' });
  infoBlock({
    echo,
    info: [
      `${yellow}${cfg.description} (v ${cfg.version})`,
      nodeConfigEnvInfo(),
      ['Logging level', cfg.logger.level],
      ['DEBUG', (process.env.DEBUG || '')],
      ...databasesInfo(cfg),
    ],
  });

  consulInfo(cfg);
};

startupInfo();
