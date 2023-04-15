import { Debug } from './debug';

const debug = Debug('THROTTLE-EX');

export interface IThrottleExOptions {
  // ссылка на функцию, которую нужно дросселировать
  functionToThrottle: Function,
  // интервал дросселирования
  intervalMills: number,
  // Функция идентификации вызовов - используется для группировки: дросселируются вызовы с одинаковым id
  // Если не указана, все вызовы имеют одинаковый id.
  // Она получает массив аргументов вызванной функции.
  fnId?: Function | undefined,
  // Функция расчета хеша данных. Если предыдущий вызов был с таким же хешем, текущий вызов подавляется.
  // Она получает массив аргументов вызванной функции.
  fnHash?: Function | undefined,
  // Если функция указана и вернет true, внутренний вызов пропускается.
  // Она получает массив аргументов вызванной функции
  fnSkip?: Function | undefined,

  onThrottle?: Function | undefined,
}

/**
 * Дросселирование вызовов функции. Внешний вызов происходит при первом внутреннем вызове. Время вызова - опорное.
 * Если за период intervalMills происходят еще вызовы, они подавляются. Данные последнего поступившего внутреннего вызова запоминаются.
 * По истечении intervalMills, если хеш данных последнего подавленного вызова не равен хешу данных последнего внешнего вызова,
 * происходит внешний вызов, и его время становится опорным. И.т.д.
 */
export function throttleEx ({ functionToThrottle, intervalMills, fnId, fnHash, fnSkip, onThrottle }: IThrottleExOptions) {
  let sendTimer: any = null;
  const throttleMap = new Map();

  function getId (...args: any[]) {
    return fnId && typeof fnId === 'function' ? fnId(...args) : '1';
  }

  function getHash (...args: any[]) {
    if (typeof fnHash !== 'function') {
      return Math.random();
    }
    return fnHash(...args);
  }

  function isSkipCall (...args: any[]) {
    return fnSkip && typeof fnSkip === 'function' ? fnSkip(...args) : false;
  }

  function fnOnThrottle (...args: any[]) {
    if (typeof onThrottle === 'function') {
      onThrottle(...args);
    }
  }

  function scheduleCheck () {
    sendTimer = setTimeout(() => {
      clearTimeout(sendTimer);
      sendTimer = null;
      const now = +(new Date());
      throttleMap.forEach((data, id) => {
        const { nextSendAfter, args, lastCallHash, alreadyCalled } = data;
        const dataHash = getHash(args);
        const canCall = !alreadyCalled && lastCallHash !== dataHash;
        if (now > nextSendAfter && canCall) {
          data.nextSendAfter = now + intervalMills;
          data.lastCallHash = dataHash;
          data.alreadyCalled = true;
          debug(`RUN [NEXT] id: ${id} | dataHash: ${dataHash}`);
          functionToThrottle(...args);
        } else if (now > nextSendAfter + intervalMills) {
          debug(`DELETE ${id} ===>> ${lastCallHash}`);
          throttleMap.delete(id);
          if (canCall) {
            debug(`RUN [LAST] id: ${id} | dataHash: ${dataHash}`);
            functionToThrottle(...args);
          }
        }
      });
      if (throttleMap.size && !sendTimer) {
        debug(`SCHEDULE CHECK NEXT`);
        scheduleCheck();
      }
    }, intervalMills);
  }

  function throttledFunction (...args: any[]) {
    debug(`CALL`);
    if (isSkipCall(args)) {
      debug(`SKIP id: ${getId(args)} | dataHash: ${getHash(args)}`);
      return;
    }
    if (!sendTimer) {
      debug(`SCHEDULE CHECK 1st`);
      scheduleCheck();
    }
    const id = getId(...args);
    const prevData = throttleMap.get(id);
    if (prevData) {
      fnOnThrottle(prevData.args, args);
      prevData.args = args;
      prevData.alreadyCalled = false;
      return;
    }
    const now = +(new Date());
    const lastCallHash = getHash(...args);
    throttleMap.set(id, {
      args,
      nextSendAfter: now + intervalMills,
      lastCallHash,
      alreadyCalled: true,
    });
    debug(`SEND [FIRST] id: ${id} | dataHash: ${lastCallHash}`);
    return functionToThrottle(...args);
  }

  return throttledFunction;
}
