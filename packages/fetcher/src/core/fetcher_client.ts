import { getRequest, postRequest, putRequest, deleteRequest } from './methods';
import type { FetcherOptions } from './fetcher';
import type { FetcherResult } from './response';

/**
 * FetcherClient の型定義
 */
export type FetcherClient = {
  get: <T, E = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options?: FetcherOptions<E>
  ) => Promise<FetcherResult<T, E>>;
  post: <T, E = unknown>(
    url: string,
    data?: unknown,
    options?: FetcherOptions<E>
  ) => Promise<FetcherResult<T, E>>;
  put: <T, E = unknown>(
    url: string,
    data?: unknown,
    options?: FetcherOptions<E>
  ) => Promise<FetcherResult<T, E>>;
  delete: <T, E = unknown>(
    url: string,
    params?: Record<string, unknown>,
    options?: FetcherOptions<E>
  ) => Promise<FetcherResult<T, E>>;
};

/**
 * 設定を受け取って FetcherClient を作成する Factory 関数
 *
 * @example
 * Server Component / Client Component での使用
 * ```typescript
 * // lib/fetcherConfig.ts
 * import { createFetcherClient } from '@r-ishino/sample-fetcher';
 *
 * export const fetcherConfig = {
 *   baseURL: 'https://api.example.com',
 *   timeout: 30000,
 * };
 *
 * // Server Component / Client Component 両方で使用可能
 * export const fetcherClient = createFetcherClient(fetcherConfig);
 *
 * // 使用例
 * const result = await fetcherClient.get<User[]>('/api/users');
 * if (result.type === 'success') {
 *   console.log(result.data);
 * }
 * ```
 */
export const createFetcherClient = <E = unknown>(
  config?: FetcherOptions<E>
): FetcherClient => {
  /**
   * 設定をマージするヘルパー関数
   */
  const mergeOptions = <OptionE = unknown>(
    options?: FetcherOptions<OptionE>
  ): FetcherOptions<OptionE> | undefined => {
    if (!config && !options) {
      return undefined;
    }

    if (!config) {
      return options;
    }

    if (!options) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return config as FetcherOptions<OptionE>;
    }

    // 両方ある場合はマージ
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const merged = {
      ...config,
      ...options,
    } as FetcherOptions<OptionE>;

    // headersを個別にマージ
    if (config.headers || options.headers) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      merged.headers = {
        ...config.headers,
        ...options.headers,
      } as Record<string, string>;
    }

    return merged;
  };

  return {
    get: <T, OptionE = unknown>(
      url: string,
      params?: Record<string, unknown>,
      options?: FetcherOptions<OptionE>
    ): Promise<FetcherResult<T, OptionE>> =>
      getRequest<T, OptionE>(url, params, mergeOptions(options)),

    post: <T, OptionE = unknown>(
      url: string,
      data?: unknown,
      options?: FetcherOptions<OptionE>
    ): Promise<FetcherResult<T, OptionE>> =>
      postRequest<T, OptionE>(url, data, mergeOptions(options)),

    put: <T, OptionE = unknown>(
      url: string,
      data?: unknown,
      options?: FetcherOptions<OptionE>
    ): Promise<FetcherResult<T, OptionE>> =>
      putRequest<T, OptionE>(url, data, mergeOptions(options)),

    delete: <T, OptionE = unknown>(
      url: string,
      params?: Record<string, unknown>,
      options?: FetcherOptions<OptionE>
    ): Promise<FetcherResult<T, OptionE>> =>
      deleteRequest<T, OptionE>(url, params, mergeOptions(options)),
  };
};
