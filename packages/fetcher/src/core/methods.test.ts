/* global Response */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getRequest,
  postRequest,
  putRequest,
  deleteRequest,
} from './methods';
import { isSuccess, isFailure } from './response';

describe('HTTP methods (Result type)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRequest', () => {
    it('should return success result on successful request', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockResponse = new Response(JSON.stringify(mockData), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await getRequest<typeof mockData>(
        '/users/1',
        undefined,
        {
          baseURL: 'https://api.example.com',
        }
      );

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toEqual(mockData);
        expect(result.status).toBe(200);
        expect(result.statusText).toBe('OK');
      }
    });

    it('should return failure result on HTTP error', async () => {
      type ApiError = { message: string; code: string };
      const errorData: ApiError = { message: 'Not found', code: 'E404' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 404,
        statusText: 'Not Found',
        headers: { 'Content-Type': 'application/json' },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await getRequest<unknown, ApiError>(
        '/users/999',
        undefined,
        {
          baseURL: 'https://api.example.com',
        }
      );

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.status).toBe(404);
        expect(result.message).toBe('Not Found');
        expect(result.error.data).toEqual(errorData);
      }
    });

    it('should return failure result on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(
        new Error('Network error')
      );

      const result = await getRequest('/users/1', undefined, {
        baseURL: 'https://api.example.com',
      });

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.message).toBe('Network error');
      }
    });
  });

  describe('postRequest', () => {
    it('should return success result on successful POST', async () => {
      const postData = { name: 'John', email: 'john@example.com' };
      const mockResponse = new Response(
        JSON.stringify({ id: 1, ...postData }),
        {
          status: 201,
          statusText: 'Created',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await postRequest('/users', postData, {
        baseURL: 'https://api.example.com',
      });

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.status).toBe(201);
        expect(result.data).toHaveProperty('id');
      }
    });

    it('should return failure result on validation error', async () => {
      type ValidationError = {
        errors: Array<{ field: string; message: string }>;
      };
      const errorData: ValidationError = {
        errors: [{ field: 'email', message: 'Invalid email' }],
      };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 400,
        statusText: 'Bad Request',
        headers: { 'Content-Type': 'application/json' },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await postRequest<unknown, ValidationError>(
        '/users',
        { name: 'John', email: 'invalid' },
        {
          baseURL: 'https://api.example.com',
        }
      );

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.status).toBe(400);
        expect(result.error.data).toEqual(errorData);
      }
    });
  });

  describe('putRequest', () => {
    it('should return success result on successful PUT', async () => {
      const updateData = { name: 'Jane' };
      const mockResponse = new Response(
        JSON.stringify({ id: 1, name: 'Jane', email: 'jane@example.com' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await putRequest('/users/1', updateData, {
        baseURL: 'https://api.example.com',
      });

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.data).toHaveProperty('name', 'Jane');
      }
    });
  });

  describe('deleteRequest', () => {
    it('should return success result on successful DELETE', async () => {
      const mockResponse = new Response(null, {
        status: 204,
        headers: { 'Content-Type': 'application/json' },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await deleteRequest('/users/1', undefined, {
        baseURL: 'https://api.example.com',
      });

      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.status).toBe(204);
      }
    });

    it('should return failure result on unauthorized DELETE', async () => {
      const mockResponse = new Response(
        JSON.stringify({ message: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await deleteRequest('/users/1', undefined, {
        baseURL: 'https://api.example.com',
      });

      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        expect(result.status).toBe(401);
      }
    });
  });

  describe('Type safety', () => {
    it('should properly type success data', async () => {
      type User = { id: number; name: string };
      const mockResponse = new Response(
        JSON.stringify({ id: 1, name: 'Test' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await getRequest<User>('/users/1', undefined, {
        baseURL: 'https://api.example.com',
      });

      if (isSuccess(result)) {
        // 型推論が効いていることを確認
        const user: User = result.data;
        expect(user.id).toBe(1);
        expect(user.name).toBe('Test');
      }
    });

    it('should properly type error data', async () => {
      type ApiError = { message: string; code: string };
      const errorData: ApiError = { message: 'Not found', code: 'E404' };
      const mockResponse = new Response(JSON.stringify(errorData), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

      const result = await getRequest<unknown, ApiError>(
        '/users/999',
        undefined,
        {
          baseURL: 'https://api.example.com',
        }
      );

      if (isFailure(result)) {
        // 型推論が効いていることを確認
        const error: ApiError | undefined = result.error.data;
        expect(error?.code).toBe('E404');
      }
    });
  });
});
