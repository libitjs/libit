import isMethod from './utils/is-method';
import {DebounceReducer} from './types';
/* eslint-disable @typescript-eslint/no-shadow */
export function debounce(delay: number): MethodDecorator {
  return (target, property, descriptor) => {
    // if (__DEV__) {
    if (!isMethod(target, property, descriptor) || !('value' in descriptor && typeof descriptor.value === 'function')) {
      throw new TypeError(`\`@Debounce\` may only be applied to class methods.`);
    }
    // }

    // We must use a map as all class instances would share the
    // same timer value otherwise.
    const timers = new WeakMap<Function, NodeJS.Timeout>();

    // Overwrite the value function with a new debounced function
    const fn = descriptor.value;

    // @ts-expect-error: ignore
    descriptor.value = function debounce(this: Function, ...args: unknown[]) {
      const timer = timers.get(this);

      if (timer) {
        clearTimeout(timer);
        timers.delete(this);
      }

      timers.set(
        this,
        setTimeout(() => {
          fn.apply(this, args);
        }, delay),
      );
    };
  };
}

export namespace debounce {
  interface DebounceReducibleCache<T> {
    timer?: NodeJS.Timeout;
    value?: T;
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
        throw new TypeError(`\`@Debounce\` may only be applied to class methods.`);
      }
      // }

      // We must use a map as all class instances would share the
      // same timer value otherwise.
      const caches = new WeakMap<Function, DebounceReducibleCache<T>>();

      // Overwrite the value function with a new debounced function
      const fn = descriptor.value;

      // @ts-expect-error: ignore
      descriptor.value = function debounce(this: Function, ...args: unknown[]) {
        if (!caches.has(this)) {
          caches.set(this, {value: initialValueProvider?.()});
        }
        const cache = caches.get(this)!;

        if (cache.timer) {
          clearTimeout(cache.timer);
          delete cache.timer;
        }

        if (reducer) {
          cache.value = reducer(cache.value!, ...args);
          args = [cache.value];
        }

        cache.timer = setTimeout(() => {
          fn.apply(this, args);
          cache.value = initialValueProvider ? initialValueProvider() : undefined;
        }, delay);
      };
    };
  }
}
