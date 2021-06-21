import * as path from 'path';
import fs from 'fs';
import pkgUp from 'pkg-up';

export type PackageInfo = Record<string, any>;

export function pkginfo(dir: string): PackageInfo;
export function pkginfo(module?: NodeModule): PackageInfo;
export function pkginfo(moduleOrDir?: NodeModule | string): PackageInfo {
  moduleOrDir = moduleOrDir ?? module;
  const dir = typeof moduleOrDir === 'string' ? moduleOrDir : path.dirname(moduleOrDir.filename ?? moduleOrDir.id);
  const packagePath = pkgUp.sync({cwd: dir});
  // Can't use `require` because of Webpack being annoying:
  // https://github.com/webpack/webpack/issues/196
  return (packagePath && JSON.parse(fs.readFileSync(packagePath, 'utf8'))) ?? {};
}

export function appPkgInfo() {
  return pkginfo(require.main);
}
