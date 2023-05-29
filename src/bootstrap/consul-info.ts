import { echo } from 'af-echo-ts';
import { blue, lBlue } from 'af-color';
import { infoBlock } from './info-block';

export const consulInfo = (cfg: any) => {
  const aps = cfg.accessPoints;
  if (!aps?.get) {
    return;
  }
  infoBlock({
    echo,
    title: 'CONSUL ACCESS POINTS',
    info: Object.values(aps.get()).map((v: any) => [v.title, v.consulServiceName]),
  });

  const fixedAP = Object.values(aps).filter((v: any) => v.noConsul);
  if (fixedAP.length) {
    infoBlock({
      echo,
      title: 'FIXED ACCESS POINTS',
      info: fixedAP.map((v: any) => [v.title, `${v.host}${blue}:${lBlue}${v.port}`]),
    });
  }
};
