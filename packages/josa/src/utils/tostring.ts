export function toString(target: any) {
  if (typeof target === 'string') {
    return target;
  }
  if (typeof target === 'number' || Buffer.isBuffer(target)) {
    return target.toString();
  }
  return JSON.stringify(target);
}
