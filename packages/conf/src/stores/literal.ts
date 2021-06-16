/*
 * literal.ts: Simple literal Object store for
 *
 * (C) 2020, Mindary.
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import {Memory, MemoryOptions} from './memory';

export interface LiteralOptions extends MemoryOptions {
  store: any;
  [key: string]: any;
}

export type PossibleLiteralOptions = Partial<LiteralOptions>;

export class Literal extends Memory {
  static type = 'literal';

  constructor(options?: PossibleLiteralOptions) {
    options = options ?? {};
    super(options);
    this.readOnly = true;
    this._store = options.store ?? options;
  }

  loadSync() {
    return this.store;
  }
}
