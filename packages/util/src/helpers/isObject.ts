/**
 * Check if the argument is a plain object
 * @param arg - The value to check
 * @returns True if the argument is a plain object
 */
export const isObject = (arg: unknown): arg is object =>
  typeof arg === 'object' &&
  arg !== null &&
  !Array.isArray(arg) &&
  arg.constructor === Object;
