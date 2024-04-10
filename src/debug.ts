import { DateTime } from 'luxon';
import { c } from 'af-color';
import { echo } from 'af-echo-ts';

export const DEBUG = (String(process.env.DEBUG || '')).trim();
export const IS_TOTAL_DEBUG = DEBUG === '*';

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

export function Debug (debugPattern: string, options?: boolean | { noTime?: boolean, noPrefix?: boolean }) {
  let noTime = false;
  let noPrefix = false;
  if (typeof options === 'boolean') {
    noTime = options;
  } else {
    noTime = Boolean(options?.noTime);
    noPrefix = Boolean(options?.noPrefix);
  }

  function debug (msg: string) {
    if (debug.enabled) {
      const prefix = noPrefix ? '' : `${debugPattern}: `;
      echo(`${noTime ? '' : `${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')}: `}${prefix}${c}${msg}`);
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
