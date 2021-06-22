import * as path from 'path';
import fs, {promises as fsAsync} from 'fs';
import pkgUp from 'pkg-up';
import parseJson = require('parse-json');
import normalize from 'normalize-package-data';
import * as typeFest from 'type-fest';

export type NormalizedPackageJson = PackageJson & normalize.Package;
export type PackageJson = typeFest.PackageJson;

export interface PkgInfo {
  (normalization?: true): Promise<[NormalizedPackageJson, string]>;
  (normalization: false): Promise<[PackageJson, string]>;
  (dirOrModule?: NodeModule | string, normalization?: boolean): Promise<[NormalizedPackageJson, string]>;
  (dirOrModule: NodeModule | string, normalization: false): Promise<[PackageJson, string]>;

  sync(normalization?: true): [NormalizedPackageJson, string];
  sync(normalization: false): [PackageJson, string];
  sync(dirOrModule?: NodeModule | string, normalization?: boolean): [NormalizedPackageJson, string];
  sync(dirOrModule: NodeModule | string, normalization: false): [PackageJson, string];
}

async function pkginfoAsync(normalization?: true): Promise<[NormalizedPackageJson, string]>;
async function pkginfoAsync(normalization: false): Promise<[PackageJson, string]>;
async function pkginfoAsync(dirOrModule?: NodeModule | string, normalization?: boolean): Promise<[NormalizedPackageJson, string]>;
async function pkginfoAsync(dirOrModule: NodeModule | string, normalization: false): Promise<[PackageJson, string]>;
async function pkginfoAsync(dirOrModule?: NodeModule | string | boolean, normalization?: boolean): Promise<[any, string]> {
  if (typeof dirOrModule === 'boolean') {
    normalization = dirOrModule;
    dirOrModule = undefined;
  }
  normalization = normalization ?? true;
  dirOrModule = dirOrModule ?? process.cwd();
  const dir = typeof dirOrModule === 'string' ? dirOrModule : path.dirname(dirOrModule.filename ?? dirOrModule.id);
  const packagePath = await pkgUp({cwd: dir});
  if (!packagePath) {
    return [undefined, dir];
  }
  // Can't use `require` because of Webpack being annoying:
  // https://github.com/webpack/webpack/issues/196
  const json = parseJson(await fsAsync.readFile(packagePath, 'utf8')) as Record<string, any>;
  if (normalization) {
    normalize(json);
  }
  return [json, dir];
}


function pkginfoSync(normalization?: true): [NormalizedPackageJson, string];
function pkginfoSync(normalization: false): [PackageJson, string];
function pkginfoSync(dirOrModule?: NodeModule | string, normalization?: boolean): [NormalizedPackageJson, string];
function pkginfoSync(dirOrModule: NodeModule | string, normalization: false): [PackageJson, string];
function pkginfoSync(dirOrModule?: NodeModule | string | boolean, normalization?: boolean): [any, any] {
  if (typeof dirOrModule === 'boolean') {
    normalization = dirOrModule;
    dirOrModule = undefined;
  }
  normalization = normalization ?? true;
  dirOrModule = dirOrModule ?? process.cwd();
  const dir = typeof dirOrModule === 'string' ? dirOrModule : path.dirname(dirOrModule.filename ?? dirOrModule.id);
  const packagePath = pkgUp.sync({cwd: dir});
  if (!packagePath) {
    return [null, null];
  }
  // Can't use `require` because of Webpack being annoying:
  // https://github.com/webpack/webpack/issues/196
  const json = parseJson(fs.readFileSync(packagePath, 'utf8')) as Record<string, any>;
  if (normalization) {
    normalize(json);
  }
  return [json, dir];
}

export const pkginfo: PkgInfo = pkginfoAsync as any;
pkginfo.sync = pkginfoSync;


