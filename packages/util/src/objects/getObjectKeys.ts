/**
 * オブジェクトのキーを型安全に取得する
 *
 * @example
 * ```typescript
 * const obj = { a: 1, b: 2, c: 3 };
 * const keys = getObjectKeys(obj); // ('a' | 'b' | 'c')[]
 * ```
 */
export const getObjectKeys = <T extends { [key: string]: unknown }>(
  obj: T
): (keyof T)[] => Object.keys(obj);
