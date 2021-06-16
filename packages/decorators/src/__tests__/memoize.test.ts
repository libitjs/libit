import {expect, sinon} from '@loopback/testlab';
import {memoize} from '..';

function sleep(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, time);
  });
}

describe('@memoize()', () => {
  // Date.now() is a bit too deterministic, as tests run so fast
  // and use the same timestamp. We use a counter to increase uniqueness.
  let count = 0;

  class Test {
    spy: sinon.SinonSpy;

    constructor(spy: sinon.SinonSpy) {
      this.spy = spy;
    }

    @memoize()
    noArgs(): number {
      this.spy();

      return Date.now() + this.inc();
    }

    @memoize()
    noArgs2(): number {
      this.spy();

      return Date.now() + this.inc();
    }

    @memoize()
    oneArg(a: string): string {
      this.spy();

      return a.toUpperCase();
    }

    @memoize()
    manyArgs(a: string, b: number, c: boolean): string {
      this.spy();

      return a + b + c;
    }

    @memoize()
    restArgs(...args: unknown[]): number {
      this.spy();

      return Date.now() + this.inc();
    }

    @memoize()
    get getter(): number {
      this.spy();

      return Date.now() + this.inc();
    }

    inc(): number {
      count += 1;

      return count;
    }
  }

  it('errors if applied to a class', () => {
    expect(() => {
      // @ts-expect-error: ignore
      @memoize()
      class TestClass {}

      return TestClass;
    }).throw(TypeError);
  });

  it.skip('errors if applied to a property', () => {
    expect(
      () =>
        class TestProp {
          // @ts-expect-error: ignore
          @memoize()
          value = 123;
        },
    ).throw(TypeError);
  });

  it('errors if `cache` is not a map', () => {
    expect(() => {
      class TestClass {
        // @ts-expect-error: ignore
        @memoize({cache: {}})
        test() {}
      }

      return TestClass;
    }).throw(Error);
  });

  it('errors if `expires` is not a number', () => {
    expect(() => {
      class TestClass {
        // @ts-expect-error: ignore
        @memoize({expires: 'abc'})
        test() {}
      }

      return TestClass;
    }).throw(Error);
  });

  it('errors if `expires` is negative', () => {
    expect(() => {
      class TestClass {
        @memoize({expires: -123})
        test() {}
      }

      return TestClass;
    }).throw(Error);
  });

  it('errors if `hasher` is not a function', () => {
    expect(() => {
      class TestClass {
        // @ts-expect-error: ignore
        @memoize({hasher: 123})
        test() {}
      }

      return TestClass;
    }).throw(TypeError);
  });

  it('doesnt leak to separate instances', () => {
    const spy1 = sinon.spy();
    const spy2 = sinon.spy();

    const a = new Test(spy1);
    const b = new Test(spy2);

    a.noArgs();
    b.noArgs();

    expect(spy1.calledOnce).true();
    expect(spy2.calledOnce).true();
    expect(a).not.equal(b);
  });

  it('caches result for getters', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.getter;
    const b = test.getter;
    const c = test.getter;

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);
  });

  it('caches result for 0 arguments', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.noArgs();
    const b = test.noArgs();
    const c = test.noArgs();

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);
  });

  it('caches result for 1 argument', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.oneArg('abc');
    const b = test.oneArg('abc');
    const c = test.oneArg('abc');

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);

    const d = test.oneArg('xyz');
    const e = test.oneArg('xyz');

    sinon.assert.calledTwice(spy);
    expect(d).not.equal(a);
    expect(e).equal(d);
  });

  it('caches result for many arguments', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.manyArgs('abc', 1, true);
    const b = test.manyArgs('abc', 1, true);
    const c = test.manyArgs('abc', 1, true);

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);

    const d = test.manyArgs('abc', 1, false);
    const e = test.manyArgs('abc', 2, true);
    const f = test.manyArgs('xyz', 1, true);
    const g = test.manyArgs('abc', 1, true);

    expect(spy.callCount).equal(4);
    expect(d).not.equal(a);
    expect(e).not.equal(a);
    expect(f).not.equal(a);
    expect(g).equal(a);
  });

  it('caches result for rest arguments', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.restArgs('abc', 1, true, {});
    const b = test.restArgs('abc', 1, true, {});
    const c = test.restArgs('abc', 1, true, {});

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);

    const d = test.restArgs('abc');
    const e = test.restArgs('abc', 3);
    const f = test.restArgs('xyz', 1, true, {}, []);
    const g = test.restArgs('abc', 1, true, {});

    expect(spy.callCount).equal(4);
    expect(d).not.equal(a);
    expect(e).not.equal(a);
    expect(f).not.equal(a);
    expect(g).equal(a);
  });

  it('returns cache for same object argument structure', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.restArgs({foo: 123});
    const b = test.restArgs({foo: 123});
    const c = test.restArgs({foo: 123});

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);

    const d = test.restArgs({foo: 456});
    const e = test.restArgs({foo: 456});
    const f = test.restArgs({bar: 'abc'});

    sinon.assert.calledThrice(spy);
    expect(d).not.equal(a);
    expect(e).equal(d);
    expect(f).not.equal(a);
    expect(f).not.equal(e);
  });

  it('returns cache for same array argument structure', () => {
    const spy = sinon.spy();
    const test = new Test(spy);

    const a = test.restArgs([123]);
    const b = test.restArgs([123]);
    const c = test.restArgs([123]);

    sinon.assert.calledOnce(spy);
    expect(b).equal(a);
    expect(c).equal(a);

    const d = test.restArgs([456]);
    const e = test.restArgs([456]);
    const f = test.restArgs(['abc']);

    sinon.assert.calledThrice(spy);
    expect(d).not.equal(a);
    expect(e).equal(d);
    expect(f).not.equal(a);
    expect(f).not.equal(e);
  });

  describe('conflict', function () {
    it('should not conflict with other property', () => {
      const spy = sinon.spy();
      const test = new Test(spy);

      const a1 = test.noArgs();
      const a2 = test.noArgs();
      const b1 = test.noArgs2();
      const b2 = test.noArgs2();

      sinon.assert.calledTwice(spy);
      expect(a1).equal(a2);
      expect(b1).equal(b2);
      expect(b1).not.equal(a1);
    });
  });

  describe('cache map', () => {
    it('can provide a custom cache map', () => {
      const spy = sinon.spy();
      const cache = new Map();
      cache.set('[]', {value: 'pre-cached value'});

      class TestCache {
        @memoize({cache})
        method() {
          spy();

          return 'value';
        }
      }

      const test = new TestCache();

      const a = test.method();
      const b = test.method();
      const c = test.method();

      sinon.assert.notCalled(spy);
      expect(a).equal('pre-cached value');
      expect(b).equal(a);
      expect(c).equal(a);
    });
  });

  describe('hash function', () => {
    function hasher() {
      return 'always same key';
    }

    it('can provide a custom hash function', () => {
      const spy = sinon.spy();

      class TestHash {
        @memoize({hasher})
        method(...args: unknown[]) {
          spy();

          return Date.now();
        }
      }

      const test = new TestHash();

      // Differents args (cache key), but same results
      const a = test.method(1, 2, 3);
      const b = test.method('a', 'b', 'c');
      const c = test.method(1, 'a');

      sinon.assert.calledOnce(spy);
      expect(b).equal(a);
      expect(c).equal(a);
    });

    it('can provide a custom hash function by passing it directly to the decorator', () => {
      const spy = sinon.spy();

      class TestHash {
        @memoize(hasher)
        method(...args: unknown[]) {
          spy();

          return Date.now();
        }
      }

      const test = new TestHash();

      // Differents args (cache key), but same results
      const a = test.method(1, 2, 3);
      const b = test.method('a', 'b', 'c');
      const c = test.method(1, 'a');

      sinon.assert.calledOnce(spy);
      expect(b).equal(a);
      expect(c).equal(a);
    });
  });

  describe('expirations', () => {
    it('will bypass cache when an expiration time has passed', async () => {
      const spy = sinon.spy();

      class TestExpires {
        @memoize({expires: 100})
        method() {
          spy();

          return Date.now();
        }
      }

      const test = new TestExpires();

      const a = test.method();
      const b = test.method();
      const c = test.method();

      sinon.assert.calledOnce(spy);
      expect(b).equal(a);
      expect(c).equal(a);

      await sleep(110);

      const d = test.method();
      const e = test.method();
      const f = test.method();

      sinon.assert.calledTwice(spy);
      expect(d).not.equal(a);
      expect(e).equal(d);
      expect(f).equal(d);
    });
  });

  describe('async/promises', () => {
    class TestAsync extends Test {
      @memoize()
      async resolvedPromise() {
        this.spy();

        const value = await Promise.resolve(Date.now());

        return value;
      }

      @memoize()
      async rejectedPromise() {
        this.spy();

        await Promise.resolve(Date.now());

        throw new Error('Failed!');
      }
    }

    it('caches and reuses the same promise', async () => {
      const spy = sinon.spy();
      const test = new TestAsync(spy);

      const a = test.resolvedPromise();
      const b = test.resolvedPromise();
      const c = test.resolvedPromise();

      sinon.assert.calledOnce(spy);
      expect(b).equal(a);
      expect(c).equal(a);

      const result = await a;

      expect(await b).equal(result);
      expect(await c).equal(result);

      const another = await test.resolvedPromise();

      sinon.assert.calledOnce(spy);
      expect(another).equal(result);
    });

    it('deletes the cache if promise is rejected', async () => {
      const spy = sinon.spy();
      const test = new TestAsync(spy);

      const a = test.rejectedPromise();
      const b = test.rejectedPromise();
      const c = test.rejectedPromise();

      sinon.assert.calledOnce(spy);
      expect(b).equal(a);
      expect(c).equal(a);

      try {
        const result = await a;

        // Should not run
        expect(await b).equal(result);
        expect(await c).equal(result);
      } catch {
        // Ignore
      }

      let reached;
      try {
        await test.rejectedPromise();
      } catch {
        sinon.assert.calledTwice(spy);
        reached = true;
      }
      expect(reached).true();
    });
  });
});
