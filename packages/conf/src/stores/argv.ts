/*
 * argv.ts: Simple memory-based store for command-line arguments.
 *
 * (C) 2020, Mindary.
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {Argv as YArgv, Options as YOptions} from 'yargs';
import {Memory, MemoryOptions} from './memory';
import {encodeKey, parseValues, transform} from '../common';
import {TransformFn} from '../types';
import Yargs = require('yargs');

export interface ArgvOptions extends MemoryOptions {
  readOnly?: boolean;
  separator?: string | RegExp;
  transform?: TransformFn;
  usage?: string;
  argvOptions?: Record<string, YOptions>;
}

export type PossibleArgvOptions = string | ArgvOptions | YArgv;

//
// ### function Argv (options)
// #### @options {Object} Options for this instance.
// Constructor function for the Argv config store, a simple abstraction
// around the Memory store that can read command-line arguments.
//
export class Argv extends Memory {
  static type = 'argv';
  yargs: YArgv;
  argvOptions?: Record<string, YOptions>;
  usage?: string;
  transform?: TransformFn;
  separator: string | RegExp;

  showHelp: (consoleLevel?: string) => YArgv<any>;
  help: () => YArgv<any>;

  constructor(options?: PossibleArgvOptions) {
    const optsOrYargs = typeof options === 'string' ? {separator: options} : options ?? {};
    super(isYargs(optsOrYargs) ? {} : optsOrYargs);

    let opts: ArgvOptions = {};
    if (isYargs(optsOrYargs)) {
      this.yargs = optsOrYargs;
    } else {
      opts = optsOrYargs;
    }

    this.readOnly = opts.readOnly ?? true;
    this.parseValues = opts.parseValues ?? false;
    this.separator = opts.separator ?? '';
    this.transform = opts.transform;
    this.usage = opts.usage;

    this.argvOptions = opts.argvOptions;
  }

  //
  // ### function loadSync ()
  // Loads the data passed in from `process.argv` into this instance.
  //
  loadSync() {
    this.loadArgv();
    return this.store;
  }

  //
  // ### function loadArgv ()
  // Loads the data passed in from the command-line arguments
  // into this instance.
  //
  loadArgv() {
    // const y: YArgv =
    //   this.yargs ??
    //   (typeof this.options === 'object'
    //     ? Yargs(process.argv.slice(2)).options(<any>this.options)
    //     : Yargs(process.argv.slice(2)));
    //
    const y = this.yargs ?? Yargs(process.argv.slice(2));

    if (typeof this.argvOptions === 'object') {
      y.options(this.argvOptions);
    }

    if (typeof this.usage === 'string') {
      y.usage(this.usage);
    }

    let argv = y.argv as Record<string, any>;

    if (!argv) {
      return;
    }

    if (this.transform) {
      argv = transform(argv, this.transform);
    }

    let tempWrite = false;

    if (this.readOnly) {
      this.readOnly = false;
      tempWrite = true;
    }

    for (const key of Object.keys(argv)) {
      let val: any = argv[key];
      if (val != null) {
        if (this.parseValues) {
          val = parseValues((val as any).toString());
        }

        if (this.separator) {
          this.set(encodeKey(...key.split(this.separator)), val);
        } else {
          this.set(key, val);
        }
      }
    }

    this.showHelp = y.showHelp;
    this.help = y.help;

    if (tempWrite) {
      this.readOnly = true;
    }
    return this.store;
  }
}

function isYargs(obj: any): obj is YArgv {
  return (typeof obj === 'function' || typeof obj === 'object') && 'argv' in obj;
}
