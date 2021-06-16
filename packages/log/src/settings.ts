import {env} from 'orx/env';
import {Transportable} from './types';
import {DEFAULT_LOG_LEVEL, LogLevelName} from './levels';

interface LogSettingsIndividual {
  level?: LogLevelName;
  transports?: Transportable[];
}

const individual: LogSettingsIndividual = require('individual')('$$loopx:log', {});

class Settings {
  get transports(): Transportable[] {
    return (individual.transports = individual.transports ?? []);
  }

  get level(): LogLevelName {
    return individual.level ?? env('LOG_LEVEL') ?? DEFAULT_LOG_LEVEL;
  }

  set level(level: LogLevelName) {
    individual.level = level;
  }

  reset() {
    individual.level = undefined;
    individual.transports?.splice(0, individual.transports?.length);
  }

  addTransport(transport: Transportable | Transportable[]) {
    // istanbul ignore else
    if (Array.isArray(transport)) {
      this.transports.push(...transport);
    } else {
      this.transports.push(transport);
    }
  }

  output(transport: Transportable | Transportable[]) {
    this.addTransport(transport);
  }
}

export const settings = new Settings();
