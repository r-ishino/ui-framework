import { describe, expect, it } from 'vitest';
import { buildQueryString } from './queryString';

describe('buildQueryString', () => {
  it('should build query string from simple object', () => {
    const params = { name: 'John', age: 30 };
    const result = buildQueryString(params);
    expect(result).toBe('name=John&age=30');
  });

  it('should handle array values', () => {
    const params = { tags: ['admin', 'active'] };
    const result = buildQueryString(params);
    expect(result).toBe('tags=admin&tags=active');
  });

  it('should skip null values', () => {
    const params = { name: 'John', age: null };
    const result = buildQueryString(params);
    expect(result).toBe('name=John');
  });

  it('should skip undefined values', () => {
    const params = { name: 'John', age: undefined };
    const result = buildQueryString(params);
    expect(result).toBe('name=John');
  });

  it('should handle boolean values', () => {
    const params = { active: true, deleted: false };
    const result = buildQueryString(params);
    expect(result).toBe('active=true&deleted=false');
  });

  it('should handle number values', () => {
    const params = { page: 1, limit: 10 };
    const result = buildQueryString(params);
    expect(result).toBe('page=1&limit=10');
  });

  it('should handle empty object', () => {
    const params = {};
    const result = buildQueryString(params);
    expect(result).toBe('');
  });

  it('should handle mixed types', () => {
    const params = {
      name: 'John',
      age: 30,
      tags: ['admin', 'active'],
      active: true,
      deleted: null,
    };
    const result = buildQueryString(params);
    expect(result).toBe('name=John&age=30&tags=admin&tags=active&active=true');
  });

  it('should URL encode special characters', () => {
    const params = { search: 'hello world', email: 'test@example.com' };
    const result = buildQueryString(params);
    expect(result).toBe('search=hello+world&email=test%40example.com');
  });
});
