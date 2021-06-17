/* eslint-disable @typescript-eslint/no-floating-promises */

import os from 'os';
import util from 'util';
import isObject from 'tily/is/object';
import {Configurable} from 'orx/configurable';
import {debug} from './debug';
import {DEFAULT_LABELS} from './constants';
import {LogFunctions, LoggerOptions, LogMetadata, Transportable} from './types';
import {settings} from './settings';
import {DEFAULT_LOG_LEVEL, isLevelEnabled, LogLevel, LogLevelName} from './levels';
import * as sys from './sys';

export interface LogWriteOptions {
  args?: unknown[];
  level?: LogLevelName;
  message: string;
  metadata?: LogMetadata;
}

export class Logger extends Configurable<LoggerOptions> implements LogFunctions {
  protected _level?: LogLevelName;
  protected silent = false;

  static create(name: string, options?: Partial<LoggerOptions>): Logger;
  static create(options: LoggerOptions): Logger;
  static create(name: string | LoggerOptions, options?: Partial<LoggerOptions>): Logger {
    if (typeof name === 'string') {
      options = {...options, name};
    } else {
      options = name;
    }
    return new Logger(options as LoggerOptions);
  }

  constructor(options: LoggerOptions) {
    super(options);

    this._level = this.options.level;
    debug('New logger "%s" created: %s', this.options.name, `(level: ${this.level})`);
  }

  static get level() {
    return settings.level;
  }

  static set level(level: LogLevelName) {
    settings.level = level;
  }

  static get transports() {
    return settings.transports;
  }

  static output(transport: Transportable | Transportable[]) {
    settings.output(transport);
    return this;
  }

  static reset() {
    settings.reset();
    return this;
  }

  get defaultOptions() {
    return {
      labels: {},
      exitOnFatal: true,
      transports: [],
    };
  }

  get level(): LogLevelName {
    return <LogLevelName>(this._level ?? settings.level);
  }

  set level(level: LogLevelName) {
    this._level = level;
  }

  configure(options?: Partial<LoggerOptions>): Readonly<Required<LoggerOptions>> {
    options = {name: '#', ...options};
    return super.configure(options);
  }

  extend(name: string, options?: LoggerOptions): Logger;
  extend(name: string, delimiter: string, options?: LoggerOptions): Logger;
  extend(name: string, delimiter?: string | LoggerOptions, options?: LoggerOptions): Logger {
    if (typeof delimiter !== 'string') {
      options = delimiter;
      delimiter = undefined;
    }
    delimiter = typeof delimiter === 'undefined' ? ':' : delimiter;
    name = `${this.options.name}${delimiter}${name}`;
    return new (this.constructor as typeof Logger)({...options, name});
  }

  disable() {
    debug('Logger %s disabled', this.options.name);
    this.silent = true;
  }

  enable() {
    debug('Logger %s enabled', this.options.name);
    this.silent = false;
  }

  isLevelEnabled(level: LogLevelName, threshold?: LogLevelName): boolean {
    if (this.silent) {
      return false;
    }
    let enabled = isLevelEnabled(level, threshold ?? this.level);
    if (enabled) {
      enabled =
        this.runWithTransport((transport: Transportable) => {
          if (LogLevel[level] >= LogLevel[transport.level]) {
            return true;
          }
        }) === true;
    }

    return enabled;
  }

  isTraceEnabled(threshold?: LogLevelName) {
    return this.isLevelEnabled('trace', threshold);
  }

  isDebugEnabled(threshold?: LogLevelName): boolean {
    return this.isLevelEnabled('debug', threshold);
  }

  isLogEnabled(threshold?: LogLevelName): boolean {
    return this.isLevelEnabled('log', threshold);
  }

  isInfoEnabled(threshold?: LogLevelName): boolean {
    return this.isLevelEnabled('info', threshold);
  }

  isWarnEnabled(threshold?: LogLevelName): boolean {
    return this.isLevelEnabled('warn', threshold);
  }

  isErrorEnabled(threshold?: LogLevelName): boolean {
    return this.isLevelEnabled('error', threshold);
  }

  isFatalEnabled(threshold?: LogLevelName): boolean {
    return this.isLevelEnabled('fatal', threshold);
  }

  trace(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  trace(message: string, ...args: unknown[]): void;
  trace(...args: any[]): void {
    return this.output('trace', ...args);
  }

  debug(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
  debug(...args: any[]): void {
    return this.output('debug', ...args);
  }

  log(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  log(message: string, ...args: unknown[]): void;
  log(...args: any[]): void {
    return this.output('log', ...args);
  }

  info(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  info(...args: any[]): void {
    return this.output('info', ...args);
  }

  warn(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  warn(...args: any[]): void {
    return this.output('warn', ...args);
  }

  error(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  error(...args: any[]): void {
    return this.output('error', ...args);
  }

  fatal(metadata: LogMetadata, message: string, ...args: unknown[]): void;
  fatal(message: string, ...args: unknown[]): void;
  fatal(...args: any[]): void {
    return this.output('fatal', ...args);
  }

  protected output(level?: LogLevelName, ...args: unknown[]) {
    try {
      let metadata = {};
      let message = '';

      if (isObject(args[0])) {
        metadata = (args as object[]).shift()!;
      }

      message = (args as string[]).shift()!;

      return this.write({
        args,
        level,
        message,
        metadata,
      });
    } finally {
      if (this.options.exitOnFatal && level === 'fatal') {
        sys.nextToGracefulExit();
      }
    }
  }

  protected write(options: LogWriteOptions) {
    const {level, message, args = [], metadata = {}} = options;

    const logLevel = level ?? DEFAULT_LOG_LEVEL;

    if (!this.isLevelEnabled(logLevel)) {
      return;
    }

    const item = {
      host: os.hostname(),
      label: this.options.labels[logLevel] || DEFAULT_LABELS[logLevel] || '',
      level: logLevel,
      message: util.format(message, ...args),
      metadata: {
        ...this.options.metadata,
        ...metadata,
      },
      name: this.options.name,
      pid: process.pid,
      time: new Date(),
    };

    this.runWithTransport((transport: Transportable) => {
      if (LogLevel[transport.level] <= LogLevel[item.level]) {
        transport.write(transport.format(item), item);
      }
    });
  }

  protected runWithTransport(fn: (transport: Transportable) => any) {
    const transports = [...settings.transports, ...this.options.transports];
    for (const transport of transports) {
      const result = fn(transport);
      if (result !== undefined) {
        return result;
      }
    }
  }
}
