/*
 * config-nested-env.js: Test fixture for env with nested keys.
 *
 * (C) 2012, Charlie Robbins and the Contributors.
 * (C) 2012, Michael Hart
 *
 */

import {Conf} from '../../../conf';

const config = new Conf().env('_');

process.stdout.write(config.get('SOME:THING')!);
