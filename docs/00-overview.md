# Sample UI Framework - Overview

## 概要

Sampleは、社内Reactアプリケーションで共通利用されるUIコンポーネントとユーティリティのフレームワークです。
主にNext.jsベースのアプリケーションでの利用を想定し、コンポーネントの再利用性を高め、開発効率を向上させることを目的としています。

## パッケージ構成

このプロジェクトはpnpmモノレポとして構成され、以下のパッケージで構成されます。

### `@sample/ui`

- **目的**: 再利用可能なUIコンポーネント群
- **依存**: React, TypeScript, linaria
- **提供**: Button, Input, Modal, Card等の基本コンポーネント
- **テスト**: Vitest
- **ドキュメント**: Storybook

### `@sample/nextjs`

- **目的**: Next.js専用のコンポーネントとユーティリティ
- **依存**: React, Next.js, TypeScript, linaria
- **提供**: Next.js専用のレイアウト、ナビゲーション、最適化されたコンポーネント
- **テスト**: Vitest

### `@sample/util`

- **目的**: フレームワーク非依存のユーティリティ関数
- **依存**: TypeScript のみ
- **提供**: 日付処理、バリデーション、文字列操作等の汎用関数
- **テスト**: Vitest

### `sample-demo`

- **目的**: コンポーネントとユーティリティの動作確認
- **依存**: Next.js, @sample/ui, @sample/nextjs, @sample/util
- **用途**: 開発中の動作確認、統合テスト

### `docs`

- **目的**: プロジェクト全体のドキュメント
- **内容**: 設計ドキュメント、ガイドライン、タスクリスト

## 技術スタック

### コア技術

- **TypeScript**: 厳格な型チェックによる品質保証
- **React**: UIライブラリ
- **Next.js**: アプリケーションフレームワーク（demoとnextjsパッケージのみ）

### スタイリング

- **linaria**: Zero-runtime CSS-in-JS（ビルド時にCSSを生成）

### 開発ツール

- **pnpm**: 効率的なパッケージ管理とモノレポ構成
- **ESLint**: コード品質の維持
- **Prettier**: コードフォーマット
- **Vitest**: 高速なユニットテスト
- **Storybook**: UIコンポーネントの可視化とドキュメント化

### CI/CD

- **GitHub Actions**: 自動テスト、ビルド、リリース

## 設計方針

### 型安全性

- TypeScriptの厳格モード（strict: true）を使用
- 可能な限り具体的な型定義を行う
- `any`の使用を最小限に抑える

### テスタビリティ

- 各パッケージに対応するテストを記述
- カバレッジ80%以上を目標

### ドキュメンテーション

- 全ての公開APIにTSDocコメントを記述
- Storybookで実際の使用例を提供
- READMEで基本的な使い方を説明

### パフォーマンス

- Tree-shakingを考慮した実装
- 不要な依存関係を持たない
- linariaによるビルド時CSS生成でランタイムオーバーヘッドを削減

### アクセシビリティ

- WAI-ARIA準拠
- キーボード操作対応
- スクリーンリーダー対応

## ディレクトリ構造

```
ui-framework/
├── packages/
│   ├── ui/                    # @sample/ui
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── nextjs/                # @sample/nextjs
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── util/                  # @sample/util
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── apps/
│   └── demo/                  # sample-demo
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── docs/                      # ドキュメント
├── .github/
│   └── workflows/             # CI/CD設定
├── package.json               # ルートワークスペース
├── pnpm-workspace.yaml
├── tsconfig.json              # 共通TypeScript設定
├── .eslintrc.js               # 共通ESLint設定
├── .prettierrc.js             # 共通Prettier設定
├── README.md
└── LICENSE
```

## 依存関係図

```
sample-demo
  ↓ depends on
@sample/nextjs
  ↓ depends on
@sample/ui
  ↓ depends on
@sample/util
```

## バージョニング

- Semantic Versioning (semver)を採用
- 各パッケージは独立してバージョン管理
- Major変更時は移行ガイドを提供

## ライセンス

検討中（MIT or Apache 2.0を推奨）
