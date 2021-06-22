import {NormalizedPackageJson, PackageJson, pkginfo} from './pkginfo';

export interface AppInfo {
  (normalization?: true): Promise<[NormalizedPackageJson, string]>;
  (normalization: false): Promise<[PackageJson, string]>;

  sync(normalization?: true): [NormalizedPackageJson, string];
  sync(normalization: false): [PackageJson, string];
}

async function appinfoAsync(normalization?: true): Promise<[NormalizedPackageJson, string]>;
async function appinfoAsync(normalization: false): Promise<[PackageJson, string]>;
async function appinfoAsync(normalization?: boolean) {
  return pkginfo(require.main, normalization);
}

function appinfoSync(normalization?: true): [NormalizedPackageJson, string];
function appinfoSync(normalization: false): [PackageJson, string];
function appinfoSync(normalization?: boolean) {
  return pkginfo.sync(require.main, normalization);
}

export const appinfo: AppInfo = appinfoAsync as any;
appinfo.sync = appinfoSync;
