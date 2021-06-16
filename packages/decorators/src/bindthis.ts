import isMethod from './utils/is-method';

export function bindthis(): MethodDecorator {
  return (target, property, descriptor) => {
    // if (__DEV__) {
    if (!isMethod(target, property, descriptor) || !('value' in descriptor && typeof descriptor.value === 'function')) {
      throw new TypeError(`\`@bindthis\` may only be applied to class methods.`);
    }
    // }

    const fn = descriptor.value;

    return {
      configurable: true,
      get(this: Function) {
        const bound = fn.bind(this);

        // Only cache the bound function when in the deepest sub-class,
        // otherwise any `super` calls will overwrite each other.
        if (target.constructor.name === this.constructor.name) {
          Object.defineProperty(this, property, {
            configurable: true,
            value: bound,
            writable: true,
          });
        }

        return bound;
      },
    };
  };
}
