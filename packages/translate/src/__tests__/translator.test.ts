import {expect, sinon} from '@loopback/testlab';
import {getFixturePath} from './support';
import {TranslateError} from '../errors';
import {Translator} from '../types';
import {createTranslator} from '../create-translator';
/* eslint-disable @typescript-eslint/no-explicit-any */
describe('createTranslator()', () => {
  let t: Translator;

  beforeEach(() => {
    t = createTranslator('common', getFixturePath('i18n-resources'));
  });

  it('errors if no namespace is provided', () => {
    expect(() => {
      createTranslator([], []);
    }).throw(TranslateError);
  });

  it('errors if no resource paths are provided', () => {
    expect(() => {
      createTranslator('common', []);
    }).throw(TranslateError);
  });

  it('errors if `autoDetect` and `locale` are empty', () => {
    expect(() => {
      createTranslator('common', getFixturePath('i18n-resources'), {
        autoDetect: false,
      });
    }).throw(TranslateError);
  });

  it('load translated messages', () => {
    expect(t.translate('common:key')).equal('value');
  });

  it('returns a message at the defined key', () => {
    expect(t.translate('common:key')).equal('value');
  });

  it('sets primary namespace', () => {
    expect(t.translate('key')).equal('value');
  });

  it('handles array of keys', () => {
    expect(t.translate(['unknown', 'key'])).equal('value');
  });

  it('sets `dir` and `locale`', () => {
    expect(t.direction).equal('ltr');
    expect(t.locale).equal('en');
  });

  it('calls `t` on i18next instance', () => {
    const spy = sinon.spy(t.i18n, 't');
    expect(t.translate('missing', {foo: 'bar'}, {defaultValue: 'Hello'})).equal('Hello');
    expect(
      spy.calledWith('missing', {
        defaultValue: 'Hello',
        interpolation: {escapeValue: false},
        lng: undefined,
        replace: {foo: 'bar'},
      } as any),
    ).ok();
    spy.restore();
  });

  describe('translate()', () => {
    beforeEach(() => {
      t = createTranslator('common', [getFixturePath('i18n-resources'), getFixturePath('i18n-resources-more')]);
    });

    it('merges objects from multiple resource paths', () => {
      expect(t.translate('common:lang')).equal('en');
      expect(t.translate('common:region')).equal('region'); // MISSING
    });

    it('supports locale with region', async () => {
      await t.changeLocale('en-US');

      expect(t.translate('common:lang')).equal('en');
      expect(t.translate('common:region')).equal('us');
    });

    it('alias t() and m()', function () {
      expect(t.t('key')).equal('value');
      expect(t.m('key')).equal('value');
    });
  });

  describe('changeLocale()', () => {
    it('calls `changeLanguage` on i18next', async () => {
      const spy = sinon.spy(t.i18n, 'changeLanguage');
      await t.changeLocale('ja');
      expect(spy.calledWith('ja')).ok();
      spy.restore();
    });

    it('updates `dir` and `locale`', async () => {
      await t.changeLocale('ja');
      expect(t.direction).equal('ltr');
      expect(t.locale).equal('ja');
    });
  });

  describe('translate with variables', function () {
    it('should translate with named variables', function () {
      expect(t.t('foo {{name}}', {name: 'bar'})).equal('foo bar');
    });

    it('should translate with list variables', function () {
      expect(t.t('foo {{0}}', ['bar'])).equal('foo bar');
    });
  });
});
