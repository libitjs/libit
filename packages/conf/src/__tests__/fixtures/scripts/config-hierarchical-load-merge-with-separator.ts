/*
 * config-hierarchical-load-merge.js: Test fixture for loading and merging nested objects across stores.
 *
 * (C) 2012, Charlie Robbins and the Contributors.
 * (C) 2012, Michael Hart
 *
 */

import path from 'path';
import {Conf} from '../../../conf';

const config = new Conf();

config.argv('--').env('__').file(path.join(__dirname, '..', 'merge', 'file1.json'));

process.stdout.write(
  JSON.stringify({
    apples: config.get('apples'),
    candy: config.get('candy'),
  }),
);
