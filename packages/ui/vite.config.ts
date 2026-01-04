import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wyw from '@wyw-in-js/vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { readFileSync } from 'fs';

// src配下の全.ts/.tsxファイルを取得（stories/testを除く）
const entries = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.stories.tsx', '**/*.test.{ts,tsx}'],
  cwd: __dirname,
});

// エントリーポイントオブジェクトを作成
const input = Object.fromEntries(
  entries.map((file) => {
    // src/components/buttons/Button/Button.tsx -> components/buttons/Button/Button
    const key = file.replace(/^src\//, '').replace(/\.tsx?$/, '');
    return [key, resolve(__dirname, file)];
  })
);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
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
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.stories.tsx', '**/*.test.{ts,tsx}', '**/package.json'],
    }),
  ],
  build: {
    lib: {
      entry: input,
      formats: ['es'],
    },
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
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'index.css';
          return assetInfo.name || 'assets/[name].[ext]';
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
