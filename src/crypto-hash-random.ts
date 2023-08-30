import * as os from 'os';
import * as crypto from 'crypto';
import { BinaryLike, Encoding } from 'crypto';

let instanceKey: string;

export const getInstanceKey = () => {
  if (!instanceKey) {
    const data = `${os.hostname()}${__dirname}${process.env.NODE_CONFIG_ENV || process.env.NODE_ENV}`;
    instanceKey = crypto.createHash('md5').update(data).digest('hex');
  }
  return instanceKey;
};

export const hash = (data: string | BinaryLike, options?: { asTsqlUID?: boolean, inputEncoding?: Encoding }): string => {
  const x = options?.inputEncoding
    ? crypto.createHash('md5').update(data as string, options?.inputEncoding).digest('hex')
    : crypto.createHash('md5').update(data as BinaryLike).digest('hex');

  if (!options?.asTsqlUID) {
    return x;
  }
  return `${x.substring(6, 8)
  + x.substring(4, 6)
  + x.substring(2, 4)
  + x.substring(0, 2)
  }-${x.substring(10, 12)
  }${x.substring(8, 10)
  }-${x.substring(14, 16)
  }${x.substring(12, 14)
  }-${x.substring(16, 20)
  }-${x.substring(20, 32)}`.toUpperCase();
};

export const simpleRandomHash = (): string => hash(String(Date.now() + Math.random()));
export const simpleRandomUid = (): string => hash(String(Date.now() + Math.random()), { asTsqlUID: true });
