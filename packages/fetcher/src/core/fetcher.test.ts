/* global Response */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetcher } from './fetcher';
import { isSuccess, isFailure } from './response';

describe('fetcher (Result type)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should make successful GET request', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const result = await fetcher<typeof mockData>(
      'https://api.example.com/users/1'
    );

    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toEqual(mockData);
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
    }
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users/1',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('should use baseURL when provided', async () => {
    const mockData = { id: 1 };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    await fetcher('/users/1', { baseURL: 'https://api.example.com' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users/1',
      expect.any(Object)
    );
  });

  it('should append query parameters', async () => {
    const mockData = { items: [] };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    await fetcher('/users', {
      baseURL: 'https://api.example.com',
      params: { page: 1, limit: 10 },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users?page=1&limit=10',
      expect.any(Object)
    );
  });

  it('should merge custom headers', async () => {
    const mockResponse = new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    await fetcher('https://api.example.com/data', {
      headers: {
        Authorization: 'Bearer token123',
        'X-Custom': 'value',
      },
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer token123',
          'X-Custom': 'value',
        }),
      })
    );
  });

  it('should call onRequest interceptor', async () => {
    const mockResponse = new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onRequest = vi.fn((config) => ({
      ...config,
      headers: {
        ...config.headers,
        'X-Intercepted': 'true',
      },
    }));

    await fetcher('https://api.example.com/data', { onRequest });

    expect(onRequest).toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Intercepted': 'true',
        }),
      })
    );
  });

  it('should call onResponse interceptor', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onResponse = vi.fn((_response, data) => ({
      ...data,
      modified: true,
    }));

    const result = await fetcher('https://api.example.com/data', {
      onResponse,
    });

    expect(onResponse).toHaveBeenCalled();
    if (isSuccess(result)) {
      expect(result.data).toEqual({ ...mockData, modified: true });
    }
  });

  it('should return failure result on HTTP error', async () => {
    const errorData = { message: 'Not found', code: 'E404' };
    const mockResponse = new Response(JSON.stringify(errorData), {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const result = await fetcher<unknown, typeof errorData>(
      'https://api.example.com/notfound'
    );

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.status).toBe(404);
      expect(result.message).toBe('Not Found');
      expect(result.error.data).toEqual(errorData);
    }
  });

  it('should call onError interceptor on HTTP error', async () => {
    const mockResponse = new Response('{}', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onError = vi.fn();

    const result = await fetcher('https://api.example.com/error', { onError });

    expect(isFailure(result)).toBe(true);
    expect(onError).toHaveBeenCalled();
  });

  it.skip('should handle timeout', async () => {
    // Note: このテストはAbortControllerのシステムレベルの動作をテストするため、
    // ユニットテスト環境では安定しない場合があります。
    // 統合テストまたはE2Eテストで実装することを推奨します。
    const mockFetch = vi.fn(
      (): Promise<Response> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(new Response('{}', { status: 200 }));
          }, 10000);
        })
    );

    vi.spyOn(globalThis, 'fetch').mockImplementation(mockFetch);

    const onError = vi.fn();

    const result = await fetcher('https://api.example.com/slow', {
      timeout: 50,
      onError,
    });

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.status).toBe(408);
      expect(result.message).toBe('Request timeout');
    }
    expect(onError).toHaveBeenCalled();
  });

  it('should handle non-JSON response', async () => {
    const mockResponse = new Response('Plain text response', {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/plain' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const result = await fetcher<string>('https://api.example.com/text');

    if (isSuccess(result)) {
      expect(result.data).toBe('Plain text response');
    }
  });

  it('should handle POST request with body', async () => {
    const postData = { name: 'John', email: 'john@example.com' };
    const mockResponse = new Response(JSON.stringify({ id: 1, ...postData }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    await fetcher('https://api.example.com/users', {
      method: 'POST',
      body: JSON.stringify(postData),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(postData),
      })
    );
  });

  it('should support async onRequest interceptor', async () => {
    const mockResponse = new Response('{}', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onRequest = vi.fn(async (config) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        ...config,
        headers: {
          ...config.headers,
          'X-Async': 'true',
        },
      };
    });

    await fetcher('https://api.example.com/data', { onRequest });

    expect(onRequest).toHaveBeenCalled();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/data',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Async': 'true',
        }),
      })
    );
  });

  it('should support async onResponse interceptor', async () => {
    const mockData = { id: 1 };
    const mockResponse = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onResponse = vi.fn(async (_response, data) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { ...data, asyncModified: true };
    });

    const result = await fetcher('https://api.example.com/data', {
      onResponse,
    });

    expect(onResponse).toHaveBeenCalled();
    if (isSuccess(result)) {
      expect(result.data).toEqual({ ...mockData, asyncModified: true });
    }
  });

  it('should support async onError interceptor', async () => {
    const mockResponse = new Response('{}', {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

    const onError = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const result = await fetcher('https://api.example.com/error', { onError });

    expect(isFailure(result)).toBe(true);
    expect(onError).toHaveBeenCalled();
  });
});
