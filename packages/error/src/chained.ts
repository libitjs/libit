import {cleanStack} from './clean-stack';
import {Exception} from './exception';
import {ErrorLike, isErrorLike} from './types';
import {toError} from './utils';

export type Cause = ErrorLike;

export interface ChainedErrorOptions {
  cleanStack?: boolean;
}

export class ChainedError extends Exception {
  cause: Error;

  constructor(cause: Cause, options?: ChainedErrorOptions);
  constructor(message: string, cause?: Cause, options?: ChainedErrorOptions);
  constructor(
    messageOrCause: string | Cause,
    causeOrOptions?: Cause | ChainedErrorOptions,
    options?: ChainedErrorOptions,
  ) {
    super();
    let cause: Error;
    if (isErrorLike(causeOrOptions)) {
      cause = toError(causeOrOptions);
      this.message = messageOrCause as string;
    } else {
      cause = toError(messageOrCause);
      this.message = cause.message;
    }

    this.stack = appendToStack(this.stack, cause, options);

    Object.defineProperty(this, 'cause', {
      value: cause,
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
