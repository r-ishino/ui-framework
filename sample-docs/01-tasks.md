# Sample UI Framework - タスクリスト

## フェーズ1: プロジェクト基盤構築

### 1.1 モノレポ環境のセットアップ

- [ ] pnpmのインストールと設定
  - [ ] `pnpm-workspace.yaml`の作成
  - [ ] ルート`package.json`の作成
  - [ ] パッケージマネージャーの制限設定（`.npmrc`）

- [ ] TypeScript環境のセットアップ
  - [ ] ルート`tsconfig.json`の作成（共通設定）
  - [ ] 各パッケージ用の`tsconfig.json`の作成（継承設定）
  - [ ] 厳格モードの有効化（strict: true）

- [ ] リンター・フォーマッター設定
  - [ ] ESLintの設定
    - [ ] `@typescript-eslint`の導入
    - [ ] Reactルールの設定
    - [ ] importソート設定
  - [ ] Prettierの設定
    - [ ] `.prettierrc.js`の作成
    - [ ] ESLintとの統合
  - [ ] エディタ設定（`.editorconfig`）

### 1.2 パッケージ構造の作成

- [ ] `packages/`ディレクトリの作成
  - [ ] `packages/util/`
    - [ ] package.json
    - [ ] tsconfig.json
    - [ ] src/index.ts
    - [ ] vitest.config.ts
  - [ ] `packages/ui/`
    - [ ] package.json
    - [ ] tsconfig.json
    - [ ] src/index.ts
    - [ ] vitest.config.ts
    - [ ] .storybook/
  - [ ] `packages/nextjs/`
    - [ ] package.json
    - [ ] tsconfig.json
    - [ ] src/index.ts
    - [ ] vitest.config.ts

- [ ] `apps/`ディレクトリの作成
  - [ ] `apps/demo/`
    - [ ] Next.jsプロジェクトのセットアップ
    - [ ] package.json
    - [ ] tsconfig.json

### 1.3 ビルド環境のセットアップ

- [ ] 各パッケージのビルド設定
  - [ ] `@sample/util`
    - [ ] tsupまたはtscによるビルド設定
    - [ ] ESM/CJS双方の出力設定
  - [ ] `@sample/ui`
    - [ ] linariaのビルド設定
    - [ ] コンポーネントのバンドル設定
  - [ ] `@sample/nextjs`
    - [ ] Next.js互換のビルド設定

- [ ] パッケージ間の依存関係設定
  - [ ] workspace protocolの使用（`workspace:*`）

### 1.4 テスト環境のセットアップ

- [ ] Vitestの設定
  - [ ] ルートレベルのVitest設定
  - [ ] React Testing Libraryの導入
  - [ ] カバレッジ設定
  - [ ] テストユーティリティの作成

- [ ] Storybookの設定（@sample/uiのみ）
  - [ ] Storybook 8の導入
  - [ ] linariaとの統合
  - [ ] アドオンの設定（a11y, controls等）

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

- [ ] `README.md`（ルート）
  - [ ] プロジェクト概要
  - [ ] クイックスタート
  - [ ] 開発ガイド
  - [ ] コントリビューションガイド

- [ ] 各パッケージの`README.md`
  - [ ] インストール方法
  - [ ] 基本的な使い方
  - [ ] API仕様

- [ ] `CONTRIBUTING.md`
  - [ ] 開発環境のセットアップ
  - [ ] コーディング規約
  - [ ] プルリクエストの流れ

- [ ] `CHANGELOG.md`の初期化

- [ ] `LICENSE`ファイル

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
- **turbo**: ビルドキャッシュと並列実行による高速化
- **TypeDoc**: API仕様書の自動生成
- **Chromatic**: Storybookの視覚的回帰テスト
- **Renovate**: 依存関係の自動更新
