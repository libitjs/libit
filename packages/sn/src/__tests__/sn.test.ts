import {expect, sinon} from '@loopback/testlab';
import path from 'path';
import execa from 'execa';
import {digest, sn, snSync} from '../sn';
import {itWithPlatform} from './sn-platform';

const SN_TEXT = 'OSX12345678';
const SN_TEXT_HASHED = digest(SN_TEXT);

describe('sn', function () {
  describe('multiple platforms', function () {
    itWithPlatform('darwin');
    itWithPlatform('linux');
    itWithPlatform('linux_arm');
    itWithPlatform('freebsd');
    itWithPlatform('win32');
  });

  describe('async - from cache file', function () {
    let stub: sinon.SinonStub | undefined;

    afterEach(() => {
      stub?.restore();
      stub = undefined;
    });

    it('should retrieve sn from default cache file', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: undefined});
      const result = await sn({
        cwd: path.resolve(__dirname, 'fixtures'),
        hash: false,
      });
      expect(result).equal('1234567890abcdedg');
    });

    it('should retrieve sn from custom cache file', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: undefined});
      const result = await sn({
        cwd: path.resolve(__dirname, 'fixtures'),
        file: '.custom_sn',
        hash: false,
      });
      expect(result).equal('abcdedg1234567890');
    });

    it('should return undefined if cache file not exist', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: undefined});
      const result = await sn({hash: false});
      expect(result).undefined();
    });
  });

  describe('sync - from cache file', function () {
    let stub: sinon.SinonStub | undefined;

    afterEach(() => {
      stub?.restore();
      stub = undefined;
    });

    it('should retrieve sn from default cache file', function () {
      stub = sinon.stub(execa, 'commandSync').returns(<any>{stdout: undefined});
      const result = snSync({
        cwd: path.resolve(__dirname, 'fixtures'),
        hash: false,
      });
      expect(result).equal('1234567890abcdedg');
    });

    it('should retrieve sn from custom cache file', function () {
      stub = sinon.stub(execa, 'commandSync').returns(<any>{stdout: undefined});
      const result = snSync({
        cwd: path.resolve(__dirname, 'fixtures'),
        file: '.custom_sn',
        hash: false,
      });
      expect(result).equal('abcdedg1234567890');
    });

    it('should return undefined if cache file not exist', function () {
      stub = sinon.stub(execa, 'commandSync').returns(<any>{stdout: undefined});
      const result = snSync({hash: false});
      expect(result).undefined();
    });
  });

  describe('unsupported platform', function () {
    let stub: sinon.SinonStub | undefined;

    afterEach(() => {
      stub?.restore();
      stub = undefined;
    });

    it('should throw error with unsupported platform', async () => {
      stub = sinon.stub(process, 'platform').value('aix');
      await expect(sn({hash: false})).rejectedWith(/Cannot provide serial number for/);
    });
  });

  describe('options', function () {
    let stub: sinon.SinonStub | undefined;

    afterEach(() => {
      stub?.restore();
      stub = undefined;
    });

    it('should return hashed value', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: SN_TEXT});
      const answer = await sn({hash: true});
      expect(answer).equal(SN_TEXT_HASHED);
    });

    it('should support custom hash function', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: SN_TEXT});
      const answer = await sn({hash: () => 'Hello SN'});
      expect(answer).equal('Hello SN');
    });

    it('should size work', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: SN_TEXT});
      const answer = await sn({hash: true, size: 12});
      expect(answer).equal(SN_TEXT_HASHED.substr(0, 12));
    });

    it('should support prefix', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: SN_TEXT});
      const commands: string[] = [];
      stub.callsFake((cmd: string) => {
        commands.push(cmd);
        return {};
      });

      await sn({prefix: '/usr/bin/'});
      for (const c of commands) {
        expect(c).startWith('/usr/bin/');
      }
    });

    it('should support sudo', async function () {
      stub = sinon.stub(execa, 'command').returns(<any>{stdout: SN_TEXT});
      const commands: string[] = [];
      stub.callsFake((cmd: string) => {
        commands.push(cmd);
        return {};
      });

      await sn({sudo: true});
      for (const c of commands) {
        expect(c).startWith('sudo ');
      }
    });
  });
});
