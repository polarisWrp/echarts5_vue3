module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/multi-word-component-names': 'off',
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        tabWidth: 2,
        semi: true,
        singleQuote: true,
        endOfLine: 'auto',
        trailingComma: 'all',
        arrowParens: 'always',
        proseWrap: 'preserve',
        htmlWhitespaceSensitivity: 'ignore',
      },
    ],
  },
};
