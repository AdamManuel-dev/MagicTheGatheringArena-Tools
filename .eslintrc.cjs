/**
 * ESLint configuration for MTG Arena collection scripts
 */
module.exports = {
  root: true,
  ignorePatterns: ['dist', 'node_modules'],
  env: {
    node: true,
    es2022: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/stylistic',
    'eslint-config-prettier',
  ],
  rules: {
    'no-underscore-dangle': 'off',
    'no-console': 'off',
    'prefer-const': ['error', {destructuring: 'all'}],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/explicit-member-accessibility': ['error', {accessibility: 'no-public'}],
    '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
    '@typescript-eslint/array-type': ['error', {default: 'generic'}],
    '@typescript-eslint/no-explicit-any': ['error', {ignoreRestArgs: true}],
  },
  overrides: [
    {
      files: ['test/**/*.{js,ts}'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
      },
    },
  ],
};
