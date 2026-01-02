/* global Response */
import { describe, expect, it } from 'vitest';
import { createFetcherError, isFetcherError } from './error';

describe('createFetcherError', () => {
  it('should create FetcherError with basic properties', () => {
    const error = createFetcherError('Not found', 404);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('FetcherError');
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.response).toBeUndefined();
    expect(error.data).toBeUndefined();
  });

  it('should create FetcherError with response', () => {
    const mockResponse = new Response('{}', { status: 500 });
    const error = createFetcherError('Server error', 500, mockResponse);

    expect(error.status).toBe(500);
    expect(error.response).toBe(mockResponse);
  });

  it('should create FetcherError with typed error data', () => {
    type ApiError = { message: string; code: string };
    const errorData: ApiError = { message: 'Validation failed', code: 'E001' };
    const error = createFetcherError<ApiError>(
      'Bad request',
      400,
      undefined,
      errorData
    );

    expect(error.status).toBe(400);
    expect(error.data).toEqual(errorData);
    expect(error.data?.code).toBe('E001');
  });
});

describe('isFetcherError', () => {
  it('should return true for FetcherError', () => {
    const error = createFetcherError('Not found', 404);
    expect(isFetcherError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Regular error');
    expect(isFetcherError(error)).toBe(false);
  });

  it('should return false for non-Error objects', () => {
    expect(isFetcherError(null)).toBe(false);
    expect(isFetcherError(undefined)).toBe(false);
    expect(isFetcherError('string')).toBe(false);
    expect(isFetcherError(123)).toBe(false);
    expect(isFetcherError({})).toBe(false);
  });

  it('should return false for Error with status but wrong name', () => {
    const error = new Error('Some error');
    Object.assign(error, { status: 500, name: 'CustomError' });
    expect(isFetcherError(error)).toBe(false);
  });

  it('should return false for FetcherError without status', () => {
    const error = new Error('Some error');
    error.name = 'FetcherError';
    expect(isFetcherError(error)).toBe(false);
  });

  it('should return false for FetcherError with non-number status', () => {
    const error = new Error('Some error');
    Object.assign(error, { name: 'FetcherError', status: '500' });
    expect(isFetcherError(error)).toBe(false);
  });

  it('should work with typed error data', () => {
    type ApiError = { message: string; code: string };
    const error = createFetcherError<ApiError>('Bad request', 400, undefined, {
      message: 'Validation failed',
      code: 'E001',
    });

    if (isFetcherError<ApiError>(error)) {
      expect(error.data?.code).toBe('E001');
      expect(error.data?.message).toBe('Validation failed');
    }
  });
});
