/* global Response */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useFetcher } from './useFetcher';
import { FetcherConfigProvider } from '../components/FetcherConfigProvider';

// テスト用の Wrapper コンポーネント
const createWrapper = (config = { baseURL: 'https://api.example.com' }) => {
  const Wrapper = ({ children }: { children: ReactNode }): ReactNode => (
    <FetcherConfigProvider config={config}>{children}</FetcherConfigProvider>
  );
  return Wrapper;
};

describe('useFetcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch data successfully with global config', async () => {
    const mockData = { id: 1, name: 'Test User' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFetcher<typeof mockData>('/api/users/1'), {
      wrapper: createWrapper(),
    });

    // 初期状態
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // データ取得完了を待つ
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // 成功時の状態
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
    expect(result.current.mutate).not.toBe(null);
  });

  it('should fetch data successfully with custom fetcherOptions', async () => {
    const mockData = { id: 1, name: 'Test User' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        useFetcher<typeof mockData>('/api/users/1', {
          fetcherOptions: {
            baseURL: 'https://custom.example.com',
          },
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('should handle fetch error', async () => {
    type ApiError = { message: string; code: string };
    const errorData: ApiError = { message: 'Not found', code: 'E404' };
    const mockResponse = new Response(JSON.stringify(errorData), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFetcher<unknown, ApiError>('/api/users/999'), {
      wrapper: createWrapper(),
    });

    // データ取得完了を待つ
    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });

    // エラー時の状態
    expect(result.current.data).toBe(null);
    expect(result.current.error).not.toBe(null);
    expect(result.current.error?.status).toBe(404);
    expect(result.current.error?.data).toEqual(errorData);
  });

  it('should call errorFallback on error', async () => {
    const errorFallback = vi.fn();
    const mockResponse = new Response(JSON.stringify({ message: 'Error' }), {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        useFetcher('/api/users', {
          errorFallback,
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.error).not.toBe(null);
    });

    // errorFallbackが呼ばれることを確認
    expect(errorFallback).toHaveBeenCalledWith(result.current.error);
  });

  it('should not fetch when url is null', () => {
    vi.spyOn(globalThis, 'fetch');

    const { result } = renderHook(() => useFetcher(null), {
      wrapper: createWrapper(),
    });

    // fetchが呼ばれないことを確認
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isLoading).toBe(false);
  });

  it('should include query parameters', async () => {
    const mockData = [{ id: 1, name: 'User 1' }];
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        useFetcher('/api/users', {
          params: { page: 1, limit: 10 },
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.data).not.toBe(null);
    });

    // クエリパラメータが含まれていることを確認
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('page=1'),
      expect.any(Object)
    );
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });

  it('should be type safe', async () => {
    type User = { id: number; name: string; email: string };
    const mockData: User = { id: 2, name: 'Jane Doe', email: 'jane@example.com' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useFetcher<User>('/api/users/2'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).not.toBe(null);
    });

    // 型安全性を確認
    if (result.current.data) {
      const user: User = result.current.data;
      expect(user.id).toBe(2);
      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('jane@example.com');
    }
  });

  it('should support SWR options', async () => {
    const mockData = { id: 1, name: 'Test User' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () =>
        useFetcher('/api/users/1', {
          swrConfig: {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
          },
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.data).not.toBe(null);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
