import {expect} from '@loopback/testlab';
import {composeInterceptors, GenericInterceptor, GenericInterceptorChain, Next} from '../..';

class Context extends Map<string, any> {}

describe('GenericInterceptorChain', () => {
  let ctx: Context;
  let interceptorChain: GenericInterceptorChain<Context>;
  let events: string[];

  beforeEach(givenContext);

  it('invokes interceptor functions', async () => {
    givenInterceptorChain(givenNamedInterceptor('interceptor1'), givenNamedInterceptor('interceptor2'));
    const result = await interceptorChain.invokeInterceptors();
    expect(events).to.eql(['before-interceptor1', 'before-interceptor2', 'after-interceptor2', 'after-interceptor1']);
    expect(result).to.be.undefined();
  });

  it('invokes an empty chain', async () => {
    givenInterceptorChain();
    const result = await interceptorChain.invokeInterceptors();
    expect(events).to.eql([]);
    expect(result).to.be.undefined();
  });

  it('honors return value', async () => {
    givenInterceptorChain(givenNamedInterceptor('interceptor1'), async (context, next) => {
      await next();
      return 'ABC';
    });
    const result = await interceptorChain.invokeInterceptors();
    expect(result).to.eql('ABC');
  });

  it('honors final handler', async () => {
    givenInterceptorChain(givenNamedInterceptor('interceptor1'), async (context, next) => {
      return next();
    });
    const finalHandler = () => {
      return 'final';
    };
    const result = await interceptorChain.invokeInterceptors(finalHandler);
    expect(result).to.eql('final');
  });

  it('skips downstream interceptors if next is not invoked', async () => {
    givenInterceptorChain(async (context, next) => {
      return 'ABC';
    }, givenNamedInterceptor('interceptor2'));
    await interceptorChain.invokeInterceptors();
    expect(events).to.eql([]);
  });

  it('passes bindings via context', async () => {
    givenInterceptorChain(
      async (context, next) => {
        context.set('foo', '1-req');
        await next();
        const foo = await context.get('foo');
        expect(foo).to.eql('2-res');
        context.set('foo', '1-res');
      },
      async (context, next) => {
        const foo = await context.get('foo');
        expect(foo).to.eql('1-req');
        await next();
        context.set('foo', '2-res');
      },
    );

    await interceptorChain.invokeInterceptors();
    const fooVal = await ctx.get('foo');
    expect(fooVal).to.eql('1-res');
  });

  it('catches error from the second interceptor', async () => {
    givenInterceptorChain(givenNamedInterceptor('interceptor1'), async (context, next) => {
      events.push('before-interceptor2');
      throw new Error('error in interceptor2');
    });
    const resultPromise = interceptorChain.invokeInterceptors();
    await expect(resultPromise).to.be.rejectedWith('error in interceptor2');
    expect(events).to.eql(['before-interceptor1', 'before-interceptor2']);
  });

  it('catches error from the first interceptor', async () => {
    givenInterceptorChain(async (context, next) => {
      events.push('before-interceptor1');
      await next();
      throw new Error('error in interceptor1');
    }, givenNamedInterceptor('interceptor2'));
    const resultPromise = interceptorChain.invokeInterceptors();
    await expect(resultPromise).to.be.rejectedWith('error in interceptor1');
    expect(events).to.eql(['before-interceptor1', 'before-interceptor2', 'after-interceptor2']);
  });

  it('can be used as an interceptor', async () => {
    givenInterceptorChain(givenNamedInterceptor('interceptor1'), async (context, next) => {
      await next();
      return 'ABC';
    });
    const interceptor = interceptorChain.asInterceptor();
    let invoked = false;
    await interceptor(new Context(), () => {
      invoked = true;
      return invoked;
    });
    expect(invoked).to.be.true();
  });

  it('composes multiple interceptors as a single interceptor', async () => {
    const interceptor = composeInterceptors(givenNamedInterceptor('interceptor1'), async (context, next) => {
      await next();
      return 'ABC';
    });
    let invoked = false;
    const result = await interceptor(new Context(), () => {
      invoked = true;
      return invoked;
    });
    expect(invoked).to.be.true();
    expect(result).to.eql('ABC');
  });

  function givenContext() {
    events = [];
    ctx = new Context();
  }

  function givenInterceptorChain(...interceptors: GenericInterceptor<Context>[]) {
    interceptorChain = new GenericInterceptorChain<Context>(ctx, interceptors);
  }

  function givenNamedInterceptor(name: string) {
    async function interceptor(context: Context, next: Next) {
      events.push(`before-${name}`);
      const result = await next();
      events.push(`after-${name}`);
      return result;
    }
    return interceptor;
  }
});
