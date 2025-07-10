export const sleep = async (timeOut: number) => new Promise((resolve) => {
  const timer = setTimeout(() => {
    clearTimeout(timer);
    resolve(true);
  }, timeOut);
});

export const rn = (x: number, digits: number = 2) => {
  const p = 10 ** digits;
  return Math.round(Number(x) * p) / p;
};

export const rnpc = (x: number, digits: number = 2) => rn(x * 100, digits);

/**
 * Rounds a number to a specified number of significant digits
 * Uses string manipulation to avoid floating point precision errors
 * @param {number} num - The number to round
 * @param {number} digits - The number of significant digits to round to
 * @returns {number} The rounded number
 */
export const rnsd = (num: number, digits: number): number => {
  // Handle edge cases
  if (num === 0 || !Number.isFinite(num)) {
    return num;
  }

  if (digits <= 0) {
    throw new Error('Number of significant digits must be positive');
  }

  // Get the sign of the number
  const sign = Math.sign(num);
  const absNum = Math.abs(num);

  // Convert to string in exponential notation to work with significant digits
  const expStr = absNum.toExponential();
  const [mantissaStr, exponentStr] = expStr.split('e');
  const exponent = parseInt(exponentStr, 10);

  // Remove the decimal point from mantissa to get all digits
  const mantissaDigits = mantissaStr.replace('.', '');

  // Take only the required number of significant digits
  let significantDigits = mantissaDigits.substring(0, digits);

  // Check if we need to round up based on the next digit
  if (mantissaDigits.length > digits) {
    const nextDigit = parseInt(mantissaDigits[digits], 10);
    if (nextDigit >= 5) {
      // Round up: add 1 to the last significant digit
      const lastDigitIndex = digits - 1;
      const lastDigit = parseInt(significantDigits[lastDigitIndex], 10);

      if (lastDigit === 9) {
        // Handle carry-over case
        let carryIndex = lastDigitIndex;
        let carry = true;
        const newDigits = significantDigits.split('');

        while (carry && carryIndex >= 0) {
          if (newDigits[carryIndex] === '9') {
            newDigits[carryIndex] = '0';
            carryIndex--;
          } else {
            newDigits[carryIndex] = String(parseInt(newDigits[carryIndex], 10) + 1);
            carry = false;
          }
        }

        if (carry) {
          // We need to add a digit at the beginning and increase exponent
          significantDigits = `1${newDigits.join('')}`;
          // But we only want 'digits' significant digits, so trim the last one
          significantDigits = significantDigits.substring(0, digits);
          // Increase exponent because we essentially multiplied by 10
          const newExponent = exponent + 1;

          // Reconstruct the number
          const firstDigit = significantDigits[0];
          const restDigits = significantDigits.substring(1);

          let resultStr;
          if (restDigits.length === 0) {
            resultStr = `${firstDigit}e${newExponent}`;
          } else {
            resultStr = `${firstDigit}.${restDigits}e${newExponent}`;
          }

          return sign * parseFloat(resultStr);
        }
        significantDigits = newDigits.join('');
      } else {
        // Simple case: just increment the last digit
        significantDigits = significantDigits.substring(0, lastDigitIndex)
          + String(lastDigit + 1);
      }
    }
  }

  // Pad with zeros if we don't have enough digits
  while (significantDigits.length < digits) {
    significantDigits += '0';
  }

  // Reconstruct the number with the correct exponent
  const firstDigit = significantDigits[0];
  const restDigits = significantDigits.substring(1);

  let resultStr;
  if (restDigits.length === 0) {
    resultStr = `${firstDigit}e${exponent}`;
  } else {
    resultStr = `${firstDigit}.${restDigits}e${exponent}`;
  }

  const result = parseFloat(resultStr);
  return sign * result;
};

const mb = (bytes: number): string => `${rn(bytes / 1024 / 1024)} mb`;

export const memUsage = (): string => {
  const { heapUsed, rss } = process.memoryUsage();
  return `MEM: ${mb(heapUsed)} / ${mb(rss)}`;
};

export const getBool = (v: any, def = false): boolean => {
  if (v == null) {
    return def;
  }
  if (typeof v === 'string') {
    if (/^(false|0|no|нет)$/i.test(v)) {
      return false;
    }
    if (/^(true|1|yes|да)$/i.test(v)) {
      return true;
    }
    return def;
  }
  if (typeof v === 'boolean') {
    return v;
  }
  if (typeof v === 'number') {
    return !!v;
  }
  return !!v;
};

export const floatEnv = (name: string, def: number) => {
  let v = process.env[name];
  if (!v) {
    return def;
  }
  v = v.replace(/_/g, '');
  const val = parseFloat(v);
  return val || val === 0 ? val : def;
};

export const intEnv = (name: string, def: number) => Math.ceil(floatEnv(name, def));

export const strEnv = (name: string, def: string) => process.env[name] || def;

export const boolEnv = (name: string, def = false) => getBool(process.env[name], def);

export const repeat = <T = any>(what: T, count: number): T[] => [...Array(count).keys()].map(() => what);

export const throttle = (func: Function, limit: number): Function => {
  let timer: any;
  let lastRan: number = 0;
  return function t (...args: any[]) {
    // @ts-ignore
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};
