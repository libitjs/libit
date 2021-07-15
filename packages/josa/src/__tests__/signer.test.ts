import {expect} from '@loopback/testlab';
import {base64} from '@libit/crypto/encoding/base64';
import {ed25519} from '@libit/crypto/ed25519';
import {p256} from '@libit/crypto/p256';
import {Identity} from '../types';
import {Signer} from '../signer';
import {randomBytes} from 'crypto';

const ASYMS = [ed25519, p256];
const SAMPLE_PAYLOAD = {action: 'send'};

describe('signer', () => {
  let signer: Signer;
  let keypair1: Identity;
  let keypair2: Identity;
  let keypair3: Identity;

  before(() => {
    signer = new Signer({
      asym: ASYMS,
    });
    keypair1 = signer.createIdentity();
    keypair2 = signer.createIdentity();
    keypair3 = signer.createIdentity('p256');
  });

  it('keypair have correct algorithm id', () => {
    expect(keypair1.algorithm).startWith(ed25519.id);
    expect(keypair2.algorithm).startWith(ed25519.id);
    expect(keypair3.algorithm).startWith(p256.id);
  });

  it('keypair have string id', () => {
    expect(keypair1.id).eql(base64.encodeURL(keypair1.publicKey));
  });

  it('sign sample data', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    expect(packet).ok();
    expect(packet.header).ok();
    expect(packet.payload).ok();
    expect(packet.signatures).ok();
    expect(packet.signatures).lengthOf(1);
  });

  it('verify packet ok', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    expect(signer.verify(packet)).to.be.ok();
  });

  it('throw error if verification failed', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    packet.payload = Math.random();
    expect(() => signer.verify(packet)).throw(/signature verification failed/);
  });

  it('extract payload from token', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    const message = signer.verify(packet);
    expect(message).ok();
    expect(message.payload).ok();
    expect(message.identities).eql([base64.encodeURL(keypair1.publicKey)]);
  });

  it('sign with multiple identities', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, [keypair1, keypair2]);
    expect(packet).to.be.ok();
    expect(packet.signatures).lengthOf(2);
  });

  it('sign with multiple times', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    expect(packet).to.be.ok();
    expect(packet.signatures).lengthOf(1);
    signer.sign(packet, keypair2);
    expect(packet.signatures).lengthOf(2);
  });

  it('extract message from packet with multiple signatures', () => {
    const packet = signer.sign(SAMPLE_PAYLOAD, [keypair1, keypair2]);
    expect(signer.verify(packet)).to.containDeep({
      payload: SAMPLE_PAYLOAD,
      identities: [base64.encodeURL(keypair1.publicKey), base64.encodeURL(keypair2.publicKey)],
    });
  });

  describe('createIdentityFromSeed', function () {
    for (const asym of ASYMS) {
      it(`should create identity from seed with "${asym}"`, function () {
        const keypair = signer.createIdentityFromSeed(randomBytes(asym.size), asym.id);
        expect(keypair).ok();
      });
    }
  });
});
