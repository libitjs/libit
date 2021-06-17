import {expect, sinon} from '@loopback/testlab';
import * as fs from 'fs-extra';
import execa from 'execa';
import tmp, {DirResult} from 'tmp';
import {setup} from '../setup';
import {stubPlatform} from './support';
import {resolveCacheFilePath} from '../sn';

describe('setup', function () {
  let restorePlatform: Function;
  let stub: sinon.SinonStub | undefined;

  let tmpobj: DirResult;

  beforeEach(() => {
    restorePlatform = stubPlatform('linux');
    tmpobj = tmp.dirSync();
  });

  afterEach(() => {
    restorePlatform();
    stub?.restore();
    stub = undefined;
    fs.removeSync(tmpobj.name);
  });

  it('should setup without sudo', async function () {
    stub = sinon.stub(execa, 'command').returns(<any>{stdout: 'foo'});
    const result = await setup();
    expect(result).equal('foo');
  });

  it('should throw error if unsupported', async function () {
    stub = sinon.stub(execa, 'command').callsFake(() => {
      throw new Error('Unsupported');
    });

    const errors: string[] = [];
    const stubError = sinon.stub(console, 'error').callsFake(message => {
      errors.push(message);
    });

    try {
      await setup({cwd: tmpobj.name});
      expect(errors).lengthOf(1);
      expect(errors[0]).match(/Could not read serial number/);
    } finally {
      stubError.restore();
    }
  });

  it('should setup that required sudo', async function () {
    stub = sinon.stub(execa, 'command').callsFake((command: string) => {
      if (!command.startsWith('sudo')) {
        throw new Error('Permission denied');
      }
      return <any>{stdout: 'foo'};
    });
    const infos: string[] = [];
    const stubInfo = sinon.stub(console, 'info').callsFake(message => {
      infos.push(message);
    });

    try {
      const expected = 'foo';
      const result = await setup({cwd: tmpobj.name});
      expect(result).equal(expected);
      expect(infos).lengthOf(3);

      const file = resolveCacheFilePath({cwd: tmpobj.name});
      expect(fs.readFileSync(file, 'utf-8')).equal(expected);
    } finally {
      stubInfo.restore();
    }
  });

  it('should throw error if write cache failed', async function () {
    stub = sinon.stub(execa, 'command').callsFake(command => {
      if (!command.startsWith('sudo')) {
        throw new Error('Permission denied');
      }
      return <any>{stdout: 'foo'};
    });

    const errors: string[] = [];
    const stubError = sinon.stub(console, 'error').callsFake(message => {
      errors.push(message);
    });

    try {
      await setup({cwd: '/a/b/c/d'});
      expect(errors).lengthOf(1);
      expect(errors[0]).match(/Could not write serial number cache file/);
    } finally {
      stubError.restore();
    }
  });

  it('should throw error if unsupported with sudo', async function () {
    stub = sinon.stub(execa, 'command').callsFake(command => {
      if (!command.startsWith('sudo')) {
        throw new Error('Permission denied');
      }
      throw new Error('Unsupported');
    });

    const errors: string[] = [];
    const stubError = sinon.stub(console, 'error').callsFake(message => {
      errors.push(message);
    });

    try {
      await setup();
      expect(errors).lengthOf(1);
      expect(errors[0]).match(/Could not read serial number/);
    } finally {
      stubError.restore();
    }
  });
});
