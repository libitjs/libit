import {expect} from '@loopback/testlab';
import {AChainedError, BChainedError, CChainedError} from '../fixtures/chained-errors';
import {ChainedError} from '../../chained';

describe('chained', function () {
  it('is instanceof Error', () => {
    const chainedError = new AChainedError('m');
    expect(chainedError).instanceOf(Error);
  });

  it('is instanceof ChainedError', () => {
    const chainedError = new AChainedError('m');
    expect(chainedError).instanceOf(ChainedError);
  });

  it('initiate with only error', function () {
    const error = new Error('foo');
    const chainedError = new ChainedError(error);
    expect(chainedError.cause).equal(error);
    expect(chainedError.message).equal(error.message);
  });

  it('initiate with message and options', function () {
    const chainedError = new ChainedError('Boom', {cleanStack: true});
    expect(chainedError.message).equal('Boom');
    expect(chainedError.cause.message).equal('Boom');
  });

  describe('with single cause', () => {
    function thrower() {
      throw new AChainedError('Error in thrower');
    }

    function rethrower() {
      try {
        thrower();
      } catch (error) {
        throw new BChainedError('Error in rethrower', error);
      }
    }

    it('cause is instance of specified error', done => {
      try {
        rethrower();
      } catch (e) {
        expect(e).instanceOf(BChainedError).with.property('cause');
        done();
      }
    });

    it("stack contains cause with it's stack", done => {
      try {
        rethrower();
      } catch (e) {
        expect(e)
          .instanceOf(BChainedError)
          .with.property('stack')
          .match(/Caused by: AChainedError/);
        done();
      }
    });
  });

  describe('with stacked causes', () => {
    function thrower() {
      throw new AChainedError('Error in thrower');
    }

    function rethrower1() {
      try {
        thrower();
      } catch (error) {
        throw new BChainedError('Error in rethrower1', error);
      }
    }

    function rethrower2() {
      try {
        rethrower1();
      } catch (error) {
        throw new CChainedError('Error in rethrower2', error);
      }
    }

    it("stack contains two causes with it's stack", done => {
      try {
        rethrower2();
      } catch (e) {
        expect(e)
          .instanceOf(CChainedError)
          .with.property('stack')
          .match(/Caused by: AChainedError/)
          .and.match(/Caused by: BChainedError/);
        done();
      }
    });
  });

  describe('stack cleaning', () => {
    class CleanStackError extends ChainedError {
      public constructor(msg: string) {
        const causeErr = new Error('Err');
        causeErr.stack += '\n at processTimers (internal/timers.js:500:7)';
        super(msg, causeErr, {cleanStack: true});
      }
    }

    class DirtyStackError extends ChainedError {
      public constructor(msg: string) {
        const causeErr = new Error('Err');
        causeErr.stack += '\n at processTimers (internal/timers.js:500:7)';
        super(msg, causeErr, {cleanStack: false});
      }
    }

    function cleanThrower() {
      throw new CleanStackError('Error in thrower');
    }

    function dirtyThrower() {
      throw new DirtyStackError('Error in thrower');
    }

    it('Cleans stack when Options.cleanStack', done => {
      try {
        cleanThrower();
      } catch (e) {
        expect(e)
          .instanceOf(CleanStackError)
          .with.property('stack')
          .not.match(/processTimers/);
        done();
      }
    });

    it('Does not clean stack when Options.cleanStack', done => {
      try {
        dirtyThrower();
      } catch (e) {
        expect(e)
          .instanceOf(DirtyStackError)
          .with.property('stack')
          .match(/processTimers/);
        done();
      }
    });
  });
});
