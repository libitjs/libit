import {expect, sinon} from '@loopback/testlab';
import {Path} from 'orx/path';
import {FileBackend} from '../file-backend';
import {getFixturePath} from './support';

describe('FileBackend', () => {
  let backend: FileBackend;

  beforeEach(() => {
    backend = new FileBackend({
      paths: [new Path(getFixturePath('i18n-resources'))],
    });
  });

  describe('init()', () => {
    it('sets options on class', () => {
      backend.init({}, {format: 'yaml'});

      expect(backend.options.format).equal('yaml');
    });

    it('errors if resource path is not a directory', () => {
      const resPath = new Path(__dirname, '../../package.json');

      expect(() => {
        backend.init(
          {},
          {
            paths: [resPath],
          },
        );
      }).throw(new RegExp(`Resource path "${resPath.path()}" must be a directory.`));
    });
  });

  describe('read()', () => {
    it('supports .js extension', () => {
      backend.configure({format: 'js'});

      expect(backend.read('en', 'type-js', () => {})).deepEqual({type: 'js'});
    });

    // it('supports .mjs extension', () => {
    //   backend.configure({ format: 'js' });

    //   expect(backend.read('en', 'type-mjs', () => {})).deepEqual({ type: 'mjs' });
    // });

    it('supports .json extension', () => {
      backend.configure({format: 'json'});

      expect(backend.read('en', 'type-json', () => {})).deepEqual({
        type: 'json',
      });
    });

    it('supports .json5 extension', () => {
      backend.configure({format: 'json'});

      expect(backend.read('en', 'type-json5', () => {})).deepEqual({
        type: 'json5',
      });
    });

    it('supports .yaml extension', () => {
      backend.configure({format: 'yaml'});

      expect(backend.read('en', 'type-yaml', () => {})).deepEqual({
        type: 'yaml',
      });
    });

    it('supports .yml extension', () => {
      backend.configure({format: 'yaml'});

      expect(backend.read('en', 'type-yaml-short', () => {})).deepEqual({
        type: 'yaml',
        short: true,
      });
    });

    it('returns empty object for missing locale', () => {
      expect(backend.read('fr', 'unknown', () => {})).deepEqual({});
    });

    it('returns object for defined locale', () => {
      expect(backend.read('en', 'common', () => {})).deepEqual({key: 'value'});
    });

    it('caches files after lookup', () => {
      expect(backend.fileCache.size).equal(0);

      backend.read('en', 'common', () => {});

      expect(backend.fileCache.size).equal(1);
    });

    it('passes the resources to the callback', () => {
      const spy = sinon.spy();

      backend.read('en', 'common', spy);

      expect(spy.calledWith(null, {key: 'value'})).ok();
    });

    it('merges objects from multiple resource paths', () => {
      backend.options.paths.push(new Path(getFixturePath('i18n-resources-more')));

      expect(backend.read('en', 'common', () => {})).deepEqual({
        key: 'value',
        lang: 'en',
      });
    });
  });
});
