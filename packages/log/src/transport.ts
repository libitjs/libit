import os from 'os';
import {Configurable} from 'orx/configurable';
import {LogItem, Transportable, TransportOptions} from './types';
import * as formats from './formats';
import {DEFAULT_LOG_LEVEL, LogLevelName} from './levels';

export abstract class Transport<Options extends TransportOptions>
  extends Configurable<Options>
  implements Transportable
{
  readonly level: LogLevelName;

  constructor(options: Options) {
    super(options);

    this.level = this.options.level ?? DEFAULT_LOG_LEVEL;
  }

  get defaultOptions() {
    return {
      eol: os.EOL,
    } as Options;
  }

  /**
   * Format the log item into a message string, and append a trailing newline if missing.
   */
  format(item: LogItem): string {
    const {eol, format} = this.options;

    let output = typeof format === 'function' ? format(item) : formats.debug(item);

    if (!output.endsWith(eol!)) {
      output += eol;
    }

    return output;
  }

  /**
   * Write the formatted message according to the transport.
   */
  abstract write(message: string, item: LogItem): void | Promise<void>;
}
