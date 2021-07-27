import {cleanStack} from './clean-stack';
import {Exception} from './exception';

export type Cause = Error | string;

export interface ChainedErrorOptions {
  cleanStack?: boolean;
}

export class ChainedError extends Exception {
  cause: Cause;

  constructor(messageOrCause: Cause, options?: ChainedErrorOptions);
  constructor(message: string, cause?: Cause, options?: ChainedErrorOptions);
  constructor(message: string | Cause, cause?: Cause | ChainedErrorOptions, options?: ChainedErrorOptions) {
    let inner: any;
    if (message instanceof Error) {
      inner = cause = message;
      super(cause.message);
    } else if (cause) {
      super(message);
      if (typeof cause === 'string' || cause instanceof Error) {
        inner = cause;
      } else {
        options = cause;
        cause = undefined;
        inner = cause;
      }
    } else {
      super(message);
      inner = message;
    }

    this.stack = appendToStack(this.stack, cause, options);

    Object.defineProperty(this, 'cause', {
      value: inner,
      writable: true,
      enumerable: false,
      configurable: true,
    });
  }
}

export function appendToStack(stack: string | undefined, cause?: Cause, options?: ChainedErrorOptions): string {
  let newStack = stack || /* istanbul ignore next */ '';
  if (cause) {
    newStack +=
      '\n Caused by: ' + (typeof cause === 'string' ? cause : cause.stack || /* istanbul ignore next */ cause);
  }

  function doCleanStack(stackToClean: string) {
    return cleanStack(stackToClean, {pretty: true});
  }

  if (options?.cleanStack ?? true) {
    newStack = doCleanStack(newStack);
  }

  return newStack;
}
