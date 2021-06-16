import {expect, sinon} from '@loopback/testlab';
import {Path} from 'orx/path';
import tmp from 'tmp';
import {RotatingFileTransport} from '../../transports/rotating-file';
import {closeStream, existsFile, readFile, wait as waitForWrite} from '../support';

describe('RotatingFileTransport', () => {
  let fixtureDir: tmp.DirResult;
  let dateStub: sinon.SinonStub;

  beforeEach(() => {
    fixtureDir = tmp.dirSync({unsafeCleanup: true});
    dateStub = sinon.stub(Date, 'now').callsFake(() => new Date(2020, 0, 1, 0, 0, 0).getTime());
  });

  afterEach(() => {
    dateStub.restore();
    fixtureDir.removeCallback();
  });

  describe('formatTimestamp()', () => {
    let transport: RotatingFileTransport;

    beforeEach(() => {
      transport = new RotatingFileTransport({
        level: 'log',
        path: 'test.log',
        rotation: 'daily',
      });
    });

    it('supports hourly', () => {
      transport.configure({
        rotation: 'hourly',
      });

      expect(transport.formatTimestamp(new Date(2020, 0, 1, 0, 0, 0).getTime())).equal('20200101.00');
      expect(transport.formatTimestamp(new Date(1998, 6, 15, 13, 0, 0).getTime())).equal('19980715.13');
      expect(transport.formatTimestamp(new Date(2010, 11, 28, 22, 0, 0).getTime())).equal('20101228.22');
    });

    it('supports daily', () => {
      transport.configure({
        rotation: 'daily',
      });

      expect(transport.formatTimestamp(new Date(2020, 0, 1, 0, 0, 0).getTime())).equal('20200101');
      expect(transport.formatTimestamp(new Date(1998, 6, 15, 0, 0, 0).getTime())).equal('19980715');
      expect(transport.formatTimestamp(new Date(2010, 11, 28, 0, 0, 0).getTime())).equal('20101228');
    });

    it('supports weekly', () => {
      transport.configure({
        rotation: 'weekly',
      });

      expect(transport.formatTimestamp(new Date(2020, 0, 1, 0, 0, 0).getTime())).equal('202001.W1');
      expect(transport.formatTimestamp(new Date(1998, 6, 10, 0, 0, 0).getTime())).equal('199807.W2');
      expect(transport.formatTimestamp(new Date(2010, 8, 17, 0, 0, 0).getTime())).equal('201009.W3');
      expect(transport.formatTimestamp(new Date(1990, 3, 25, 0, 0, 0).getTime())).equal('199004.W4');
      expect(transport.formatTimestamp(new Date(2000, 6, 29, 0, 0, 0).getTime())).equal('200007.W5');
    });

    it('supports monthly', () => {
      transport.configure({
        rotation: 'monthly',
      });

      expect(transport.formatTimestamp(new Date(2020, 0, 1, 0, 0, 0).getTime())).equal('202001');
      expect(transport.formatTimestamp(new Date(1998, 6, 1, 0, 0, 0).getTime())).equal('199807');
      expect(transport.formatTimestamp(new Date(2010, 11, 1, 0, 0, 0).getTime())).equal('201012');
    });
  });

  describe('hourly', () => {
    it('rotates file when dates change', async () => {
      const path = new Path(fixtureDir.name, 'hourly.log');
      const rotPath = new Path(fixtureDir.name, 'hourly-20200101.00.log.0');

      const transport = new RotatingFileTransport({level: 'log', path, rotation: 'hourly'});

      transport.write('First line of content.');

      await waitForWrite(50);

      dateStub.callsFake(() => new Date(2020, 0, 1, 6, 0, 0).getTime());

      transport.write('Second line of content, yeah.');

      await waitForWrite(50);

      transport.write('And the third line of content...');

      await closeStream(transport);

      expect(existsFile(rotPath)).equal(true);

      expect(readFile(path)).equal('And the third line of content...');
      expect(readFile(rotPath)).equal('First line of content.Second line of content, yeah.');
    });
  });

  describe('daily', () => {
    it('rotates file when dates change', async () => {
      const path = new Path(fixtureDir.name, 'daily.log');
      const rotPath = new Path(fixtureDir.name, 'daily-20200101.log.0');

      const transport = new RotatingFileTransport({level: 'log', path, rotation: 'daily'});

      transport.write('First line of content.');

      await waitForWrite(50);

      dateStub.callsFake(() => new Date(2020, 0, 14, 0, 0, 0).getTime());

      transport.write('Second line of content, yeah.');

      await waitForWrite(50);

      transport.write('And the third line of content...');

      await closeStream(transport);

      expect(existsFile(rotPath)).equal(true);

      expect(readFile(path)).equal('And the third line of content...');
      expect(readFile(rotPath)).equal('First line of content.Second line of content, yeah.');
    });
  });

  describe('weekly', () => {
    it('rotates file when dates change', async () => {
      const path = new Path(fixtureDir.name, 'weekly.log');
      const rotPath = new Path(fixtureDir.name, 'weekly-202001.W1.log.0');

      const transport = new RotatingFileTransport({level: 'log', path, rotation: 'weekly'});

      transport.write('First line of content.');

      await waitForWrite(50);

      dateStub.callsFake(() => new Date(2020, 0, 22, 0, 0, 0).getTime());

      transport.write('Second line of content, yeah.');

      await waitForWrite(50);

      transport.write('And the third line of content...');

      await closeStream(transport);

      expect(existsFile(rotPath)).equal(true);

      expect(readFile(path)).equal('And the third line of content...');
      expect(readFile(rotPath)).equal('First line of content.Second line of content, yeah.');
    });
  });

  describe('monthly', () => {
    it('rotates file when dates change', async () => {
      const path = new Path(fixtureDir.name, 'monthly.log');
      const rotPath = new Path(fixtureDir.name, 'monthly-202001.log.0');

      const transport = new RotatingFileTransport({level: 'log', path, rotation: 'monthly'});

      transport.write('First line of content.');

      await waitForWrite(50);

      dateStub.callsFake(() => new Date(2020, 5, 1, 0, 0, 0).getTime());

      transport.write('Second line of content, yeah.');

      await waitForWrite(50);

      transport.write('And the third line of content...');

      await closeStream(transport);

      expect(existsFile(rotPath)).equal(true);

      expect(readFile(path)).equal('And the third line of content...');
      expect(readFile(rotPath)).equal('First line of content.Second line of content, yeah.');
    });
  });
});
