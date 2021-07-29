export type ErrorLike =
  | Error
  | string
  | {
      code?: string | number;
      message?: string;
      [p: string]: any;
    };

export function isErrorLike(x: any): x is ErrorLike {
  return typeof x === 'string' || x instanceof Error || typeof x?.message === 'string';
}
