import {ErrorLike} from './types';

export function toError(error: ErrorLike) {
  if (error instanceof Error) {
    return error;
  }

  if (error !== null && typeof error === 'object') {
    // Handle plain error objects with message property and/or possibly other metadata
    return Object.assign(new Error(error.message), error) as Error;
  }

  return new Error(error);
}
