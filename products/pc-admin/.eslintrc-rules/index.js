/**
 * ESLint 自定义规则插件
 * 用于注册自定义的国际化规范检查规则
 */

const i18nKeyFormat = require('./i18n-key-format');
const noDirectStorage = require('./no-direct-storage');
const noManualComponentImport = require('./no-manual-component-import');

module.exports = {
  meta: {
    name: 'eslint-plugin-custom',
    version: '1.0.0',
  },
  rules: {
    'i18n-key-format': i18nKeyFormat,
    'no-direct-storage': noDirectStorage,
    'no-manual-component-import': noManualComponentImport,
  },
};
