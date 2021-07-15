import {
  Identity,
  pack,
  Packet,
  SecretKey,
  Signer,
  SignerOptions,
  SignOptions,
  unpack,
  VerifyOptions,
} from '@libit/josa';
import {Digester} from '@libit/digester';
import {DigestibleTicket, isDigestibleTicket} from './types';
import {HashCtor} from '@libit/crypto';
import {Buffer} from 'buffer';

export interface JOTOptions extends Partial<SignerOptions> {}

export class JOT {
  signer: Signer;
  digester: Digester;
  digestAlgorithm: HashCtor;

  constructor(options: JOTOptions = {}) {
    this.signer = new Signer(options);
    const hashes = [...this.signer.box.hashes];
    this.digestAlgorithm = options.digestAlgorithm ?? hashes[0];
    if (options.digestAlgorithm && !hashes.includes(options.digestAlgorithm)) {
      hashes.push(options.digestAlgorithm);
    }
    this.digester = new Digester(hashes);
  }

  createIdentity(algorithm?: string): Identity;
  createIdentity(secretKey: SecretKey): Identity;
  createIdentity(algorithmOrSecretKey?: string | SecretKey): Identity {
    return this.signer.createIdentity(algorithmOrSecretKey as any);
  }

  createIdentityFromSeed(seed: Buffer | string, algorithm?: string) {
    return this.signer.createIdentityFromSeed(seed, algorithm);
  }

  sign(data: any, key: SecretKey | SecretKey[], options?: SignOptions): Packet {
    return this.signer.sign(
      {
        digest: this.digester.digest(data, this.digestAlgorithm),
      },
      key,
      options,
    );
  }

  unsign(packet: Packet, options?: VerifyOptions): DigestibleTicket {
    const ticket = this.signer.verify(packet, options);
    if (!isDigestibleTicket(ticket.payload)) {
      throw new Error('JOT payload is not digestible');
    }
    return ticket;
  }

  signAndPack(data: any, key: SecretKey | SecretKey[], options?: SignOptions): string {
    return pack(this.sign(data, key, options));
  }

  unpackAndUnsign(token: string, options?: VerifyOptions): DigestibleTicket {
    return this.unsign(unpack(token), options);
  }

  verify(ticket: DigestibleTicket, data?: any): boolean {
    return this.digester.verify(data, ticket.payload.digest);
  }
}

export const jot = new JOT();
