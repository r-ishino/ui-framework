# CSS事前抽出の採用理由

最終更新: 2025-12-30

## 概要

`@sample/ui`パッケージでは、Linaria（CSS-in-JS）を使用したコンポーネントをビルドする際に、**CSS事前抽出方式**を採用しました。このドキュメントでは、その決定に至った経緯と技術的な理由を説明します。

## TL;DR（要約）

- ✅ **CSS事前抽出方式を採用**
- 🎯 主な理由: Next.js 15+ Turbopack対応、バージョン管理の簡素化、ビルド複雑性の封じ込め
- ⚠️ トレードオフ: Tree-shakingの喪失（ただし社内利用では影響は限定的）
- 🛠️ ビルドツール: Vite（ライブラリモード）+ @wyw-in-js/vite

---

## 背景

### 初期の検討

プロジェクト開始時、Linariaを使ったコンポーネントの配布方法として、以下の2つの選択肢がありました：

#### 方式A: CSS-in-JSのまま配布

```typescript
// ライブラリ内のコード（tsupでビルド）
import { css, cx } from '@linaria/core';

const button = css`
  padding: 8px 16px;
  /* ... */
`;

// ↓ ビルド後もCSS-in-JSのまま
export const button = css`
  padding: 8px 16px;
`;
```

**消費側（Next.jsアプリ）での要件:**

- `@wyw-in-js/webpack-loader`の設定が必要
- ビルド時にCSS抽出処理が実行される
- ライブラリと同じバージョンの`@linaria/core`が必要

#### 方式B: CSS事前抽出

```typescript
// ライブラリ内のコード
import { css, cx } from '@linaria/core';
const button = css`padding: 8px 16px;`;

// ↓ ビルド時にCSSを抽出
// dist/index.js
const button = 'btn_abc123';

// dist/index.css
.btn_abc123 { padding: 8px 16px; }
```

**消費側（Next.jsアプリ）での要件:**

- `import '@sample/ui/styles.css'`でCSSを読み込むだけ
- 特別なビルド設定は不要

---

## 決定の要因

### 1. Next.js 15+ Turbopack対応 🚨 **最重要**

#### 問題

Next.js 15以降、**Turbopack**がデフォルトのビルドツールになる予定です。現時点（2025年12月）で、以下の状況です：

| Next.jsバージョン | デフォルトビルドツール | Linaria対応                    |
| ----------------- | ---------------------- | ------------------------------ |
| 12.x ~ 14.x       | Webpack 5              | ✅ `@wyw-in-js/webpack-loader` |
| 15.x+             | Turbopack              | ❌ **未対応**                  |

Turbopackでは、カスタムwebpackローダーのサポートが限定的で、**Linariaプラグインが動作しない**可能性が高いです。

#### 影響

CSS-in-JSのまま配布した場合：

- Next.js 15+へのアップグレードが**困難または不可能**
- Turbopackを使用できず、高速ビルドの恩恵を受けられない
- webpack 5に留まり続ける必要がある（技術的負債）

CSS事前抽出の場合：

- **Turbopackと完全互換**（単純なCSSファイルの読み込み）
- Next.jsのバージョンアップに追従可能
- 将来の技術変化に対して柔軟

---

### 2. バージョン管理の複雑性

#### CSS-in-JSのまま配布した場合の依存関係

```
@sample/ui (ライブラリ)
├── dependencies
│   ├── @linaria/core@^6.3.0      ← ランタイム依存
│   └── @linaria/react@^6.3.0     ← ランタイム依存
└── devDependencies
    └── @wyw-in-js/vite@^0.4.0    ← ビルド時依存

Next.jsアプリ (消費側)
├── dependencies
│   ├── @sample/ui@^0.1.0
│   ├── @linaria/core@^7.0.0      ← バージョン不一致の可能性
│   └── @linaria/react@^7.0.0
└── devDependencies
    └── @wyw-in-js/webpack-loader@^1.0.0  ← 異なるツール
```

#### 潜在的な問題

1. **ランタイムAPI の不整合**
   - ライブラリ: `@linaria/core@6.x`でビルド
   - アプリ: `@linaria/core@7.x`を使用
   - → `css`タグや`cx`関数のAPI変更でランタイムエラー

2. **ビルドツールの違い**
   - ライブラリ開発: Viteプラグイン使用
   - アプリ: webpack-loader使用
   - → CSS抽出アルゴリズムの違いによるクラス名の不一致

3. **peerDependencies管理の負担**

   ```json
   {
     "peerDependencies": {
       "@linaria/core": "^6.0.0",
       "@linaria/react": "^6.0.0"
     }
   }
   ```

   - 消費側でのバージョン制約
   - 複数のライブラリが異なるバージョンを要求する可能性

#### CSS事前抽出の場合

