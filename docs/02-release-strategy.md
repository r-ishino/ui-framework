# Sample UI Framework - リリース戦略

## GitHub Packagesを使ったリリース

このプロジェクトでは、npm public registryではなくGitHub Packagesを使用してパッケージを公開します。

## Changesets vs Lerna：どちらを選ぶべきか

### 比較表

| 項目              | Changesets                   | Lerna                              |
| ----------------- | ---------------------------- | ---------------------------------- |
| **主な用途**      | バージョン管理とリリース     | モノレポ全般の管理                 |
| **メンテナンス**  | ✅ 活発（Atlassian等が使用） | ⚠️ 2022年に一時停止→Nrwlが引き継ぎ |
| **学習コスト**    | 低い（シンプル）             | 中〜高（多機能）                   |
| **リリース方式**  | PR駆動（changesetファイル）  | コミットベース or 手動             |
| **CHANGELOG生成** | ✅ 自動・高品質              | ⚠️ 基本的だが可能                  |
| **依存関係更新**  | ✅ 自動的に適切に処理        | ⚠️ 手動または複雑な設定            |
| **GitHub統合**    | ✅ 公式Actionあり            | △ 可能だが設定が複雑               |
| **pnpm対応**      | ✅ 完全対応                  | ✅ 対応                            |
| **セットアップ**  | 簡単（数分）                 | 複雑（設定が多い）                 |
| **チーム運用**    | ✅ PR単位で管理しやすい      | △ コミットメッセージに依存         |

### Lernaの特徴

**メリット:**

- モノレポ管理の老舗（2016年〜）
- タスク実行の並列化（`lerna run`）
- パッケージ間の依存関係管理
- Babel、Jestなどの大規模プロジェクトで実績

**デメリット:**

- 一時期メンテナンスが停止（2022年）
- 設定が複雑で学習コストが高い
- リリース管理が直感的でない
- 現代的なツール（Turbo, Nx）に移行する傾向

**Lernaの設定例:**

```json
{
  "version": "independent",
  "npmClient": "pnpm",
  "command": {
    "publish": {
      "conventionalCommits": true,
      "message": "chore(release): publish"
    }
  },
  "ignoreChanges": ["**/*.md", "**/test/**"]
}
```

### Changesetsの特徴

**メリット:**

- リリース管理に特化してシンプル
- PR駆動のワークフローで管理しやすい
- GitHub Actionsとの統合が簡単
- 高品質なCHANGELOGを自動生成
- 依存関係の自動更新が優秀
- モダンなツール（Remix, Pnpm自体など）で採用

**デメリット:**

- リリース管理以外の機能はない（タスク実行等）
- タスク並列実行には別ツール（Turbo等）が必要

### 推奨：Changesets + Turbo（またはpnpm run）

現代的なモノレポ構成では、以下の組み合わせが最適です：

```
┌─────────────────────────────────────┐
│ pnpm workspace                      │  ← パッケージ管理
│  ├── Changesets                     │  ← リリース管理
│  └── Turbo (optional)               │  ← タスク並列実行・キャッシュ
└─────────────────────────────────────┘
```

**このプロジェクトでの推奨:**

- ✅ **Changesets**: リリース管理（シンプルで十分）
- ✅ **pnpm**: パッケージ管理とワークスペース
- 🤔 **Turbo**: ビルドが遅くなったら導入を検討

### 実際の使用例の比較

#### Lernaでのリリース

```bash
# 1. 変更を実装（コミットメッセージが重要）
git commit -m "feat: add new button component"

# 2. バージョンアップ（全パッケージを確認する必要がある）
lerna version --conventional-commits

# 3. 公開
lerna publish from-git
```

**問題点:**

- コミットメッセージを間違えると正しいバージョンにならない
- どのパッケージが影響を受けるか分かりにくい
- CHANGELOGの内容が不十分になりがち

#### Changesetsでのリリース

```bash
# 1. 変更を実装
git commit -m "any message is fine"

# 2. changesetを追加（対話形式で分かりやすい）
pnpm changeset
# → どのパッケージ？ → @sample/ui
# → 変更の種類は？ → minor
# → 説明は？ → Add new Button component with variant support

# 3. PRをマージ後、自動的にVersion Packages PRが作成される
# 4. そのPRをマージすると自動公開
```

