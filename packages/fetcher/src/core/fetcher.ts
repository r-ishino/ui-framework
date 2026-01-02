import { buildQueryString } from '../utils/queryString';
import { createFetcherError, FetcherOptions, FetcherResponse } from './types';

/**
 * カスタムヘッダーをRecord<string, string>に変換
 */
const parseCustomHeaders = (
  headers?: Record<string, string>
): Record<string, string> => headers || {};

/**
 * レスポンスボディを解析
 */
const parseResponseBody = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return response.json();
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (await response.text()) as unknown as T;
};

/**
 * Fetcher関数
 */
export const fetcher = async <T, E = unknown>(
  url: string,
  options?: FetcherOptions<E>
): Promise<FetcherResponse<T>> => {
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

      throw error;
    }

    // レスポンスインターセプター
    const data: T = onResponse ? await onResponse(response, rawData) : rawData;

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // AbortErrorの処理
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = createFetcherError<E>('Request timeout', 408);
      if (onError) {
        await onError(timeoutError);
      }
      throw timeoutError;
    }

    throw error;
  }
};
