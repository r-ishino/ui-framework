import useSWR, { type SWRConfiguration, type KeyedMutator } from 'swr';
import { createFetcherClient } from '../core/fetcher_client';
import type { FetcherOptions } from '../core/fetcher';
import type { FetcherError } from '../core/error';

// ========================================
// 型定義
// ========================================

/**
 * useFetcherのオプション型
 */
export type UseFetcherOptions<T, E = unknown> = {
  /** クエリパラメータ */
  params?: Record<string, unknown> | null;
  /** fetcherのオプション（baseURL, headers, timeout など） */
  fetcherOptions?: FetcherOptions<E>;
  /** エラー時のフォールバック処理 */
  errorFallback?: (error: FetcherError<E>) => void;
  /** SWRのオプション */
  swrConfig?: SWRConfiguration<T, FetcherError<E>>;
};

/**
 * useFetcherの戻り値型
 */
export type UseFetcherResult<T, E = unknown> = {
  /** レスポンスデータ（成功時） */
  data: T | null;
  /** SWRのmutate関数（キャッシュ更新用） */
  mutate: KeyedMutator<T> | null;
  /** エラー（失敗時） */
  error: FetcherError<E> | null;
  /** ローディング状態 */
  isLoading: boolean;
  /** 再検証中 */
  isValidating: boolean;
};

// ========================================
// useFetcher実装
// ========================================

/**
 * useSWRベースのデータ取得hook
 * GET専用。POST/PUT/DELETEは useFetcherClient を使用
 *
 * FetcherConfigProvider で設定したグローバル設定が自動的に適用される。
 * fetcherOptions を指定すると、グローバル設定を上書きできる。
 *
 * @example
 * グローバル設定を使う（推奨）
 * ```typescript
 * const { data, error, isLoading } = useFetcher<User>('/api/users/1');
 * ```
 *
 * @example
 * パラメータ付き
 * ```typescript
 * const { data, error, isLoading } = useFetcher<User[]>('/api/users', {
 *   params: { page: 1, limit: 10 },
 * });
 * ```
 *
 * @example
 * 個別にオプションを上書き
 * ```typescript
 * const { data, error, isLoading } = useFetcher<User>(
 *   '/api/users/1',
 *   {
 *     fetcherOptions: {
 *       timeout: 60000, // グローバル設定を上書き
 *     },
 *     errorFallback: (error) => {
 *       console.error('Failed to fetch:', error.message);
 *     },
 *   }
 * );
 * ```
 */
export const useFetcher = <T, E = unknown>(
  url: string | null,
  options?: UseFetcherOptions<T, E>
): UseFetcherResult<T, E> => {
  const {
    params,
    fetcherOptions,
    errorFallback,
    swrConfig,
  } = options ?? {};

  // SWR用のキー生成（urlとparamsを組み合わせる）
  const swrKey = url === null ? null : { url, params: params ?? undefined };

  // fetcherOptions が指定されている場合のみカスタムfetcherを使用
  // 指定されていない場合（null）は、SWRConfigのfetcherが使われる
  const customFetcher = fetcherOptions
    ? async (key: { url: string; params?: Record<string, unknown> }): Promise<T> => {
        // fetcherOptions が指定されている場合は、新しいクライアントを作成
        const customClient = createFetcherClient(fetcherOptions);
        const result = await customClient.get<T, E>(key.url, key.params);

        if (result.type === 'success') {
          return result.data;
        }

        // 失敗時はエラーをthrow（SWRのエラーハンドリングのため）
        throw result.error;
      }
    : null;

  const { data, mutate, error, isLoading, isValidating } = useSWR<T, FetcherError<E>>(
    swrKey,
    customFetcher, // null の場合、SWRConfigのfetcherが使われる
    swrConfig
  );

  // エラーハンドリング
  if (error != null && errorFallback != null) {
    errorFallback(error);
  }

  return {
    data: data ?? null,
    mutate: mutate ?? null,
    error: error ?? null,
    isLoading,
    isValidating,
  };
};
