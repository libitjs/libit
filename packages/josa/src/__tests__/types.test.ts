import {expect} from '@loopback/testlab';
import {isPrivateKey, isPublicKey} from '../types';

describe('types', () => {
  it('isPrivateKey', () => {
    expect(
      isPrivateKey({
        algorithm: 'a',
        privkey: 'a',
      }),
    ).true();

    expect(
      isPrivateKey({
        algorithm: 'a',
        pubkey: 'b',
      }),
    ).false();

    expect(
      isPrivateKey({
        privkey: 'a',
        pubkey: 'b',
      }),
    ).false();

    expect(
      isPrivateKey({
        algorithm: 'a',
        privkey: 'a',
        pubkey: 'b',
      }),
    ).true();
  });

  it('isPublicKey', function () {
    expect(
      isPublicKey({
        algorithm: 'a',
        privkey: 'a',
      }),
    ).false();

    expect(
      isPublicKey({
        algorithm: 'a',
        pubkey: 'b',
      }),
    ).true();

    expect(
      isPublicKey({
        privkey: 'a',
        pubkey: 'b',
      }),
    ).false();

    expect(
      isPublicKey({
        algorithm: 'a',
        privkey: 'a',
        pubkey: 'b',
      }),
    ).true();
  });
});
