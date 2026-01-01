import { describe, test, expect } from 'vitest';
import { isBlank } from './isBlank';

describe('isBlank', () => {
  describe('null/undefined', () => {
    test('nullの場合trueを返す', () => {
      expect(isBlank(null)).toBe(true);
    });

    test('undefinedの場合trueを返す', () => {
      expect(isBlank(undefined)).toBe(true);
    });
  });

  describe('文字列', () => {
    test('空文字列の場合trueを返す', () => {
      expect(isBlank('')).toBe(true);
    });

    test('非空文字列の場合falseを返す', () => {
      expect(isBlank('hello')).toBe(false);
      expect(isBlank(' ')).toBe(false); // スペースは空ではない
    });
  });

  describe('配列', () => {
    test('空配列の場合trueを返す', () => {
      expect(isBlank([])).toBe(true);
    });

    test('要素を持つ配列の場合falseを返す', () => {
      expect(isBlank([1])).toBe(false);
      expect(isBlank([1, 2, 3])).toBe(false);
      expect(isBlank([''])).toBe(false); // 空文字列を含む配列は空配列ではない
    });
  });

  describe('オブジェクト', () => {
    test('空オブジェクトの場合trueを返す', () => {
      expect(isBlank({})).toBe(true);
    });

    test('プロパティを持つオブジェクトの場合falseを返す', () => {
      expect(isBlank({ key: 'value' })).toBe(false);
      expect(isBlank({ key: null })).toBe(false); // nullを含むオブジェクトは空ではない
    });
  });

  describe('真偽値', () => {
    test('falseの場合trueを返す', () => {
      expect(isBlank(false)).toBe(true);
    });

    test('trueの場合falseを返す', () => {
      expect(isBlank(true)).toBe(false);
    });
  });

  describe('その他の型', () => {
    test('数値0の場合falseを返す', () => {
      expect(isBlank(0)).toBe(false);
    });

    test('正の数値の場合falseを返す', () => {
      expect(isBlank(123)).toBe(false);
    });

    test('負の数値の場合falseを返す', () => {
      expect(isBlank(-1)).toBe(false);
    });

    test('NaNの場合falseを返す', () => {
      expect(isBlank(NaN)).toBe(false);
    });

    test('関数の場合falseを返す', () => {
      expect(isBlank(() => {})).toBe(false);
    });

    test('Dateオブジェクトの場合falseを返す', () => {
      expect(isBlank(new Date())).toBe(false);
    });

    test('正規表現の場合falseを返す', () => {
      expect(isBlank(/test/)).toBe(false);
    });
  });

  describe('型ガード', () => {
    test('nullまたはundefinedとして型推論される', () => {
      const value: string | null | undefined = null;

      if (isBlank(value)) {
        // この中では value が null | undefined 型として扱われる
        const _typedValue: null | undefined = value;
        expect(_typedValue).toBeNull();
      }
    });

    test('非blankな値の場合、型が保持される', () => {
      const value: string | null = 'hello';

      if (!isBlank(value)) {
        // この中では value が string 型として扱われる（nullが除外される）
        const _typedValue: string = value;
        expect(_typedValue).toBe('hello');
      }
    });
  });

  describe('エッジケース', () => {
    test('空配列を含むオブジェクトは空ではない', () => {
      expect(isBlank({ arr: [] })).toBe(false);
    });

    test('空オブジェクトを含む配列は空ではない', () => {
      expect(isBlank([{}])).toBe(false);
    });

    test('ネストした空オブジェクトは空ではない', () => {
      expect(isBlank({ nested: {} })).toBe(false);
    });
  });
});
