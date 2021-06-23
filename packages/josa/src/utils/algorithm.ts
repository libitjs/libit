import {HashCtor} from '@libit/crypto';
import {AnyAsym} from '../types';

function getAlgId(alg: AnyAsym | HashCtor | string) {
  return typeof alg === 'string' ? alg : alg.id;
}

export function encodeAlgorithm(asym: AnyAsym | string, hash: HashCtor | string) {
  return `${getAlgId(asym)}-${getAlgId(hash)}`;
}

export function decodeAlgorithm(algorithm: string): [string, string] {
  const [asym, hash] = algorithm.split('-');
  if (!asym || !asym) {
    throw new Error(`algorithm ("${algorithm}") is not valid, should be like: ED25519-SHA512`);
  }
  return [asym, hash];
}
