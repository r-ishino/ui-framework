import { describe, test, expect } from 'vitest';
import { borderRadius, toBorderRadiusValue } from './Radius';

describe('Radius', () => {
  test('borderRadiusオブジェクトが定義されている', () => {
    expect(borderRadius).toBeDefined();
    expect(typeof borderRadius).toBe('object');
  });

  test('toBorderRadiusValue: 有効なBorderRadiusを変換できる', () => {
    expect(toBorderRadiusValue('none')).toBe('0px');
    expect(toBorderRadiusValue('s')).toBe('2px');
    expect(toBorderRadiusValue('m')).toBe('4px');
    expect(toBorderRadiusValue('l')).toBe('8px');
    expect(toBorderRadiusValue('circle')).toBe('9999px');
  });

  test('toBorderRadiusValue: nullの場合はnoneを返す', () => {
    expect(toBorderRadiusValue(null)).toBe('0px');
  });

  test('toBorderRadiusValue: undefinedの場合はnoneを返す', () => {
    expect(toBorderRadiusValue(undefined)).toBe('0px');
  });
});
