import {expect} from '@loopback/testlab';
import pkginfo, {appPkgInfo, PackageInfo} from '..';
import {execScriptFromFixtures, fixturesPath, readPkgFromFixtures} from './support';

function assertPkgInfoWithFixtures(real: PackageInfo, expectPackageDirToFixtures: string) {
  expect(real).eql(readPkgFromFixtures(expectPackageDirToFixtures));
}

describe('pkginfo', () => {
  it('should read package json from module with undefined module parameter', function () {
    expect(pkginfo()).eql(require('../../package.json'));
  });

  it('should read package json from module', function () {
    expect(pkginfo(module)).eql(require('../../package.json'));
  });

  it('host package json should not match with local', function () {
    const hostPkg = pkginfo(require.main);
    expect(hostPkg).not.eql(require('../../package.json'));
  });

  it('get application package json', function () {
    expect(appPkgInfo()).eql(pkginfo(require.main));
  });

  it('should read package json from dir', function () {
    assertPkgInfoWithFixtures(pkginfo(fixturesPath('.')), '.');
  });

  it('should read host package json from local', () => {
    assertPkgInfoWithFixtures(execScriptFromFixtures('local.js'), '.');
  });

  it('should read sub package json from sub module', function () {
    assertPkgInfoWithFixtures(execScriptFromFixtures('sub-local.js'), './modules/foo');
  });

  it('should read host package json from sub module', function () {
    assertPkgInfoWithFixtures(execScriptFromFixtures('sub-host.js'), '.');
  });
});
