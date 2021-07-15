import {expect} from '@loopback/testlab';
import {isPrivateKey, isPublicKey} from '../types';

describe('types', () => {
  it('isPrivateKey', () => {
    expect(
      isPrivateKey({
        algorithm: 'a',
        secretKey: 'a',
      }),
    ).true();

    expect(
      isPrivateKey({
        algorithm: 'a',
        publicKey: 'b',
      }),
    ).false();

    expect(
      isPrivateKey({
        secretKey: 'a',
        publicKey: 'b',
      }),
    ).false();

    expect(
      isPrivateKey({
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
