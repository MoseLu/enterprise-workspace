import type { PluginMetadata } from './types';

/**
 * 默认插件元数据配置
 */
const DEFAULT_PLUGIN_METADATA: Partial<PluginMetadata> = {
  category: 'general',
  tags: [],
  recommended: false,
};

/**
 * 定义插件配置的辅助函数
 * 提供类型提示和默认值
 *
 * @param metadata 插件元数据配置
 * @returns 标准化的插件元数据
 *
 * @example
 * ```typescript
 * const config = definePluginConfig({
 *   label: 'GitHub 集成',
 *   description: '提供 GitHub 代码展示功能',
 *   author: 'BTC Team',
 *   version: '1.0.0',
 *   updateTime: '2024-01-15',
 *   demo: ['/demo/github'],
 *   category: 'integration',
 *   tags: ['github', 'code', 'markdown'],
 *   recommended: true
 * });
 * ```
 */
export function definePluginConfig(metadata: PluginMetadata): PluginMetadata {
  return {
    ...DEFAULT_PLUGIN_METADATA,
    ...metadata,
    tags: [...(DEFAULT_PLUGIN_METADATA.tags || []), ...(metadata.tags || [])],
  };
}

/**
 * 合并插件配置
 * 将用户配置与默认配置合并
 *
 * @param userConfig 用户配置
 * @param defaultConfig 默认配置
 * @returns 合并后的配置
 */
export function mergePluginConfig<T extends Record<string, any>>(
  userConfig: T,
  defaultConfig: T
): T {
  return {
    ...defaultConfig,
    ...userConfig,
  };
}

/**
 * 创建插件配置模板
 * 用于快速生成插件配置
 *
 * @param pluginName 插件名称
 * @returns 插件配置模板
 */
export function createPluginConfigTemplate(pluginName: string): PluginMetadata {
  const updateTime = new Date().toISOString().split('T')[0];
  const config: PluginMetadata = {
    label: pluginName,
    description: `${pluginName} 插件`,
    author: 'BTC Team',
    version: '1.0.0',
    category: 'custom',
    tags: [pluginName.toLowerCase()],
  };
  if (updateTime) {
    config.updateTime = updateTime;
  }
  return definePluginConfig(config);
}

/**
 * 验证插件配置
 * 检查配置的完整性和有效性
 *
 * @param metadata 插件元数据
 * @returns 验证结果
 */
export function validatePluginConfig(metadata: PluginMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 必需字段检查
  if (!metadata.label) {
    errors.push('label 字段是必需的');
  }

  if (!metadata.version) {
    errors.push('version 字段是必需的');
  }

  // 版本号格式检查
  if (metadata.version && !/^\d+\.\d+\.\d+/.test(metadata.version)) {
    errors.push('version 格式不正确，应为 x.y.z 格式');
  }

  // 日期格式检查
  if (metadata.updateTime && !/^\d{4}-\d{2}-\d{2}/.test(metadata.updateTime)) {
    errors.push('updateTime 格式不正确，应为 YYYY-MM-DD 格式');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 格式化插件信息
 * 将插件配置格式化为可读的字符串
 *
 * @param metadata 插件元数据
 * @returns 格式化的插件信息
 */
export function formatPluginInfo(metadata: PluginMetadata): string {
  const lines: string[] = [];

  lines.push(`📦 ${metadata.label || 'Unknown Plugin'}`);
  lines.push(`   版本: ${metadata.version || 'unknown'}`);

  if (metadata.author) {
    lines.push(`   作者: ${metadata.author}`);
  }

  if (metadata.updateTime) {
    lines.push(`   更新: ${metadata.updateTime}`);
  }

  if (metadata.description) {
    lines.push(`   描述: ${metadata.description}`);
  }

  if (metadata.category) {
    lines.push(`   分类: ${metadata.category}`);
  }

  if (metadata.tags && metadata.tags.length > 0) {
    lines.push(`   标签: ${metadata.tags.join(', ')}`);
  }

  if (metadata.recommended) {
    lines.push(`   ⭐ 推荐使用`);
  }

  return lines.join('\n');
}
