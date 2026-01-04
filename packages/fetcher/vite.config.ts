import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { readFileSync } from 'fs';

// src配下の全.ts/.tsxファイルを取得（test/specを除く）
const entries = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
  cwd: __dirname,
});

// エントリーポイントオブジェクトを作成
const input = Object.fromEntries(
  entries.map((file) => {
    // src/core/fetcher.ts -> core/fetcher
    const key = file.replace(/^src\//, '').replace(/\.tsx?$/, '');
    return [key, resolve(__dirname, file)];
  })
);

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/package.json'],
    }),
  ],
  build: {
    lib: {
      entry: input,
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      // 相対パス・絶対パス以外（node_modules のパッケージ等）を全て external にする
      external: /^[^./]/,
      output: {
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        banner: (chunk) => {
          // ソースファイルに 'use client' が含まれているかチェック
          if (chunk.facadeModuleId) {
            try {
              const content = readFileSync(chunk.facadeModuleId, 'utf-8');
              if (
                content.includes("'use client'") ||
                content.includes('"use client"')
              ) {
                return "'use client';";
              }
            } catch (e) {
              // ファイル読み込みエラーは無視
            }
          }
          return '';
        },
      },
    },
  },
});
