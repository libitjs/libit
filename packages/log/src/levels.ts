import {settings} from './settings';

export enum LogLevel {
  trace = 1,
  debug,
  log,
  info,
  warn,
  error,
  fatal,
}

export type LogLevelName = keyof typeof LogLevel;
export type LogLevelLabels = {[L in LogLevelName]?: string};

export const LOG_LEVELS: LogLevelName[] = ['trace', 'debug', 'log', 'info', 'warn', 'error', 'fatal'];

export const DEFAULT_LOG_LEVEL: LogLevelName = 'log';

export function isLevelEnabled(level: LogLevelName, threshold?: LogLevelName): boolean {
  const levelVal = LogLevel[level];
  const thresholdVal = LogLevel[threshold ?? settings.level];
  return !thresholdVal || (!!levelVal && levelVal >= thresholdVal);
}
