/* eslint-disable no-console */
import { hash, simpleRandomHash, simpleRandomUid } from '../src';
import { hashCode } from '../src/crypto-hash-random';

console.log(hash('ad ADLk fda;ldkj aDSLakd ;ALKDJ A;sdklj AD'));

console.log('simpleRandomHash');

console.log(simpleRandomHash());
console.log(simpleRandomHash());
console.log(simpleRandomHash());

console.log('simpleRandomUid');
console.log(simpleRandomUid());
console.log(simpleRandomUid());
console.log(simpleRandomUid());
console.log(simpleRandomUid());

console.log(hashCode('asdadasdasdsa asd sd D SAD ASd ASD asd asd ad asd aD ADS ASD ASD ASD asd'));
