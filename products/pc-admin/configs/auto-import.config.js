var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
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
/**
 * 创建 Components 自动导入配置
 * @param options 配置选项
 */
export function createComponentsConfig(options) {
    if (options === void 0) { options = {}; }
    var _a = options.extraDirs, extraDirs = _a === void 0 ? [] : _a, _b = options.includeShared, includeShared = _b === void 0 ? true : _b;
    var dirs = __spreadArray([
        'src/components'
    ], extraDirs, true);
    // 如果包含共享组件，添加共享组件分组目录
    if (includeShared) {
        // 添加分组目录，支持自动导入
        dirs.push('../../packages/shared-components/src/components/basic', '../../packages/shared-components/src/components/layout', '../../packages/shared-components/src/components/navigation', '../../packages/shared-components/src/components/form', '../../packages/shared-components/src/components/data', '../../packages/shared-components/src/components/feedback', '../../packages/shared-components/src/components/others');
    }
    return Components({
        resolvers: [
            ElementPlusResolver({
                importStyle: false, // 禁用按需样式导入，避免 Vite reloading
            }),
            // 自定义解析器：@btc/shared-components
            function (componentName) {
                if (componentName.startsWith('Btc') || componentName.startsWith('btc-')) {
                    return {
                        name: componentName,
                        from: '@btc/shared-components',
                    };
                }
            },
        ],
        dts: 'src/components.d.ts',
        dirs: dirs,
        extensions: ['vue', 'tsx'], // 支持 .vue 和 .tsx 文件
        // 强制重新扫描组件
        deep: true,
        // 包含所有 Btc 开头的组件
        include: [/\.vue$/, /\.tsx$/, /Btc[A-Z]/, /btc-[a-z]/],
    });
}
// UTF-8 encoding fix
