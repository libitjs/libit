import {AsyncOrSync} from 'ts-essentials';
import debugFactory from 'debug';
import {InterceptContext, InvocationResult} from './types';

const debug = debugFactory('libit:interceptor:interceptor-chain');

/**
 * Any type except `void`. We use this type to enforce that interceptor functions
 * always return a value (including undefined or null).
 */
export type NonVoid = string | number | boolean | null | undefined | object;

/**
 * The `next` function that can be used to invoke next generic interceptor in
 * the chain
 */
export type Next = () => AsyncOrSync<NonVoid>;

/**
 * An interceptor function to be invoked in a chain for the given context.
 * It serves as the base interface for various types of interceptors, such
 * as method invocation interceptor or request/response processing interceptor.
 *
 * @remarks
 * We choose `NonVoid` as the return type to avoid possible bugs that an
 * interceptor forgets to return the value from `next()`. For example, the code
 * below will fail to compile.
 *
 * ```ts
 * const myInterceptor: Interceptor = async (ctx, next) {
 *   // preprocessing
 *   // ...
 *
 *   // There is a subtle bug that the result from `next()` is not further
 *   // returned back to the upstream interceptors
 *   const result = await next();
 *
 *   // postprocessing
 *   // ...
 *   // We must have `return ...` here
 *   // either return `result` or another value if the interceptor decides to
 *   // have its own response
 * }
 * ```
 *
 * @typeParam C - `Context` class or a subclass of `Context`
 * @param context - Context object
 * @param next - A function to proceed with downstream interceptors or the
 * target operation
 *
 * @returns The invocation result as a value (sync) or promise (async).
 */
export type GenericInterceptor<C extends InterceptContext = InterceptContext> = (
  context: C,
  next: Next,
) => AsyncOrSync<NonVoid>;

/**
 * Invocation state of an interceptor chain
 */
class InterceptorChainState<C extends InterceptContext = InterceptContext> {
  /**
   * Create a state for the interceptor chain
   * @param interceptors - Interceptor functions or binding keys
   * @param finalHandler - An optional final handler
   */
  constructor(
    public readonly interceptors: GenericInterceptor<C>[],
    public readonly finalHandler: Next = () => undefined,
  ) {}

  private _index = 0;

  /**
   * Get the index for the current interceptor
   */
  get index() {
    return this._index;
  }

  /**
   * Check if the chain is done - all interceptors are invoked
   */
  done() {
    return this._index === this.interceptors.length;
  }

  /**
   * Get the next interceptor to be invoked
   */
  next() {
    if (this.done()) {
      throw new Error('No more interceptor is in the chain');
    }
    return this.interceptors[this._index++];
  }
}

/**
 * A chain of generic interceptors to be invoked for the given context
 *
 * @typeParam C - `Context` class or a subclass of `Context`
 */
export class GenericInterceptorChain<C extends InterceptContext = InterceptContext> {
  /**
   * A getter for an array of interceptor functions or binding keys
   */
  protected getInterceptors: () => GenericInterceptor<C>[];

  /**
   * Create an invocation chain with a list of interceptor functions or
   * binding keys
   * @param context - Context object
   * @param interceptors - An array of interceptor functions or binding keys
   */
  constructor(context: C, interceptors: GenericInterceptor<C>[]);

  /**
   * Create an invocation interceptor chain with a binding filter and comparator.
   * The interceptors are discovered from the context using the binding filter and
   * sorted by the comparator (if provided).
   *
   * @param context - Context object
   * @param interceptors - The interceptors
   */
  constructor(private context: C, interceptors: GenericInterceptor<C>[] | (() => GenericInterceptor<C>[])) {
    this.getInterceptors = typeof interceptors === 'function' ? interceptors : () => interceptors;
  }

  /**
   * Invoke the interceptor chain
   */
  invokeInterceptors(finalHandler?: Next): AsyncOrSync<InvocationResult> {
    // Create a state for each invocation to provide isolation
    const state = new InterceptorChainState<C>(this.getInterceptors(), finalHandler);
    return this.next(state);
  }

  /**
   * Use the interceptor chain as an interceptor
   */
  asInterceptor(): GenericInterceptor<C> {
    return (ctx, next) => {
      return this.invokeInterceptors(next);
    };
  }

  /**
   * Invoke downstream interceptors or the target method
   */
  private next(state: InterceptorChainState<C>): AsyncOrSync<InvocationResult> {
    if (state.done()) {
      // No more interceptors
      return state.finalHandler();
    }
    // Invoke the next interceptor in the chain
    return this.invokeNextInterceptor(state);
  }

  /**
   * Invoke downstream interceptors
   */
  private invokeNextInterceptor(state: InterceptorChainState<C>): AsyncOrSync<InvocationResult> {
    const index = state.index;
    const interceptor = state.next();
    /* istanbul ignore if */
    if (debug.enabled) {
      debug('Invoking interceptor %d (%s) on %s', index, interceptor.name);
    }
    return interceptor(this.context, () => this.next(state));
  }
}

/**
 * Invoke a chain of interceptors with the context
 * @param context - Context object
 * @param interceptors - An array of interceptor functions or binding keys
 */
export function invokeInterceptors<C extends InterceptContext = InterceptContext, T = InvocationResult>(
  context: C,
  interceptors: GenericInterceptor<C>[],
): AsyncOrSync<T | undefined> {
  const chain = new GenericInterceptorChain(context, interceptors);
  return chain.invokeInterceptors();
}

/**
 * Compose a list of interceptors as a single interceptor
 * @param interceptors - A list of interceptor functions or binding keys
 */
export function composeInterceptors<C extends InterceptContext = InterceptContext>(
  ...interceptors: GenericInterceptor<C>[]
): GenericInterceptor<C> {
  return (ctx, next) => {
    const interceptor = new GenericInterceptorChain(ctx, interceptors).asInterceptor();
    return interceptor(ctx, next);
  };
}
