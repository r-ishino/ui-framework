import { describe, test, expect } from 'vitest';
import * as tokens from './index';

describe('tokens index', () => {
  test('colorがエクスポートされている', () => {
    expect(tokens.color).toBeDefined();
  });

  test('spaceがエクスポートされている', () => {
    expect(tokens.space).toBeDefined();
  });

  test('borderRadiusがエクスポートされている', () => {
    expect(tokens.borderRadius).toBeDefined();
  });
});
