const {pkginfo} = require('../../..')

const [data] = pkginfo.sync(module, false);
console.log(JSON.stringify(data));
