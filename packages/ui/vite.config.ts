import { defineConfig } from 'vite';
import wyw from '@wyw-in-js/vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { glob } from 'glob';
import { readFileSync } from 'fs';

// src配下の全.ts/.tsxファイルを取得（stories/testを除く）
const entries = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.stories.tsx', '**/*.test.tsx'],
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
      exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
    }),
  ],
  build: {
    lib: {
      entry: input,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@linaria/core',
        '@linaria/react',
      ],
      output: [
        {
          format: 'es',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].mjs',
          chunkFileNames: '[name].mjs',
          banner: (chunk) => {
            // ソースファイルに 'use client' が含まれているかチェック
            if (chunk.facadeModuleId) {
              try {
                const content = readFileSync(chunk.facadeModuleId, 'utf-8');
                if (content.includes("'use client'") || content.includes('"use client"')) {
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
        {
          format: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          exports: 'named',
          banner: (chunk) => {
            // ソースファイルに 'use client' が含まれているかチェック
            if (chunk.facadeModuleId) {
              try {
                const content = readFileSync(chunk.facadeModuleId, 'utf-8');
                if (content.includes("'use client'") || content.includes('"use client"')) {
                  return "'use client';";
                }
              } catch (e) {
                // ファイル読み込みエラーは無視
              }
            }
            return '';
          },
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) return 'index.css';
            return assetInfo.name || 'assets/[name].[ext]';
          },
        },
      ],
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
