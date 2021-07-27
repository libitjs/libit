import {ChainedError} from '../../chained';

export class AChainedError extends ChainedError {
  public constructor(msg: string, cause?: Error) {
    super(msg, cause);
  }
}

export class BChainedError extends ChainedError {
  public constructor(msg: string, cause?: Error) {
    super(msg, cause);
  }
}

export class CChainedError extends ChainedError {
  public constructor(msg: string, cause?: Error) {
    super(msg, cause);
  }
}
