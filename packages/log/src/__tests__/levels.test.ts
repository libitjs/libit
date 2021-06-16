import {expect} from '@loopback/testlab';
import {isLevelEnabled, LOG_LEVELS, LogLevelName} from '../levels';
/* eslint-disable @typescript-eslint/no-explicit-any */
function assertLevelEnabled(threshold: LogLevelName, expected: Record<LogLevelName, boolean>) {
  for (const l of LOG_LEVELS) {
    expect(isLevelEnabled(l, threshold)).equal(expected[l], `${l} should be ${expected[l]}`);
  }
}

describe('levels', function () {
  describe('isLevelEnabled()', () => {
    it('returns false for unknown level', () => {
      expect(isLevelEnabled('unknown' as any, 'log')).false();
    });

    it('returns false for unknown threshold level', () => {
      expect(isLevelEnabled('debug', 'unknown' as any)).true();
    });

    it('returns true for no default level', () => {
      expect(isLevelEnabled('debug')).false();
      expect(isLevelEnabled('info')).true();
    });

    it('returns false if level is below threshold level', () => {
      expect(isLevelEnabled('debug', 'error')).false();
    });

    it('returns tru if level is above threshold level', () => {
      expect(isLevelEnabled('error', 'debug')).true();
    });

    it('handles `silly` threshold level', () => {});

    it('handles `trace` threshold level', () => {
      assertLevelEnabled('trace', {
        trace: true,
        debug: true,
        log: true,
        info: true,
        warn: true,
        error: true,
        fatal: true,
      });
    });

    it('handles `debug` threshold level', () => {
      assertLevelEnabled('debug', {
        trace: false,
        debug: true,
        log: true,
        info: true,
        warn: true,
        error: true,
        fatal: true,
      });
    });

    it('handles `log` threshold level', () => {
      assertLevelEnabled('log', {
        trace: false,
        debug: false,
        log: true,
        info: true,
        warn: true,
        error: true,
        fatal: true,
      });
    });

    it('handles `info` threshold level', () => {
      assertLevelEnabled('info', {
        trace: false,
        debug: false,
        log: false,
        info: true,
        warn: true,
        error: true,
        fatal: true,
      });
    });

    it('handles `warn` threshold level', () => {
      assertLevelEnabled('warn', {
        trace: false,
        debug: false,
        log: false,
        info: false,
        warn: true,
        error: true,
        fatal: true,
      });
    });

    it('handles `error` threshold level', () => {
      assertLevelEnabled('error', {
        trace: false,
        debug: false,
        log: false,
        info: false,
        warn: false,
        error: true,
        fatal: true,
      });
    });

    it('handles `fatal` threshold level', () => {
      assertLevelEnabled('fatal', {
        trace: false,
        debug: false,
        log: false,
        info: false,
        warn: false,
        error: false,
        fatal: true,
      });
    });
  });
});
