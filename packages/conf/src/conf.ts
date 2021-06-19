import isEqual from 'tily/is/equal';
import isPlainObject from 'tily/is/plainObject';
import {Configurable} from 'orx/configurable';
import {Store, StoreOptions} from './store';
import {
  Argv,
  Env,
  File,
  FileOptions,
  Literal,
  Memory,
  PossibleArgvOptions,
  PossibleEnvOptions,
  PossibleFileOptions,
  PossibleLiteralOptions,
  PossibleMemoryOptions,
  Stores,
} from './stores';
import {Codec, GenericConf} from './types';
import {merge, traverseSync} from './utils';

export interface Source extends StoreOptions {
  type: string;
}

export interface ConfOptions {
  type?: string;
  store?: StoreOptions;
  stores?: Record<string, StoreOptions>;
  source?: Source;
  sources?: Record<string, Source>;
}

export type PossibleStoreOptions =
  | StoreOptions
  | PossibleArgvOptions
  | PossibleEnvOptions
  | PossibleFileOptions
  | PossibleLiteralOptions
  | PossibleMemoryOptions;

export class Conf<T extends GenericConf = GenericConf, O extends ConfOptions = ConfOptions>
  extends Configurable<O>
  implements Iterable<[keyof T, T[keyof T]]>
{
  stores: Record<string, Store>;
  sources: Store[];

  constructor(options?: O) {
    super(options);
    this.stores = {};
    this.sources = [];
    this.init();
  }

  //
  // ### function init (options)
  // #### @options {Object} Options to initialize this instance with.
  // Initializes this instance with additional `stores` or `sources` in the
  // `options` supplied.

  *[Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]> {
    for (const [key, value] of Object.entries(this.get())) {
      yield [key, value];
    }
  }

  argv(options?: PossibleArgvOptions): this {
    return this.add('argv', options);
  }

  env(options?: PossibleEnvOptions): this {
    return this.add('env', options);
  }

  file(key: string, options?: Partial<FileOptions> | string): this;

  file(key: Partial<FileOptions> | string): this;

  file(key: string | Partial<FileOptions>, options?: Partial<FileOptions> | string): this {
    if (!options) {
      options = typeof key === 'string' ? {file: key} : key;
      key = 'file';
    } else {
      options = typeof options === 'string' ? {file: options} : options;
    }
    return this.add(<string>key, {type: 'file', ...options});
  }

  defaults(options: PossibleLiteralOptions | Partial<T> = {}) {
    if (!options.store) {
      options = {store: options};
    }
    options = Object.assign({type: 'literal'}, options);
    return this.add('defaults', options);
  }

  overrides(options: PossibleLiteralOptions | Partial<T> = {}) {
    if (!options.store) {
      options = {store: options};
    }
    options = Object.assign({type: 'literal'}, options);
    return this.add('overrides', options);
  }

  memory(options: PossibleMemoryOptions | Partial<T> = {}) {
    options = Object.assign({type: 'memory'}, options);
    return this.add('memory', options);
  }

  use(name: string, options: Record<string, any> = {}) {
    const store = this.stores[name];
    const update = store && !isEqual(store, options);

    if (!store || update) {
      if (update) {
        this.remove(name);
      }

      this.add(name, options);
    }

    return this;
  }

  //
  // ### function use (name, options)
  // #### @type {string} Type of the config store to use.
  // #### @options {Object} Options for the store instance.
  // Adds (or replaces) a new store with the specified `name`
  // and `options`. If `options.type` is not set, then `name`
  // will be used instead:
  //
  //    config.use('file');
  //    config.use('file', { type: 'file', filename: '/path/to/userconf' })

  //
  add(name: string, options: any): this {
    options = options || {};
    const type = options.type || name;

    if (!Stores[type]) {
      throw new Error('Cannot add store with unknown type: ' + type);
    }

    this.stores[name] = this.create(type, options);
    this.stores[name].loadSync();

    return this;
  }

  //
  // ### function add (name, options)
  // #### @name {string} Name of the store to add to this instance
  // #### @options {Object} Options for the store to create
  // Adds a new store with the specified `name` and `options`. If `options.type`
  // is not set, then `name` will be used instead:
  //
  //    config.add('memory');
  //    config.add('userconf', { type: 'file', filename: '/path/to/userconf' })

  //
  create(type: 'argv', options?: PossibleArgvOptions): Argv;

  //
  // ### function create (type, options)
  // #### @type {string} Type of the config store to use.
  // #### @options {Object} Options for the store instance.
  // Creates a store of the specified `type` using the
  // specified `options`.

  create(type: 'env', options?: PossibleEnvOptions): Env;

  create(type: 'file', options?: PossibleFileOptions): File;

  create(type: 'literal', options?: PossibleLiteralOptions): Literal;

  create(type: 'memory', options?: PossibleMemoryOptions): Memory;

  create<S extends Store = Store>(type: string, options?: PossibleStoreOptions): S;

  create<S extends Store = Store>(type: string, options?: any): S {
    return <S>new Stores[type](options);
  }

  //
  remove(name: string) {
    delete this.stores[name];
    return this;
  }

  //
  // ### function remove (name)
  // #### @name {string} Name of the store to remove from this instance
  // Removes a store with the specified `name` from this instance. Users
  // are allowed to pass in a type argument (e.g. `memory`) as name if
  // this was used in the call to `.add()`.

  get(): T;

  get<K extends keyof T>(key: K): T[K];

  get<K extends keyof T, Default = unknown>(key: K, defaultValue: Default): T[K] | Default;

  get(key?: string, defaultValue?: unknown): unknown {
    //
    // Otherwise the asynchronous, hierarchical `get` is
    // slightly more complicated because we do not need to traverse
    //
    // the entire set of stores, but up until there is a defined value.
    const names = Object.keys(this.stores);
    const objs: any[] = [];

    for (const name of names) {
      const value = this.stores[name].get(key);
      if (value === undefined) {
        continue;
      }
      if (!isPlainObject(value) && !objs.length) {
        return <T>value;
      }
      objs.push(value);
    }

    if (objs.length) {
      if (objs.length === 1) {
        return objs[0];
      }
      return <T>merge(objs.reverse());
    }
    return defaultValue;
  }

  //
  any(...keys: string[]): any;

  //
  // ### function any (keys, callback)
  // #### @keys {array|string...} Array of keys to query, or a variable list of strings
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Retrieves the first truthy value (if any) for the specified list of keys.

  any(keys: string[]): any;

  any(...keys: any[]): any {
    if (Array.isArray(keys[0])) {
      keys = keys[0];
    }

    for (const key of keys) {
      const value = this.get(key);
      if (value != null) {
        return value;
      }
    }
  }

  set(obj: Partial<T>): boolean | undefined;

  //
  // ### function set (key, value, callback)
  // #### @key {string} Key to set in this instance
  // #### @value {literal|Object} Value for the specified key
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Sets the `value` for the specified `key` in this instance.
  //

  set<K extends keyof T>(key: K, value: T[K]): boolean | undefined;

  set(key: string, value: any): boolean | undefined;

  set(key: string | any, value?: any): boolean | undefined {
    return traverseSync(this.stores, store => {
      if (!store.readOnly) {
        return store.set(key, value);
      }
    });
  }

  // Throws an error if any of `keys` has no value, otherwise returns `true`
  required(keys: string[]) {
    const missing: string[] = [];
    for (const key of keys) {
      if (this.get(key) === undefined) {
        missing.push(key);
      }
    }
    if (missing.length) {
      throw new Error('Missing required keys: ' + missing.join(', '));
    }
    return this;
  }

  //
  // ### function required (keys)
  // #### @keys {array} List of keys

  //
  reset(): boolean | undefined {
    return traverseSync(this.stores, store => store.reset());
  }

  //
  // ### function reset (callback)
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Clears all keys associated with this instance.

  //
  clear(key: string): boolean | undefined {
    return traverseSync(this.stores, store => store.clear(key));
  }

  //
  // ### function clear (key, callback)
  // #### @key {string} Key to remove from this instance
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Removes the value for the specified `key` from this instance.

  //
  merge(key: Record<string, any>): boolean | undefined;

  //
  // ### function merge ([key,] value [, callback])
  // #### @key {string} Key to merge the value into
  // #### @value {literal|Object} Value to merge into the key
  // #### @callback {function} **Optional** Continuation to respond to when complete.
  // Merges the properties in `value` into the existing object value at `key`.
  //
  // 1. If the existing value `key` is not an Object, it will be completely overwritten.
  // 2. If `key` is not supplied, then the `value` will be merged into the root.

  merge(key: string, value: any): boolean | undefined;

  merge(key: string | Record<string, any>, value?: any): boolean | undefined {
    if (typeof key === 'string' && value !== undefined) {
      return traverseSync(this.stores, store => store.merge(key, value));
    }
    if (isPlainObject(key)) {
      const names = Object.keys(key);
      for (const name of names) {
        if (this.merge(name, key[name]) !== true) {
          return false;
        }
      }
      return true;
    }

    throw new Error('Cannot merge non-object into top-level.');
  }

  //
  async load(): Promise<T> {
    if (this.sources.length) {
      const sourceHierarchy = this.sources.splice(0);
      sourceHierarchy.reverse();

      const data = merge(await Promise.all(sourceHierarchy.map(store => store.load())));
      if (data && typeof data === 'object') {
        this.use('sources', {
          type: 'literal',
          store: data,
        });
      }
    }

    const stores = Object.values(this.stores).reverse();
    const objs = await Promise.all(stores.map(store => store.load()));
    return merge(objs);
  }

  //
  // ### function load (callback)
  // Responds with an Object representing all keys associated in this instance.

  loadSync(): Record<string, any> {
    if (this.sources.length) {
      const sourceHierarchy = this.sources.splice(0).reverse();
      const data = merge(sourceHierarchy.map(store => store.loadSync()));
      if (data && typeof data === 'object') {
        this.use('sources', {
          type: 'literal',
          store: data,
        });
      }
    }

    const stores = Object.values(this.stores).reverse();
    return merge(stores.map(store => store.loadSync()));
  }

  //
  async save(codec?: Codec): Promise<Record<string, any>> {
    return merge(
      (await Promise.all(Object.values(this.stores).map(store => store.save(codec)))).filter(
        data => data && typeof data === 'object',
      ),
    );
  }

  //
  // ### function save (callback)
  // complete.
  // Instructs each config to save.  If a callback is provided, we will attempt
  // asynchronous saves on the configs, falling back to synchronous saves if
  // this isn't possible.  If a config does not know how to save, it will be
  // ignored.  Returns an object consisting of all of the data which was
  // actually saved.

  saveSync(codec?: Codec): Record<string, any> {
    return merge(
      Object.values(this.stores)
        .map(store => store.saveSync(codec))
        .filter(data => data && typeof data === 'object'),
    );
  }

  //
  protected init() {
    //
    // Add any stores passed in through the options
    // to this instance.
    //
    if (this.options.type) {
      this.add(this.options.type, this.options);
    } else if (this.options.store) {
      this.add(this.options.store.type, this.options.store);
    } else if (this.options.stores) {
      for (const name of Object.keys(this.options.stores)) {
        const store = this.options.stores[name];
        this.add(name, store);
      }
    }

    //
    // Add any read-only sources to this instance
    //
    if (this.options.source) {
      this.sources.push(this.create(this.options.source.type, this.options.source));
    } else if (this.options.sources) {
      for (const name of Object.keys(this.options.sources)) {
        const source = this.options.sources[name];
        this.sources.push(this.create(source.type || name, source));
      }
    }
  }
}

export const conf = new Conf();
