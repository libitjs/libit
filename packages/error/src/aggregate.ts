import {cleanStack} from './clean-stack';
import indentString from 'indent-string';

const cleanInternalStack = (stack: string) => stack.replace(/\s+at .*aggregate-error\/index.js:\d+:\d+\)?/g, '');

export type ErrorLike =
  | Error
  | string
  | {
      code?: string | number;
      message?: string;
      [p: string]: any;
    };

export class AggregateError extends Error {
  name = 'AggregateError';
  #errors;

  constructor(errs: ErrorLike[]) {
    super();
    if (!Array.isArray(errs)) {
      throw new TypeError(`Expected input to be an Array, got ${typeof errs}`);
    }

    const errors = errs.map(error => {
      if (error instanceof Error) {
        return error;
      }

      if (error !== null && typeof error === 'object') {
        // Handle plain error objects with message property and/or possibly other metadata
        return Object.assign(new Error(error.message), error) as Error;
      }

      return new Error(error);
    });

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
