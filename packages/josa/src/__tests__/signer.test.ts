import {expect} from '@loopback/testlab';
import {base64} from '@libit/crypto/encoding/base64';
import {Identity} from '../types';
import {Signer} from '../signer';

const SAMPLE_PAYLOAD = {action: 'send'};

describe('signer', function () {
  let signer: Signer;
  let keypair1: Identity;
  let keypair2: Identity;

  before(() => {
    signer = new Signer();
    keypair1 = signer.createIdentity();
    keypair2 = signer.createIdentity();
  });

  it('keypair have string id', function () {
    expect(keypair1.id).eql(base64.encodeURL(keypair1.pubkey));
  });

  it('sign sample data', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    expect(packet).ok();
    expect(packet.header).ok();
    expect(packet.payload).ok();
    expect(packet.signatures).ok();
    expect(packet.signatures).lengthOf(1);
  });

  it('verify packet ok', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    expect(signer.verify(packet)).to.be.ok();
  });

  it('throw error if verification failed', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    packet.payload = Math.random();
    expect(() => signer.verify(packet)).throw(/signature verification failed/);
  });

  it('extract payload from token', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    const message = signer.verify(packet);
    expect(message).ok();
    expect(message.payload).ok();
    expect(message.identities).eql([base64.encodeURL(keypair1.pubkey)]);
  });

  it('sign with multiple identities', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, [keypair1, keypair2]);
    expect(packet).to.be.ok();
    expect(packet.signatures).lengthOf(2);
  });

  it('sign with multiple times', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, keypair1);
    expect(packet).to.be.ok();
    expect(packet.signatures).lengthOf(1);
    signer.sign(packet, keypair2);
    expect(packet.signatures).lengthOf(2);
  });

  it('extract message from packet with multiple signatures', function () {
    const packet = signer.sign(SAMPLE_PAYLOAD, [keypair1, keypair2]);
    expect(signer.verify(packet)).to.containDeep({
      payload: SAMPLE_PAYLOAD,
      identities: [base64.encodeURL(keypair1.pubkey), base64.encodeURL(keypair2.pubkey)],
    });
  });
});
