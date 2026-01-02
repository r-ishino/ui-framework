# CLAUDE.md - AI Assistant Reference

このファイルは、AIアシスタント（Claude）がプロジェクトを理解し、適切にサポートするための参考情報です。

## やり取りについて

日本語でやり取りします。

## プロジェクト概要

Sample UI Frameworkは、React 19コンポーネントとユーティリティのモノレポです。

- **構成**: pnpm workspaces + Turbo
- **言語**: TypeScript (strict mode)
- **主要技術**: React 19, Next.js 16, Storybook 8

## パッケージ構成

```
packages/
├── ui/         # @sample/ui - React UIコンポーネント
├── nextjs/     # @sample/nextjs - Next.js専用コンポーネント/ユーティリティ
└── util/       # @sample/util - フレームワーク非依存のユーティリティ

apps/
└── demo/       # sample-demo - デモNext.jsアプリケーション
```

## よく使うコマンド

### 開発環境セットアップ

```bash
# 依存関係のインストール
pnpm install

# 全パッケージのビルド
pnpm build

# 型チェック
pnpm type-check
```

### デモアプリの起動

**方法1: ディレクトリ移動**

```bash
cd apps/demo
pnpm dev
```

**方法2: ワークスペースフィルター（推奨）**

```bash
pnpm --filter sample-demo dev
```

デモアプリは http://localhost:3000 で起動します。

### パッケージ別の操作

```bash
# 特定パッケージのビルド
pnpm --filter @sample/ui build
pnpm --filter @sample/util build

# 特定パッケージのテスト
pnpm --filter @sample/ui test
pnpm --filter @sample/ui test:watch

# UIパッケージのStorybook起動
pnpm --filter @sample/ui storybook
```

### リント・フォーマット

```bash
# リント実行
pnpm lint

# リント自動修正
pnpm lint:fix

# フォーマット
pnpm format
```

### テスト

```bash
# 全パッケージのテスト実行
pnpm test

# ウォッチモード
pnpm test:watch
```

### クリーンアップ

```bash
# 特定パッケージのクリーン
pnpm --filter @sample/ui clean

# node_modulesとビルド成果物の削除
rm -rf node_modules packages/*/node_modules apps/*/node_modules
rm -rf packages/*/dist apps/demo/.next
```

## Claude Codeでのバックグラウンドタスク管理

```bash
# 実行中のタスク一覧
/tasks

# バックグラウンドでデモ起動
pnpm --filter sample-demo dev
# (run_in_background: true で実行)

# タスク停止: KillShellツールを使用
# または手動で: pkill -f "pnpm.*dev"
```

### 重要: 開発サーバー終了の徹底

**開発サーバー（`pnpm dev`、Storybookなど）を起動した場合、タスク完了時に必ずプロセスを停止してください。**

プロセスが残ったままだと、次回起動時にポート（3000、6006など）が塞がっておりエラーになります。

```bash
# 開発サーバー停止の確認
ps aux | grep -E "pnpm.*dev|next.*dev|storybook" | grep -v grep

# プロセスが残っている場合は停止
pkill -f "pnpm.*dev"
pkill -f "storybook"

# または個別にkill
kill <PID>
```

**Claude Codeでの推奨フロー:**

1. 開発サーバー起動前に、既存プロセスがないか確認
2. `run_in_background: true` で起動
3. 確認・テストが終わったら、**必ずKillShellツールまたはpkillでプロセス停止**
4. 停止を確認してからタスクを終了

## Node.jsバージョン

```bash
# プロジェクト指定バージョン
cat .node-version  # 22.21.1

# バージョン確認
node --version
nodenv version
```

## ディレクトリ構造

```
.
├── apps/
│   └── demo/              # デモアプリ (Next.js 16)
├── packages/
│   ├── ui/                # UIコンポーネント + Storybook
│   ├── nextjs/            # Next.js専用
│   └── util/              # ユーティリティ
├── docs/                  # プロジェクトドキュメント
├── .changeset/            # バージョン管理 (Changesets)
├── turbo.json             # Turboパイプライン設定
├── pnpm-workspace.yaml    # pnpmワークスペース設定
└── package.json           # ルート設定
```

## 技術スタック詳細

### コア

- **TypeScript**: ^5.3.3 (strict mode)
- **React**: ^19.2.3
- **React DOM**: ^19.2.3

### ビルド・開発ツール

- **pnpm**: >=8.0.0 (パッケージマネージャー)
- **Turbo**: ビルドオーケストレーション
- **tsup**: TypeScriptビルドツール
- **Vite**: ^7.3.0 (Storybook用)

### テスト

- **Vitest**: ^1.3.0
- **React Testing Library**: ^16.3.1
- **jsdom**: ^24.0.0

### リント・フォーマット

- **ESLint**: ^8.57.1
- **Prettier**: 設定済み
- **TypeScript ESLint**: 設定済み

### ドキュメント

- **Storybook**: ^8.6.15 (@sample/uiのみ)
  - addon-a11y, addon-essentials, addon-interactions, addon-links

### Next.js (demo/nextjsパッケージ)

