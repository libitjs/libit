import isPlainObject from 'tily/is/plainObject';
import {ObjectSchema} from '../types';

export function validate(schema: ObjectSchema<string>, object: any, parameterName: string, allowUnknown: Boolean) {
  if (!isPlainObject(object)) {
    throw new Error('Expected "' + parameterName + '" to be a plain object.');
  }
  Object.keys(object).forEach(function (key) {
    const validator = schema[key];
    if (!validator) {
      if (!allowUnknown) {
        throw new Error('"' + key + '" is not allowed in "' + parameterName + '"');
      }
      return;
    }
    if (!validator.isValid(object[key])) {
      throw new Error(validator.message);
    }
  });
}