```
@sample/ui (ライブラリ)
├── dependencies
│   └── @linaria/core@^6.3.0      ← ランタイムのみ（cx関数用）
└── devDependencies
    └── @wyw-in-js/vite@^0.8.1    ← ビルド時のみ

Next.jsアプリ (消費側)
├── dependencies
│   ├── @sample/ui@^0.1.0
│   └── @linaria/core@^6.3.0      ← peerDependencyとして要求
└── devDependencies
    └── （Linariaプラグイン不要）  ← 設定不要！
```

**メリット:**

- ✅ ビルドツールのバージョン管理が不要
- ✅ webpack-loader vs Viteプラグインの違いを気にしない
- ✅ 消費側のビルド設定が単純

---

### 3. ビルド複雑性の封じ込め

#### CSS-in-JSのまま配布: 複雑性が漏れる

```
┌─────────────────────────────┐
│ ライブラリ (@sample/ui)      │
│ - Linaria設定                │
│ - Babel設定                  │
│ - CSS抽出ロジック            │
└─────────────────────────────┘
            ↓ 配布
┌─────────────────────────────┐
│ 消費側 (Next.jsアプリ)        │
│ - Linaria設定が必要 ⚠️       │
│ - Babel設定が必要 ⚠️         │
│ - webpack-loader設定 ⚠️      │
│ - ライブラリの実装変更に影響  │
└─────────────────────────────┘
```

**問題点:**

- ライブラリのLinaria設定を消費側が理解する必要がある
- ライブラリがLinariaから別のCSS-in-JSライブラリに移行した場合、消費側も変更が必要
- チーム全体がLinariaの知識を持つ必要がある

#### CSS事前抽出: 複雑性を封じ込める

```
┌─────────────────────────────┐
│ ライブラリ (@sample/ui)      │
│ - Linaria設定 ✅             │
│ - Babel設定 ✅               │
│ - CSS抽出ロジック ✅         │
│   ↓ ビルド時に処理           │
│ - 静的CSS出力                │
└─────────────────────────────┘
            ↓ 配布
┌─────────────────────────────┐
│ 消費側 (Next.jsアプリ)        │
│ - import '@sample/ui/styles.css' │
│   ↓ 完了！                   │
└─────────────────────────────┘
```

**メリット:**

- ✅ 消費側は単純なCSS読み込みだけ
- ✅ ライブラリの実装変更（LinariaからXXXへの移行など）が消費側に影響しない
- ✅ CSS-in-JSの知識が不要

---

### 4. 社内利用における最適性

#### プロジェクトの状況

- **用途**: 社内/チーム内での使用
- **環境**: Next.js プロダクションアプリケーション
- **開発体制**: 統一された技術スタック

#### Tree-shakingの喪失は許容可能

CSS-in-JSのまま配布する最大のメリットは**Tree-shaking**（未使用コンポーネントのCSSを削除）ですが、社内利用では以下の理由で重要度が低いです：

1. **コンポーネント数が限定的**
   - 社内UIライブラリは10〜50コンポーネント程度
   - すべてのCSSを含めても数十KB程度

2. **多くのコンポーネントを使用**
   - 社内アプリでは多数のコンポーネントを使用するため、Tree-shakingの効果が小さい

3. **ネットワークキャッシュの効果**
   - 単一のCSSファイルはキャッシュされ、全ページで共有される
   - ページごとに異なるCSS チャンクよりも効率的な場合がある

#### 計算例

```
仮定:
- ライブラリに30コンポーネント
- 1コンポーネントあたり平均500B のCSS
- アプリで20コンポーネントを使用

CSS-in-JS（Tree-shaking）:
20 × 500B = 10KB（使用分のみ）

CSS事前抽出:
30 × 500B = 15KB（全コンポーネント）

差分: 5KB（gzip後は約1.5KB）
→ 社内利用では許容範囲
```

---

## 実装の詳細

### ビルドツールの選択

#### tsup → Vite への変更

当初、tsup（esbuildベース）を使用していましたが、Linariaプラグインとの相性問題があり、**Viteのライブラリモード**に変更しました。

**選択理由:**

- ✅ Storybook用にViteをすでに使用（一貫性）
- ✅ `@wyw-in-js/vite`の安定したサポート
- ✅ ライブラリモードの成熟した機能
- ✅ 型定義生成（vite-plugin-dts）

### ビルド設定

```typescript
// packages/ui/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    wyw({
      include: ['**/*.{ts,tsx}'],
      exclude: ['node_modules/**', '**/*.stories.tsx'],
      babelOptions: {
        presets: [
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    }),
    react(),
    dts({ insertTypesEntry: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@linaria/core'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'index.css';
          return assetInfo.name as string;
        },
      },
    },
    cssCodeSplit: false, // 単一のCSSファイルに統合
  },
});
```

