import isClass from './utils/is-class';
import isMethod from './utils/is-method';
import isProperty from './utils/is-property';
import isParam from './utils/is-param';

export function deprecate(message?: string) {
  return (target: Function | Object, property?: string | symbol, descriptor?: unknown): void => {
    const isProtoOrStatic = typeof target === 'function';
    const className = isProtoOrStatic ? (target as Function).name : target.constructor.name;
    const accessSymbol = isProtoOrStatic ? `.${String(property)}` : `#${String(property)}`;

    // Class
    if (isClass(target, property, descriptor)) {
      console.debug(message || `Class \`${className}\` has been deprecated.`);

      // Method
    } else if (isMethod(target, property, descriptor)) {
      console.debug(message || `Method \`${className + accessSymbol}()\` has been deprecated.`);

      // Property
    } else if (isProperty(target, property, descriptor)) {
      console.debug(message || `Property \`${className + accessSymbol}\` has been deprecated.`);

      // Param (Babel/Jest doesnt support them)
    } /* istanbul ignore next */ else if (isParam(target, property, descriptor)) {
      console.debug(message || `Parameter ${descriptor} for \`${className + accessSymbol}()\` has been deprecated.`);
    }
  };
}
