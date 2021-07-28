import {AsyncOrSync} from 'ts-essentials';
import {IDisposable} from '@libit/lifecycle';
import {Exception} from '@libit/error/exception';
import {noop} from './utils';

const MIN_INTERVAL_MS = 10;

export class IntervalTimerError extends Exception {}

export type IntervalRunner = (...args: any[]) => AsyncOrSync<void>;

export type IntervalTimerMode = 'legacy' | 'dynamic' | 'fixed';

export class IntervalTimer implements IDisposable {
  private timeouts: Record<number, any> = {};
  private promises: Record<number, Promise<any>> = {};
  private iterationId: number;
  private interval: number;
  private runner: IntervalRunner;

  constructor(protected mode: IntervalTimerMode = 'legacy') {}

  private _running = false;

  get running() {
    return this._running;
  }

  static start(runner: IntervalRunner, interval: number, ...args: any[]): IntervalTimer;

  static start(mode: IntervalTimerMode, runner: IntervalRunner, interval: number, ...args: any[]): IntervalTimer;

  static start(mode: any, runner: any, interval: any, ...args: any[]) {
    if (typeof mode === 'function') {
      args = interval;
      interval = runner;
      runner = mode;
      mode = 'fixed';
    }
    return new IntervalTimer(mode).start(runner, interval, ...args);
  }

  dispose(): void {
    // eslint-disable-next-line no-void
    void this.stop();
  }

  async stop() {
    if (this.running) {
      this._running = false;

      const {timeouts, promises} = this;
      this.timeouts = {};
      this.promises = {};

      for (const id in timeouts) {
        clearTimeout(timeouts[id]);
      }

      for (const id in promises) {
        try {
          await promises[id];
        } catch (_) {
          // ignore
        }
      }
    }
  }

  async restart(runner: IntervalRunner, interval: number, ...args: any) {
    await this.stop();
    this.start(runner, interval, ...args);
    return this;
  }

  start(runner: IntervalRunner, interval: number, ...args: any) {
    validateInterval(interval);
    if (!this.running) {
      this._running = true;
      this.iterationId = 0;
      this.interval = interval;
      this.runner = runner;
      this.timeouts[this.iterationId] = setTimeout((...a: any[]) => this.doTimeout(...a), this.interval, ...args);
    }
    return this;
  }

  protected doTimeout(...args: any[]) {
    delete this.timeouts[this.iterationId];
    this.promises[this.iterationId] = this.run(...args);
  }

  protected async run(...args: any[]) {
    // The next line ensures that this.promises[iterationId] is set
    // before invoking the runner.
    await noop();
    const startTime = new Date().getTime();
    const prevIterationId = this.iterationId;

    if (this.mode === 'legacy') {
      this.iterationId = getNextIterationId(this.iterationId);
      this.timeouts[this.iterationId] = setTimeout((...a: any[]) => this.doTimeout(...a), this.interval, ...args);
    }

    try {
      await this.runner(...args);
    } finally {
      if (this.running && this.mode !== 'legacy') {
        let interval = this.interval;
        if (this.mode === 'dynamic') {
          const endTime = new Date().getTime();
          const executionTime = endTime - startTime;
          interval = this.interval > executionTime ? this.interval - executionTime : 0;
        }
        this.iterationId = getNextIterationId(this.iterationId);
        this.timeouts[this.iterationId] = setTimeout((...a: any[]) => this.doTimeout(...a), interval, ...args);
      }
      delete this.promises[prevIterationId];
    }
  }
}

/**
 * @private
 *
 * @param {number} interval - Interval in milliseconds. Must be at least 10 ms.
 */
export function validateInterval(interval: number) {
  if (MIN_INTERVAL_MS >= interval) {
    throw new IntervalTimerError(
      `Invalid argument: "interval". Expected a number greater than or equal to ${MIN_INTERVAL_MS}.`,
    );
  }
}

export function getNextIterationId(iterationId: number) {
  if (iterationId === Number.MAX_SAFE_INTEGER) {
    return 0;
  }
  return iterationId + 1;
}