### package.json設定

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./styles.css": "./dist/index.css"
  },
  "dependencies": {
    "@linaria/core": "^6.3.0"
  }
}
```

**ポイント:**

- `./styles.css`エクスポートでCSS読み込みを提供
- `@linaria/core`は`cx`関数のためにランタイム依存として保持

---

## 消費側での使用方法

### Next.jsアプリでの読み込み

```typescript
// app/layout.tsx または pages/_app.tsx
import '@sample/ui/styles.css';  // ← CSS読み込み
import { Button } from '@sample/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Button variant="primary">Click me</Button>
        {children}
      </body>
    </html>
  );
}
```

**必要なもの:**

- ✅ `@sample/ui`パッケージ
- ✅ `@linaria/core`（peerDependency）
- ❌ Linariaプラグイン設定 **不要**
- ❌ webpack-loader設定 **不要**

---

## トレードオフの評価

### 失われたもの

| 項目                  | CSS-in-JS | CSS事前抽出   | 評価                  |
| --------------------- | --------- | ------------- | --------------------- |
| **Tree-shaking**      | ✅ 可能   | ❌ 不可能     | 🟡 社内利用では影響小 |
| **動的スタイリング**  | ✅ 柔軟   | ⚠️ 限定的     | 🟢 現在は不要         |
| **CSS変数の動的変更** | ✅ 容易   | ⚠️ 工夫が必要 | 🟢 CSS変数で対応可能  |

### 得られたもの

| 項目               | CSS-in-JS   | CSS事前抽出 | 評価              |
| ------------------ | ----------- | ----------- | ----------------- |
| **Turbopack対応**  | ❌ 困難     | ✅ 完全対応 | 🔴 **最重要**     |
| **バージョン管理** | ❌ 複雑     | ✅ シンプル | 🔴 **重要**       |
| **セットアップ**   | ❌ 複雑     | ✅ 不要     | 🟢 重要           |
| **ビルド速度**     | ⚠️ やや遅い | ✅ 高速     | 🟢 副次的メリット |
| **デバッグ**       | ⚠️ やや困難 | ✅ 容易     | 🟢 副次的メリット |

---

## 将来の考慮事項

### 動的スタイリングが必要になった場合

現在のCSS事前抽出方式でも、以下の方法で対応可能：

1. **CSS変数を使用**

   ```typescript
   // ライブラリ側
   const button = css`
     background: var(--button-bg, #3b82f6);
   `;

   // 消費側
   <Button style={{ '--button-bg': '#ff0000' }} />
   ```

2. **インラインスタイルと組み合わせ**

   ```typescript
   <Button style={{ opacity: isDisabled ? 0.5 : 1 }} />
   ```

3. **条件付きクラス名**
   ```typescript
   const classes = cx(button, isActive && activeButton);
   ```

### 他のCSS-in-JSライブラリへの移行

CSS事前抽出により、ライブラリの実装詳細が消費側に漏れないため、将来的に以下の移行が容易：

- Linaria → vanilla-extract
- Linaria → Panda CSS
- Linaria → Tailwind CSS（コンパイル時）

消費側は`import '@sample/ui/styles.css'`を変更する必要がなく、**透過的な移行が可能**。

---

## まとめ

### 採用の決定理由（優先順位順）

1. 🚨 **Next.js 15+ Turbopack対応**
   - 将来のNext.jsバージョンで使用できなくなるリスクを回避

2. 🔴 **バージョン管理の簡素化**
   - Linariaとビルドツールのバージョン不一致による問題を防ぐ

3. 🟢 **ビルド複雑性の封じ込め**
   - 消費側のセットアップを不要にし、開発体験を向上

4. 🟡 **社内利用における最適性**
   - Tree-shakingの喪失は許容範囲

### 結論

**CSS事前抽出方式は、社内UIライブラリとして最適な選択である。**

特に、Next.js 15+への対応とバージョン管理の簡素化は、プロダクション環境での安定性と長期的な保守性において決定的に重要です。

---

## 参考情報

### 関連ドキュメント

- [00-overview.md](./00-overview.md) - プロジェクト全体のアーキテクチャ
- [CLAUDE.md](../CLAUDE.md) - プロジェクト設定と技術スタック

### 技術リソース

- [Linaria Documentation](https://linaria.dev/)
- [wyw-in-js (What You Write is What you get)](https://wyw-in-js.dev/)
- [Next.js Turbopack](https://nextjs.org/docs/architecture/turbopack)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)

### バージョン情報

- Linaria: 6.3.0
- @wyw-in-js/vite: 0.8.1
- Vite: 7.3.0
- Next.js (想定環境): 16.x
- Node.js: 22.21.1

最終更新日: 2025-12-30
