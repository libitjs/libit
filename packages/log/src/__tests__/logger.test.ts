import {expect, sinon} from '@loopback/testlab';
import {noop} from 'ts-essentials';
import {env} from 'orx/env';
import capitalize from 'tily/string/capitalize';
import {DEFAULT_LABELS} from '../constants';
import * as formats from '../formats';
import {StreamTransport} from '../transports/stream';
import {Formatter, LoggerOptions, Transportable} from '../types';
import {Logger} from '../logger';
import {ConsoleTransport} from '../transports/console';
import {LOG_LEVELS, LogLevel, LogLevelName} from '../levels';
import * as sys from '../sys';

describe('Logger', () => {
  describe('threshold level priority', function () {
    it('should get from env', function () {
      const expected = 'warn';

      const originEnvLevel = env('LOG_LEVEL') ?? null;
      env('LOG_LEVEL', expected);

      expect(Logger.level).equal(expected);
      expect(Logger.create('test').level).equal(expected);

      env('LOG_LEVEL', originEnvLevel);
    });

    it('should get from global', function () {
      const expected = 'warn';

      const originEnvLevel = env('LOG_LEVEL') ?? null;
      env('LOG_LEVEL', 'trace');

      const originGlobalLevel = Logger.level;
      Logger.level = expected;

      expect(Logger.level).equal(expected);
      expect(Logger.create('test').level).equal(expected);

      Logger.level = originGlobalLevel;
      env('LOG_LEVEL', originEnvLevel);
    });

    it('should get from local', function () {
      const expected = 'warn';

      const originEnvLevel = env('LOG_LEVEL') ?? null;
      env('LOG_LEVEL', 'trace');

      const originGlobalLevel = Logger.level;
      Logger.level = 'debug';

      expect(Logger.create('test', {level: expected}).level).equal(expected);

      Logger.level = originGlobalLevel;
      env('LOG_LEVEL', originEnvLevel);
    });
  });

  describe('level log', function () {
    let logger: Logger;
    let outStream: {write: sinon.SinonSpy};
    let errStream: {write: sinon.SinonSpy};

    function mockLogger(options?: Partial<LoggerOptions>, format: Formatter = formats.console) {
      return Logger.create({
        name: 'test',
        level: 'trace',
        transports: [
          new StreamTransport({
            eol: '\n',
            format,
            level: 'warn',
            stream: errStream,
          }),
          new StreamTransport({
            eol: '\n',
            format,
            level: 'trace',
            stream: outStream,
          }),
        ],
        ...options,
      });
    }

    beforeEach(() => {
      errStream = {write: sinon.spy()};
      outStream = {write: sinon.spy()};

      logger = mockLogger();
    });

    afterEach(() => {
      env('LOG_LEVEL', null);
    });

    it('hooks up to console by default', () => {
      logger = Logger.create('test', {transports: [new ConsoleTransport()]});

      const outSpy = sinon.stub(console, 'log').callsFake(() => true);
      const errSpy = sinon.stub(console, 'error').callsFake(() => true);

      logger.log('Hello');
      logger.error('Oops');

      expect(outSpy.calledWith('Hello')).ok();
      expect(errSpy.calledWith(`${DEFAULT_LABELS.error} Oops`)).ok();

      outSpy.restore();
      errSpy.restore();
    });

    it('writes `log` level by default', () => {
      logger.log('Hello');
      expect(outStream.write.calledWith('Hello\n')).ok();
    });

    it('writes `debug` to stream', () => {
      logger.debug('Message');
      expect(outStream.write.calledWith(`${DEFAULT_LABELS.debug} Message\n`)).ok();
    });

    it('writes `error` to stream', () => {
      logger.error('Message');
      expect(outStream.write.calledWith(`${DEFAULT_LABELS.error} Message\n`)).ok();
      expect(errStream.write.calledWith(`${DEFAULT_LABELS.error} Message\n`)).ok();
    });

    it('writes `log` to stream', () => {
      logger.log('Message');
      expect(outStream.write.calledWith('Message\n')).ok();
    });

    it('writes `info` to stream', () => {
      logger.info('Message');
      expect(outStream.write.calledWith(`${DEFAULT_LABELS.info} Message\n`)).ok();
    });

    it('writes `trace` to stream', () => {
      logger.trace('Message');
      expect(outStream.write.calledWith(`${DEFAULT_LABELS.trace} Message\n`)).ok();
    });

    it('writes `warn` to stream', () => {
      logger.warn('Message');
      expect(errStream.write.calledWith(`${DEFAULT_LABELS.warn} Message\n`)).ok();
    });

    it('doesnt write levels above min level', () => {
      logger.level = 'debug';

      logger.trace('Trace');
      logger.debug('Debug');
      logger.log('Log');
      logger.info('Info');
      logger.error('Error');

      expect(outStream.write.calledWith(`${DEFAULT_LABELS.trace} Trace\n`)).not.ok();
      expect(outStream.write.calledWith(`${DEFAULT_LABELS.debug} Debug\n`)).ok();
      expect(outStream.write.calledWith('Log\n')).ok();
      expect(errStream.write.calledWith(`${DEFAULT_LABELS.info} Info\n`)).not.ok();
      expect(errStream.write.calledWith(`${DEFAULT_LABELS.error} Error\n`)).ok();
    });

    it('can interpolate values', () => {
      logger.log('String %s, number %d, object %j', 'foo', 123, {bar: true});

      expect(outStream.write.calledWith('String foo, number 123, object {"bar":true}\n')).ok();
    });

    it('can customize labels', () => {
      logger = mockLogger({
        labels: {
          trace: '[inspect]',
          debug: '[diagnose]',
          info: '[notice]',
          warn: '[alert]',
          error: '[fail]',
        },
      });
      logger.trace('Trace');
      logger.debug('Debug');
      logger.log('Log');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      expect(outStream.write.calledWith('[inspect] Trace\n')).ok();
      expect(outStream.write.calledWith('[diagnose] Debug\n')).ok();
      expect(outStream.write.calledWith('Log\n')).ok();
      expect(outStream.write.calledWith('[notice] Info\n')).ok();
      expect(outStream.write.calledWith('[alert] Warning\n')).ok();
      expect(errStream.write.calledWith('[fail] Error\n')).ok();
    });

    it('can silence output', () => {
      logger = mockLogger();
      logger.trace('Trace');
      logger.debug('Debug');
      logger.log('Log');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      expect(outStream.write.callCount).equal(6);
      expect(errStream.write.callCount).equal(2);

      logger.disable();
      logger.trace('Trace');
      logger.debug('Debug');
      logger.log('Log');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      expect(outStream.write.callCount).equal(6);
      expect(errStream.write.callCount).equal(2);

      logger.enable();
      logger.trace('Trace');
      logger.debug('Debug');
      logger.log('Log');
      logger.info('Info');
      logger.warn('Warning');
      logger.error('Error');

      expect(outStream.write.callCount).equal(12);
      expect(errStream.write.callCount).equal(4);
    });

    it('can provide additional metadata', () => {
      logger = mockLogger(
        {
          metadata: {
            foo: 123,
          },
        },
        formats.debug,
      );

      logger.log('Without metadata');
      logger.info({foo: 'bar'}, 'With metadata');

      expect(outStream.write.calledWithMatch(/LOG Without metadata \(foo=123/)).ok();
      expect(outStream.write.calledWithMatch(/INFO With metadata \(foo=bar/)).ok();
    });
  });

  describe('isLevelEnabled', function () {
    function assertLevelEnabled(logger: Logger, level: LogLevelName, threshold: LogLevelName) {
      expect(logger.isLevelEnabled(level)).equal(LogLevel[level] >= LogLevel[threshold]);
      expect((logger as any)[`is${capitalize(level)}Enabled`]()).equal(LogLevel[level] >= LogLevel[threshold]);
    }

    describe('level by logger', function () {
      for (const level of LOG_LEVELS) {
        it(`check level "${level}"`, function () {
          const logger = Logger.create('test', {
            level,
            transports: [new ConsoleTransport({level: 'trace'})],
          });
          assertLevelEnabled(logger, 'trace', level);
          assertLevelEnabled(logger, 'debug', level);
          assertLevelEnabled(logger, 'log', level);
          assertLevelEnabled(logger, 'info', level);
          assertLevelEnabled(logger, 'warn', level);
          assertLevelEnabled(logger, 'error', level);
          assertLevelEnabled(logger, 'fatal', level);
        });
      }
    });

    describe('level by transports', function () {
      for (const level of LOG_LEVELS) {
        it(`check level "${level}"`, function () {
          const logger = Logger.create('test', {
            level: 'trace',
            transports: [new ConsoleTransport({level})],
          });
          assertLevelEnabled(logger, 'trace', level);
          assertLevelEnabled(logger, 'debug', level);
          assertLevelEnabled(logger, 'log', level);
          assertLevelEnabled(logger, 'info', level);
          assertLevelEnabled(logger, 'warn', level);
          assertLevelEnabled(logger, 'error', level);
          assertLevelEnabled(logger, 'fatal', level);
        });
      }
    });
  });

  describe('global output', function () {
    let transports: Transportable[];
    let outStream: {write: sinon.SinonSpy};
    let errStream: {write: sinon.SinonSpy};

    beforeEach(() => {
      errStream = {write: sinon.spy()};
      outStream = {write: sinon.spy()};

      transports = [
        new StreamTransport({
          eol: '\n',
          format: formats.console,
          level: 'warn',
          stream: errStream,
        }),
        new StreamTransport({
          eol: '\n',
          format: formats.console,
          level: 'trace',
          stream: outStream,
        }),
      ];

      Logger.output(transports);
    });

    afterEach(function () {
      Logger.reset();
    });

    it('should have been set global transports', function () {
      expect(Logger.transports).deepEqual(transports);
    });

    it('should output above min level', () => {
      env('LOG_LEVEL', 'debug');
      const logger = Logger.create('test');

      logger.trace('Trace');
      logger.debug('Debug');
      logger.log('Log');
      logger.info('Info');
      logger.error('Error');

      expect(outStream.write.calledWith(`${DEFAULT_LABELS.trace} Trace\n`)).not.ok();
      expect(outStream.write.calledWith(`${DEFAULT_LABELS.debug} Debug\n`)).ok();
      expect(outStream.write.calledWith('Log\n')).ok();
      expect(errStream.write.calledWith(`${DEFAULT_LABELS.info} Info\n`)).not.ok();
      expect(errStream.write.calledWith(`${DEFAULT_LABELS.error} Error\n`)).ok();
    });
  });

  describe('extend namespace', function () {
    it('should extend namespace', function () {
      const logger = Logger.create('foo');
      const loggerBar = logger.extend('bar');
      expect(loggerBar.options.name).equal('foo:bar');
    });

    it('should extend namespace with custom delimiter', function () {
      const logger = Logger.create('foo');
      const loggerBar = logger.extend('bar', '--');
      expect(loggerBar.options.name).equal('foo--bar');
    });

    it('should extend namespace with empty delimiter', function () {
      const logger = Logger.create('foo');
      const loggerBar = logger.extend('bar', '');
      expect(loggerBar.options.name).equal('foobar');
    });
  });

  describe('exitOnFatal', function () {
    let errStub: sinon.SinonStub;

    beforeEach(() => {
      errStub = sinon.stub(console, 'error').callsFake(() => true);
    });

    afterEach(function () {
      errStub.restore();
    });

    it('should not exit on fatal if exitOnFatal is false', function () {
      const logger = Logger.create('test', {
        exitOnFatal: false,
        transports: [new ConsoleTransport()],
      });

      const exitStub = sinon.stub(sys, 'nextToGracefulExit').callsFake(noop as any);

      logger.fatal('Oops');

      expect(errStub.calledWith(`${DEFAULT_LABELS.fatal} Oops`)).ok();
      expect(exitStub.notCalled).ok();

      exitStub.restore();
    });

    it('should exit on fatal if exitOnFatal is true', function () {
      const logger = Logger.create('test', {transports: [new ConsoleTransport()]});

      const exitStub = sinon.stub(sys, 'nextToGracefulExit').callsFake(noop as any);

      logger.fatal('Oops');

      expect(errStub.calledWith(`${DEFAULT_LABELS.fatal} Oops`)).ok();
      expect(exitStub.calledOnce).ok();

      exitStub.restore();
    });
  });
});
