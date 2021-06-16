import * as paths from 'orx/paths';
import {createTranslator as create, TranslatorOptions} from '@libit/translate';

export function createTranslator(options?: TranslatorOptions) {
  return create('log', paths.join(__dirname, '..', 'intl'), options);
}

export default createTranslator();
