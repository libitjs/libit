import {expect} from '@loopback/testlab';
import {jot, JOT} from '../jot';

describe('JOT', () => {
  it('should export correctly', () => {
    expect(JOT).is.Function();
    expect(jot).is.instanceof(JOT);
  });

  describe('sign & unsign', function () {
    it('should sign and unsign successful', function () {
      const key = jot.createIdentity();
      const packet = jot.sign('hello', key);
      const ticket = jot.unsign(packet);
      expect(ticket.payload).eql(packet.payload);
      expect(ticket.identities).deepEqual([key.id]);
    });

    it('should throw error when try to unsign un-digestible payload', function () {
      const key = jot.createIdentity();
      const packet = jot.signer.sign('hello', key);
      expect(() => jot.unsign(packet)).throw(/not digestible/);
    });
  });

  it('signAndPack and unpackAndUnsign', function () {
    const key = jot.createIdentity();
    const packet = jot.sign('hello', key);
    const data = jot.signAndPack('hello', key);
    const ticket = jot.unpackAndUnsign(data);
    expect(ticket.payload).eql(packet.payload);
    expect(ticket.identities).deepEqual([key.id]);
  });

  describe('verify', function () {
    const sample = {
      foo: 'bar',
      buf: Buffer.from('jot'),
    };

    const sample2 = {
      foo: 'bar',
      buf: 'jot',
    };

    it('should verify successful', function () {
      const key = jot.createIdentity();
      const data = jot.signAndPack(sample, key);
      const ticket = jot.unpackAndUnsign(data);
      expect(jot.verify(ticket, sample)).true();
    });

    it('should verify failure', function () {
      const key = jot.createIdentity();
      const data = jot.signAndPack(sample, key);
      const ticket = jot.unpackAndUnsign(data);
      expect(jot.verify(ticket, sample2)).false();
    });
  });
});
