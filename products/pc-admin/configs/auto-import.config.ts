/**
 * 自动导入配置模板
 * 供所有应用（admin-app, logistics-app 等）使用
 */
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

/**
 * 创建 Auto Import 配置
 */
export function createAutoImportConfig() {
  return AutoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      {
        '@btc/shared-core': [
          'useCrud',
          'useDict',
          'usePermission',
          'useRequest',
          'createI18nPlugin',
          'useI18n',
        ],
        '@btc/shared-utils': [
          'formatDate',
          'formatDateTime',
          'formatMoney',
          'formatNumber',
          'isEmail',
          'isPhone',
          'storage',
        ],
      },
    ],

    resolvers: [
      ElementPlusResolver({
        importStyle: false, // 禁用按需样式导入
      }),
    ],

    dts: 'src/auto-imports.d.ts',

    eslintrc: {
      enabled: true,
      filepath: './.eslintrc-auto-import.json',
    },

    vueTemplate: true,
  });
}

export interface ComponentsConfigOptions {
  /**
   * 额外的组件目录（用于域级组件）
   */
  extraDirs?: string[];
  /**
   * 是否导入共享组件库
   */
  includeShared?: boolean;
}

/**
 * 创建 Components 自动导入配置
 * @param options 配置选项
 */
export function createComponentsConfig(options: ComponentsConfigOptions = {}) {
  const { extraDirs = [], includeShared = true } = options;

  const dirs = [
    'src/components', // 应用级组件
    ...extraDirs, // 额外的域级组件目录
  ];

  // 如果包含共享组件，添加共享组件分组目录
  if (includeShared) {
    // 添加分组目录，支持自动导入
    dirs.push(
      '../../packages/shared-components/src/components/basic',
      '../../packages/shared-components/src/components/layout',
      '../../packages/shared-components/src/components/navigation',
      '../../packages/shared-components/src/components/form',
      '../../packages/shared-components/src/components/data',
      '../../packages/shared-components/src/components/feedback',
      '../../packages/shared-components/src/components/others'
    );
  }

  return Components({
    resolvers: [
      ElementPlusResolver({
        importStyle: false, // 禁用按需样式导入，避免 Vite reloading
      }),
      // 自定义解析器：@btc/shared-components
      (componentName) => {
        // 将 kebab-case 转换为 PascalCase
        // 例如: btc-svg -> BtcSvg
        const convertToPascalCase = (name: string): string => {
          if (name.startsWith('Btc')) {
            return name; // 已经是 PascalCase
          }
          if (name.startsWith('btc-')) {
            // btc-svg -> BtcSvg
            return name
              .split('-')
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join('');
          }
          return name;
        };

        if (componentName.startsWith('Btc') || componentName.startsWith('btc-')) {
          const pascalName = convertToPascalCase(componentName);
          return {
            name: pascalName,
            from: '@btc/shared-components',
          };
        }
      },
    ],
    dts: 'src/components.d.ts',
    dirs,
    extensions: ['vue', 'tsx'], // 支持 .vue 和 .tsx 文件
    // 强制重新扫描组件
    deep: true,
    // 包含所有 Btc 开头的组件
    include: [/\.vue$/, /\.tsx$/, /Btc[A-Z]/, /btc-[a-z]/],
  });
}
// UTF-8 encoding fix
