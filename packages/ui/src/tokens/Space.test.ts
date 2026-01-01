import { describe, test, expect } from 'vitest';
import { space, toSpaceValue } from './Space';

describe('Space', () => {
  test('spaceオブジェクトが定義されている', () => {
    expect(space).toBeDefined();
    expect(typeof space).toBe('object');
  });

  test('toSpaceValue: 有効なSpaceを変換できる', () => {
    expect(toSpaceValue('zero')).toBe('0px');
    expect(toSpaceValue('xxs')).toBe('4px');
    expect(toSpaceValue('xs')).toBe('8px');
    expect(toSpaceValue('s')).toBe('12px');
    expect(toSpaceValue('m')).toBe('16px');
    expect(toSpaceValue('l')).toBe('24px');
    expect(toSpaceValue('xl')).toBe('32px');
    expect(toSpaceValue('xxl')).toBe('40px');
    expect(toSpaceValue('negativeM')).toBe('-16px');
  });

  test('toSpaceValue: nullの場合はzeroを返す', () => {
    expect(toSpaceValue(null)).toBe('0px');
  });

  test('toSpaceValue: undefinedの場合はzeroを返す', () => {
    expect(toSpaceValue(undefined)).toBe('0px');
  });
});
