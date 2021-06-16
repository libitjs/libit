import {expect, sinon} from '@loopback/testlab';
import {Path} from 'orx/path';
import tmp from 'tmp';
import {FileTransport} from '../../transports/file';
import {closeStream, existsFile, readFile, sizeFile, wait as waitForWrite, writeFile} from '../support';

describe('FileTransport', () => {
  let fixtureDir: tmp.DirResult;

  beforeEach(() => {
    fixtureDir = tmp.dirSync({unsafeCleanup: true});
  });

  afterEach(function () {
    fixtureDir.removeCallback();
  });

  it('triggers close callback if stream has not been opened', async () => {
    const spy = sinon.spy();
    const path = new Path(fixtureDir.name, 'current.log');
    const transport = new FileTransport({level: 'log', path});

    transport.close(spy);

    await closeStream(transport);

    expect(spy.called).true();
  });

  it('writes messages to the given log file', async () => {
    const path = new Path(fixtureDir.name, 'current.log');
    const transport = new FileTransport({level: 'log', path});

    transport.write('Line 1\n');
    transport.write('Line 2, duh\n');
    transport.write('Line 3, of course\n');

    await closeStream(transport);

    expect(readFile(path)).equal('Line 1\nLine 2, duh\nLine 3, of course\n');
  });

  it('buffers messages to the given log file if rotating', async () => {
    const path = new Path(fixtureDir.name, 'current.log');
    const transport = new FileTransport({level: 'log', path});

    transport.write('Line 1\n');

    // @ts-expect-error: for testing
    transport.rotating = true;
    transport.write('Line 2, duh\n');

    await closeStream(transport);

    expect(readFile(path)).equal('Line 1\n');

    // @ts-expect-error: for testing
    transport.rotating = false;
    transport.write('Line 3, of course\n');

    await closeStream(transport);

    expect(readFile(path)).equal('Line 1\nLine 2, duh\nLine 3, of course\n');
  });

  it('inherits correct file size on open', async () => {
    const path = new Path(fixtureDir.name, 'current.log');
    const transport = new FileTransport({level: 'log', path});

    writeFile(path, 'This is the initial content.\n');

    transport.open(); // Trigger open

    // @ts-expect-error: for testing
    expect(sizeFile(path)).equal(transport.lastSize);

    transport.write('Line 1\n');

    await closeStream(transport);

    expect(readFile(path)).equal('This is the initial content.\nLine 1\n');
  });

  it('rotates file when writing if existing file is too large', async () => {
    const path = new Path(fixtureDir.name, 'existing.log');
    const rotPath = new Path(fixtureDir.name, 'existing.log.0');

    const transport = new FileTransport({level: 'log', path, maxSize: 35});

    transport.write('First line of content.');
    await waitForWrite(50);
    transport.write('Second line of content, yeah.');
    await waitForWrite(50);
    transport.write('And the third line of content...');
    await closeStream(transport);
    expect(existsFile(path)).true();
    expect(existsFile(rotPath)).true();
    expect(readFile(path)).equal('And the third line of content...');
    expect(readFile(rotPath)).equal('First line of content.Second line of content, yeah.');
  });

  it('increments the file name counter for each match', async () => {
    const path = new Path(fixtureDir.name, 'existing.log');
    const rot0Path = new Path(fixtureDir.name, 'existing.log.0');
    const rot1Path = new Path(fixtureDir.name, 'existing.log.1');
    const rot2Path = new Path(fixtureDir.name, 'existing.log.2');

    const transport = new FileTransport({level: 'log', path, maxSize: 20});

    transport.write('First line of content.');
    await waitForWrite(50);
    transport.write('Second line of content, yeah.');
    await waitForWrite(50);
    transport.write('And the third line of content...');
    await closeStream(transport);
    expect(readFile(rot2Path)).equal('And the third line of content...');
    expect(readFile(rot1Path)).equal('Second line of content, yeah.');
    expect(readFile(rot0Path)).equal('First line of content.');
  });

  describe('gzip', () => {
    it('rotates file when writing if existing file is too large', async () => {
      const path = new Path(fixtureDir.name, 'archive.log');
      const rotPath = new Path(fixtureDir.name, 'archive.log.gz.0');

      const transport = new FileTransport({level: 'log', path, maxSize: 35, gzip: true});

      transport.write('First line of content.');
      await waitForWrite(50);
      transport.write('Second line of content, yeah.');
      await waitForWrite(50);
      transport.write('And the third line of content...');
      await closeStream(transport);
      expect(existsFile(rotPath)).true();
      expect(sizeFile(rotPath)).equal(55);
      expect(readFile(rotPath)).not.equal('First line of content.Second line of content, yeah.');
    });
  });
});
