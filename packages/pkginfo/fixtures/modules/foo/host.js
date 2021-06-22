const {pkginfo} = require('../../..')

const [data] = pkginfo.sync(require.main ,false);
console.log(JSON.stringify(data));