**利点:**

- 変更内容を明示的に記録
- レビュアーがchangesetファイルで変更を確認できる
- 自動化が簡単

### Lernaからの移行が必要な場合

もし既存プロジェクトでLernaを使っている場合：

1. **Lerna + Changesetsの併用** → 移行期間
2. **段階的にChangesetsへ移行** → リリース管理のみ移行
3. **Lernaの削除** → タスク実行は`pnpm`や`turbo`へ

### 結論

**新規プロジェクトならChangesets一択**

- シンプル
- モダン
- メンテナンスされている
- 十分な機能

**Lernaが適している場合**

- 既に大規模なLerna構成がある
- Lerna固有の機能に依存している
- 移行コストが高い

このプロジェクトは新規なので、**Changesets**を強く推奨します。

---

## 推奨: Changesetsを使った自動リリース

### Changesetsとは

[Changesets](https://github.com/changesets/changesets)は、モノレポに特化したバージョン管理・リリース自動化ツールです。

**メリット:**

- モノレポでのバージョン管理が簡単
- 依存関係のある複数パッケージを自動的に適切なバージョンにアップ
- CHANGELOGの自動生成
- GitHub Actionsとの統合が容易
- チームでの運用がしやすい（PRごとにchangesetを追加）

### セットアップ手順

#### 1. Changesetsのインストール

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

これにより`.changeset`ディレクトリと設定ファイルが作成されます。

#### 2. `.changeset/config.json`の設定

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["sample-demo"]
}
```

- `access: "restricted"`: GitHub Packages用（private registry）
- `ignore: ["sample-demo"]`: デモアプリはリリース対象外

#### 3. `.npmrc`の設定（GitHub Packages用）

ルートディレクトリに`.npmrc`を作成：

```
@YOUR-ORG:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`YOUR-ORG`は実際のGitHub organizationまたはユーザー名に置き換えてください。

#### 4. 各パッケージの`package.json`設定

```json
{
  "name": "@YOUR-ORG/ui",
  "version": "0.1.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR-ORG/ui-framework.git",
    "directory": "packages/ui"
  }
}
```

#### 5. GitHub Actionsの設定

