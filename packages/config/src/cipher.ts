import flatten from 'tily/array/flatten';
import {bcrypt} from '@libit/crypto/bcrypt';
import {random} from '@libit/crypto/random';
import {cipher} from '@libit/crypto/cipher';

export interface CipherFamily {
  name: string;
  ivLen: number;
  keyLen: number;
  ids: string[];
}

export interface CipherAlgorithm {
  id: string;
  family: string;
  ivLen: number;
  keyLen: number;
}

export const CipherFamilies: CipherFamily[] = [
  {
    name: 'AES-128',
    keyLen: 16,
    ivLen: 16,
    ids: ['AES-128-ECB', 'AES-128-CBC', 'AES-128-CTR', 'AES-128-CFB', 'AES-128-OFB'],
  },
  {
    name: 'AES-192',
    keyLen: 24,
    ivLen: 16,
    ids: ['AES-192-ECB', 'AES-192-CBC', 'AES-192-CTR', 'AES-192-CFB', 'AES-192-OFB'],
  },
  {
    name: 'AES-256',
    keyLen: 32,
    ivLen: 16,
    ids: ['AES-256-ECB', 'AES-256-CBC', 'AES-256-CTR', 'AES-256-CFB', 'AES-256-OFB'],
  },
  {
    name: 'ARC2',
    keyLen: 8,
    ivLen: 8,
    ids: ['ARC2-64-CBC'],
  },
  {
    name: 'Blowfish',
    keyLen: 32,
    ivLen: 8,
    ids: ['BF-ECB', 'BF-CBC', 'BF-CFB', 'BF-OFB'],
  },
  {
    name: 'CAMELLIA-128',
    keyLen: 16,
    ivLen: 16,
    ids: ['CAMELLIA-128-ECB', 'CAMELLIA-128-CBC', 'CAMELLIA-128-CTR', 'CAMELLIA-128-CFB', 'CAMELLIA-128-OFB'],
  },
  {
    name: 'CAMELLIA-192',
    keyLen: 24,
    ivLen: 16,
    ids: ['CAMELLIA-192-ECB', 'CAMELLIA-192-CBC', 'CAMELLIA-192-CTR', 'CAMELLIA-192-CFB', 'CAMELLIA-192-OFB'],
  },
  {
    name: 'CAMELLIA-256',
    keyLen: 32,
    ivLen: 16,
    ids: ['CAMELLIA-256-ECB', 'CAMELLIA-256-CBC', 'CAMELLIA-256-CTR', 'CAMELLIA-256-CFB', 'CAMELLIA-256-OFB'],
  },
  {
    name: 'CAST5',
    keyLen: 16,
    ivLen: 8,
    ids: ['CAST5-ECB', 'CAST5-CBC', 'CAST5-CFB', 'CAST5-OFB'],
  },
  {
    name: 'DES',
    keyLen: 8,
    ivLen: 8,
    ids: ['DES-ECB', 'DES-CBC', 'DES-CFB', 'DES-OFB'],
  },
  {
    name: 'IDEA',
    keyLen: 16,
    ivLen: 8,
    ids: ['IDEA-ECB', 'IDEA-CBC', 'IDEA-CFB', 'IDEA-OFB'],
  },
  {
    name: 'Triple-DES (EDE)',
    keyLen: 16,
    ivLen: 8,
    ids: ['DES-EDE-ECB', 'DES-EDE-CBC', 'DES-EDE-CFB', 'DES-EDE-OFB'],
  },
  {
    name: 'Triple-DES (EDE3)',
    keyLen: 24,
    ivLen: 8,
    ids: ['DES-EDE3-ECB', 'DES-EDE3-CBC', 'DES-EDE3-CFB', 'DES-EDE3-OFB'],
  },
];

export const CipherAlgorithms: CipherAlgorithm[] = flatten(
  CipherFamilies.map(family =>
    family.ids.map(id => ({
      id,
      family,
      ivLen: family.ivLen,
      keyLen: family.keyLen,
    })),
  ),
);

export function findCipherAlgorithm(id: string) {
  id = id.toUpperCase();
  return CipherAlgorithms.find(alg => alg.id === id);
}

export function getCipherAlgorithm(id: string) {
  const alg = findCipherAlgorithm(id);
  if (!alg) {
    throw new Error(`Cipher algorithm "${id}" is not supported`);
  }
  return alg;
}

export function genIV(algorithm: CipherAlgorithm) {
  return random.randomBytes(algorithm.ivLen);
}

export function encrypt(algorithm: CipherAlgorithm, secret: string | Buffer, iv: Buffer, plaintext: string | Buffer) {
  const key = bcrypt.pbkdf(secret, iv, 8, algorithm.keyLen);
  const input = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext);
  return cipher.encrypt(algorithm.id, key, algorithm.id.endsWith('ECB') ? Buffer.alloc(0) : iv, input);
}

export function decrypt(algorithm: CipherAlgorithm, secret: string | Buffer, iv: Buffer, ciphertext: Buffer) {
  const key = bcrypt.pbkdf(secret, iv, 8, algorithm.keyLen);
  const input = Buffer.isBuffer(ciphertext) ? ciphertext : Buffer.from(ciphertext);
  return cipher.decrypt(algorithm.id, key, algorithm.id.endsWith('ECB') ? Buffer.alloc(0) : iv, input);
}
