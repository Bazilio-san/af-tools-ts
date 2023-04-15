import { DateTime } from 'luxon';
import { c } from 'af-color';
import { echo } from 'af-echo-ts';

export const DEBUG = (String(process.env.DEBUG || '')).trim();
export const IS_TOTAL_DEBUG = DEBUG === '*';

export const dbg = (str: string) => {
  echo(`${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')} ${c}${str}`);
};

const getDbgRe = (debugPattern: string) => new RegExp(`\\b${debugPattern}\\b`, 'i');

export function Debug (debugPattern: string) {
  function debug (msg: string) {
    if (debug.enabled) {
      echo(`${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')} ${c}${msg}`);
    }
  }
  debug.enabled = IS_TOTAL_DEBUG || (getDbgRe(debugPattern)).test(DEBUG);
  return debug;
}

export const getProjectDebug = (projectDebugPattern: string) => {
  const isTotalProjectDebug = IS_TOTAL_DEBUG || (getDbgRe(projectDebugPattern)).test(DEBUG);

  return function PDebug (debugPattern: string) {
    function debug (msg: string) {
      if (debug.enabled) {
        echo(`${DateTime.now().setZone('UTC').toFormat('HH:mm:ss')} ${c}${msg}`);
      }
    }
    debug.enabled = isTotalProjectDebug || (getDbgRe(debugPattern)).test(DEBUG);
    return debug;
  };
};
