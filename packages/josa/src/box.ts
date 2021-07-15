import {Buffer} from 'buffer';
import {HashCtor} from '@libit/crypto';
import {AnyAsym, isKeyPair, KeyPair, PrivateKey, PublicKey} from './types';
import {decodeAlgorithm, encodeAlgorithm} from './utils';

export class Box {
  asyms: AnyAsym[];
  hashes: HashCtor[];

  static isBox(obj: any): obj is Box {
    return (
      obj &&
      typeof obj.createKeyPair === 'function' &&
      typeof obj.sign === 'function' &&
      typeof obj.verify === 'function'
    );
  }

  constructor(asym: AnyAsym | AnyAsym[], hash: HashCtor | HashCtor[]) {
    this.asyms = Array.isArray(asym) ? asym : [asym];
    this.hashes = Array.isArray(hash) ? hash : [hash];
  }

  defaultAsym() {
    return this.asyms[0];
  }

  defaultHash() {
    return this.hashes[0];
  }

  findAsym(name?: string) {
    return name ? this.asyms.find(a => a.id.toLowerCase() === name.toLowerCase()) : this.asyms[0];
  }

  findHash(name?: string) {
    return name ? this.hashes.find(h => h.id.toLowerCase() === name.toLowerCase()) : this.hashes[0];
  }

  asym(name?: string): AnyAsym {
    const result = this.findAsym(name);
    if (!result) {
      throw new Error(name ? `'${name}' algorithm not provided` : `no algorithm provided`);
    }
    return result;
  }

  hash(name?: string): HashCtor {
    const result = this.findHash(name);
    if (!result) {
      throw new Error(name ? `'${name}' hash not provided` : `no hash provided`);
    }
    return result;
  }

  adsa(algorithm: string) {
    const [asym, hash] = decodeAlgorithm(algorithm);
    return this.asym(asym).adsa(this.hash(hash));
  }

  createKeyPair(algorithm?: string): KeyPair {
    let [asymId, hashId] = algorithm ? decodeAlgorithm(algorithm) : [this.defaultAsym().id, this.defaultHash().id];
    asymId = asymId ?? this.defaultAsym().id;
    hashId = hashId ?? this.defaultHash().id;

    const asym = this.asym(asymId);
    const privkey = asym.privateKeyGenerate();
    const pubkey = asym.publicKeyCreate(privkey);
    return {algorithm: encodeAlgorithm(asym.id, hashId), privkey, pubkey};
  }

  toKeyPair(key: Buffer, algorithm: string): KeyPair;
  toKeyPair(key: PrivateKey): KeyPair;
  toKeyPair(key: PrivateKey | Buffer, algorithm?: string): KeyPair {
    if (isKeyPair(key)) {
      return key;
    }
    if (Buffer.isBuffer(key)) {
      if (!algorithm) {
        throw new Error('key is raw format, algorithm must be provided');
      }
      key = {
        algorithm,
        privkey: key,
      };
    }
    [algorithm] = decodeAlgorithm(key.algorithm);
    return {
      ...key,
      pubkey: this.asym(algorithm).publicKeyCreate(key.privkey),
    };
  }

  sign(data: string | Buffer, key: KeyPair | PrivateKey): Buffer {
    return this.adsa(key.algorithm).sign(data, key.privkey);
  }

  verify(msg: string | Buffer, sig: Buffer, key: KeyPair | PublicKey): Boolean {
    return this.adsa(key.algorithm).verify(msg, sig, key.pubkey);
  }
}
