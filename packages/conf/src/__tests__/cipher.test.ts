import {CipherAlgorithms, decrypt, encrypt, genIV, getCipherAlgorithm} from '../cipher';
import {expect} from '@loopback/testlab';

describe('cipher', () => {
  it('should get algorithm', function () {
    for (const a of CipherAlgorithms) {
      expect(getCipherAlgorithm(a.id)).ok();
    }
  });

  describe('algorithms', function () {
    const secret = 'abc123';
    const plaintext = 'hello world';

    for (const a of CipherAlgorithms) {
      it(`should encrypt and decrypt "${plaintext}" with ${a.id}`, () => {
        const alg = getCipherAlgorithm(a.id);
        const iv = genIV(alg);
        const ciphertext = encrypt(alg, secret, iv, plaintext);
        const decrypted = decrypt(alg, secret, iv, ciphertext);
        expect(decrypted.toString('utf8')).eql(plaintext);
      });
    }
  });
});
