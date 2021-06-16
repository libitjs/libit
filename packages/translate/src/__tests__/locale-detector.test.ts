import {expect, sinon} from '@loopback/testlab';
import osLocale from 'os-locale';
import {LocaleDetector} from '../locale-detector';

describe('LocaleDetector', () => {
  const {argv} = process;
  let stubOsLocal: sinon.SinonStub;
  let detector: LocaleDetector;

  before(() => {
    stubOsLocal = sinon.stub(osLocale, 'sync').callsFake(() => 'en-US');
  });

  after(() => {
    stubOsLocal.restore();
  });

  beforeEach(() => {
    detector = new LocaleDetector();
    detector.locale = '';
  });

  afterEach(() => {
    process.argv = argv;
  });

  it('returns the locale explicitly defined', () => {
    detector.cacheUserLanguage('fr-FR');

    expect(detector.detect()).equal('fr-FR');
  });

  it('returns the locale from argv', () => {
    process.argv = ['--locale', 'de'];

    expect(detector.detect()).equal('de');
  });

  it('returns the locale from the OS', () => {
    expect(detector.detect()).equal('en-US');
  });

  it('handles missing locale arg', () => {
    process.argv = [];

    expect(detector.detect()).equal('en-US');
  });

  it('handles no locale arg value', () => {
    process.argv = ['--locale', '--foo'];

    expect(detector.detect()).equal('en-US');
  });
});
