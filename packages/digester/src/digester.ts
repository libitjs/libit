import {Buffer} from 'buffer';
import {HashCtor} from '@libit/crypto';
import {base64} from '@libit/crypto/encoding/base64';
import {SHA512} from '@libit/crypto/sha512';

export class Digester {
  hashes: HashCtor[];

  constructor(hash: HashCtor | HashCtor[] = SHA512) {
    this.hashes = Array.isArray(hash) ? hash : [hash];
  }

  findHash(name?: string): HashCtor | undefined {
    if (!name) {
      return this.hashes[0];
    } else {
      return this.hashes.find(h => h.id.toLowerCase() === name.toLowerCase());
    }
  }

  hash(name?: string): HashCtor {
    const hash = this.findHash(name);
    if (!hash) {
      throw new Error(`Hash ${name} is not supported`);
    }
    return hash;
  }

  digest(target?: any, algorithm?: string | HashCtor) {
    const hash = typeof algorithm === 'function' ? algorithm : this.hash(algorithm);
    const data = this._digest(target ?? '', hash);
    return encodeDigest(hash.id, data);
  }

  verify(target: any, digestWithAlg: string) {
    const [algorithm, digest] = decodeDigest(digestWithAlg);
    const hash = typeof algorithm === 'function' ? algorithm : this.hash(algorithm);
    const data = this._digest(target, hash);
    return Buffer.compare(digest, data) === 0;
  }

  protected _digest(target: any, hash: HashCtor) {
    const s = JSON.stringify(target ?? '');
    return hash.digest(Buffer.from(s));
  }
}

function encodeDigest(algorithm: string, digest: Buffer) {
  return algorithm + '=' + base64.encodeURL(digest);
}

function decodeDigest(digestWithAlg: string): [string, Buffer] {
  const i = digestWithAlg.indexOf('=');
  const algorithm = digestWithAlg.substr(0, i);
  const digest = base64.decodeURL(digestWithAlg.substr(i + 1));
  return [algorithm, digest];
}
