import { isBlank } from './isBlank';

/**
 * 値が存在するかどうかを判定する（null/undefined/空文字/空配列/空オブジェクトでない）
 *
 * @example
 * ```typescript
 * isPresent('hello'); // true
 * isPresent(123); // true
 * isPresent(null); // false
 * isPresent(undefined); // false
 * isPresent(''); // false
 * isPresent([]); // false
 * isPresent({}); // false
 * ```
 */
export const isPresent = <T>(arg: T | null | undefined): arg is T =>
  !isBlank(arg);