`.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://npm.pkg.github.com'

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm build

      - name: Create Release Pull Request or Publish
        id: changesets
        uses: changesets/action@v1
        with:
          publish: pnpm release
          commit: 'chore: release packages'
          title: 'chore: release packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 6. ルート`package.json`にスクリプト追加

```json
{
  "scripts": {
    "changeset": "changeset",
    "version": "changeset version",
    "release": "changeset publish"
  }
}
```

### リリースワークフロー

#### 開発者の作業フロー

1. **機能開発・バグ修正**

```bash
# 通常の開発
git checkout -b feature/new-button
# コードを書く...
```

2. **Changesetの追加**

```bash
pnpm changeset
```

対話形式で以下を選択：

- どのパッケージを変更したか
- 変更の種類（major/minor/patch）
- 変更内容の説明

これにより`.changeset`ディレクトリに変更記録ファイルが作成されます。

3. **PRの作成**

```bash
git add .
git commit -m "feat: add new button component"
git push origin feature/new-button
```

PRには自動的にchangesetファイルが含まれます。

#### リリースフロー（自動）

1. **PRがmainにマージされる**

2. **GitHub Actionsが自動実行**
   - Changesetを検出
   - "Version Packages"というPRを自動作成
   - このPRには：
     - バージョン番号の更新
     - CHANGELOGの更新
     - 依存パッケージのバージョン更新

3. **Version Packages PRをレビュー・マージ**
   - CHANGELOGを確認
   - バージョン番号が適切か確認
   - マージすると自動的にGitHub Packagesに公開

4. **自動的に以下が実行される**
   - パッケージのビルド
   - GitHub Packagesへのpublish
   - GitタグとGitHub Releaseの作成

### バージョンの種類

Semantic Versioningに従います：

- **major (1.0.0 → 2.0.0)**: 破壊的変更
  - APIの削除・変更
  - 動作の大きな変更

- **minor (1.0.0 → 1.1.0)**: 後方互換性のある機能追加
  - 新しいコンポーネントの追加
  - 新しいpropsの追加

- **patch (1.0.0 → 1.0.1)**: バグ修正
  - バグ修正
  - ドキュメント修正
  - 内部リファクタリング

### 依存関係の自動更新

Changesetsは依存関係を自動的に適切に更新します：

例: `@sample/ui`を1.0.0→1.1.0にアップデートした場合

- `@sample/nextjs`（@sample/uiに依存）→ 自動的にpatchバージョンアップ
- `sample-demo`（ignoreに含まれる）→ 更新されない

## 代替案: 手動リリース

小規模プロジェクトや初期段階では手動リリースも選択肢です。

### 手動リリースの手順

1. **バージョン更新**

```bash
cd packages/ui
npm version patch  # or minor, major
```

2. **ビルド**

```bash
pnpm build
```

3. **公開**

```bash
cd packages/ui
npm publish
```

4. **タグ作成**

```bash
git tag @sample/ui@1.0.1
git push --tags
```

**デメリット:**

- 手作業が多い
- ミスしやすい
- CHANGELOGの管理が大変
- 依存関係の更新を手動で行う必要がある

## GitHub Packagesへのアクセス設定

### パッケージを使う側の設定

プロジェクトで`@sample/*`パッケージを使う場合：

1. **`.npmrc`を作成**

```
@YOUR-ORG:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

2. **Personal Access Token (PAT)の作成**

GitHub Settings → Developer settings → Personal access tokens → Generate new token

必要な権限:

- `read:packages`

3. **環境変数に設定**

```bash
export GITHUB_TOKEN=your_token_here
```

または`.bashrc`/`.zshrc`に追加：

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

4. **インストール**

```bash
pnpm add @YOUR-ORG/ui
```

### CIでの設定

GitHub Actionsでは`GITHUB_TOKEN`が自動的に利用可能です：

```yaml
- name: Install dependencies
  run: pnpm install
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## ベストプラクティス

### 1. changesetは小さく保つ

- 1つのPRに1つのchangeset
- 複数の独立した変更は別々のPRに分ける

### 2. 説明は分かりやすく

```bash
pnpm changeset
```

実行時に書く説明は、利用者向けに書く：

❌ 悪い例:

```
Fixed bug
```

✅ 良い例:

```
Fixed Button component not responding to disabled prop
```

### 3. プレリリース版の活用

不安定な変更を試したい場合：

```bash
pnpm changeset pre enter beta
pnpm changeset version
pnpm release
```

これにより`1.0.0-beta.1`のようなバージョンが作成されます。

### 4. CHANGELOGのカスタマイズ

より詳細なCHANGELOGが欲しい場合：

```bash
pnpm add -D -w @changesets/changelog-github
```

`.changeset/config.json`:

```json
{
  "changelog": [
    "@changesets/changelog-github",
    { "repo": "YOUR-ORG/ui-framework" }
  ]
}
```

これによりGitHubのPRリンクが自動的にCHANGELOGに追加されます。

## トラブルシューティング

### パッケージが公開されない

1. `publishConfig.registry`が正しく設定されているか確認
2. GitHub Actionsの`packages: write`権限があるか確認
3. パッケージ名が`@YOUR-ORG/`で始まっているか確認

### 依存パッケージがインストールできない

1. `.npmrc`が正しく設定されているか確認
2. `GITHUB_TOKEN`が有効か確認
3. パッケージの可視性設定を確認（privateになっていないか）

### Changesets PRが作成されない

1. mainブランチにchangesetファイルがマージされているか確認
2. GitHub Actionsが正常に実行されているか確認
3. 既に"Version Packages" PRが存在しないか確認

## まとめ

**推奨構成:**

- ✅ Changesets: バージョン管理とリリース自動化
- ✅ GitHub Actions: CI/CDパイプライン
- ✅ GitHub Packages: プライベートパッケージホスティング
- ✅ pnpm workspace: モノレポ管理

この構成により、開発者は`pnpm changeset`を実行するだけで、後はすべて自動化されます。
