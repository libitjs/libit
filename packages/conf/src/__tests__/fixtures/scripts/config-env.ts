/*
 * provider-argv.js: Test fixture for using process.env defaults with config.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Conf} from '../../../conf';

const provider = new Conf().env();

process.stdout.write(provider.get('SOMETHING')!);
