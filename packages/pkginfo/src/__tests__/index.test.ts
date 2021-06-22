import {expect} from '@loopback/testlab';
import * as pkgUp from 'pkg-up';
import {appinfo, PackageJson, pkginfo} from '..';
import {execScriptFromFixtures, fixturesPath, readPkgFromFixtures} from './support';

function assertPkgInfoWithFixtures(real: PackageJson, expectPackageDirToFixtures: string) {
  expect(real).eql(readPkgFromFixtures(expectPackageDirToFixtures));
}

describe('pkginfo', () => {
  describe('async', function () {
    it('should read package json from module with undefined module parameter', async () => {
      const [real] = await pkginfo(false);
      expect(real).eql(require(pkgUp.sync({cwd: '.'})!));
    });

    it('should read package json from module', async () => {
      const [real] = await pkginfo(module, false);
      expect(real).eql(require('../../package.json'));
    });

    it('host package json should not match with local', async () => {
      const [real] = await pkginfo(require.main, false);
      expect(real).not.eql(require('../../package.json'));
    });

    it('get application package json', async () => {
      const [real] = await appinfo(false);
      const [expected] = await pkginfo(require.main, false);
      expect(real).eql(expected);
    });

    it('should read package json from dir', async () => {
      const [real] = await pkginfo(fixturesPath('.'), false);
      assertPkgInfoWithFixtures(real, '.');
    });

    it('normalize', async () => {
      const [normalized] = await appinfo();
      const [original] = await appinfo(false);
      expect(normalized).not.eql(original);
      expect(normalized).have.property('_id');
      expect(original).not.have.property('_id');
    });
  });

  describe('sync', function () {
    it('should read package json from module with undefined module parameter', () => {
      const [real] = pkginfo.sync(false);
      expect(real).eql(require(pkgUp.sync({cwd: '.'})!));
    });

    it('should read package json from module', () => {
      const [real] = pkginfo.sync(module, false);
      expect(real).eql(require('../../package.json'));
    });

    it('host package json should not match with local', () => {
      const [real] = pkginfo.sync(require.main, false);
      expect(real).not.eql(require('../../package.json'));
    });

    it('get application package json', () => {
      const real = appinfo.sync(false);
      const expected = pkginfo.sync(require.main, false);
      expect(real).eql(expected);
    });

    it('should read package json from dir', () => {
      const [real] = pkginfo.sync(fixturesPath('.'), false);
      assertPkgInfoWithFixtures(real, '.');
    });

    it('normalize', () => {
      const [normalized] = appinfo.sync();
      const [original] = appinfo.sync(false);
      expect(normalized).not.eql(original);
      expect(normalized).have.property('_id');
      expect(original).not.have.property('_id');
    });
  });

  describe('integration', function () {
    it('should read host package json from local', () => {
      assertPkgInfoWithFixtures(execScriptFromFixtures('local.js'), '.');
    });

    it('should read sub package json from sub module', () => {
      assertPkgInfoWithFixtures(execScriptFromFixtures('sub-local.js'), './modules/foo');
    });

    it('should read host package json from sub module', () => {
      assertPkgInfoWithFixtures(execScriptFromFixtures('sub-host.js'), '.');
    });
  });
});
