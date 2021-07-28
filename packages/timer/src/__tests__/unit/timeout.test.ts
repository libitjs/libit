import {expect, sinon} from '@loopback/testlab';
import BluebirdPromise from 'bluebird';
import {TimeoutTimer} from '../../timeout';

describe('TimeoutTimer', function() {
  const OriginalPromise = Promise;
  let clock: sinon.SinonFakeTimers;

  beforeEach(async () => {
    // lolex fake clock
    clock = sinon.useFakeTimers();
    // eslint-disable-next-line no-global-assign
    Promise = BluebirdPromise as any;
    BluebirdPromise.setScheduler(fn => fn());
  });

  afterEach(async () => {
    clock.restore();
    // eslint-disable-next-line no-global-assign
    Promise = OriginalPromise;
  });

  it('should set and cancel successfully with a synchronous handler', () => {
    const timer = new TimeoutTimer();
    timer.setIfNotSet(() => {
    }, 1000);
    timer.cancel();
  });

  it('should set and cancel successfully with an asynchronous handler', () => {
    const timer = new TimeoutTimer();
    timer.setIfNotSet(async () => {
    }, 1000);
    timer.cancel();
  });

  it('should keep silent if an error occurs during execution', async () => {
    const spy = sinon.spy();
    const timer = new TimeoutTimer(async () => {
      spy();
      throw new Error('Some error.');
    }, 1000);

    expect(timer.running).is.true();

    clock.runToLast();

    expect(spy.called).ok();
    expect(timer.running).is.false();
  });

  it('setIfNotSet', function() {
    const spies = [sinon.spy(), sinon.spy()];
    const timer = new TimeoutTimer(async () => spies[0](), 1000);
    timer.setIfNotSet(async () => spies[1](), 1000);
    clock.runToLast();
    expect(spies[0].called).ok();
  });

  it('cancelAndSet', function() {
    const spies = [sinon.spy(), sinon.spy()];
    const timer = new TimeoutTimer(async () => spies[0](), 1000);
    timer.cancelAndSet(async () => spies[1](), 1000);
    clock.runToLast();
    expect(spies[1].called).ok();
  });
});
