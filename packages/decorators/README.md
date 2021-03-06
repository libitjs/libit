# @libit/decorators

> Experimental decorators for common patterns.
>
> This package is initial forked from [boost](https://github.com/milesj/boost)

## `@bindthis`

> bindthis(): MethodDecorator

Automatically binds a class method's `this` context to its current instance, even when the method is dereferenced, which
is the primary use-case for this decorator. This is an alternative to manually `bind()`ing within the constructor, or
using class properties with anonymous functions.

```ts
import {bindthis} from '@libit/decorators';

class Example {
  @bindthis()
  static test() {
    return this; // Class constructor
  }

  @bindthis()
  test() {
    return this; // Class instance
  }
}

const example = new Example();
const {test} = example;

example.test() == test(); // true
```

## `@debounce`

> debounce(delay: number): MethodDecorator

Delays the execution of the class method by the provided time in milliseconds. If another method call occurs within this
timeframe, the execution delay will be reset.

```ts
import {debounce} from '@libit/decorators';

class Example {
  @debounce(250)
  log() {
    console.log('Fired!');
  }
}

const example = new Example();

example.log(); // Will not log
example.log(); // Will not log
example.log(); // Will log after 250ms
```

> Debouncing only works on methods with no return.

## `@deprecate`

> deprecate(message?: string): Decorator

Marks a class declaration, class method, class property, or method parameter as deprecated by logging a deprecation
message to the console. Works for both static and instance members.

```ts
import {deprecate} from '@libit/decorators';

@deprecate()
class Example {
  @deprecate()
  static property = 123;

  @deprecate('Can provide a custom message')
  method() {}
}
```

## `@memoize`

> memoize(options?: MemoizeHasher | MemoizeOptions): MethodDecorator

Caches the return value of a class method or getter to consistently and efficiently return the same value. By default,
hashes the method's arguments to determine a cache key, but can be customized with a unique hashing function.

Memoization also works on async/promise based methods by caching the promise itself. However, if the promise is
rejected, the cache will be deleted so that subsequent calls can refresh itself.

```ts
import {memoize} from '@libit/decorators';

class Example {
  @memoize()
  someExpensiveOperation() {
    // Return some value
  }

  @memoize({expires: 3600})
  async fetchInBackground() {
    // Return some async value with an expiration time
  }
}

const example = new Example();

example.someExpensiveOperation(); // Will run and cache result
example.someExpensiveOperation(); // Will return cached result
example.someExpensiveOperation(); // Will return cached result
```

The memoize decorator supports the following options:

- `cache` (`MemoizeCache<T>`) - A custom `Map` instance to store cached values. Can also be used to pre-cache expected
  values.
- `expires` (`number`) - Time in milliseconds in which to keep the cache alive (TTL). Pass `0` to cache indefinitely.
  Defaults to `0`.
- `hasher` (`MemoizeHasher`) - A hashing function to determine the cache key. Is passed the method's arguments and must
  return a string. If not provided, arguments are hashed using `JSON.stringify()`.

## `@throttle`

> throttle(delay: number): MethodDecorator

Throttles the execution of a class method to only fire once within every delay timeframe (in milliseconds). Will always
fire on the first invocation.

```ts
import {throttle} from '@libit/decorators';

class Example {
  @throttle(100)
  log() {
    console.log('Fired!');
  }
}

const example = new Example();

example.log(); // Will log
example.log(); // Will not log
example.log(); // Will not log

// 100ms pass
example.log(); // Will log
```

> Throttling only works on methods with no return.
