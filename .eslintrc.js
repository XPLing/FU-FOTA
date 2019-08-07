// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  globals: {
    'moxie': true,
    'QiniuJsSDK': true,
    'plupload': true,
    'Qiniu': true,
    '_': true
  },
  env: {
    browser: true,
  },
  extends: [
    // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
    'plugin:vue/essential',
    // https://github.com/standard/standard/blob/master/docs/RULES-en.md
    'standard'
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': 0,
    'indent': 0,
    'space-before-function-paren': 0,
    'space-before-blocks': 0,
    'no-multiple-empty-lines': 0,
    'quotes': 0,
    'eol-last': 0,
    'padded-blocks': 0,
    'no-trailing-spaces': 0,
    'no-unused-vars': 0,
    'eqeqeq': 0,
    'one-var': 0,
    // 禁止在计算属性中对属性修改
    'vue/no-side-effects-in-computed-properties': 'off',
    'prefer-promise-reject-errors': 'off',
    'handle-callback-err': 'off',
    'camelcase': 'off',
    'vue/require-prop-type-constructor': 'off',
    'no-irregular-whitespace': 'off'
  }
};
