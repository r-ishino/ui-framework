import { describe, test, expect } from 'vitest';
import { isObject } from './isObject';

describe('isObject', () => {
  describe('正常系 - プレーンオブジェクト', () => {
    test('空オブジェクトの場合trueを返す', () => {
      expect(isObject({})).toBe(true);
    });

    test('プロパティを持つオブジェクトの場合trueを返す', () => {
      expect(isObject({ key: 'value' })).toBe(true);
    });

    test('ネストしたオブジェクトの場合trueを返す', () => {
      expect(isObject({ nested: { key: 'value' } })).toBe(true);
    });
  });

  describe('異常系 - プレーンオブジェクト以外', () => {
    test('nullの場合falseを返す', () => {
      expect(isObject(null)).toBe(false);
    });

    test('undefinedの場合falseを返す', () => {
      expect(isObject(undefined)).toBe(false);
    });

    test('文字列の場合falseを返す', () => {
      expect(isObject('string')).toBe(false);
    });

    test('数値の場合falseを返す', () => {
      expect(isObject(123)).toBe(false);
    });

    test('真偽値の場合falseを返す', () => {
      expect(isObject(true)).toBe(false);
      expect(isObject(false)).toBe(false);
    });

    test('配列の場合falseを返す', () => {
      expect(isObject([])).toBe(false);
      expect(isObject([1, 2, 3])).toBe(false);
    });

    test('Dateオブジェクトの場合falseを返す', () => {
      expect(isObject(new Date())).toBe(false);
    });

    test('正規表現の場合falseを返す', () => {
      expect(isObject(/test/)).toBe(false);
    });

    test('関数の場合falseを返す', () => {
      expect(isObject(() => {})).toBe(false);
      expect(isObject(function () {})).toBe(false);
    });

    test('クラスインスタンスの場合falseを返す', () => {
      class TestClass {}
      expect(isObject(new TestClass())).toBe(false);
    });
  });

  describe('型ガード', () => {
    test('型推論が正しく動作する', () => {
      const value: unknown = { key: 'value' };

      if (isObject(value)) {
        // この中では value が object 型として扱われる
        // TypeScriptのコンパイル時に型チェックされる
        const _typedValue: object = value;
        expect(_typedValue).toBeDefined();
      }
    });
  });
});
