import * as paths from 'orx/paths';
import {createTranslator as originCreateTranslator, TranslatorOptions} from '@libit/translate';

export function createTranslator(options?: TranslatorOptions) {
  return originCreateTranslator('log', paths.join(__dirname, '..', 'intl'), options);
}

export default createTranslator();
