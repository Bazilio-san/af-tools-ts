import { DateTime } from 'luxon';
import {
  black, c, green, yellow, blue, magenta,
  cyan, lGreen, lYellow, lBlue, lMagenta, lCyan, boldOff, reset
} from 'af-color';
import { echo } from 'af-echo-ts';

export const DEBUG = (String(process.env.DEBUG || '')).trim();
export const IS_TOTAL_DEBUG = DEBUG === '*';

export interface IDebugOptions {
  noTime?: boolean,
  noPrefix?: boolean,
  prefixColor?: string | 'random',
  messageColor?: string,
}

export const dbg = (str: string) => {
  echo(`${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')} ${c}${str}`);
};

const getDbgRe = (debugPattern: string) => new RegExp(`\\b${debugPattern}\\b`, 'i');

export function DebugExact (debugPattern: string) {
  function debug (msg: string) {
    if (debug.enabled) {
      echo(`${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')} ${c}${msg}`);
    }
  }

  debug.enabled = getDbgRe(debugPattern).test(DEBUG);
  return debug;
}

export function Debug (debugPattern: string, options?: boolean | IDebugOptions) {
  let noTime = false;
  let noPrefix = false;
  let prefixColor = black;
  let messageColor = cyan;
  if (typeof options === 'boolean') {
    noTime = options;
  } else {
    noTime = Boolean(options?.noTime);
    noPrefix = Boolean(options?.noPrefix);
    prefixColor = options?.prefixColor || black;
    messageColor = options?.messageColor || cyan;
  }

  if (prefixColor === 'random') {
    prefixColor = [green, yellow, blue, magenta, cyan, lGreen, lYellow, lBlue, lMagenta, lCyan][Math.floor(Math.random() * 10)] || cyan;
  }

  function debug (msg: string) {
    if (debug.enabled) {
      const prefix = noPrefix ? '' : `${prefixColor}${debugPattern}${boldOff}${reset}: `;
      echo(`${noTime ? '' : `${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')}: `}${prefix}${messageColor}${msg}`);
    }
  }

  debug.enabled = IS_TOTAL_DEBUG || (getDbgRe(debugPattern)).test(DEBUG);
  return debug;
}

export const getProjectDebug = (projectDebugPattern: string) => {
  const isTotalProjectDebug = IS_TOTAL_DEBUG || (getDbgRe(projectDebugPattern)).test(DEBUG);

  return function PDebug (debugPattern: string, noTime?: boolean) {
    function debug (msg: string) {
      if (debug.enabled) {
        if (noTime) {
          echo(c + msg);
        } else {
          echo(`${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')} ${c}${msg}`);
        }
      }
    }

    debug.enabled = isTotalProjectDebug || (getDbgRe(debugPattern)).test(DEBUG);
    return debug;
  };
};
