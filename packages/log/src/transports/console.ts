import * as formats from '../formats';
import {Transport} from '../transport';
import {LogItem, TransportOptions} from '../types';
import {DEFAULT_LOG_LEVEL} from '../levels';

type ConsoleMethod = 'log' | 'warn' | 'error';

export class ConsoleTransport extends Transport<TransportOptions> {
  constructor(options?: Partial<TransportOptions>) {
    super({
      format: formats.console,
      level: DEFAULT_LOG_LEVEL,
      ...options,
    });
  }

  write(message: string, {level}: LogItem) {
    let m: ConsoleMethod = 'log';
    if (level === 'fatal' || level === 'error') {
      m = 'error';
    } else if (level === 'warn') {
      m = 'warn';
    }
    console[m](message.trim());
  }
}
