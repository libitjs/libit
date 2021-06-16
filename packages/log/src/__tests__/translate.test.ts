import {expect} from '@loopback/testlab';
import {createTranslator} from '../translate';

describe('translate', function () {
  it('should translate with en locale', function () {
    const t = createTranslator({locale: 'en'});
    expect(t.t('log')).equal('log');
  });

  it('should translate with zh-CN locale', function () {
    const t = createTranslator({locale: 'zh'});
    expect(t.t('log')).equal('日志');
  });
});
