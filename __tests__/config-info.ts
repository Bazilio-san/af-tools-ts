import * as config from 'config';
import { yellow } from 'af-color';
import { echo } from 'af-echo-ts';
import { configInfo, consulInfo, infoBlock, nodeConfigEnvInfo } from '../src';
import dotEnvResult from './dotenv';

const startupInfo = () => {
  const cfg: any = config as any;
  configInfo({ dotEnvResult, cfg, debugId: 'test-config-info' });

  const info = infoBlock({
    info: [
      `${yellow}${cfg.description} (v ${cfg.version})`,
      nodeConfigEnvInfo(),
      ['Logging level', cfg.logger.level],
      ['DEBUG', (process.env.DEBUG || '')],
    ],
  });
  echo.info(`\n${info}`);

  consulInfo(cfg);
};

startupInfo();
