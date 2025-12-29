import type { StorybookConfig } from '@storybook/react-vite';
import wyw from '@wyw-in-js/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Add linaria (wyw-in-js) support
    config.plugins = config.plugins || [];
    config.plugins.unshift(
      wyw({
        include: ['**/*.{ts,tsx}'],
        exclude: ['node_modules/**'],
        babelOptions: {
          presets: [
            '@babel/preset-typescript',
            ['@babel/preset-react', { runtime: 'automatic' }],
          ],
        },
      })
    );
    return config;
  },
};

export default config;
