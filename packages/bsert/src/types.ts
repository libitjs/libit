export interface Func {
  (...args: any[]): any;
}

export interface AssertionError extends Error {
  type: string;
  name: string;
  code: string;
  generatedMessage: string;
  actual: any;
  expected: any;
  operator: string;
}

export interface AssertionErrorOptions {
  message?: AssertMessage | null;
  operator?: string;
  actual?: any;
  expected?: any;
  stackStartFunction?: Func;
  stackStartFn?: Func;
}

export interface AssertionErrorCtor {
  new (options: string | AssertionErrorOptions): AssertionError;
}

export type AssertErrorFn = (err: any) => void;

export type AssertMessage = string | Record<string, any>;

export interface Assert {
  /**
   * @param expression    Expression to test for truthiness.
   * @param message    Message to display on error.
   */
  (expression: any, message?: AssertMessage): void;

  AssertionError: AssertionErrorCtor;

  /**
   * Asserts that object is truthy.
   *
   * @type <T>   Type of object.
   * @param value   Object to test.
   * @param message    Message to display on error.
   */
  assert<T>(value: T, message?: AssertMessage): void;

  /**
   * Asserts that object is truthy.
   *
   * @type <T>   Type of object.
   * @param value   Object to test.
   * @param message    Message to display on error.
   */
  strict<T>(value: T, message?: AssertMessage): void;

  /**
   * Asserts that object is truthy.
   *
   * @type <T>   Type of object.
   * @param value   Object to test.
   * @param message    Message to display on error.
   */
  ok<T>(value: T, message?: AssertMessage): void;

  /**
   * Asserts non-strict equality (==) of actual and expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  equal<T>(actual: T, expected: T, message?: AssertMessage): void;

  /**
   * Asserts non-strict inequality (==) of actual and expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  notEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  /**
   * Asserts non-strict equality (==) of actual and expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  strictEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  /**
   * Asserts non-strict inequality (==) of actual and expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  notStrictEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  fail(message?: AssertMessage): void;

  /**
   * Asserts that fn will throw an error.
   *
   * @param fn   Function that may throw.
   * @param message   Message to display on error.
   */
  throws(fn: Function, message?: AssertMessage): void;

  /**
   * Asserts that function will throw an error with message matching regexp.
   *
   * @param fn   Function that may throw.
   * @param expected  Potential expected message match or error constructor.
   * @param message   Message to display on error.
   */
  throws(fn: Function, expected: RegExp | Error | AssertErrorFn | Function, message?: AssertMessage): void;

  /**
   * Asserts that fn will not throw an error.
   *
   * @param fn   Function that may throw.
   * @param message   Message to display on error.
   */
  doesNotThrow(fn: Function, message?: AssertMessage): void;

  /**
   * Asserts that function will throw an error that is an instance of constructor.
   *
   * @param fn   Function that may throw.
   * @param expected   Potential expected error constructor.
   * @param message   Message to display on error.
   */
  doesNotThrow(fn: Function, expected: RegExp | Error | AssertErrorFn | Function, message?: AssertMessage): void;

  /**
   * Asserts that fn will reject with an error.
   *
   * @param fn   Function that may throw.
   * @param message   Message to display on error.
   */
  rejects(fn: Function, message?: AssertMessage): Promise<any>;

  /**
   * Asserts that function will reject with an error with message matching regexp.
   *
   * @param fn   Function that may throw.
   * @param expected  Potential expected message match or error constructor.
   * @param message   Message to display on error.
   */
  rejects(fn: Function, expected: RegExp | Error | AssertErrorFn | Function, message?: AssertMessage): Promise<any>;

  /**
   * Asserts that fn will not reject with an error.
   *
   * @param fn   Function that may throw.
   * @param message   Message to display on error.
   */
  doesNotReject(fn: Function, message?: AssertMessage): Promise<any>;

  /**
   * Asserts that function will reject with an error that is an instance of constructor.
   *
   * @param fn   Function that may throw.
   * @param expected   Potential expected error constructor.
   * @param message   Message to display on error.
   */
  doesNotReject(
    fn: Function,
    expected: RegExp | Error | AssertErrorFn | Function,
    message?: AssertMessage,
  ): Promise<any>;

  /**
   * Asserts if value is not a false value, and throws if it is a true value.
   *
   * @type <T>   Type of object.
   * @param object   Actual value.
   * @param message   Message to display on error.
   * @remarks This is added to allow for chai to be a drop-in replacement for
   *          Node’s assert class.
   */
  ifError<T>(object: T, message?: AssertMessage): void;

  /**
   * Asserts that actual is deeply equal (==) to expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  deepEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  /**
   * Asserts that actual is not deeply equal (==) to expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  notDeepEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  /**
   * Asserts that actual is deeply equal (==) to expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  deepStrictEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  /**
   * Asserts that actual is not deeply equal (==) to expected.
   *
   * @type <T>   Type of the objects.
   * @param actual   Actual value.
   * @param expected   Potential expected value.
   * @param message   Message to display on error.
   */
  notDeepStrictEqual<T>(actual: T, expected: T, message?: AssertMessage): void;

  bufferEqual(actual: Buffer, expected: Buffer | string, enc?: string, message?: AssertMessage): void;

  bufferEqual(actual: Buffer, expected: Buffer | string, message?: AssertMessage): void;

  notBufferEqual(actual: Buffer, expected: Buffer | string, enc?: string, message?: AssertMessage): void;

  notBufferEqual(actual: Buffer, expected: Buffer | string, message?: AssertMessage): void;

  enforce<T>(value: T, name?: string, type?: string): void;

  range<T>(value: T, name?: string): void;
}
