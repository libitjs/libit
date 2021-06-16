import {i18n, InterpolationOptions} from 'i18next';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Direction = 'ltr' | 'rtl';

export type ResourceFormat = 'js' | 'json' | 'yaml';

export type Locale = string;

export interface InterpolationParams {
  [key: string]: unknown;
}

export interface MessageOptions {
  /** Default value to return if a translation was not found. */
  defaultValue?: string;
  /** Count used to determine plurals. */
  count?: number;
  /** Context used for special parsing (male, female, etc). */
  context?: string;
  /** Interpolation options to pass down. */
  interpolation?: InterpolationOptions;
  /** Force translation to this locale. */
  locale?: Locale;
  /** Post-processors to run on the translation. */
  postProcess?: string | string[];
}

export interface Translator {
  direction: Direction;
  locale: Locale;
  changeLocale: (locale: Locale) => Promise<void>;
  // Testing only
  i18n: i18n;

  translate(key: string | string[], params?: InterpolationParams, options?: MessageOptions): string;
  t(key: string | string[], params?: InterpolationParams | any[], options?: MessageOptions): string;
  m(key: string | string[], params?: InterpolationParams | any[], options?: MessageOptions): string;
}
