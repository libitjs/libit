/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DebounceReducer<T> {
  (previousValue: T, ...args: any[]): T;
}
