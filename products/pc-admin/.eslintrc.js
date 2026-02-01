module.exports = {
  root: true,
  ignorePatterns: [
    'dist/**',
    '**/dist/**',
    'node_modules/**',
    '**/node_modules/**',
    '*.d.ts',
    '**/*.d.ts',
    'coverage/**',
    '**/coverage/**',
    'build/**',
    '**/build/**',
    // 忽略国际化文件本身（避免检查 JSON 文件中的 key）
    '**/locales/**/*.json',
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'i18n',
  ],
  rules: (() => {
    const customRules = require('./.eslintrc-rules');
    const rules = {
      '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-unused-vars': 'off',
    // 日志规范：禁止使用 console，强制使用统一的 logger
    // 允许 console.warn 和 console.error 用于紧急错误（向后兼容）
    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'], // 仅允许 console.warn 和 console.error 用于紧急错误
      },
    ],
    // 国际化规范检查
    // 1. 禁止硬编码中文文本（核心规则）
    // 注意：eslint-plugin-i18n v2.4.0 的配置选项已变更，使用默认配置
    // 允许在 console.log/console.warn/console.error 中使用中文（用于调试日志）
    'i18n/no-chinese-character': [
      'error',
      {
        ignorePatterns: [
          /console\.(log|warn|error|info|debug)\([^)]*[\u4e00-\u9fa5][^)]*\)/,
        ],
      },
    ],
    // 2. 强制国际化 key 使用 snake_case 格式，且符合层级结构（自定义规则）
    // 注意：由于 ESLint 插件注册限制，此规则暂时通过自定义脚本检查
    // 可以使用 scripts/check-i18n-keys.js 进行手动检查
    // 重构 import/no-restricted-paths 规则
    // 规则1：禁止 应用(apps) 导入 包(packages) 的源码
    // 规则2：禁止 包A 的源码 导入 包B 的源码（跨包源码导入）
    // 例外：允许导入样式文件和语言文件（.scss, .css, locales）
    // 例外：允许通过包名导入（@btc/shared-core, @btc/shared-components 等），这些是合法的包导出
    // 注意：except 匹配的是导入路径（可能包含别名），需要匹配实际文件路径模式
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './apps/**',
            from: './packages/**/src/**',
            except: [
              './packages/**/src/**/*.scss',
              './packages/**/src/**/*.css',
              './packages/**/src/**/locales/**',
              './packages/**/src/**/styles/**',
              './packages/shared-core/src/**/locales/**',
              './packages/shared-components/src/locales/**',
              './packages/shared-components/src/styles/**',
              // 允许通过包导出路径导入（这些是合法的包导出，在 package.json exports 中定义）
              './packages/shared-core/src/index.ts',
              './packages/shared-core/src/manifest/index.ts',
              './packages/shared-core/src/env/index.ts',
              './packages/shared-core/src/utils/**',
              './packages/shared-components/src/index.ts',
            ],
          },
          {
            target: './packages/*/src/**',
            from: '../*/src/**',
          },
        ],
      },
    ],
    'import/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],
    'import/no-self-import': 'error',
      {
        utilityFunctions: [
          // 消息和确认框工具
          'BtcMessage',
          'BtcConfirm',
          'BtcAlert',
          'BtcPrompt',
          'BtcMessageBox',
          // 图表相关
          'registerEChartsThemes',
          // 工具对象和常量
          'CommonColumns',
          'DEFAULT_OPERATION_WIDTH',
          'IMPORT_FILENAME_KEY',
          'IMPORT_FORBIDDEN_KEYWORDS_KEY',
          // Composables
          'useUpload',
          'useUser',
          'useCurrentApp',
          'useFormRenderer',
          'useBrowser',
          'useContentHeight',
          'provideContentHeight',
          'useGlobalBreakpoints',
          'initGlobalBreakpoints',
          'useProcessStore',
          'getCurrentAppFromPath',
          // 菜单相关
          'registerMenus',
          'clearMenus',
          'clearMenusExcept',
          'getMenusForApp',
          'getMenuRegistry',
          // 工具函数
          'addClass',
          'removeClass',
          'mountDevTools',
          'unmountDevTools',
          'autoMountDevTools',
          'setIsMainAppFn',
          'getIsMainAppFn',
          // 事件系统
          'mitt',
          'globalMitt',
          // 插件
          'ExcelPlugin',
          'CodePlugin',
          'BtcExportBtn',
          'BtcImportBtn',
          'BtcCodeJson',
          // 语言包
          'sharedLocalesZhCN',
          'sharedLocalesEnUS',
        ],
        allowedFiles: [
          '**/main.ts',
          '**/main.js',
          '**/bootstrap/**',
          '**/router/**',
        ],
      },
    ],
    // 禁止直接使用存储 API，必须使用统一工具
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[object.name="localStorage"][property.name=/^(getItem|setItem|removeItem|clear)$/]',
        message: '禁止直接使用 localStorage API，请使用统一的 storage 工具：import { storage } from "@btc/shared-utils"',
      },
      {
        selector: 'MemberExpression[object.name="sessionStorage"][property.name=/^(getItem|setItem|removeItem|clear)$/]',
        message: '禁止直接使用 sessionStorage API，请使用统一的 sessionStorage 工具：import { sessionStorage } from "@btc/shared-core/utils/storage/session"',
      },
      {
        selector: 'AssignmentExpression[left.object.name="document"][left.property.name="cookie"]',
        message: '禁止直接使用 document.cookie，请使用统一的 cookie 工具：import { setCookie, deleteCookie } from "@btc/shared-core/utils/cookie"',
      },
      {
        selector: 'MemberExpression[object.object.name="document"][object.property.name="cookie"]',
        message: '禁止直接使用 document.cookie，请使用统一的 cookie 工具：import { getCookie } from "@btc/shared-core/utils/cookie"',
      },
    ];

    // 添加自定义规则（使用 'off' 作为占位符，实际规则在插件中定义）
    // 注意：这些规则需要通过插件系统注册，这里只是占位
    // 实际使用需要通过 eslint-plugin-custom 插件
    Object.keys(customRules.rules).forEach(ruleName => {
      rules[ruleName] = 'off'; // 暂时关闭，等待插件系统配置
    });

    return rules;
  })(),
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      // 补充：让 import 解析识别 monorepo 包路径（避免误判）
      node: {
        paths: ['./packages'],
        extensions: ['.ts', '.js', '.mjs'],
      },
    },
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        // Vue 模板中也需要检查国际化规范
        'i18n/no-chinese-character': 'error',
      },
    },
    // 允许应用导入包的样式和语言文件（通过禁用规则实现）
    {
      files: [
        'apps/**/src/**/bootstrap/**/*.{ts,tsx}',
        'apps/**/src/**/i18n/**/*.{ts,tsx}',
        'apps/**/src/main.{ts,tsx}',
        'apps/**/src/**/bootstrap/**/ui.{ts,tsx}',
      ],
      rules: {
        'import/no-restricted-paths': 'off',
      },
    },
    // 允许 locales/config.ts 中的中文字符串（这些是国际化文本本身）
    {
      files: ['apps/**/src/locales/config.ts'],
      rules: {
        'i18n/no-chinese-character': 'off',
      },
    },
    // 允许存储工具库内部直接使用原生 API
    {
      files: ['packages/shared-core/src/utils/storage/**/*.{ts,js}', 'packages/shared-core/src/utils/cookie/**/*.{ts,js}', 'packages/shared-core/src/utils/cross-domain/**/*.{ts,js}'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    // 允许 logger 模块内部使用 console（用于传输错误等）
    {
      files: ['packages/shared-core/src/utils/logger/**/*.{ts,js}'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
};
