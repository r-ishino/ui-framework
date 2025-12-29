# Sample UI Framework - タスクリスト

## フェーズ1: プロジェクト基盤構築

### 1.1 モノレポ環境のセットアップ

- [x] pnpmのインストールと設定
  - [x] `pnpm-workspace.yaml`の作成
  - [x] ルート`package.json`の作成
  - [x] パッケージマネージャーの制限設定（`.npmrc`）

- [x] TypeScript環境のセットアップ
  - [x] ルート`tsconfig.json`の作成（共通設定）
  - [x] 各パッケージ用の`tsconfig.json`の作成（継承設定）
  - [x] 厳格モードの有効化（strict: true）

- [x] リンター・フォーマッター設定
  - [x] ESLintの設定
    - [x] `@typescript-eslint`の導入
    - [x] Reactルールの設定
    - [x] importソート設定
  - [x] Prettierの設定
    - [x] `.prettierrc.js`の作成
    - [x] ESLintとの統合
  - [x] エディタ設定（`.editorconfig`）

### 1.2 パッケージ構造の作成

- [x] `packages/`ディレクトリの作成
  - [x] `packages/util/`
    - [x] package.json
    - [x] tsconfig.json
    - [x] src/index.ts
    - [x] vitest.config.ts
  - [x] `packages/ui/`
    - [x] package.json
    - [x] tsconfig.json
    - [x] src/index.ts
    - [x] vitest.config.ts
    - [ ] .storybook/ (パッケージはインストール済みだが設定未作成)
  - [x] `packages/nextjs/`
    - [x] package.json
    - [x] tsconfig.json
    - [x] src/index.ts
    - [x] vitest.config.ts

- [x] `apps/`ディレクトリの作成
  - [x] `apps/demo/`
    - [x] Next.jsプロジェクトのセットアップ
    - [x] package.json
    - [x] tsconfig.json

### 1.3 ビルド環境のセットアップ

- [x] 各パッケージのビルド設定
  - [x] `@sample/util`
    - [x] tsupまたはtscによるビルド設定
    - [x] ESMの出力設定
  - [x] `@sample/ui`
    - [x] linariaのビルド設定
    - [x] コンポーネントのバンドル設定
  - [x] `@sample/nextjs`
    - [x] Next.js互換のビルド設定

- [x] パッケージ間の依存関係設定
  - [x] workspace protocolの使用（`workspace:*`）

### 1.4 テスト環境のセットアップ

- [x] Vitestの設定
  - [x] ルートレベルのVitest設定（各パッケージに設定済み）
  - [x] React Testing Libraryの導入
  - [x] カバレッジ設定
  - [ ] テストユーティリティの作成

- [ ] Storybookの設定（@sample/uiのみ）
  - [x] Storybook 8の導入（8.6.15）
  - [ ] linariaとの統合（設定ファイル未作成）
  - [x] アドオンの設定（a11y, controls等 - package.jsonに記載）

## フェーズ2: CI/CD環境構築

### 2.1 GitHub Actions設定

- [ ] `.github/workflows/ci.yml`
  - [ ] プルリクエスト時の自動テスト
  - [ ] Lint・型チェック
  - [ ] ビルド確認
  - [ ] カバレッジレポート

- [ ] `.github/workflows/release.yml`
  - [ ] 自動バージョンアップ
  - [ ] npm publishの自動化
  - [ ] Changelogの自動生成

- [ ] `.github/workflows/storybook-deploy.yml`
  - [ ] Storybookの自動デプロイ（GitHub Pages or Vercel）

### 2.2 品質管理

- [ ] pre-commitフックの設定（husky）
  - [ ] lint-stagedの設定
  - [ ] コミットメッセージの検証（commitlint）

- [ ] プルリクエストテンプレート
- [ ] イシューテンプレート

## フェーズ3: 初期コンポーネント実装

### 3.1 @sample/util

- [ ] 基本的なユーティリティ関数
  - [ ] 日付処理（date-fns wrapper）
  - [ ] バリデーション関数
  - [ ] 文字列操作
  - [ ] オブジェクト操作
- [ ] テストの作成
- [ ] ドキュメントの作成

### 3.2 @sample/ui

- [ ] デザイントークンの定義
  - [ ] カラーパレット
  - [ ] タイポグラフィ
  - [ ] スペーシング
  - [ ] ブレークポイント

- [ ] 基本コンポーネント
  - [ ] Button
  - [ ] Input
  - [ ] Checkbox
  - [ ] Radio
  - [ ] Select
  - [ ] Textarea

- [ ] レイアウトコンポーネント
  - [ ] Box
  - [ ] Flex
  - [ ] Grid
  - [ ] Stack
  - [ ] Container

- [ ] フィードバックコンポーネント
  - [ ] Alert
  - [ ] Toast
  - [ ] Modal
  - [ ] Spinner

