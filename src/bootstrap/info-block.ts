import { rs, green, magenta } from 'af-color';
import { TInfoLine } from '../interfaces';

export const infoBlock = (
  options: {
    title?: string,
    info: TInfoLine[] | string,
    width?: number,
    padding?: number,
    titleColor?: string,
    labelColor?: string,
    valueColor?: string,
    echo?: Function,
  },
) => {
  const { info, width = 64, titleColor = green, labelColor = green, valueColor = magenta, echo } = options;
  let { title = '', padding = 24 } = options;
  title = title.trim() ? ` ${title.trim()} ` : '';
  // eslint-disable-next-line no-control-regex
  const noEsc = (v: string): string => v.replace(/\x1b\[(\d+;)?\d+m/g, '');
  const eq = '='.repeat(Math.max(1, Math.ceil((width - noEsc(title).length) / 2)));
  let text: string;
  if (Array.isArray(info)) {
    const maxLenOfLabels = Math.max(...info.filter((v) => Array.isArray(v)).map(([label = '']) => noEsc(label).length));
    padding = padding === 0 ? maxLenOfLabels + 3 : Math.max(maxLenOfLabels + 3, padding);

    const pad = (v: any) => String(v) + ' '.repeat(padding - String(v).length);

    text = info.map((v) => {
      if (Array.isArray(v)) {
        const [label, value] = v;
        return `${labelColor}${pad(`${label || ''}:`)}${valueColor}${value || ''}${rs}`;
      }
      if (v) {
        return valueColor + v;
      }
      return undefined;
    }).filter(Boolean).join('\n');
  } else {
    text = valueColor + info;
  }
  text = `${titleColor}${eq}${title}${eq}${rs}\n${text}`;

  if (echo) {
    echo(text);
  }
  return text;
};
