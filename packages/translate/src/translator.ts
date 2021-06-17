import i18next, {i18n, InitOptions, TFunction} from 'i18next';
import {Path, PortablePath} from 'orx/path';
import {asArray, isFalsyOrEmpty} from 'orx/arrays';
import {Direction, InterpolationParams, Locale, MessageOptions, ResourceFormat, Translator} from './types';
import {TranslateError} from './errors';
import {FileBackend} from './file-backend';
import {LocaleDetector} from './locale-detector';

const debug = require('debug')('libit:translate:translator');

export interface TranslatorOptions {
  /** Automatically detect the locale from the environment. Defaults to `true`. */
  autoDetect?: boolean;
  /** Enable debugging by logging info to the console. */
  debug?: boolean;
  /** Fallback locale(s) to use when the detected locale isn't translated. Defaults to `en`. */
  fallbackLocale?: Locale | Locale[];
  /** Locale to explicitly use. */
  locale?: Locale;
  /** Order in which to load and lookup locale translations. */
  lookupType?: InitOptions['load'];
  /** File format resource bundles are written in. Defaults to `yaml`. */
  resourceFormat?: ResourceFormat;
}

const DEFAULT_TRANSLATOR_OPTIONS: TranslatorOptions = {
  autoDetect: true,
  debug: false,
  fallbackLocale: 'en',
  lookupType: 'all',
  resourceFormat: 'yaml',
};

export class DefaultTranslator implements Translator {
  protected opts: TranslatorOptions;
  readonly i18n: i18n;
  readonly ready: Promise<TFunction>;

  constructor(
    namespace: string | string[],
    resourceDir: PortablePath | PortablePath[],
    options: TranslatorOptions = {},
  ) {
    const namespaces = asArray(namespace);
    const resourcePaths = asArray(resourceDir).map(Path.create);

    this.opts = {
      ...DEFAULT_TRANSLATOR_OPTIONS,
      ...options,
    };

    if (isFalsyOrEmpty(namespaces)) {
      throw new TranslateError('NAMESPACE_REQUIRED');
    } else if (isFalsyOrEmpty(resourcePaths)) {
      throw new TranslateError('RESOURCES_REQUIRED');
    } else if (!this.opts.autoDetect && !this.opts.locale) {
      throw new TranslateError('LOCALE_REQUIRED');
    }

    // istanbul ignore if
    if (debug.enabled) {
      debug('New translator created: %s namespace(s)', namespaces.join(', '));
    }

    this.i18n = i18next.createInstance().use(new FileBackend());

    if (this.opts.autoDetect) {
      this.i18n.use(new LocaleDetector());
    }

    this.ready = this.i18n.init(
      {
        backend: {
          format: this.opts.resourceFormat,
          paths: resourcePaths,
        },
        cleanCode: true,
        debug: this.opts.debug,
        defaultNS: namespaces[0],
        fallbackLng: this.opts.fallbackLocale,
        initImmediate: false,
        lng: this.opts.locale,
        load: this.opts.lookupType,
        lowerCaseLng: false,
        ns: namespaces,
        returnEmptyString: true,
        returnNull: true,
      },
      handleError,
    );
  }

  get direction(): Direction {
    return this.i18n.dir();
  }

  get locale(): Locale {
    return this.i18n.language;
  }

  translate(
    key: string | string[],
    params?: InterpolationParams | any[],
    {interpolation, locale: lng, ...options}: MessageOptions = {},
  ): string {
    return this.i18n.t(key, {
      interpolation: {escapeValue: false, ...interpolation},
      ...options,
      lng,
      replace: params,
    });
  }

  t(key: string | string[], params?: InterpolationParams | any[], options?: MessageOptions): string {
    return this.translate(key, params, options);
  }

  m(key: string | string[], params?: InterpolationParams | any[], options?: MessageOptions): string {
    return this.translate(key, params, options);
  }

  async changeLocale(locale: Locale): Promise<void> {
    debug('Locale manually changed to "%s"', locale);
    await this.i18n.changeLanguage(locale);
  }
}

// istanbul ignore next
function handleError(error: Error | null) {
  if (error) {
    throw error;
  }
}
