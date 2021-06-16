import {DebounceReducer} from './types';
import isMethod from './utils/is-method';

/* eslint-disable @typescript-eslint/no-shadow */

export function throttle(delay: number): MethodDecorator {
  return (target, property, descriptor) => {
    // if (__DEV__) {
    if (!isMethod(target, property, descriptor) || !('value' in descriptor && typeof descriptor.value === 'function')) {
      throw new TypeError(`\`@throttle\` may only be applied to class methods.`);
    }
    // }

    // We must use a map as all class instances would share the
    // same boolean value otherwise.
    const throttling = new WeakMap<Function, boolean>();

    // Overwrite the value function with a new throttled function
    const fn = descriptor.value;

    // @ts-expect-error: ignore this
    descriptor.value = function throttle(this: Function, ...args: unknown[]) {
      if (throttling.get(this)) {
        return;
      }

      fn.apply(this, args);
      throttling.set(this, true);

      setTimeout(() => {
        throttling.delete(this);
      }, delay);
    };
  };
}

export namespace throttle {
  interface ThrottleReducibleCache<T> {
    timer?: NodeJS.Timeout;
    value?: T;
    last?: number;
    pending?: boolean;
  }

  export function reducible<T>(
    delay: number,
    reducer?: DebounceReducer<T>,
    initialValueProvider?: () => T,
  ): MethodDecorator {
    return (target, property, descriptor) => {
      // if (__DEV__) {
      if (
        !isMethod(target, property, descriptor) ||
        !('value' in descriptor && typeof descriptor.value === 'function')
      ) {
        throw new TypeError(`\`@throttle\` may only be applied to class methods.`);
      }
      // }

      // We must use a map as all class instances would share the
      // same boolean value otherwise.
      const throttling = new WeakMap<Function, ThrottleReducibleCache<T>>();

      // Overwrite the value function with a new throttled function
      const fn = descriptor.value;

      // @ts-expect-error: ignore this
      descriptor.value = function throttle(this: Function, ...args: unknown[]) {
        if (!throttling.has(this)) {
          throttling.set(this, {value: initialValueProvider?.()});
        }

        const cache = throttling.get(this)!;

        if (cache.last == null) {
          cache.last = -Number.MAX_VALUE;
        }

        if (reducer) {
          cache.value = reducer(cache.value!, ...args);
        }

        if (cache.pending) {
          return;
        }

        const nextTime = cache.last + delay;
        if (nextTime <= Date.now()) {
          cache.last = Date.now();
          fn.apply(this, [cache.value]);
          cache.value = initialValueProvider ? initialValueProvider() : undefined;
        } else {
          cache.pending = true;
          cache.timer = setTimeout(() => {
            cache.pending = false;
            cache.last = Date.now();
            fn.apply(this, [cache.value]);
            cache.value = initialValueProvider ? initialValueProvider() : undefined;
          }, nextTime - Date.now());
        }
      };
    };
  }
}
