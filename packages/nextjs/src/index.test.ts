import { describe, test, expect } from 'vitest';
import { version, NextLink } from './index';

describe('@sample/nextjs index', () => {
  test('versionがエクスポートされている', () => {
    expect(version).toBeDefined();
    expect(typeof version).toBe('string');
  });

  test('NextLinkがエクスポートされている', () => {
    expect(NextLink).toBeDefined();
    expect(typeof NextLink).toBe('function');
  });
});
