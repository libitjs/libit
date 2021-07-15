import {expect} from '@loopback/testlab';
import {isSecretKey, isPublicKey} from '../types';

describe('types', () => {
  it('isPrivateKey', () => {
    expect(
      isSecretKey({
        algorithm: 'a',
        secretKey: 'a',
      }),
    ).true();

    expect(
      isSecretKey({
        algorithm: 'a',
        publicKey: 'b',
      }),
    ).false();

    expect(
      isSecretKey({
        secretKey: 'a',
        publicKey: 'b',
      }),
    ).false();

    expect(
      isSecretKey({
        algorithm: 'a',
        secretKey: 'a',
        publicKey: 'b',
      }),
    ).true();
  });

  it('isPublicKey', function () {
    expect(
      isPublicKey({
        algorithm: 'a',
        secretKey: 'a',
      }),
    ).false();

    expect(
      isPublicKey({
        algorithm: 'a',
        publicKey: 'b',
      }),
    ).true();

    expect(
      isPublicKey({
        secretKey: 'a',
        publicKey: 'b',
      }),
    ).false();

    expect(
      isPublicKey({
        algorithm: 'a',
        secretKey: 'a',
        publicKey: 'b',
      }),
    ).true();
  });
});
