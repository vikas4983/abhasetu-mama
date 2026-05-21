module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist', 'storybook-static', 'node_modules'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
  }
};
