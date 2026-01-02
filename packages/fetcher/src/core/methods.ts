import { fetcher } from './fetcher';
import type { FetcherOptions, FetcherResponse } from './types';

/**
 * GETリクエスト
 */
export const getRequest = <T, E = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: FetcherOptions<E>
): Promise<FetcherResponse<T>> =>
  fetcher<T, E>(url, { ...options, params, method: 'GET' });

/**
 * POSTリクエスト
 */
export const postRequest = <T, E = unknown>(
  url: string,
  data?: unknown,
  options?: FetcherOptions<E>
): Promise<FetcherResponse<T>> =>
  fetcher<T, E>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * PUTリクエスト
 */
export const putRequest = <T, E = unknown>(
  url: string,
  data?: unknown,
  options?: FetcherOptions<E>
): Promise<FetcherResponse<T>> =>
  fetcher<T, E>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * DELETEリクエスト
 */
export const deleteRequest = <T, E = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: FetcherOptions<E>
): Promise<FetcherResponse<T>> =>
  fetcher<T, E>(url, { ...options, params, method: 'DELETE' });
