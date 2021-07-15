import {expect} from '@loopback/testlab';
import {Buffer} from 'buffer';
import {ed25519} from '@libit/crypto/ed25519';
import {ed448} from '@libit/crypto/ed448';
import {secp256k1} from '@libit/crypto/secp256k1';
import {p256} from '@libit/crypto/p256';
import {p384} from '@libit/crypto/p384';
import {SHA512} from '@libit/crypto/sha512';
import {Box} from '../box';
import {encodeAlgorithm} from '../utils';
import {SecretKey} from '../types';
import {randomBytes} from 'crypto';

const ASYMS = [ed25519, ed448, p256, p384, secp256k1];
const MESSAGE = Buffer.from('hello world');

describe('box', function () {
  let box: Box;

  beforeEach(function () {
    box = new Box(ASYMS, [SHA512]);
  });

  it('should use default algo', function () {
    expect(box.asym().id).to.eql(ed25519.id);
  });

  it('should create key pair', function () {
    const keypair = box.createKeyPair();
    expect(keypair).to.be.ok();
    expect(keypair.algorithm.split('-')).length(2);
    expect(keypair.algorithm).to.eql(encodeAlgorithm(ed25519, SHA512));
    expect(keypair.secretKey).instanceof(Buffer);
    expect(keypair.publicKey).instanceof(Buffer);
  });

  it('should sign with default algo', function () {
    const keypair = box.createKeyPair();
    const sig = box.sign(MESSAGE, keypair);
    expect(sig).instanceof(Buffer);
  });

  it('should verify with default algo', function () {
    const keypair = box.createKeyPair();
    const sig = box.sign(MESSAGE, keypair);
    const result = box.verify(MESSAGE, sig, keypair);
    expect(result).to.be.true();
  });

  it('should create key pair with custom algo', function () {
    const keypair = box.createKeyPair(secp256k1.id);
    expect(keypair).to.be.ok();
    expect(keypair.algorithm).to.eql(encodeAlgorithm(secp256k1, SHA512));
    expect(keypair.secretKey).instanceof(Buffer);
    expect(keypair.publicKey).instanceof(Buffer);
  });

  it('should sign with custom algo', function () {
    const keypair = box.createKeyPair(secp256k1.id);
    let sig = box.sign(MESSAGE, keypair);
    expect(sig).instanceof(Buffer);

    sig = box.sign(MESSAGE, keypair);
    expect(sig).instanceof(Buffer);
  });

  it('should verify with custom algo', function () {
    const keypair = box.createKeyPair(secp256k1.id);
    let sig = box.sign(MESSAGE, keypair);
    let result = box.verify(MESSAGE, sig, keypair);
    expect(result).to.be.true();

    sig = box.sign(MESSAGE, keypair);
    result = box.verify(MESSAGE, sig, keypair);
    expect(result).to.be.true();
  });

  describe('toKeyPair', function () {
    it('should return same keypair object if convert a keypair object', function () {
      const keypair1 = box.createKeyPair(secp256k1.id);
      const keypair2 = box.toKeyPair(keypair1);
      expect(keypair2).equal(keypair1);
    });

    it('should convert to keypair with private key buffer', function () {
      const keypair1 = box.createKeyPair(secp256k1.id);
      const keypair2 = box.toKeyPair(keypair1.secretKey, keypair1.algorithm);
      expect(keypair2).deepEqual(keypair1);
    });

    it('should convert to keypair with private key', function () {
      const keypair1 = box.createKeyPair(secp256k1.id);
      const secretKey: SecretKey = {
        algorithm: keypair1.algorithm,
        secretKey: keypair1.secretKey,
      };
      const keypair2 = box.toKeyPair(secretKey);
      expect(keypair2).deepEqual(keypair1);
    });
  });

  describe('createKeyPairFromSeed', function () {
    for (const asym of ASYMS) {
      it(`should create keypair from seed with "${asym}"`, function () {
        const keypair = box.createKeyPairFromSeed(randomBytes(asym.size), asym.id);
        expect(keypair).ok();
      });
    }
  });
});
