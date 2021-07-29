import indentString from 'indent-string';
import {cleanStack} from './clean-stack';
import {ErrorLike} from './types';
import {toError} from './utils';

const cleanInternalStack = (stack: string) => stack.replace(/\s+at .*aggregate-error\/index.js:\d+:\d+\)?/g, '');

export class AggregateError extends Error {
  name = 'AggregateError';
  #errors;

  constructor(errs: ErrorLike[]) {
    super();
    if (!Array.isArray(errs)) {
      throw new TypeError(`Expected input to be an Array, got ${typeof errs}`);
    }

    const errors = errs.map(toError);

    let message = errors
      .map(error => {
        // The `stack` property is not standardized, so we can't assume it exists
        return typeof error.stack === 'string' ? cleanInternalStack(cleanStack(error.stack)) : String(error);
      })
      .join('\n');
    message = '\n' + indentString(message, 4);

    this.message = message;
    this.#errors = errors;
  }

  get errors() {
    return this.#errors.slice();
  }
}
