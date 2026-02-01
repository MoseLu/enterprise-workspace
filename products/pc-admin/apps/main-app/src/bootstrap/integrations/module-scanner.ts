/**
 * 模块自动扫描器
 * 参考 cool-admin-vue 的实现，自动扫描 modules 和 plugins 目录下的配置文件
 */
;

import type { App } from 'vue';
import type { Plugin } from '@btc/shared-core';

// 扫描 modules 和 plugins 目录下的 config.ts 文件
// 使用 '*' 导入所有导出，然后尝试获取 default 或第一个导出
const moduleFilesRaw = import.meta.glob('/src/{modules,plugins}/*/config.ts', {
  eager: true,
  import: '*'
});

// 处理模块文件，尝试获取 default 导出或第一个导出
const moduleFiles: Record<string, any> = {};
for (const [path, exports] of Object.entries(moduleFilesRaw)) {
  // 排除非插件配置文件（如 api-services/config.ts）
  if (path.includes('api-services/config.ts')) {
    continue;
  }
  
  if (typeof exports === 'object' && exports !== null) {
    // 优先使用 default 导出
    if ('default' in exports) {
      moduleFiles[path] = exports.default;
    } else {
      // 如果没有 default，尝试使用第一个导出
      const exportKeys = Object.keys(exports);
      if (exportKeys.length > 0) {
        // 如果文件没有 default 导出且不是插件配置，跳过它
        // 例如 api-services/config.ts 只是导出 API 配置，不是插件
        const firstExport = exports[exportKeys[0]];
        // 检查是否是有效的插件配置
        if (firstExport && typeof firstExport === 'object' && 'name' in firstExport) {
          moduleFiles[path] = firstExport;
        }
        // 否则跳过这个文件（不是插件配置）
      }
    }
  }
}

// 扫描 plugins 目录下的配置文件（支持多种命名）
const pluginFiles = import.meta.glob('/src/plugins/**/plugin.ts', {
  eager: true,
  import: 'default'
});

// 扫描 plugins 目录下的 index.ts 文件（支持命名导出）
// 使用 lazy: true 避免在模块加载时立即执行插件代码，从而避免循环依赖
const pluginIndexFiles = import.meta.glob('/src/plugins/*/index.ts', {
  eager: false,
  import: '*'
});

// 合并所有扫描到的文件
const allFiles = { ...moduleFiles, ...pluginFiles, ...pluginIndexFiles };

/**
 * 解析文件路径，提取模块信息
 */
function parseFilePath(filePath: string): { type: string; name: string; fileName: string } {
  const parts = filePath.split('/');
  const type = parts[2] || ''; // modules 或 plugins
  const name = parts[3] || ''; // 模块名
  const fileName = parts[parts.length - 1] || ''; // 文件名

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
  const result: any = {
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
    ...(config.toolbar ? {
      toolbar: {
        order: config.toolbar.order || 0,
        pc: config.toolbar.pc !== false,
        h5: config.toolbar.h5 !== false,
        component: config.toolbar.component
      }
    } : {}),

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

  // 明确处理可选属性的 undefined（exactOptionalPropertyTypes）
  if (config.layout) {
    result.layout = {
      position: config.layout.position || 'global',
      order: config.layout.order || 0,
      component: config.layout.component
    };
  }

  return result as Plugin;
}

/**
 * 自动扫描并注册所有插件
 */
export async function scanAndRegisterPlugins(app: App): Promise<Plugin[]> {
  const plugins: Plugin[] = [];
  const processedModules = new Set<string>();

  // 处理所有文件（包括懒加载的插件文件）
  // 使用 Set 记录已处理的插件名称，避免重复注册
  const processedPluginNames = new Set<string>();
  
  for (const [filePath, moduleConfigOrLoader] of Object.entries(allFiles)) {
    try {
      const { type, name, fileName } = parseFilePath(filePath);
      const moduleKey = `${type}/${name}`;

      // 避免重复处理同一模块
      if (processedModules.has(moduleKey)) {
        continue;
      }

      // 如果模块配置是函数（懒加载），需要先调用它
      let moduleConfig: any;
      if (typeof moduleConfigOrLoader === 'function') {
        moduleConfig = await moduleConfigOrLoader();
      } else {
        moduleConfig = moduleConfigOrLoader;
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
          console.warn(`[ModuleScanner] 跳过无效插件: ${filePath} (缺少 name 属性)`);
          continue;
        }

        // 检查插件是否已经注册过（避免重复注册）
        if (processedPluginNames.has(pluginConfig.name)) {
          console.warn(`[ModuleScanner] 跳过重复插件: ${pluginConfig.name} (已在 ${filePath} 中注册)`);
          continue;
        }

        plugins.push(pluginConfig);
        processedPluginNames.add(pluginConfig.name);
        processedModules.add(moduleKey);
      }

    } catch (error) {
      logger.error(`[ModuleScanner] 解析插件失败: ${filePath}`, error);
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
