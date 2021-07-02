import {
  Identity,
  pack,
  Packet,
  PrivateKey,
  Signer,
  SignerOptions,
  SignOptions,
  unpack,
  VerifyOptions,
} from '@libit/josa';
import {Digester} from '@libit/digester';
import {DigestibleTicket} from './types';

export interface JOTOptions extends Partial<SignerOptions> {}

export class JOT {
  protected signer: Signer;
  protected digester: Digester;

  constructor(options: JOTOptions = {}) {
    this.signer = new Signer(options);
    this.digester = new Digester(this.signer.box.hashes);
  }

  createIdentity(algorithm?: string): Identity {
    return this.signer.createIdentity(algorithm);
  }

  sign(data: any, key: PrivateKey | PrivateKey[], options?: SignOptions): Packet {
    return this.signer.sign(
      {
        digest: this.digester.digest(data),
      },
      key,
      options,
    );
  }

  unsign(packet: Packet, options?: VerifyOptions): DigestibleTicket {
    return this.signer.verify(packet, options);
  }

  signAndPack(data: any, key: PrivateKey | PrivateKey[], options?: SignOptions): string {
    return pack(this.sign(data, key, options));
  }

  unpackAndUnsign(token: string, options?: VerifyOptions): DigestibleTicket {
    return this.unsign(unpack(token), options);
  }

  verify(ticket: DigestibleTicket, data?: any): boolean {
    return this.digester.verify(data, ticket.payload.digest);
  }
}

export default new JOT();
