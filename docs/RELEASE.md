# リリース手順ガイド

このドキュメントでは、Sample UI Frameworkのパッケージをリリースする手順を説明します。

## 概要

このプロジェクトでは、**Changesets**を使用した自動リリースを採用しています。

- **配信先**: GitHub Packages
- **バージョン管理**: パッケージごとに独立（Independent Mode）
- **CHANGELOG**: 自動生成（GitHub PRリンク付き）
- **リリースフロー**: 完全自動化

## リリースの流れ

```
1. 開発者: 機能開発・バグ修正
2. 開発者: pnpm changeset で変更を記録
3. 開発者: PRを作成・マージ
   ↓
4. 自動: GitHub Actionsが"Version Packages" PRを作成
5. 開発者: "Version Packages" PRをレビュー・マージ
   ↓
6. 自動: GitHub Packagesに公開
7. 自動: Gitタグ・GitHub Releaseを作成
```

## 開発者の作業手順

### 1. 機能開発・バグ修正

通常通り開発します。

```bash
git checkout -b feature/add-new-button
# コードを書く...
```

### 2. Changesetの追加

変更内容を記録します。

```bash
pnpm changeset
```

対話形式で以下を選択：

#### 2-1. どのパッケージを変更しましたか？

```
? Which packages would you like to include?
❯ ◉ @sample/ui
  ◯ @sample/nextjs
  ◯ @sample/util
```

スペースキーで選択、Enterで確定。

#### 2-2. 変更の種類は？

```
? Which packages should have a major bump?
? Which packages should have a minor bump?
? Which packages should have a patch bump?
```

**バージョンの選び方：**

- **patch (1.0.0 → 1.0.1)**: バグ修正、ドキュメント更新
- **minor (1.0.0 → 1.1.0)**: 新機能追加（後方互換性あり）
- **major (1.0.0 → 2.0.0)**: 破壊的変更（APIの削除・変更）

#### 2-3. 変更内容の説明

```
? Please enter a summary for this change:
```

**良い例：**

```
Add Button component with variant support (primary, secondary, ghost)
```

**悪い例：**

```
Added new component
```

説明は：
- 利用者向けに書く
- 何が追加/修正されたか明確に
- 英語で書く（CHANGELOGに表示される）

### 3. PRの作成

changesetファイルを含めてコミット・プッシュします。

```bash
git add .
git commit -m "feat: add Button component with variants"
git push origin feature/add-new-button
```

PRを作成し、レビューを依頼します。

### 4. PRのマージ

レビュー承認後、mainブランチにマージします。

## 自動リリースフロー

### 1. Version Packages PRの自動作成

mainにマージされると、GitHub Actionsが自動的に**"Version Packages"**という名前のPRを作成します。

このPRには：
- バージョン番号の更新
- CHANGELOGの更新
- 依存パッケージのバージョン更新

が含まれます。

### 2. Version Packages PRのレビュー

以下を確認します：

- ✅ バージョン番号が適切か
- ✅ CHANGELOGの内容が正しいか
- ✅ 依存関係の更新が適切か

問題なければマージします。

### 3. 自動公開

Version Packages PRをマージすると、自動的に：

1. パッケージがビルドされる
2. GitHub Packagesに公開される
3. Gitタグが作成される
4. GitHub Releaseが作成される

## バージョン管理戦略

### パッケージごとに独立

各パッケージは独自のバージョンを持ちます：

```
@sample/ui     → 1.2.0
@sample/nextjs → 0.5.1
@sample/util   → 2.0.0
```

### 依存関係の自動更新

例：`@sample/util`を1.0.0→1.1.0にアップデートした場合

- `@sample/ui`（utilに依存）→ 自動的に1.2.0→1.2.1にpatchアップ
- `@sample/nextjs`（uiとutilに依存）→ 自動的に0.5.1→0.5.2にpatchアップ

**依存関係は自動的に適切に更新されます。**

## Semantic Versioningの原則

### major (破壊的変更)

```
1.0.0 → 2.0.0
```

**例：**
- 既存のpropsを削除
- props名を変更
- コンポーネントのAPIを変更
- 依存ライブラリのメジャーアップデート

### minor (新機能)

```
1.0.0 → 1.1.0
```

**例：**
- 新しいコンポーネントを追加
- 新しいpropsを追加（既存動作は変わらない）
- 新しいユーティリティ関数を追加

### patch (バグ修正)

```
1.0.0 → 1.0.1
```

**例：**
- バグを修正
- 内部リファクタリング（APIは変わらない）
- ドキュメントの修正
- 型定義の修正

## よくあるケース

### 複数のパッケージを同時に変更した場合

1つのchangesetで複数のパッケージを選択できます。

```bash
pnpm changeset
# @sample/ui と @sample/nextjs の両方を選択
```

### 変更を取り消したい場合

changesetファイルを削除すればOKです。

```bash
rm .changeset/[changeset-name].md
```

### 複数の変更を1つのリリースにまとめたい

複数のPRをマージした後、Version Packages PRには全ての変更がまとめられます。

### プレリリース版を作りたい場合

```bash
pnpm changeset pre enter beta
pnpm changeset version
# → 1.0.0-beta.1 のようなバージョンになる

# 通常リリースに戻す
pnpm changeset pre exit
```

## トラブルシューティング

### Version Packages PRが作成されない

**原因：**
- changesetファイルがmainにマージされていない
- GitHub Actionsが失敗している

**解決：**
1. `.changeset/`ディレクトリに`.md`ファイルがあるか確認
2. GitHub Actionsの実行ログを確認

### パッケージが公開されない

**原因：**
- GitHub Actionsのpermissionsが不足
- repository URLが間違っている

**解決：**
1. `.github/workflows/release.yml`のpermissionsを確認
2. package.jsonの`repository`フィールドを確認

### CHANGELOGにPRリンクが表示されない

**原因：**
- `@changesets/changelog-github`が正しく設定されていない

**解決：**
- `.changeset/config.json`の`changelog`設定を確認

## パッケージの利用

### パッケージをインストールする側の設定

プロジェクトでこのパッケージを使う場合：

#### 1. `.npmrc`を作成

```
@r-ishino:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${PACKAGE_TOKEN}
```

#### 2. Personal Access Token (PAT)を作成

GitHub Settings → Developer settings → Personal access tokens → Generate new token

必要な権限:
- `read:packages`

#### 3. 環境変数に設定

```bash
export PACKAGE_TOKEN=ghp_xxxxxxxxxxxxx
```

または`.bashrc`/`.zshrc`に追加。

#### 4. インストール

```bash
pnpm add @r-ishino/ui
```

## まとめ

**開発者がやること：**
1. コードを書く
2. `pnpm changeset`を実行
3. PRを作成・マージ
4. Version Packages PRをマージ

**自動化されること：**
- バージョン番号の更新
- CHANGELOGの生成
- パッケージの公開
- Gitタグ・Releaseの作成

これで、安全で一貫性のあるリリースが実現できます！
