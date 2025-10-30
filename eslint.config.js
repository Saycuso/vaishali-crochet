import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'functions']), // ignore Firebase folder globally
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      quotes: 'off', // 🟢 disable "must use double quotes" warning
      'require-jsdoc': 'off', // 🟢 disable "missing JSDoc" warning
    },
  },
  {
    // 🟢 Firebase Functions exception: Node.js environment rules
    files: ['functions/**/*.js'],
    languageOptions: {
      globals: globals.node, // make Node APIs valid (process, require, etc.)
    },
    rules: {
      quotes: 'off',
      'require-jsdoc': 'off',
      'no-console': 'off', // allow console logs in backend
    },
  },
])
