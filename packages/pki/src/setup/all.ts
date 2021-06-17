import {p192} from '@libit/crypto/p192';
import {p224} from '@libit/crypto/p224';
import {p256} from '@libit/crypto/p256';
import {p384} from '@libit/crypto/p384';
import {p521} from '@libit/crypto/p521';
import {secp256k1} from '@libit/crypto/secp256k1';
import {ed448} from '@libit/crypto/ed448';
import {ed25519} from '@libit/crypto/ed25519';
import {rsa} from '@libit/crypto/rsa';

import {MD5} from '@libit/crypto/md5';
import {SHA1} from '@libit/crypto/sha1';
import {SHA224} from '@libit/crypto/sha224';
import {SHA256} from '@libit/crypto/sha256';
import {SHA384} from '@libit/crypto/sha384';
import {SHA512} from '@libit/crypto/sha512';

import {oids} from '@libit/crypto/encoding/oids';
import {algs} from '../algs';

const {curves, keyAlgs} = oids;

algs.addAsym({
  [curves.P192]: p192,
  [curves.P224]: p224,
  [curves.P256]: p256,
  [curves.P384]: p384,
  [curves.P521]: p521,
  [curves.SECP256K1]: secp256k1,
  [curves.ED448]: ed448,
  [curves.ED25519]: ed25519,
  [keyAlgs.RSA]: rsa,
});

algs.addHash([MD5, SHA1, SHA224, SHA256, SHA384, SHA512]);
