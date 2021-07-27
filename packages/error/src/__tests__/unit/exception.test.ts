import {expect} from '@loopback/testlab';
import {checkProperties, checkProtoChain} from '../support';
import {Exception} from '../../exception';

describe('custom', function () {
  it('Instance', () => checkProtoChain(Exception, Error));

  it('Instance pre ES6 environment', () => {
    const O = Object as any;
    const E = Error as any;
    const setPrototypeOf = O.setPrototypeOf;
    const captureStackTrace = E.captureStackTrace;
    delete O.setPrototypeOf;
    delete E.captureStackTrace;

    checkProtoChain(Exception, Error);
    checkProperties(new Exception(), {
      name: 'Exception',
      message: '',
    });
    O.setPrototypeOf = setPrototypeOf;
    E.captureStackTrace = captureStackTrace;
  });

  it('Extended', () => {
    class SubError extends Exception {}
    checkProtoChain(SubError, Exception, Error);
    checkProperties(new SubError('test message'), {
      name: 'SubError',
      message: 'test message',
    });
  });

  it('Extended with constructor', () => {
    class HttpError extends Exception {
      constructor(public code: number, message?: string) {
        super(message);
      }
    }
    checkProtoChain(HttpError, Exception, Error);
    checkProperties(new HttpError(404, 'test message'), {
      name: 'HttpError',
      code: 404,
      message: 'test message',
    });
  });

  it('Extended with name', () => {
    class RenamedError extends Exception {
      constructor(name: string, message?: string) {
        super(message);
        Object.defineProperty(this, 'name', {value: name});
      }
    }
    checkProtoChain(RenamedError, Exception, Error);
    checkProperties(new RenamedError('test', 'test message'), {
      name: 'test',
      message: 'test message',
    });
  });

  it('Basic properties', () =>
    checkProperties(new Exception('my message'), {
      name: 'Exception',
      message: 'my message',
    }));

  it('Without message', () =>
    checkProperties(new Exception(), {
      name: 'Exception',
      message: '',
    }));

  it('Native log behaviour', () => expect(`${new Exception('Hello')}`).match('Exception: Hello'));
});
