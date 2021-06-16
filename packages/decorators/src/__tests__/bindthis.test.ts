import {expect} from '@loopback/testlab';
import {bindthis} from '..';

describe('@bindthis()', () => {
  class Test {
    value: string;

    constructor(value = 'abc') {
      this.value = value;
    }

    @bindthis()
    getValue(): string {
      return this.value;
    }

    @bindthis()
    async getAsyncValue(): Promise<string> {
      const value = await Promise.resolve(this.value);

      return value;
    }

    @bindthis()
    setValue(value: string) {
      this.value = value;

      return this;
    }
  }

  it('errors if applied to a class', () => {
    expect(() => {
      // @ts-expect-error: ignore
      @bindthis()
      class TestClass {}

      return TestClass;
    }).throw(TypeError);
  });

  it.skip('errors if applied to a property', () => {
    expect(
      () =>
        class TestProp {
          // @ts-expect-error: ignore
          @bindthis()
          value = 123;
        },
    ).throw(TypeError);
  });

  it('binds methods to an instance', async () => {
    const test = new Test();
    const {getValue, getAsyncValue} = test;

    expect(getValue()).equal('abc');
    expect(await getAsyncValue()).equal('abc');
  });

  it('binds method only once', () => {
    const test = new Test();
    const {getValue, getAsyncValue} = test;

    expect(test.getValue).equal(test.getValue);
    expect(test.getValue).equal(getValue);
    expect(test.getAsyncValue).equal(test.getAsyncValue);
    expect(test.getAsyncValue).equal(getAsyncValue);
  });

  it('doesnt leak to separate instances', async () => {
    const a = new Test('a');
    const b = new Test('b');
    const c = new Test('c');

    expect(a.getValue()).not.equal(b.getValue());
    expect(await b.getAsyncValue()).not.equal(await c.getAsyncValue());
  });

  it('allows sub-classes to overwrite', () => {
    class TestSub extends Test {
      getValue() {
        return 'xyz';
      }
    }

    const a = new Test();
    const b = new TestSub();
    const {getValue} = b;

    expect(a.getValue()).equal('abc');
    expect(b.getValue()).equal('xyz');
    expect(b.getValue()).equal(getValue());
  });

  it('allows sub-classes to overwrite and bind', () => {
    class TestSub extends Test {
      @bindthis()
      getValue() {
        return 'xyz';
      }
    }

    const a = new Test();
    const b = new TestSub();
    const {getValue} = b;

    expect(a.getValue()).equal('abc');
    expect(b.getValue()).equal('xyz');
    expect(b.getValue()).equal(getValue());
  });

  it('allows setters to work correctly', () => {
    const test = new Test();
    const {setValue} = test;

    expect(test.getValue()).equal('abc');

    expect(setValue('xyz')).equal(test);

    expect(test.getValue()).equal('xyz');
  });

  it('allows sub-class overwritten setters to work correctly', () => {
    class TestSub extends Test {
      @bindthis()
      setValue(value: string) {
        this.value = `inherited ${value}`;

        return this;
      }
    }

    const a = new Test();
    const b = new TestSub();

    a.setValue('abc');

    expect(a.getValue()).equal('abc');
    expect(b.getValue()).equal('abc');

    b.setValue('xyz');

    expect(a.getValue()).equal('abc');
    expect(b.getValue()).equal('inherited xyz');
  });

  it('doesnt break parent super calls', () => {
    class TestSub extends Test {
      @bindthis()
      getValue() {
        return `${super.getValue()} child`;
      }
    }

    const a = new Test('a');
    const b = new TestSub('b');
    const {getValue} = b;

    expect(a.getValue()).equal('a');
    expect(b.getValue()).equal('b child');
    expect(b.getValue()).equal(getValue());
  });

  it('supports static methods', () => {
    class StaticTest {
      @bindthis()
      static test() {
        expect(this).equal(StaticTest);
      }
    }

    StaticTest.test();
  });
});
