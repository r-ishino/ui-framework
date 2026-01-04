import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { target: '19' }]],
      },
    }),
    dts({
      insertTypesEntry: true,
      exclude: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/package.json'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      // 相対パス・絶対パス以外（node_modules のパッケージ等）を全て external にする
      external: /^[^./]/,
    },
    sourcemap: true,
  },
});
