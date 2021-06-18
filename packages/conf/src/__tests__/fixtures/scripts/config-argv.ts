/*
 * provider-argv.js: Test fixture for using yargs defaults with config.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

import {Conf} from '../../../conf';

const config = new Conf().argv();

process.stdout.write(config.get('something')!);
