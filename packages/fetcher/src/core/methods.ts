import { fetcher, type FetcherOptions } from './fetcher';
import type { FetcherResult } from './response';

/**
 * GET リクエスト (Result型)
 * エラーをthrowせず、FetcherResultを返す
 */
export const getRequest = <T, E = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: FetcherOptions<E>
): Promise<FetcherResult<T, E>> =>
  fetcher<T, E>(url, { ...options, params, method: 'GET' });

/**
 * POST リクエスト (Result型)
 * エラーをthrowせず、FetcherResultを返す
 */
export const postRequest = <T, E = unknown>(
  url: string,
  data?: unknown,
  options?: FetcherOptions<E>
): Promise<FetcherResult<T, E>> =>
  fetcher<T, E>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * PUT リクエスト (Result型)
 * エラーをthrowせず、FetcherResultを返す
 */
export const putRequest = <T, E = unknown>(
  url: string,
  data?: unknown,
  options?: FetcherOptions<E>
): Promise<FetcherResult<T, E>> =>
  fetcher<T, E>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * DELETE リクエスト (Result型)
 * エラーをthrowせず、FetcherResultを返す
 */
export const deleteRequest = <T, E = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: FetcherOptions<E>
): Promise<FetcherResult<T, E>> =>
  fetcher<T, E>(url, { ...options, params, method: 'DELETE' });
