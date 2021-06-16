import {LogLevelLabels, LogLevelName} from './levels';

export interface LogMetadata {
  [field: string]: unknown;
}

export interface LogItem {
  host: string;
  label: string;
  level: LogLevelName;
  message: string;
  metadata: LogMetadata;
  name: string;
  pid: number;
  time: Date;
}

export interface LoggerOptions {
  /** Unique name for this logger. */
  name: string;
  /** Custom log level for each logger **/
  level?: LogLevelName;
  /** Custom labels to use for each log type. */
  labels?: LogLevelLabels;
  /** Metadata to include within each log item. */
  metadata?: LogMetadata;
  /** If true, handled exceptions will cause process.exit **/
  exitOnFatal?: boolean;
  /** Transports to write messages to. */
  transports?: Transportable[];
}

export interface LogMethod {
  (metadata: LogMetadata, message: string, ...args: unknown[]): void;
  (message: string, ...args: unknown[]): void;
}

export interface LogFunctions {
  isTraceEnabled(threshold?: LogLevelName): boolean;
  isDebugEnabled(threshold?: LogLevelName): boolean;
  isLogEnabled(threshold?: LogLevelName): boolean;
  isInfoEnabled(threshold?: LogLevelName): boolean;
  isWarnEnabled(threshold?: LogLevelName): boolean;
  isErrorEnabled(threshold?: LogLevelName): boolean;
  isFatalEnabled(threshold?: LogLevelName): boolean;
  trace: LogMethod;
  debug: LogMethod;
  log: LogMethod;
  info: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  fatal: LogMethod;
}

export interface Writable {
  write: (message: string) => void;
}

export type Formatter = (item: LogItem) => string;

export interface Transportable {
  level: LogLevelName;
  format: Formatter;
  write: (message: string, item: LogItem) => void | Promise<void>;
}

export interface TransportOptions {
  eol?: string;
  format?: Formatter | null;
  level: LogLevelName;
}

export type Rotation = 'hourly' | 'daily' | 'weekly' | 'monthly';
