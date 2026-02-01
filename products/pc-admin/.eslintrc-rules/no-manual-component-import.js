/**
 * ESLint 自定义规则：禁止手动导入 @btc/shared-components 中的组件
 *
 * 规则说明：
 * 1. 禁止手动导入 Vue 组件（这些组件已通过 unplugin-vue-components 自动注册）
 * 2. 允许导入工具函数/对象（如 BtcMessage, BtcConfirm 等）
 * 3. 允许使用 import type 导入类型定义
 *
 * 组件识别：
 * - 所有在 components.d.ts 的 GlobalComponents 接口中定义的组件
 * - 命名约定：以 Btc 开头且是 PascalCase 的通常是组件
 *
 * 工具函数白名单：
 * - BtcMessage, BtcConfirm, BtcAlert, BtcPrompt, BtcMessageBox
 * - registerEChartsThemes, CommonColumns
 * - useUpload, useUser, useCurrentApp, useFormRenderer 等 composables
 * - 其他工具函数和常量
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: '禁止手动导入 @btc/shared-components 中的组件，这些组件已通过自动导入机制注册',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noManualComponentImport: '禁止手动导入组件 "{{name}}"，该组件已通过 unplugin-vue-components 自动注册，可直接在模板中使用，无需导入',
      useTypeImport: '类型定义应使用 "import type" 语法导入',
    },
    schema: [
      {
        type: 'object',
        properties: {
          utilityFunctions: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: '允许导入的工具函数白名单',
            default: [],
          },
          allowedFiles: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: '允许手动导入的文件路径模式（支持 glob）',
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const utilityFunctions = options.utilityFunctions || [
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
    ];
    const allowedFiles = options.allowedFiles || [
      '**/main.ts',
      '**/main.js',
      '**/bootstrap/**',
      '**/router/**',
    ];

    /**
     * 检查文件是否在允许列表中
     */
    function isAllowedFile(filename) {
      if (!filename) return false;
      return allowedFiles.some(pattern => {
        // 简单的 glob 匹配（支持 ** 通配符）
        const regex = new RegExp(
          pattern
            .replace(/\*\*/g, '.*')
            .replace(/\*/g, '[^/]*')
            .replace(/\//g, '\\/')
        );
        return regex.test(filename);
      });
    }

    /**
     * 检查是否是工具函数
     */
    function isUtilityFunction(name) {
      return utilityFunctions.includes(name);
    }

    /**
     * 检查是否是组件（通过命名约定判断）
     * 组件通常以 Btc 开头且是 PascalCase
     */
    function isComponent(name) {
      // 排除已知的工具函数
      if (isUtilityFunction(name)) {
        return false;
      }

      // 组件命名约定：以 Btc 开头且是 PascalCase
      if (/^Btc[A-Z]/.test(name)) {
        return true;
      }

      // 其他可能的组件命名（如 AppLayout, ElButton 等）
      if (/^[A-Z][a-zA-Z0-9]*$/.test(name) && !name.startsWith('use') && !name.startsWith('get') && !name.startsWith('set')) {
        // 排除明显的工具函数命名
        if (name.includes('Plugin') || name.includes('Enum') || name.endsWith('Config')) {
          return false;
        }
        return true;
      }

      return false;
    }

    /**
     * 检查 ImportDeclaration 节点
     */
    function checkImportDeclaration(node) {
      // 只检查从 @btc/shared-components 的导入
      if (node.source.value !== '@btc/shared-components') {
        return;
      }

      const filename = context.getFilename();

      // 检查是否在允许的文件列表中
      if (isAllowedFile(filename)) {
        return;
      }

      // 检查是否是类型导入（允许）
      if (node.importKind === 'type') {
        // 类型导入应该使用 import type 语法
        if (!node.source.raw.includes("'@btc/shared-components'") || !node.source.raw.includes('type')) {
          // 检查是否有 type 关键字
          const sourceCode = context.getSourceCode();
          const text = sourceCode.getText(node);
          if (text.includes('import type')) {
            return; // 已经使用了 import type
          }
          // 如果导入的是类型，建议使用 import type
          const hasTypeOnly = node.specifiers.every(spec => {
            if (spec.type === 'ImportSpecifier' && spec.importKind === 'type') {
              return true;
            }
            return false;
          });
          if (hasTypeOnly) {
            context.report({
              node,
              messageId: 'useTypeImport',
            });
          }
        }
        return; // 类型导入允许
      }

      // 检查每个导入的标识符
      node.specifiers.forEach(spec => {
        if (spec.type === 'ImportSpecifier') {
          const importedName = spec.imported.name;
          const localName = spec.local.name;

          // 跳过类型导入
          if (spec.importKind === 'type') {
            return;
          }

          // 检查是否是组件
          if (isComponent(importedName)) {
            context.report({
              node: spec,
              messageId: 'noManualComponentImport',
              data: {
                name: importedName,
              },
            });
          }
        } else if (spec.type === 'ImportDefaultSpecifier') {
          // 默认导入（如 import BtcCrud from ...）
          const localName = spec.local.name;
          if (isComponent(localName)) {
            context.report({
              node: spec,
              messageId: 'noManualComponentImport',
              data: {
                name: localName,
              },
            });
          }
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          // 命名空间导入（如 import * as Components from ...）
          // 这种情况通常用于动态导入，暂时允许
        }
      });
    }

    return {
      ImportDeclaration: checkImportDeclaration,
    };
  },
};
