import { isObject } from './isObject';

/**
 * Check if the argument is blank (null, undefined, empty string, empty array, or empty object)
 * @param arg - The value to check
 * @returns True if the argument is blank
 */
export const isBlank = <T>(
  arg: T | null | undefined
): arg is null | undefined => {
  if (Array.isArray(arg)) {
    return arg.length === 0;
  }
  if (isObject(arg)) {
    return Object.keys(arg).length === 0;
  }
  if (typeof arg === 'boolean') {
    return arg === false;
  }
  return arg === null || arg === undefined || arg === '';
};
