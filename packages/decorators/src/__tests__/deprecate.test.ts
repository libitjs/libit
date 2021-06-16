import {expect, sinon} from '@loopback/testlab';
import {deprecate} from '..';

describe('@deprecate', () => {
  let stub: sinon.SinonStub;

  beforeEach(() => {
    stub = sinon.stub(console, 'debug');
  });

  afterEach(() => {
    stub.restore();
  });

  it('marks a class as deprecated', () => {
    @deprecate()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}

    expect(stub.calledWith('Class `Test` has been deprecated.')).true();
  });

  it('marks a class as deprecated with a custom message', () => {
    @deprecate('Use something else!')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {}

    expect(stub.calledWith('Use something else!')).true();
  });

  it('marks a method as deprecated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      @deprecate()
      static staticMethod() {}

      @deprecate()
      instMethod() {}
    }

    expect(stub.calledWith('Method `Test.staticMethod()` has been deprecated.')).true();
    expect(stub.calledWith('Method `Test#instMethod()` has been deprecated.')).true();
  });

  it('marks a method as deprecated with a custom message', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      @deprecate('Use another static')
      static staticMethod() {}

      @deprecate('Use another instance')
      instMethod() {}
    }

    expect(stub.calledWith('Use another static')).true();
    expect(stub.calledWith('Use another instance')).true();
  });

  it('marks a property as deprecated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      @deprecate()
      static staticProp = 123;

      @deprecate()
      instProp = 'abc';
    }

    expect(stub.calledWith('Property `Test.staticProp` has been deprecated.')).true();
    expect(stub.calledWith('Property `Test#instProp` has been deprecated.')).true();
  });

  it('marks a property as deprecated with a custom message', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    class Test {
      @deprecate('Use another static')
      static staticProp = 123;

      @deprecate('Use another instance')
      instProp = 'abc';
    }

    expect(stub.calledWith('Use another static')).true();
    expect(stub.calledWith('Use another instance')).true();
  });
});
