import {pack, Packet, PrivateKey, Signer, SignerOptions, SignOptions, Ticket, unpack} from '@libit/josa';
import {Digester} from '@libit/digester';
import {Identity, VerifyOptions} from '@libit/josa/src/types';

export interface Receipt {
  digest: string;
}

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

  unsign(packet: Packet, options?: VerifyOptions): Ticket<Receipt> {
    return this.signer.verify(packet, options);
  }

  signAndPack(data: any, key: PrivateKey | PrivateKey[], options?: SignOptions): string {
    return pack(this.sign(data, key, options));
  }

  unpackAndUnsign(token: string, options?: VerifyOptions): Ticket<Receipt> {
    return this.unsign(unpack(token), options);
  }

  verify(ticket: Ticket<Receipt>, data?: any): boolean {
    return this.digester.verify(data, ticket.payload.digest);
  }
}

export default new JOT();
