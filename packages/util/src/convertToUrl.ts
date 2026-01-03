import { getObjectKeys } from './objects/getObjectKeys';
import { isPresent } from './helpers/isPresent';

/**
 * パスとクエリパラメータから URL を生成する
 *
 * null/undefined のパラメータは除外される。
 * boolean 値も含めることができる。
 * 配列は複数の同名パラメータとして展開される（例: `key=val1&key=val2`）。
 *
 * @example
 * ```typescript
 * convertToUrl('/api/users', { page: 1, limit: 10 });
 * // => '/api/users?page=1&limit=10'
 *
 * convertToUrl('/api/users', { tags: ['a', 'b'] });
 * // => '/api/users?tags=a&tags=b'
 *
 * convertToUrl('/api/users', { flag: true });
 * // => '/api/users?flag=true'
 *
 * convertToUrl('/api/users', { name: null, age: undefined });
 * // => '/api/users' (null/undefined は除外される)
 *
 * convertToUrl('/api/users');
 * // => '/api/users'
 * ```
 */
export const convertToUrl = (
  path: string,
  params?: Record<string, unknown>
): string => {
  if (params == null) {
    return path;
  }

  const compactedParams: Record<string, unknown> = {};

  getObjectKeys(params).forEach((key) => {
    const value = params[key];
    if (typeof value === 'boolean' || isPresent(value)) {
      compactedParams[key] = value;
    }
  });

  if (getObjectKeys(compactedParams).length === 0) {
    return path;
  }

  const searchParams = new URLSearchParams();
  getObjectKeys(compactedParams).forEach((key) => {
    const value = compactedParams[key];

    if (Array.isArray(value)) {
      // 配列の場合は複数の同名パラメータとして追加
      value.forEach((v) => {
        searchParams.append(String(key), String(v));
      });
    } else {
      searchParams.append(String(key), String(value));
    }
  });

  const queryString = searchParams.toString();
  return `${path}?${queryString}`;
};
