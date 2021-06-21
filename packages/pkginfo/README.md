# @libit/pkginfo

> An easy way to expose properties on a module from a package.json
>
> `@libit/pkginfo` is forked from [node-pkginfo](https://github.com/indexzero/node-pkginfo).

## Installation

```
  npm install @libit/pkginfo
```

## Highlights

- Full TypeScript version
- Using [pkg-up](https://github.com/sindresorhus/pkg-up) to find package json file
- Read package json file through `fs.readFileSync` instead of `require` for this
  [issue](https://github.com/webpack/webpack/issues/196)
- Provide `appPkgInfo()` function to get application json data directly

## Motivation

[How can a module get package data from an application's package.json?](https://stackoverflow.com/questions/16301722/in-node-js-how-can-a-module-get-data-from-an-applications-package-json)

```ts
// get applicaiton json data using pkginfo
pkginfo(require.main);
// =>
// {"name": "application", ...}

// or simply using appPkgInfo
appPkgInfo();
// =>
// {"name": "application", ...}
```

## Usage

Using `pkginfo` is idiot-proof, just import/require and invoke it.

```ts
const info = pkginfo(module);
console.dir(info);
```

Here's a sample of the output:

```js
{ name: 'simple-app',
  description: 'A test fixture for pkginfo',
  version: '0.1.0',
  keywords: [ 'test', 'fixture' ],
  main: './dist/index.js',
  scripts: { test: 'mocha __tests__/**/*.test.js' },
  engines: { node: '>= 12' } }
```

### License: MIT
