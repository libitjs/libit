export interface DebounceReducer<T> {
  (previousValue: T, ...args: any[]): T;
}
