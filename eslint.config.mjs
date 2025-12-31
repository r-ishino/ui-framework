import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import storybookPlugin from 'eslint-plugin-storybook';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base JavaScript recommended config
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/.cache/**',
      '**/storybook-static/**',
      '**/next-env.d.ts',
    ],
  },

  // TypeScript and React configuration
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json', './packages/*/tsconfig.json', './apps/*/tsconfig.json'],
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        // Timer functions (browser & Node.js)
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        // Node globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        // ES6+ globals
        Promise: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
        Symbol: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: true,
      },
    },
    rules: {
      // Import rules
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never',
        },
      ],
      'import/no-namespace': 'error',
      'import/prefer-default-export': 'off',
      'import/no-default-export': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],

      // Unused imports
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // General rules
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'func-style': ['error', 'expression'],
      'no-use-before-define': 'off',

      // TypeScript rules
      '@typescript-eslint/no-use-before-define': 'error',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never',
        },
      ],

      // React rules
      'react/jsx-filename-extension': [
        'error',
        {
          extensions: ['.tsx'],
        },
      ],
      'react/jsx-max-depth': [
        'error',
        {
          max: 7,
        },
      ],
      'react/jsx-sort-props': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
        },
      ],
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX a11y rules (recommended)
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          assert: 'both',
        },
      ],

      // Restrict syntax
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSEnumDeclaration',
          message: "Don't declare enums.",
        },
        {
          selector: 'TSInterfaceDeclaration',
          message: 'Prefer types to interfaces.',
        },
      ],
    },
  },

  // TypeScript-specific rules (only for .ts and .tsx files)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/typedef': 'error',
    },
  },

  // JavaScript files - relax some TypeScript rules
  {
    files: ['**/*.{js,jsx}'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/typedef': 'off',
    },
  },

  // Storybook plugin recommended config (must come before overrides)
  ...storybookPlugin.configs['flat/recommended'],

  // Next.js app directory - allow default exports
  {
    files: [
      'apps/demo/app/**/*.{ts,tsx,js,jsx}',
      'apps/demo/pages/**/*.{ts,tsx,js,jsx}',
      '**/app/**/*.{ts,tsx,js,jsx}',
      '**/pages/**/*.{ts,tsx,js,jsx}',
    ],
    rules: {
      'import/no-default-export': 'off',
    },
  },

  // Storybook files and config files - allow default exports and console, relax TypeScript rules
  {
    files: [
      '**/*.stories.{ts,tsx,js,jsx}',
      '**/.storybook/**/*.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/rollup.config.{js,ts}',
      '**/jest.config.{js,ts}',
      '**/vitest.config.{js,ts}',
      '**/vite.config.{js,ts}',
      '**/next.config.{js,ts}',
      '**/turbo.json',
      '**/tsup.config.{js,ts}',
    ],
    languageOptions: {
      parserOptions: {
        project: null, // Disable TypeScript project for these files
      },
    },
    rules: {
      'import/no-default-export': 'off',
      'no-console': 'off',
      'no-alert': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/typedef': 'off',
      'storybook/no-renderer-packages': 'off', // Allow importing types from @storybook/react
    },
  },

  // Prettier config (must be last to override other formatting rules)
  prettierConfig,
];
