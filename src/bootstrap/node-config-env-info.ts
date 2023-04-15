import { magenta, rs, green, bg } from 'af-color';

export const nodeConfigEnvInfo = (arg?: {lineLen?: number, padding?: number}) => {
  const { lineLen = 64, padding = 24 } = arg || {};
  const label = 'NODE_CONFIG_ENV:';
  const v = process.env.NODE_CONFIG_ENV;
  return v
    ? `\n${bg.cyan}${green}${label}${' '.repeat(padding - label.length)}${
      magenta}${v}${' '.repeat(lineLen - padding - v.length)}${rs}`
    : '';
};
