import isObject from 'tily/is/object';

export function safeJsonParse(thing: any) {
  if (isObject(thing)) return thing;
  try {
    return JSON.parse(thing);
  } catch (e) {
    return undefined;
  }
}
