import type { Plugin } from '@btc/shared-core';
import { tSync } from '../i18n/getters';

/**
 * 扫描 system-app 中定义的工具栏插件
 * 只需关心插件目录（@system/plugins），无需解析模块信息
 */

const pluginModules = import.meta.glob('@system/plugins/**/index.ts', {
  eager: true,
  import: '*'
});

function isValidPluginConfig(config: any): config is Plugin {
  return (
    config &&
    typeof config === 'object' &&
    typeof config.name === 'string' &&
    (config.install || config.components || config.directives || config.toolbar || config.layout)
  );
}

export async function discoverSystemPlugins(): Promise<Plugin[]> {
  const plugins: Plugin[] = [];

  for (const [filePath, moduleExports] of Object.entries(pluginModules)) {
    try {
      const mod = moduleExports as Record<string, any>;
      for (const exportValue of Object.values(mod)) {
        if (isValidPluginConfig(exportValue)) {
          plugins.push(exportValue as Plugin);
        }
      }
    } catch (error) {
      logger.error(`[layout-app] ${tSync('common.error.plugin_parse_failed')}:`, filePath, error);
    }
  }

  plugins.sort((a, b) => (b.order || 0) - (a.order || 0));
  return plugins;
}