- [ ] 各コンポーネントのStory作成
- [ ] 各コンポーネントのテスト作成

### 3.3 @sample/nextjs

- [ ] Next.js最適化コンポーネント
  - [ ] OptimizedImage（next/image wrapper）
  - [ ] Link（next/link wrapper）
  - [ ] Head管理ユーティリティ

- [ ] レイアウト関連
  - [ ] AppLayout
  - [ ] Header
  - [ ] Footer
  - [ ] Sidebar

- [ ] テスト・ドキュメント作成

### 3.4 sample-demo

- [ ] デモアプリケーションの実装
  - [ ] 全コンポーネントの使用例
  - [ ] インタラクティブなサンプル
  - [ ] パフォーマンステスト

## フェーズ4: ドキュメント整備

### 4.1 プロジェクトドキュメント

- [x] `README.md`（ルート）
  - [x] プロジェクト概要
  - [x] クイックスタート
  - [x] 開発ガイド
  - [x] コントリビューションガイド

- [ ] 各パッケージの`README.md`
  - [ ] インストール方法
  - [ ] 基本的な使い方
  - [ ] API仕様

- [x] `CONTRIBUTING.md`
  - [x] 開発環境のセットアップ
  - [x] コーディング規約
  - [x] プルリクエストの流れ

- [ ] `CHANGELOG.md`の初期化

- [x] `LICENSE`ファイル

- [x] `CLAUDE.md`（AIアシスタント向けリファレンス）
  - [x] プロジェクト構成とコマンド
  - [x] 技術スタック詳細
  - [x] トラブルシューティング

### 4.2 APIドキュメント

- [ ] TSDocコメントの記述
- [ ] API仕様書の生成（TypeDoc等）

### 4.3 使用例とチュートリアル

- [ ] Getting Started guide
- [ ] コンポーネント使用例
- [ ] カスタマイズガイド
- [ ] マイグレーションガイド

## フェーズ5: 公開準備

### 5.1 パッケージ公開準備

- [ ] npm organizationの設定（@sample）
- [ ] パッケージメタデータの整備
  - [ ] keywords
  - [ ] repository
  - [ ] bugs
  - [ ] homepage

- [ ] .npmignore / files設定

### 5.2 最終チェック

- [ ] 全テストのパス確認
- [ ] ビルド成功確認
- [ ] ドキュメントの最終レビュー
- [ ] ライセンス表記の確認
- [ ] セキュリティ監査

### 5.3 リリース

- [ ] 初回バージョン（v0.1.0）のリリース
- [ ] npm publishの実行
- [ ] GitHubリリースノートの作成
- [ ] 社内通知

## 継続的な改善

### メンテナンス

- [ ] 依存パッケージの定期更新
- [ ] セキュリティアップデート
- [ ] パフォーマンス最適化
- [ ] バグ修正

### 機能追加

- [ ] フィードバックに基づく新コンポーネント追加
- [ ] 既存コンポーネントの機能拡張
- [ ] アクセシビリティ改善

### ドキュメント

- [ ] ベストプラクティスの文書化
- [ ] よくある質問（FAQ）の整備
- [ ] トラブルシューティングガイド

## 備考

### 検討事項

- **CSS-in-JSライブラリの選定**: linariaで確定しているが、パフォーマンステストで問題があれば再検討
- **ライセンス**: MIT or Apache 2.0（社内ポリシーに応じて決定）
- **バージョン管理**: Changesets vs Lerna vs 手動（チーム規模に応じて決定）
- **デプロイ先**: npm public registry or private registry
- **Storybook デプロイ**: GitHub Pages vs Vercel vs Chromatic

### 推奨される追加ツール

- **changeset**: モノレポのバージョン管理
- **turbo**: ビルドキャッシュと並列実行による高速化 ✅ 導入済み
- **TypeDoc**: API仕様書の自動生成
- **Chromatic**: Storybookの視覚的回帰テスト
- **Renovate**: 依存関係の自動更新

### 現在の進捗状況（2025-12-29時点）

#### 完了済み
- ✅ フェーズ1: プロジェクト基盤構築（ほぼ完了）
  - モノレポ環境、TypeScript、リンター・フォーマッター
  - 全パッケージの構造とビルド環境
  - テスト環境（Vitest + React Testing Library）
  - Turboによるビルドオーケストレーション
- ✅ フェーズ4（一部）: 基本ドキュメント整備
  - README.md、CONTRIBUTING.md、LICENSE、CLAUDE.md

#### 未完了（今後のタスク）
- ⏳ Storybookの設定ファイル作成（.storybook/）
- ⏳ テストユーティリティの実装
- ⏳ CI/CD環境構築（GitHub Actions）
- ⏳ 初期コンポーネント実装
- ⏳ 各パッケージのREADME作成
- ⏳ パッケージ公開準備
