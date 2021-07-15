import {Asym} from '@libit/crypto';
import isNumber from 'tily/is/number';
import isString from 'tily/is/string';
import isPlainObject from 'tily/is/plainObject';
import isBoolean from 'tily/is/boolean';
import {Buffer} from 'buffer';

export type AnyAsym = Asym<any, any>;

export type Payload = any;

export interface PublicKey {
  /**
   * Signature algorithm.
   *
   * For example:
   * P256-SHA256: ECDSA using P-256 curve and SHA-256 hash algorithm
   *
   */
  algorithm: string;
  publicKey: Buffer;
}

export interface SecretKey {
  /**
   * Signature algorithm.
   *
   * For example:
   * P256-SHA256: ECDSA using P-256 curve and SHA-256 hash algorithm
   *
   */
  algorithm: string;
  secretKey: Buffer;
}

export interface KeyPair extends PublicKey, SecretKey {}

export interface Identity extends KeyPair {
  id: string;
}

export interface Signature {
  idt: string;
  alg: string;
  sig: string;
}

export interface Header {
  kid?: string;
  sat?: number;
  exp?: number;
  nbf?: number;
  nonce?: string;
}

export interface Packet {
  header: Header;
  payload: any;
  signatures: Signature[];
}

export interface Ticket<T = any> {
  payload: T;
  identities: string[];
}

export interface SignOptions {
  keyid?: string;
  /** expressed in seconds or a string describing a time span zeit/ms . Eg: 60, “2 days”, “10h”, “7d” **/
  expiresIn?: string | number;
  /** expressed in seconds or a string describing a time span zeit/ms . Eg: 60, “2 days”, “10h”, “7d” **/
  notBefore?: string | number;
  noTimestamp?: boolean;
  header?: object;
}

export interface VerifyOptions {
  clockTimestamp?: number;
  clockTolerance?: number;
  ignoreExpiration?: boolean;
  ignoreNotBefore?: boolean;
  /**
   * If you want to check `nonce` claim, provide a string value here.
   * It is used on Open ID for the ID Tokens. ([Open ID implementation notes](https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes))
   */
  nonce?: string;
}

export interface PropertySchema {
  isValid: (value: any) => Boolean;
  message: string;
}

export type ObjectSchema<T extends string> = Record<T, PropertySchema>;

export const SignOptionsSchema: ObjectSchema<keyof SignOptions> = {
  expiresIn: {
    isValid: value => Boolean(isNumber(value) || (isString(value) && value)),
    message: '"expiresIn" should be a number of seconds or string representing a timespan',
  },
  notBefore: {
    isValid: value => Boolean(isNumber(value) || (isString(value) && value)),
    message: '"notBefore" should be a number of seconds or string representing a timespan',
  },
  header: {isValid: isPlainObject, message: '"header" must be an object'},
  noTimestamp: {isValid: isBoolean, message: '"noTimestamp" must be a boolean'},
  keyid: {isValid: isString, message: '"keyid" must be a string'},
};

export const HeaderSchema: ObjectSchema<string> = {
  sat: {isValid: isNumber, message: '"sat" should be a number of seconds'},
  exp: {isValid: isNumber, message: '"exp" should be a number of seconds'},
  nbf: {isValid: isNumber, message: '"nbf" should be a number of seconds'},
  nonce: {isValid: isString, message: '"nonce" should be a string'},
};

export function isPacket(x: any): x is Packet {
  return Boolean(x?.header && x.payload && x.signatures);
}

export function isKeyPair(x: any): x is KeyPair {
  return Boolean(x && typeof x.algorithm === 'string' && x.secretKey && x.publicKey);
}

export function isSecretKey(x: any): x is SecretKey {
  return Boolean(x && typeof x.algorithm === 'string' && x.secretKey);
}

export function isPublicKey(x: any): x is SecretKey {
  return Boolean(x && typeof x.algorithm === 'string' && x.publicKey);
}
