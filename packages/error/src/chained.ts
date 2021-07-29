import {cleanStack} from './clean-stack';
import {Exception} from './exception';
import {ErrorLike, isErrorLike} from './types';
import {toError} from './utils';

export type Cause = ErrorLike;

export interface ChainedErrorOptions {
  cleanStack?: boolean;
}

export class ChainedError extends Exception {
  cause: Cause;

  constructor(messageOrCause: Cause, options?: ChainedErrorOptions);
  constructor(message: string, cause?: Cause, options?: ChainedErrorOptions);
  constructor(message: string | Cause, cause?: Cause | ChainedErrorOptions, options?: ChainedErrorOptions) {
    super();
    let inner: any;
    if (isErrorLike(cause)) {
      inner = toError(cause);
      this.message = message as string;
    } else if (isErrorLike(message)) {
      if (typeof message !== 'string') {
        inner = toError(message);
      }
      this.message = typeof message === 'string' ? message : message.message!;
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
