import {AggregateError} from '../../aggregate';
import {expect} from '@loopback/testlab';

describe('AggregateError', function () {
  it('main', function () {
    const error = new AggregateError([
      new Error('foo'),
      'bar',
      {
        message: 'baz',
        code: 'EBAZ',
      },
      {
        code: 'EQUX',
      },
    ]);

    // console.log(error);

    expect(error.message).match(/Error: foo\n {8}at /);
    expect(error.message).match(/Error: bar\n {8}at /);

    expect([...error.errors]).deepEqual([
      new Error('foo'),
      new Error('bar'),
      Object.assign(new Error('baz'), {code: 'EBAZ'}),
      Object.assign(new Error(), {code: 'EQUX'}),
    ]);
  });

  it('gracefully handle Error instances without a stack', function () {
    class StacklessError extends Error {
      constructor(...args: any[]) {
        super(...args);
        this.name = this.constructor.name;
        delete this.stack;
      }
    }

    const error = new AggregateError([new Error('foo'), new StacklessError('stackless')]);

    // console.log(error);

    expect(error.message).match(/Error: foo\n {8}at /);
    expect(error.message).match(/StacklessError: stackless/);

    expect([...error.errors]).deepEqual([new Error('foo'), new StacklessError('stackless')]);
  });
});
