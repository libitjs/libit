import {Buffer} from 'buffer';
import {HashCtor} from '@libit/crypto';
import {SHA512} from '@libit/crypto/sha512';
import isUndefined from 'tily/is/undefined';
import {ed25519} from '@libit/crypto/ed25519';
import {base64} from '@libit/crypto/encoding/base64';
import {
  AnyAsym,
  Header,
  HeaderSchema,
  Identity,
  isPacket,
  KeyPair,
  Ticket,
  Packet,
  Payload,
  SecretKey,
  Signature,
  SignOptions,
  SignOptionsSchema,
  VerifyOptions,
} from './types';
import {Box} from './box';
import {timespan, toString, validate} from './utils';
import {ExpiredError, NotBeforeError, SigningError} from './errors';

export interface SignerOptions {
  box: Box;
  asym: AnyAsym | AnyAsym[];
  hash: HashCtor | HashCtor[];
  digestAlgorithm?: HashCtor; // default is SHA512
  defaultExpiresIn?: number | string;
}

const DEFAULT_SIGNER_OPTIONS: Partial<SignerOptions> = {
  asym: [ed25519],
  hash: [SHA512],
  defaultExpiresIn: '30m', // 30 minutes
};

export class Signer {
  options: SignerOptions;
  box: Box;

  constructor(opts?: Partial<SignerOptions>) {
    const options = <SignerOptions>Object.assign({}, DEFAULT_SIGNER_OPTIONS, opts);
    this.options = options;
    this.box = Box.isBox(options.box) ? options.box : new Box(options.asym, options.hash);
  }

  createIdentity(algorithm?: string): Identity;
  createIdentity(secretKey: SecretKey): Identity;
  createIdentity(algorithmOrSecretKey?: string | SecretKey): Identity {
    const identity = <Identity>this.box.createKeyPair(algorithmOrSecretKey as any);
    identity.id = base64.encodeURL(identity.publicKey);
    return identity;
  }

  createIdentityFromSeed(seed: Buffer | string, algorithm?: string) {
    const identity = <Identity>this.box.createKeyPairFromSeed(seed, algorithm);
    identity.id = base64.encodeURL(identity.publicKey);
    return identity;
  }

  sign(target: Packet, key: SecretKey | SecretKey[]): Packet;
  sign(target: Payload, key: SecretKey | SecretKey[], options?: SignOptions): Packet;
  sign(target: Packet | Payload, key: SecretKey | SecretKey[], options: SignOptions = {}): Packet {
    const packet = this.buildPacket(target, options);
    const keys = Array.isArray(key) ? key : [key];
    const content = this.encode(packet.header, packet.payload);
    packet.signatures.push(...keys.map(k => this.createSignature(content, this.box.toKeyPair(k))));
    return packet;
  }

  verify(packet: Packet, options?: VerifyOptions): Ticket {
    options = Object.assign({}, options);

    if (options.clockTimestamp && typeof options.clockTimestamp !== 'number') {
      throw new SigningError('clockTimestamp must be a number');
    }

    if (!isUndefined(options.nonce) && (typeof options.nonce !== 'string' || options.nonce.trim() === '')) {
      throw new SigningError('nonce must be a non-empty string');
    }

    const clockTimestamp = options.clockTimestamp || Math.floor(Date.now() / 1000);

    const {header, payload, signatures} = packet;

    // validate signature algorithms
    for (const signature of signatures) {
      const [asym, hash] = signature.alg.split('-');
      if (!asym || !hash || !this.box.findAsym(asym) || !this.box.findHash(hash)) {
        throw new SigningError('signature has invalid algorithm');
      }
    }
    const valid = signatures
      .map(signature =>
        this.box.verify(this.encode(header, payload), base64.decodeURL(signature.sig), {
          algorithm: signature.alg,
          publicKey: base64.decodeURL(signature.idt),
        }),
      )
      .every(v => v);

    if (!valid) {
      throw new SigningError('signature verification failed');
    }

    if (typeof header.nbf !== 'undefined' && !options.ignoreNotBefore) {
      if (typeof header.nbf !== 'number') {
        throw new SigningError('invalid nbf value');
      }
      if (header.nbf > clockTimestamp + (options.clockTolerance || 0)) {
        throw new NotBeforeError('stk not active', new Date(header.nbf * 1000));
      }
    }

    if (typeof header.exp !== 'undefined' && !options.ignoreExpiration) {
      if (typeof header.exp !== 'number') {
        throw new SigningError('invalid exp value');
      }
      if (clockTimestamp >= header.exp + (options.clockTolerance || 0)) {
        throw new ExpiredError('stk expired', new Date(header.exp * 1000));
      }
    }

    if (options.nonce) {
      if (header.nonce !== options.nonce) {
        throw new SigningError('stk nonce invalid. expected: ' + options.nonce);
      }
    }

    const identities = signatures.map(s => s.idt);
    return {payload, identities};
  }

  protected buildPacket(target: any, options: SignOptions = {}): Packet {
    if (isPacket(target)) {
      return target;
    }

    const header: Header = Object.assign(
      {
        kid: options.keyid,
      },
      options.header,
    );

    validateHeader(header);

    if (!isUndefined(header.exp) && !isUndefined(options.expiresIn)) {
      throw new Error('Bad "options.expiresIn" option the header already has an "exp" property.');
    }

    if (!isUndefined(header.nbf) && !isUndefined(options.notBefore)) {
      throw new Error('Bad "options.notBefore" option the header already has an "nbf" property.');
    }

    validateSignOptions(options);

    const timestamp = header.sat || Math.floor(Date.now() / 1000);

    if (options.noTimestamp) {
      delete header.sat;
    } else {
      header.sat = timestamp;
    }

    const notBefore = options.notBefore;
    if (!isUndefined(notBefore)) {
      header.nbf = timespan(notBefore, timestamp);
      if (isUndefined(header.nbf)) {
        throw new Error(
          '"notBefore" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60',
        );
      }
    }

    const expiresIn = options.expiresIn ?? this.options.defaultExpiresIn;
    if (!isUndefined(expiresIn)) {
      header.exp = timespan(expiresIn, timestamp);
      if (isUndefined(header.exp)) {
        throw new Error(
          '"expiresIn" should be a number of seconds or string representing a timespan eg: "1d", "20h", 60',
        );
      }
    }
    return {header, payload: target, signatures: []};
  }

  protected createSignature(data: string | Buffer, keypair: KeyPair): Signature {
    return {
      idt: base64.encodeURL(keypair.publicKey),
      alg: keypair.algorithm,
      sig: base64.encodeURL(this.box.sign(data, keypair)),
    };
  }

  protected encode(header: Header, payload: any) {
    return Buffer.concat([header, payload].map(o => Buffer.from(toString(o ?? ''))));
  }
}

export function validateSignOptions(options: SignOptions) {
  return validate(SignOptionsSchema, options, 'options', false);
}

export function validateHeader(header: Header) {
  return validate(HeaderSchema, header, 'header', true);
}
