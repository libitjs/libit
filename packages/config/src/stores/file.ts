/*
 * file.ts : Simple file storage engine for config files
 *
 * (C) 2020, Mindary.
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import fs from 'fs-extra';
import path from 'path';
import {Memory, MemoryOptions} from './memory';
import {Codec} from '../types';
import * as codecs from '../codecs';
import {checkCodecRequires, resolveCodec} from '../codecs';
import {detect} from '../detect';
import {decrypt, encrypt, genIV, getCipherAlgorithm} from '../cipher';
import isString from 'tily/is/string';
import isEqual from 'tily/is/equal';

export interface FileOptions extends MemoryOptions {
  file: string;
  dir: string;
  codec: Codec | string;
  secure: Buffer | string | FileSecure;
  spacing: number;
  search: boolean;
}

export interface FileSecure {
  alg: string;
  secretPath?: string;
  secret: Buffer | string;
}

export type PossibleFileOptions = Partial<FileOptions>;

export const SECURE_IV_SEP = Buffer.from(':');

//
// ### function File (options)
// #### @options {Object} Options for this instance
// Constructor function for the File config store, a simple abstraction
// around the Memory store that can persist configuration to disk.
//
export class File extends Memory {
  static type = 'file';
  file: string;
  dir: string;
  codec: Codec;
  secure: FileSecure;
  spacing: number;

  constructor(options?: PossibleFileOptions) {
    options = options ?? {};
    super(options);

    if (!options || !options.file) {
      throw new Error('Missing required option `file`');
    }

    this.file = options.file;
    this.dir = options.dir ?? process.cwd();
    this.spacing = options.spacing ?? 2;

    if (options.secure) {
      let secret: Buffer | string;
      if (Buffer.isBuffer(options.secure) || typeof options.secure === 'string') {
        this.secure = <FileSecure>{};
        secret = options.secure;
      } else {
        this.secure = options.secure;
        secret = this.secure.secret;
      }

      this.secure.alg = this.secure.alg ?? 'aes-256-cbc';
      if (this.secure.secretPath) {
        secret = fs.readFileSync(this.secure.secretPath, 'utf8');
      }

      this.secure.secret = secret;

      if (!this.secure.secret) {
        throw new Error('secure.secret option is required');
      }
    }

    if (options.search) {
      this.search(this.dir);
    }

    if (options.codec) {
      const codec = resolveCodec(options.codec);
      if (!codec) {
        throw new Error(`The codec is not supported with name: ${options.codec}`);
      }
      this.codec = checkCodecRequires(codec);
    } else if (this.file) {
      const detected = detect(this.file);
      if (detected) {
        this.file = detected.file;
        this.codec = checkCodecRequires(detected.codec);
      }
    }
    if (!this.codec) {
      this.codec = codecs.json;
    }
  }

  exists() {
    return fs.existsSync(this.file);
  }

  //
  // ### function save (value, callback)
  // #### @value {Object} _Ignored_ Left here for consistency
  // #### @callback {function} Continuation to respond to when complete.
  // Saves the current configuration object to disk at `this.file`
  // using the format specified by `this.format`.
  //
  async save(codec?: Codec) {
    await this.saveToFile(this.file, codec);
    return this.store;
  }

  //
  // ### function saveToFile (path, value, callback)
  // #### @path {string} The path to the file where we save the configuration to
  // #### @format {Object} Optional formatter, default behind the one of the store
  // #### @callback {function} Continuation to respond to when complete.
  // Saves the current configuration object to disk at `this.file`
  // using the format specified by `this.format`.
  //
  saveToFile(file: string, codec?: Codec) {
    return fs.writeFile(file, this.encode(codec));
  }

  //
  // ### function saveSync (value, callback)
  // Saves the current configuration object to disk at `this.file`
  // using the format specified by `this.format` synchronously.
  //
  saveSync(codec?: Codec) {
    this.saveToFileSync(this.file, codec);
    return this.store;
  }

  saveToFileSync(file: string, codec?: Codec) {
    return fs.writeFileSync(file, this.encode(codec));
  }

  //
  // ### function load (callback)
  // #### @callback {function} Continuation to respond to when complete.
  // Responds with an Object representing all keys associated in this instance.
  //
  async load() {
    if (!this.exists()) {
      this._store = {};
      return this.store;
    }

    //
    // Else, the path exists, read it from disk
    //
    try {
      let data = await fs.readFile(this.file, this.secure ? '' : 'utf8');
      // Deals with string that include BOM
      if (isString(data) && data.charAt(0) === '\uFEFF') {
        data = data.substr(1);
      }

      this._store = this.decode(data);
    } catch (ex) {
      throw new Error(`Error parsing your configuration file: [${this.file}]: ${ex.message}`);
    }

    return this.store;
  }

  //
  // ### function loadSync (callback)
  // Attempts to load the data stored in `this.file` synchronously
  // and responds appropriately.
  //
  loadSync() {
    if (!this.exists()) {
      this._store = {};
      return this.store;
    }

    //
    // Else, the path exists, read it from disk
    //
    try {
      // Deals with file that include BOM
      let data = fs.readFileSync(this.file, this.secure ? null : 'utf8');
      if (isString(data) && data.charAt(0) === '\uFEFF') {
        data = data.substr(1);
      }

      this._store = this.decode(data);
    } catch (ex) {
      throw new Error(`Error parsing your configuration file: [${this.file}]: ${ex.message}`);
    }

    return this.store;
  }

  //
  // ### function stringify ()
  // Returns an encrypted version of the contents IIF
  // `this.secure` is enabled
  //
  encode(codec?: Codec) {
    codec = codec ?? this.codec;
    const spacing = this.spacing;
    const encoded = codec.encode(this.store, {spacing});
    let data = Buffer.from(encoded);

    if (this.secure) {
      const alg = getCipherAlgorithm(this.secure.alg);
      const iv = genIV(alg);
      const encrypted = encrypt(alg, this.secure.secret, iv, data);
      data = Buffer.concat([iv, SECURE_IV_SEP, encrypted]);
    }

    return data;
  }

  //
  // ### function parse (contents)
  // Returns a decrypted version of the contents IFF
  // `this.secure` is enabled.
  //
  decode(contents: string | Buffer) {
    if (this.secure) {
      const data = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
      const alg = getCipherAlgorithm(this.secure.alg);
      if (!isEqual(data.slice(alg.ivLen, alg.ivLen + SECURE_IV_SEP.length), SECURE_IV_SEP)) {
        throw new Error('"iv" is required');
      }
      const iv = data.slice(0, alg.ivLen);
      const ciphertext = data.slice(alg.ivLen + SECURE_IV_SEP.length);
      const decrypted = decrypt(alg, this.secure.secret, iv, ciphertext);
      contents = decrypted.toString();
    }

    return this.codec.decode(contents.toString('utf8'));
  }

  //
  // ### function search (base)
  // #### @base {string} Base directory (or file) to begin searching for the target file.
  // Attempts to find `this.file` by iteratively searching up the
  // directory structure
  //
  search(base?: string) {
    let looking = true;
    let full;
    let previous;
    let stats;

    base = base ?? process.cwd();

    if (this.file[0] === '/') {
      //
      // If filename for this instance is a fully qualified path
      // (i.e. it starts with a `'/'`) then check if it exists
      //
      try {
        stats = fs.statSync(fs.realpathSync(this.file));
        if (stats.isFile()) {
          full = this.file;
          looking = false;
        }
      } catch (ex) {
        //
        // Ignore errors
        //
      }
    }

    if (looking && base) {
      //
      // Attempt to stat the realpath located at `base`
      // if the directory does not exist then return false.
      //
      try {
        const stat = fs.statSync(fs.realpathSync(base));
        looking = stat.isDirectory();
      } catch (ex) {
        return false;
      }
    }

    while (looking) {
      //
      // Iteratively look up the directory structure from `base`
      //
      try {
        stats = fs.statSync(fs.realpathSync((full = path.join(base, this.file))));
        looking = stats.isDirectory();
      } catch (ex) {
        previous = base;
        base = path.dirname(base);

        if (previous === base) {
          //
          // If we've reached the top of the directory structure then simply use
          // the default file path.
          //
          try {
            stats = fs.statSync(fs.realpathSync((full = path.join(this.dir, this.file))));
            if (stats.isDirectory()) {
              full = undefined;
            }
          } catch (e) {
            //
            // Ignore errors
            //
          }

          looking = false;
        }
      }
    }

    //
    // Set the file for this instance to the fullpath
    // that we have found during the search. In the event that
    // the search was unsuccessful use the original value for `this.file`.
    //
    this.file = full ?? this.file;

    return full;
  }
}
