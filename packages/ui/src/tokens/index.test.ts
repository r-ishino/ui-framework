import { describe, test, expect } from 'vitest';
import { color, space, borderRadius } from './index';

describe('tokens index', () => {
  test('colorがエクスポートされている', () => {
    expect(color).toBeDefined();
  });

  test('spaceがエクスポートされている', () => {
    expect(space).toBeDefined();
  });

  test('borderRadiusがエクスポートされている', () => {
    expect(borderRadius).toBeDefined();
  });
});
