module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: [
    'plugin:jest/recommended',
    'eslint:recommended',
    'plugin:vue/recommended',
    'prettier/vue',
    'plugin:prettier/recommended',
  ],
  plugins: ['vue', 'jest'],
  // add your custom rules here
  rules: {
    'no-console': ['warn'],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'require-atomic-updates': 'off',
  },
}
