import {expect} from '@loopback/testlab';
import {Buffer} from 'buffer';
import {ed25519} from '@libit/crypto/ed25519';
import {secp256k1} from '@libit/crypto/secp256k1';
import {p256} from '@libit/crypto/p256';
import {SHA512} from '@libit/crypto/sha512';
import {Box} from '../box';
import {encodeAlgorithm} from '../utils';

const message = Buffer.from('hello world');

describe('box', function () {
  let box: Box;

  beforeEach(function () {
    box = new Box([ed25519, p256, secp256k1], [SHA512]);
  });

  it('should use default algo', function () {
    expect(box.asym().id).to.eql(ed25519.id);
  });

  it('should create key pair', function () {
    const keypair = box.createKeyPair();
    expect(keypair).to.be.ok();
    expect(keypair.algorithm).to.eql(encodeAlgorithm(ed25519, SHA512));
    expect(keypair.privkey).instanceof(Buffer);
    expect(keypair.pubkey).instanceof(Buffer);
  });

  it('should sign with default algo', function () {
    const keypair = box.createKeyPair();
    const sig = box.sign(message, keypair);
    expect(sig).instanceof(Buffer);
  });

  it('should verify with default algo', function () {
    const keypair = box.createKeyPair();
    const sig = box.sign(message, keypair);
    const result = box.verify(message, sig, keypair);
    expect(result).to.be.true();
  });

  it('should create key pair with custom algo', function () {
    const keypair = box.createKeyPair(secp256k1.id);
    expect(keypair).to.be.ok();
    expect(keypair.algorithm).to.eql(encodeAlgorithm(secp256k1, SHA512));
    expect(keypair.privkey).instanceof(Buffer);
    expect(keypair.pubkey).instanceof(Buffer);
  });

  it('should sign with custom algo', function () {
    const keypair = box.createKeyPair(secp256k1.id);
    let sig = box.sign(message, keypair);
    expect(sig).instanceof(Buffer);

    sig = box.sign(message, keypair);
    expect(sig).instanceof(Buffer);
  });

  it('should verify with custom algo', function () {
    const keypair = box.createKeyPair(secp256k1.id);
    let sig = box.sign(message, keypair);
    let result = box.verify(message, sig, keypair);
    expect(result).to.be.true();

    sig = box.sign(message, keypair);
    result = box.verify(message, sig, keypair);
    expect(result).to.be.true();
  });
});
