import {expect} from '@loopback/testlab';
import * as formats from '../formats';
import {LogItem} from '../types';

describe('formats', () => {
  const item: LogItem = {
    host: 'machine.local',
    label: 'Error',
    level: 'error',
    message: 'Hello there!',
    metadata: {},
    name: 'test',
    pid: 1,
    time: new Date(),
  };

  describe('console()', () => {
    it('includes label when not log level', () => {
      expect(formats.console(item)).equal('Error Hello there!');
    });

    it('doesnt include label when log level', () => {
      expect(
        formats.console({
          ...item,
          level: 'log',
        }),
      ).equal('Hello there!');
    });
  });

  describe('debug()', () => {
    it('includes all item fields', () => {
      expect(formats.debug(item)).equal(
        `[${item.time.toISOString()}] ERROR Hello there! (host=machine.local, name=test, pid=1)`,
      );
    });

    it('supports more metadata', () => {
      expect(
        formats.debug({
          ...item,
          metadata: {
            foo: 'abc',
            bar: 123,
            baz: true,
          },
        }),
      ).equal(
        `[${item.time.toISOString()}] ERROR Hello there! (bar=123, baz=true, foo=abc, host=machine.local, name=test, pid=1)`,
      );
    });
  });

  describe('json()', () => {
    it('serializes all item fields', () => {
      expect(formats.json(item)).equal(JSON.stringify(item));
    });
  });

  describe('message()', () => {
    it('includes only the message', () => {
      expect(formats.message(item)).equal('Hello there!');
    });
  });
});
