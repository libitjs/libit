import {expect, sinon} from '@loopback/testlab';
import {debounce} from '..';

describe('@debounce()', () => {
  class Test {
    @debounce(100)
    log(...args: unknown[]) {
      console.log('Logged!', ...args);
    }
  }

  let clock: sinon.SinonFakeTimers;
  let stub: sinon.SinonStub;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    stub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    stub.restore();
    clock.restore();
  });

  it('errors if applied to a class', () => {
    expect(() => {
      // @ts-expect-error: ignore
      @debounce(100)
      class TestClass {}

      return TestClass;
    }).throw(TypeError);
  });

  it.skip('errors if applied to a property', () => {
    expect(
      () =>
        class TestProp {
          // @ts-expect-error: ignore
          @debounce(100)
          value = 123;
        },
    ).throw(Error);
  });

  it('logs only after the delay', () => {
    const test = new Test();

    test.log();

    sinon.assert.notCalled(stub);

    test.log();

    sinon.assert.notCalled(stub);

    clock.tick(150);

    expect(stub.calledWith('Logged!')).true();
    sinon.assert.calledOnce(stub);
  });

  it('passes arguments through', () => {
    const test = new Test();

    test.log(1, 2);
    test.log(3, 4);
    test.log(5, 6);

    clock.tick(150);

    expect(stub.calledWith('Logged!', 5, 6)).true();
    sinon.assert.calledOnce(stub);
  });
});

describe('@debounce.reducible()', () => {
  class ReducibleTest {
    private readonly _handle: Function;

    constructor(fn: Function) {
      this._handle = fn;
    }

    @debounce.reducible(100, (a: number, b: number) => a + b, () => 0)
    report(p: number): void {
      this._handle(p);
    }
  }

  const spy: sinon.SinonSpy = sinon.spy();
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('should work', function () {
    const t = new ReducibleTest(spy);

    t.report(1);
    t.report(2);
    t.report(3);
    expect(spy.args).deepEqual([]);

    clock.tick(200);
    expect(spy.args).deepEqual([[6]]);
    spy.resetHistory();

    t.report(4);
    t.report(5);
    clock.tick(50);
    t.report(6);

    expect(spy.args).deepEqual([]);
    clock.tick(60);
    expect(spy.args).deepEqual([]);
    clock.tick(50);
    expect(spy.args).deepEqual([[15]]);
  });
});
