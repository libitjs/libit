import './globalize';
import {program} from '@caporal/core';
import {sn} from '@libit/sn';

const g = require('strong-globalize')();
const pkg = require('../package.json');

export async function cli(argv?: string[]) {
  program
    .version(pkg.version)
    .description(g.f('Retrieve the serial number of the local machine.'))
    .option('-c, --cwd <cwd>', g.f('The custom current working directory'))
    .option('-f, --file <file>', g.f('The custom cache file name'))
    .option('-p, --prefix <prefix>', g.f('A string to be prefixed ahead of the shell command to be run'))
    .option('-u, --uuid', g.f('Prefer to retrieve uuid on the first attempt'))
    .option('-d, --hash', g.f('Retrieve the hashed serial number'))
    .option('-s, --size <size>', g.f('Slice the serial number to specified size'))
    .action(async ({options}) => {
      console.log(await sn(Object.assign({}, options)));
    });

  await program.run(argv);
}

if (require.main === module) {
  cli(process.argv.slice(2)).catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
