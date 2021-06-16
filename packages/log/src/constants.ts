import chalk from 'chalk';
import t from './translate';
import {LogLevelLabels} from './levels';

export const DEFAULT_LABELS: LogLevelLabels = {
  trace: chalk.magenta(t.t('log:trace')),
  debug: chalk.gray(t.t('log:debug')),
  info: chalk.cyan(t.t('log:info')),
  warn: chalk.yellow(t.t('log:warn')),
  error: chalk.red(t.t('log:error')),
  fatal: chalk.red(t.t('log:fatal')),
};

export const MAX_LOG_SIZE = 10485760;
