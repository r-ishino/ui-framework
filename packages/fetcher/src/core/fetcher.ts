import { buildQueryString } from '../utils/queryString';
import { createFetcherError, type FetcherError } from './error';
import {
  createSuccess,
  createFailure,
  parseResponseBody,
  type FetcherResult,
} from './response';

export type FetcherOptions<E = unknown> = RequestInit & {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  onRequest?: (
    config: FetcherOptions<E>
  ) => FetcherOptions<E> | Promise<FetcherOptions<E>>;
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>;
  onError?: (error: FetcherError<E>) => void | Promise<void>;
};

/**
 * カスタムヘッダーをRecord<string, string>に変換
 */
const parseCustomHeaders = (
  headers?: Record<string, string>
): Record<string, string> => headers || {};

/**
 * Fetcher関数（Result型を返す）
 */
export const fetcher = async <T, E = unknown>(
  url: string,
  options?: FetcherOptions<E>
): Promise<FetcherResult<T, E>> => {
  const {
    baseURL = '',
    timeout = 30000,
    params,
    onRequest,
    onResponse,
    onError,
    headers: customHeaders,
    ...requestInit
  } = options || {};

  // URL構築
  const queryString = params ? buildQueryString(params) : '';
  const fullUrl = `${baseURL}${url}${queryString ? `?${queryString}` : ''}`;

  // リクエストヘッダー準備
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...parseCustomHeaders(customHeaders),
  };

  // リクエストインターセプター
  const finalOptions: FetcherOptions<E> = {
    ...requestInit,
    headers,
    ...(onRequest ? await onRequest({ ...requestInit, headers }) : {}),
  };

  // タイムアウト処理
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await globalThis.fetch(fullUrl, {
      ...finalOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // レスポンスボディの解析
    const rawData = await parseResponseBody<T>(response);

    // エラーレスポンスの処理
    if (!response.ok) {
      const error = createFetcherError<E>(
        response.statusText || 'Request failed',
        response.status,
        response,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        rawData as unknown as E
      );

      if (onError) {
        await onError(error);
      }

      return createFailure<E>(error, response.status);
    }

    // レスポンスインターセプター
    const data: T = onResponse ? await onResponse(response, rawData) : rawData;

    return createSuccess(data, response.status, response.statusText, response.headers);
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortErrorの処理
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = createFetcherError<E>('Request timeout', 408);
      if (onError) {
        await onError(timeoutError);
      }
      return createFailure<E>(timeoutError, 408);
    }

    return createFailure<E>(error, 500);
  }
};
