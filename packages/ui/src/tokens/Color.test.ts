import { describe, test, expect } from 'vitest';
import { color, toColorValue } from './Color';

describe('Color', () => {
  test('colorオブジェクトが定義されている', () => {
    expect(color).toBeDefined();
    expect(typeof color).toBe('object');
  });

  test('toColorValue: 有効なColorを変換できる', () => {
    expect(toColorValue('white')).toBe('#ffffff');
    expect(toColorValue('black')).toBe('#181818');
    expect(toColorValue('gray800')).toBe('#333333');
  });

  test('toColorValue: nullの場合はinheritを返す', () => {
    expect(toColorValue(null)).toBe('inherit');
  });

  test('toColorValue: undefinedの場合はinheritを返す', () => {
    expect(toColorValue(undefined)).toBe('inherit');
  });
});
