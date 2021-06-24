const {config} = require('../..');

//
// 1. any overrides
//
config.overrides({
  always: 'be this value',
});

//
// 2. `process.env`
// 3. `process.argv`
//
config.env().argv();

//
// 4. Values in `config.json`
//
config.file('./config1.json');

//
// Or with a custom name
// Note: A custom key must be supplied for hierarchy to work if multiple files are used.
//
config.file('custom', './config2.json');

//
// Or searching from a base directory.
// Note: `name` is optional.
//
config.file('app', {
  file: 'config.json',
  dir: __dirname,
  search: true,
});

//
// 5. Any default values
//
config.defaults({
  'if nothing else': 'use this value',
});

console.log(config.get());
