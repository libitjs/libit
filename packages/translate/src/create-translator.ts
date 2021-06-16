import {PortablePath} from 'orx/path';
import {DefaultTranslator, TranslatorOptions} from './translator';
import {Translator} from './types';

export function createTranslator(
  namespace: string | string[],
  resourceDir: PortablePath | PortablePath[],
  options: TranslatorOptions = {},
): Translator {
  return new DefaultTranslator(namespace, resourceDir, options);
}
