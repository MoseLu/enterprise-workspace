/**
 * 模块自动扫描器
 * 参考 cool-admin-vue 的实现，自动扫描 modules 和 plugins 目录下的配置文件
 */
;

import type { App } from 'vue';
import type { Plugin } from '@btc/shared-core';
import { useI18n, logger } from '@btc/shared-core';

// 扫描 modules 和 plugins 目录下的 config.ts 文件
const moduleFiles = import.meta.glob('/src/{modules,plugins}/*/config.ts', {
  eager: true,
  import: 'default'
});

// 扫描 plugins 目录下的配置文件（支持多种命名）
const pluginFiles = import.meta.glob('/src/plugins/**/plugin.ts', {
  eager: true,
  import: 'default'
});

// 扫描 plugins 目录下的 index.ts 文件（支持命名导出）
const pluginIndexFiles = import.meta.glob('/src/plugins/*/index.ts', {
  eager: true,
  import: '*'
});

// 合并所有扫描到的文件
const allFiles = { ...moduleFiles, ...pluginFiles, ...pluginIndexFiles };

/**
 * 解析文件路径，提取模块信息
 */
function parseFilePath(filePath: string): { type: string; name: string; fileName: string } {
  const parts = filePath.split('/');
  const type = parts[2]; // modules 或 plugins
  const name = parts[3]; // 模块名
  const fileName = parts[parts.length - 1]; // 文件名

  return { type, name, fileName };
}

/**
 * 检查配置是否为有效的插件配置
 */
function isValidPluginConfig(config: any): config is Plugin {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.name === 'string' &&
    (config.install || config.components || config.directives || config.toolbar || config.layout)
  );
}

/**
 * 转换 cool-admin-vue 风格的配置为 Plugin 格式
 */
function convertToPluginConfig(config: any, name: string): Plugin {
  return {
    name: config.name || name,
    version: config.version || '1.0.0',
    description: config.description || config.label,
    author: config.author || 'BTC Team',
    order: config.order || 0,
    enable: config.enable !== false,

    // 转换组件配置
    components: config.components || [],

    // 转换指令配置
    directives: config.directives || {},

    // 转换路由配置
    views: config.views || [],
    pages: config.pages || [],

    // 转换工具栏配置
    toolbar: config.toolbar ? {
      order: config.toolbar.order || 0,
      pc: config.toolbar.pc !== false,
      h5: config.toolbar.h5 !== false,
      component: config.toolbar.component
    } : undefined,

    // 转换布局配置
    layout: config.layout ? {
      position: config.layout.position || 'global',
      order: config.layout.order || 0,
      component: config.layout.component
    } : undefined,

    // 转换安装钩子
    install: config.install,

    // 转换卸载钩子
    uninstall: config.uninstall,

    // 转换加载完成钩子
    onLoad: config.onLoad,

    // 转换 API 配置
    api: config.api,

    // 其他配置
    dependencies: config.dependencies || [],
    options: config.options || {}
  };
}

/**
 * 自动扫描并注册所有插件
 */
export async function scanAndRegisterPlugins(app: App): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  const processedModules = new Set<string>();


  for (const [filePath, moduleConfig] of Object.entries(allFiles)) {
    try {
      const { type, name, fileName } = parseFilePath(filePath);
      const moduleKey = `${type}/${name}`;

      // 避免重复处理同一模块
      if (processedModules.has(moduleKey)) {
        continue;
      }


      let pluginConfigs: Plugin[] = [];

      // 处理 index.ts 文件的命名导出
      if (fileName === 'index.ts' && typeof moduleConfig === 'object') {
        // 查找所有以 Plugin 结尾的导出
        for (const [exportName, exportValue] of Object.entries(moduleConfig || {})) {
          if (exportName.endsWith('Plugin') && isValidPluginConfig(exportValue)) {
            pluginConfigs.push(exportValue as Plugin);
          }
        }
      } else {
        // 处理其他情况（默认导出）
        let pluginConfig: Plugin;

        // 检查是否已经是 Plugin 格式
        if (isValidPluginConfig(moduleConfig)) {
          pluginConfig = moduleConfig;
        } else {
          // 尝试调用配置函数（cool-admin-vue 风格）
          const configResult = typeof moduleConfig === 'function'
            ? moduleConfig(app)
            : moduleConfig;

          if (isValidPluginConfig(configResult)) {
            pluginConfig = configResult;
          } else {
            // 转换为 Plugin 格式
            pluginConfig = convertToPluginConfig(configResult, name);
          }
        }
        pluginConfigs = [pluginConfig];
      }

      // 处理所有找到的插件配置
      for (const pluginConfig of pluginConfigs) {
        // 验证插件配置
        if (!pluginConfig.name) {
          const { t } = useI18n();
          console.warn(`[ModuleScanner] ${t('common.plugin.skip_invalid')}: ${filePath} (${t('common.plugin.missing_name')})`);
          continue;
        }

        plugins.push(pluginConfig);
        processedModules.add(moduleKey);

      }

    } catch (error) {
      const { t } = useI18n();
      logger.error(`[ModuleScanner] ${t('common.plugin.parse_failed')}: ${filePath}`, error);
    }
  }

  // 按 order 排序（数字越大优先级越高）
  plugins.sort((a, b) => (b.order || 0) - (a.order || 0));


  return plugins;
}

/**
 * 获取扫描统计信息
 */
export function getScanStats() {
  const stats = {
    totalFiles: Object.keys(allFiles).length,
    moduleFiles: Object.keys(moduleFiles).length,
    pluginFiles: Object.keys(pluginFiles).length,
    pluginIndexFiles: Object.keys(pluginIndexFiles).length
  };

  return stats;
}
