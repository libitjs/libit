import {AsyncOrSync} from 'ts-essentials';
import {IDisposable} from '@libit/lifecycle';

export class TimeoutTimer implements IDisposable {
  private _timer: any;

  constructor();
  constructor(runner: () => AsyncOrSync<void>, timeout: number);
  constructor(runner?: any, timeout?: any) {
    if (typeof runner === 'function' && typeof timeout === 'number') {
      this.setIfNotSet(runner, timeout);
    }
  }

  get running() {
    return this._timer != null;
  }

  dispose(): void {
    this.cancel();
  }

  cancel(): void {
    if (this.running) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }

  cancelAndSet(runner: () => AsyncOrSync<void>, timeout: number): void {
    this.cancel();
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.setIfNotSet(runner, timeout);
  }

  setIfNotSet(runner: () => AsyncOrSync<void>, timeout: number): void {
    if (!this.running) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      this._timer = setTimeout(async () => {
        this._timer = null;
        try {
          await runner();
        } catch (e) {
          // ignore
        }
      }, timeout);
    }
  }
}
