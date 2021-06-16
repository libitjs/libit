import {BackendModule, Resource, ResourceKey} from 'i18next';
import {Configurable} from 'orx/configurable';
import {Path} from 'orx/path';
import {Config} from '@libit/conf';
import {TranslateError} from './errors';
import {Locale, ResourceFormat} from './types';

const EXTS: {[K in ResourceFormat]: string[]} = {
  js: ['js'],
  json: ['json', 'json5'],
  yaml: ['yaml', 'yml'],
};

export interface FileBackendOptions {
  format?: ResourceFormat;
  paths?: Path[];
}

export class FileBackend extends Configurable<FileBackendOptions> implements BackendModule {
  fileCache = new Map<Path, ResourceKey>();

  type: 'backend' = 'backend';

  get defaultOptions(): Partial<FileBackendOptions> {
    return {
      format: 'yaml',
    };
  }

  init(services: unknown, options: Partial<FileBackendOptions>) {
    this.configure(options);

    // Validate resource paths are directories
    this.options.paths.forEach(path => {
      if (path.exists() && !path.isDirectory()) {
        throw new TranslateError('RESOURCE_PATH_INVALID', [path.path()]);
      }
    });
  }

  // istanbul ignore next
  create() {
    // We don't need this but is required by the interface
  }

  read(locale: Locale, namespace: string, callback: (error: Error | null, resources: Resource) => void): ResourceKey {
    const {format, paths} = this.options;
    const resources: ResourceKey = {};

    paths.forEach(path => {
      EXTS[format].some(ext => {
        const resPath = path.append(locale, `${namespace}.${ext}`);
        const isCached = this.fileCache.has(resPath);

        if (!resPath.exists()) {
          return false;
        }

        if (!isCached) {
          this.fileCache.set(
            resPath,
            ext === 'js' ? require(resPath.path()) : new Config().file(resPath.path()).get()!,
          );
        }

        Object.assign(resources, this.fileCache.get(resPath));

        return true;
      });
    });

    callback(null, resources);

    return resources;
  }
}
