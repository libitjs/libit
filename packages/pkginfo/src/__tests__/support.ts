import * as path from 'path';
import * as pkgUp from 'pkg-up';
import fs from 'fs';
import * as execa from 'execa';

export function fixturesPath(dir: string) {
  return path.resolve(__dirname, '../../fixtures', dir);
}

export function readPkgFromFixtures(dir: string) {
  const packagePath = pkgUp.sync({cwd: fixturesPath(dir)});
  return packagePath && JSON.parse(fs.readFileSync(packagePath, 'utf8'));
}

export function execScriptFromFixtures(scriptPath: string) {
  const {stdout} = execa.sync('node', [fixturesPath(scriptPath)]);
  return JSON.parse(stdout.trim());
}
