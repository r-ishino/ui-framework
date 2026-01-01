# Testing Strategy

## 概要

本プロジェクトでは、Vitestを使用してパッケージごとにテストを実施します。カバレッジ100%を目標とし、コンポーネントの振る舞いを中心にテストします。

## テストツール

- **Vitest**: テストランナー
- **React Testing Library**: UIコンポーネントテスト
- **@vitest/coverage-v8**: カバレッジ計測

## パッケージ別のテスト方針

### @sample/util

**対象**: フレームワーク非依存の純粋関数

**テスト内容**:

- 入力と出力の検証
- 型ガードの動作確認

**カバレッジ目標**: 100%

### @sample/ui

**対象**: Reactコンポーネント

**テストする内容**:

- ✅ Props による表示の切り替え
- ✅ ユーザーインタラクション（クリック、入力）
- ✅ 状態変化（loading、disabled）
- ✅ アクセシビリティ（role, aria属性）
- ✅ 条件分岐のカバレッジ

**テストしない内容**:

- ❌ スタイリング（色、サイズ） → Storybookで確認
- ❌ 実装の詳細（変数名、クラス名）
- ❌ ライブラリの動作（Linaria、React本体）

**カバレッジ目標**: 100%を目指すが、100%でなくてもリリース可能とする

### @sample/nextjs

**対象**: Next.js専用コンポーネント

**テスト方針**: @sample/uiと同様

**カバレッジ目標**: 100%を目指すが、100%でなくてもリリース可能とする

## ファイル配置

コロケーション方式を採用：

```
src/
├── components/
│   └── Button/
│       ├── Button.tsx
│       ├── Button.test.tsx      ← テスト
│       ├── Button.stories.tsx   ← Storybook
│       └── index.ts
└── helpers/
    ├── isObject.ts
    └── isObject.test.ts
```

## テストケースのパターン

### コンポーネントテストの構造

```typescript
describe('ComponentName', () => {
  describe('レンダリング', () => {
    test('基本的な表示', () => { ... });
  });

  describe('Props', () => {
    test('variant別の動作', () => { ... });
  });

  describe('インタラクション', () => {
    test('クリックイベント', () => { ... });
  });

  describe('アクセシビリティ', () => {
    test('role属性', () => { ... });
  });
});
```

### ユーティリティテストの構造

```typescript
describe('functionName', () => {
  describe('正常系', () => {
    test('期待する動作', () => { ... });
  });

  describe('境界値', () => {
    test.each([...])('パラメータ化テスト', () => { ... });
  });

  describe('異常系', () => {
    test('エラーケース', () => { ... });
  });
});
```

## カバレッジ設定

全パッケージでカバレッジのしきい値を設定し、それを超えない場合はCIで失敗させます

```typescript
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  thresholds: {
    lines: 100, // このライブラリでは100%を必須とする
    functions: 100,
    branches: 100,
    statements: 100,
  },
  exclude: [
    '**/*.config.ts',
    '**/*.stories.tsx',
    '**/dist/**',
    '**/node_modules/**',
  ],
}
```

## テスト実行

```bash
# 単一パッケージ
pnpm --filter @sample/util test
pnpm --filter @sample/ui test

# 全パッケージ
pnpm test

# カバレッジ付き
pnpm --filter @sample/util test -- --coverage

# ウォッチモード
pnpm --filter @sample/ui test:watch

# カバレッジレポート閲覧
open packages/util/coverage/index.html
```

**補足**: Turboの設定により、テスト実行前に依存パッケージのビルドが自動的に実行されます。例えば `@sample/nextjs` のテストを実行すると、依存する `@sample/ui` と `@sample/util` が先にビルドされます。これは `turbo.json` の `"test": { "dependsOn": ["build"] }` 設定によるものです。

## 参考資料

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
