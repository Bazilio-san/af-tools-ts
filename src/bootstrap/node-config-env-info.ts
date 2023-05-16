import { magenta, rs, bg, black } from 'af-color';

export const nodeConfigEnvInfo = (arg?: { lineLen?: number, padding?: number }) => {
  const { lineLen = 64, padding = 24 } = arg || {};
  const label = 'NODE_CONFIG_ENV:';
  const v = process.env.NODE_CONFIG_ENV;
  return v
    ? `${bg.cyan}${black}${label}${magenta}${' '.repeat(padding - label.length)}${v}${' '.repeat(lineLen - padding - v.length)}${rs}`
    : '';
};
