import {expect} from '@loopback/testlab';
import {SHA256} from '@libit/crypto/sha256';
import {SHA512} from '@libit/crypto/sha512';
import {Digester} from '../digester';

describe('Digester', function () {
  it('constructor', function () {
    const digester = new Digester(SHA256);
    expect(digester.hashes).lengthOf(1);
    expect(digester.hash()).equal(SHA256);
    expect(digester.hash(SHA256.id)).equal(SHA256);
    expect(() => digester.hash(SHA512.id)).throw(/not supported/);
  });

  it('digest()', function () {
    const digester = new Digester(SHA256);
    const digest = digester.digest({
      a: 'b',
    });
    expect(digest).startWith(SHA256.id + '=');
  });

  it('verify()', function () {
    const digester = new Digester(SHA256);
    const digest = digester.digest({
      a: 'b',
    });
    let verified = digester.verify(
      {
        a: 'b',
      },
      digest,
    );
    expect(verified).be.true();
    verified = digester.verify(
      {
        a: 'c',
      },
      digest,
    );
    expect(verified).be.false();
  });
});
