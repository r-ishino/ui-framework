import { createFetcherError, isFetcherError, type FetcherError } from './error';

export type FetcherResponse<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

/**
 * Result型パターン: 成功時のレスポンス
 */
export type FetcherSuccess<T> = {
  type: 'success';
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
};

/**
 * Result型パターン: 失敗時のレスポンス
 */
export type FetcherFailure<E = unknown> = {
  type: 'failure';
  error: FetcherError<E>;
  status: number;
  message: string;
};

/**
 * Result型パターン: 成功または失敗のいずれか
 */
export type FetcherResult<T, E = unknown> =
  | FetcherSuccess<T>
  | FetcherFailure<E>;

/**
 * Result型の型ガード: 成功判定
 */
export const isSuccess = <T, E = unknown>(
  result: FetcherResult<T, E>
): result is FetcherSuccess<T> => result.type === 'success';

/**
 * Result型の型ガード: 失敗判定
 */
export const isFailure = <T, E = unknown>(
  result: FetcherResult<T, E>
): result is FetcherFailure<E> => result.type === 'failure';

/**
 * 成功レスポンスを作成
 */
export const createSuccess = <T>(
  data: T,
  status: number,
  statusText: string,
  headers: Headers
): FetcherSuccess<T> => ({
  type: 'success',
  data,
  status,
  statusText,
  headers,
});

/**
 * 失敗レスポンスを作成
 */
export const createFailure = <E>(
  error: unknown,
  status: number
): FetcherFailure<E> => {
  if (isFetcherError<E>(error)) {
    return {
      type: 'failure',
      error,
      status: error.status,
      message: error.message,
    };
  }
  // 予期しないエラーの場合 - FetcherErrorを作成
  const errorMessage = error instanceof Error ? error.message : String(error);
  const fetcherError = createFetcherError<E>(errorMessage, status);
  return {
    type: 'failure',
    error: fetcherError,
    status,
    message: errorMessage,
  };
};

/**
 * レスポンスボディを解析
 */
export const parseResponseBody = async <T>(response: Response): Promise<T> => {
  // 204 No Content やその他の空レスポンスを処理
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || response.status === 204) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return null as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    const text = await response.text();
    if (text.length === 0) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return null as unknown as T;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return JSON.parse(text);
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (await response.text()) as unknown as T;
};
