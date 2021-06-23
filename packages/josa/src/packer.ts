import {base64} from '@libit/crypto/encoding/base64';
import * as msgpack from 'msgpackr';
import {Packet, Signature} from './types';

export function pack(packet: Packet) {
  const header = encode(packet.header);
  const payload = encode(packet.payload);
  const signatures = encode(packet.signatures.map(s => [encode(s.idt), encode(s.alg), encode(s.sig)].join('.')));
  return [header, payload, signatures].join('.');
}

export function unpack(token: string) {
  const parts = token.split('.');
  const header = decode(parts[0]);
  const payload = decode(parts[1]);
  const signatures = decode(parts[2]).map((s: string) => {
    const props = s.split('.');
    return <Signature>{
      idt: decode(props[0]),
      alg: decode(props[1]),
      sig: decode(props[2]),
    };
  });
  return {header, payload, signatures};
}

function encode(target: any) {
  return base64.encodeURL(msgpack.pack(target));
}

function decode(token: string) {
  return msgpack.unpack(base64.decodeURL(token));
}
