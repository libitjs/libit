import {p256} from '@libit/crypto/p256';
import {SHA256} from '@libit/crypto/sha256';
import {oids} from '@libit/crypto/encoding/oids';
import {algs} from '../algs';

const {curves} = oids;

algs.addAsym({
  [curves.P256]: p256,
});

algs.addHash([SHA256]);
