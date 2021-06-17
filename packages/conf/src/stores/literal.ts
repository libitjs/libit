/*
 * literal.ts: Simple literal Object store for
 *
 * (C) 2020, Mindary.
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Memory, MemoryOptions} from './memory';

export interface LiteralOptions<T = Record<string, any>> extends MemoryOptions {
  store: T;
}

export type PossibleLiteralOptions = Partial<LiteralOptions>;

export class Literal<T = Record<string, any>> extends Memory {
  static type = 'literal';

  constructor(options?: PossibleLiteralOptions | T) {
    options = options ?? {};
    super(options);
    this.readOnly = true;
    this._store = (options as any)?.store ?? options;
  }

  loadSync() {
    return this.store;
  }
}
