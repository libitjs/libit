# @libit/pkginfo

> An easy way to find and read package json whether from a submodule or the application

## Installation

```
$ npm install @libit/pkginfo
```

## Highlights

- Using [pkg-up](https://github.com/sindresorhus/pkg-up) to find package json file
- Read package json file through `fs.readFile` instead of `require` for this
  [issue](https://github.com/webpack/webpack/issues/196)
- Provide `appinfo()` and `appinfo.sync()` function to get application json data directly
- [Throws more helpful JSON errors](https://github.com/sindresorhus/parse-json)
- [Normalizes the data](https://github.com/npm/normalize-package-data#what-normalization-currently-entails)

## Motivation

[How can a module get package data from an application's package.json?](https://stackoverflow.com/questions/16301722/in-node-js-how-can-a-module-get-data-from-an-applications-package-json)

```ts
import {pkginfo} from '@libit/pkginfo';

// get applicaiton json data using pkginfo
console.log(await pkginfo(require.main));
// await pkginfo(require.main);
// =>
// [{"name": "application", ...}, '.../resolved-directory']

// or simply using appfino
console.log(await appinfo());
// await appinfo(require.main);
// =>
// [{"name": "application", ...}, '.../resolved-directory']
```

## Usage

```ts
import {pkginfo} from '@libit/pkginfo';

console.log(await pkginfo());
// => [{name: '@libit/pkginfo', …}, '.../resolved-directory']

console.log(await pkginfo(require.main));
// => [{name: 'app', …}, '.../resolved-directory']

console.log(await pkginfo('some-other-directory'));
// => [{name: 'unicorn', …}, '.../resolved-directory']
```

Here's a sample of the output:

```js
[ '.../fixtures', { 
  name: 'simple-app',
  description: 'A test fixture for pkginfo',
  version: '0.1.0',
  keywords: [ 'test', 'fixture' ],
  main: './dist/index.js',
  scripts: { test: 'mocha __tests__/**/*.test.js' },
  engines: { node: '>= 12'
}}]
```

## API 
### `pkginfo(dirOrModule?: NodeModule | string, normalization?: boolean)`

Returns a `Promise<[PackageJson, string]>` or `Promise<[NormalizePackageJson, string]>` for package data and package file directory,
or Promise<[null, null]> if couldn't be found.

### `pkginfo.sync(dirOrModule?: NodeModule | string, normalization?: boolean)`

Returns a `[PackageJson, string]` or `NormalizePackageJson, string` for package data and package file directory,
or [null, null] if couldn't be found.

### `appinfo(normalization?: boolean)` and `appinfo.sync(normalization?: boolean)`

```ts
appinfo() <=> pkginfo(require.main);
appinfo(false) <=> pkginfo(require.main, false);
```