- **Next.js**: ^16.1.1
- **Turbopack**: デフォルト

### スタイリング

- **linaria**: ^6.2.0 (@wyw-in-js/vite ^0.4.0)
  - Zero-runtime CSS-in-JS

## Turboパイプライン設定

Turboは以下のタスクを管理しています（`turbo.json`参照）：

- `build`: 依存パッケージを先にビルド
- `dev`: 並行開発サーバー起動
- `test`: 並行テスト実行
- `lint`: 並行リント実行
- `type-check`: 並行型チェック
- `clean`: ビルド成果物削除

依存関係は自動で解決され、キャッシュにより高速ビルドが可能です。

## 開発フロー

### 実装後の必須チェック項目

**重要**: 新しい機能やパッケージを実装した後は、必ず以下をチェックしてください：

```bash
# 1. テストの実行（新しいテストを追加した場合は特に重要）
pnpm test
# または特定パッケージのみ
pnpm --filter @r-ishino/sample-fetcher test

# 2. Lintチェック
pnpm lint
# エラーがある場合は自動修正を試す
pnpm lint:fix

# 3. 型チェック
pnpm tsc

# 4. ビルド確認
pnpm build
```

これらのチェックを怠ると、CIで失敗する可能性があります。

### コード変更時のベストプラクティス

1. **テストファイル作成時**:
   - テストファイルには `/* global Response */` などのグローバル変数宣言が必要な場合がある
   - vitest.config.tsで `passWithNoTests: true` を設定しておく

2. **新しいパッケージ追加時**:
   - README.mdを作成してドキュメント化
   - package.jsonに適切なメタデータを設定
   - テストファイルを追加

3. **Demo アプリでの動作確認**:
   - サーバーサイド（Server Component）での使用例
   - クライアントサイド（Client Component）での使用例
   - 両方で型安全性が保たれていることを確認

## Git操作の注意点

### コミット時

- changesetを使用してバージョン管理
- コミットメッセージは意味のある内容に
- テストとリントを通してからコミット

### ブランチ戦略

- `main`: 安定版ブランチ
- `feature/*`: 新機能
- `fix/*`: バグ修正

## トラブルシューティング

### ビルドエラー

```bash
# クリーンビルド
pnpm clean
rm -rf node_modules packages/*/node_modules
pnpm install
pnpm build
```

### 型エラー

```bash
# 型チェック実行
pnpm type-check

# 特定パッケージの型チェック
pnpm --filter @sample/ui type-check
```

### Storybook起動エラー

- Node.jsバージョンを確認 (22.21.1)
- Storybookのバージョンを確認 (10.1.10で統一)
- peer dependencyの警告は無視してOK（React 19使用のため）

### デモアプリ起動エラー

- `pnpm build`で全パッケージをビルド済みか確認
- Next.js設定の`eslint`警告は無視してOK（非推奨設定だが動作に影響なし）

### ポート競合エラー（EADDRINUSE）

開発サーバー起動時に「Port 3000 is already in use」などのエラーが出る場合：

```bash
# 実行中のプロセスを確認
ps aux | grep -E "pnpm.*dev|next.*dev|storybook" | grep -v grep

# プロセスを停止
pkill -f "pnpm.*dev"
pkill -f "storybook"

# または特定のポートを使用しているプロセスを確認・停止
lsof -i :3000  # ポート3000を使用中のプロセス確認
kill -9 <PID>  # PIDを指定して強制終了
```

## 参考ドキュメント

- [README.md](./README.md) - プロジェクト概要
- [docs/00-overview.md](./docs/00-overview.md) - 詳細なアーキテクチャ
- [docs/01-tasks.md](./docs/01-tasks.md) - 実装タスク
- [docs/02-release-strategy.md](./docs/02-release-strategy.md) - リリース戦略
- [docs/03-pnpm-vs-turbo.md](./docs/03-pnpm-vs-turbo.md) - ツール比較
- [docs/RELEASE.md](./docs/RELEASE.md) - リリース手順ガイド（実践的）
- [CONTRIBUTING.md](./CONTRIBUTING.md) - コントリビューションガイド

## 重要な注意事項

1. **Node.jsバージョン**: 必ず22.21.1を使用（`.node-version`で管理）
2. **パッケージマネージャー**: pnpmのみ使用（npmやyarnは使用しない）
3. **Storybookバージョン**: 全パッケージ10.1.10で統一（ESM-onlyのため、設定はESM形式で記述）
4. **React 19**: 一部ライブラリがpeer dependencyで警告を出すが動作に問題なし
5. **ビルド順序**: Turboが依存関係を解決するため、個別パッケージのビルド順序を気にする必要なし
6. **開発サーバーの停止**: `pnpm dev`やStorybookなどの開発サーバーを起動した場合、タスク完了時に必ずプロセスを停止すること（ポート競合を防ぐため）

## 最終更新

- 2025-12-29: 初版作成
- 2025-12-29: Storybook 10.1.10へアップデート
- 2025-12-31: 開発サーバー停止に関する注意事項を追加
- Node.js: 22.21.1
- React: 19.2.3
- Next.js: 16.1.1
- Storybook: 10.1.10
