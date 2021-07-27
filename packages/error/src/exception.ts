/**
 * Allows to easily extend a base class to create custom applicative errors.
 *
 * example:
 * ```
 * class HttpError extends Exception {
 * 	public constructor(
 * 		public code: number,
 * 		message?: string,
 * 	) {
 * 		super(message)
 * 	}
 * }
 *
 * new HttpError(404, 'Not found')
 * ```
 */
export class Exception extends Error {
  name: string;

  constructor(message?: string) {
    super(message);
    // set error name as constructor name, make it not enumerable to keep native Error behavior
    Object.defineProperty(this, 'name', {
      value: new.target.name,
      writable: true,
      enumerable: false,
      configurable: true,
    });
    // fix the extended error prototype chain
    // because typescript __extends implementation can't
    // see https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    fixProto(this, new.target.prototype);
    // try to remove constructor from stack trace
    fixStack(this);
  }
}

/**
 * Fix the prototype chain of the error
 *
 * Use Object.setPrototypeOf
 * Support ES6 environments
 *
 * Fallback setting __proto__
 * Support IE11+, see https://docs.microsoft.com/en-us/scripting/javascript/reference/javascript-version-information
 */
export function fixProto(target: Error, prototype: {}) {
  const setPrototypeOf: Function = (Object as any).setPrototypeOf;
  if (setPrototypeOf) {
    setPrototypeOf(target, prototype);
  } else {
    (target as any).__proto__ = prototype;
  }
}

/**
 * Capture and fix the error stack when available
 *
 * Use Error.captureStackTrace
 * Support v8 environments
 */
export function fixStack(target: Error, fn: Function = target.constructor) {
  const captureStackTrace: Function = (Error as any).captureStackTrace;
  if (captureStackTrace) {
    captureStackTrace(target, fn);
  }
}
