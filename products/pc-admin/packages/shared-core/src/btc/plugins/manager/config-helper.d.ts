import type { PluginMetadata } from './types';
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
export declare function definePluginConfig(metadata: PluginMetadata): PluginMetadata;
/**
 * 合并插件配置
 * 将用户配置与默认配置合并
 *
 * @param userConfig 用户配置
 * @param defaultConfig 默认配置
 * @returns 合并后的配置
 */
export declare function mergePluginConfig<T extends Record<string, any>>(userConfig: T, defaultConfig: T): T;
/**
 * 创建插件配置模板
 * 用于快速生成插件配置
 *
 * @param pluginName 插件名称
 * @returns 插件配置模板
 */
export declare function createPluginConfigTemplate(pluginName: string): PluginMetadata;
/**
 * 验证插件配置
 * 检查配置的完整性和有效性
 *
 * @param metadata 插件元数据
 * @returns 验证结果
 */
export declare function validatePluginConfig(metadata: PluginMetadata): {
    valid: boolean;
    errors: string[];
};
/**
 * 格式化插件信息
 * 将插件配置格式化为可读的字符串
 *
 * @param metadata 插件元数据
 * @returns 格式化的插件信息
 */
export declare function formatPluginInfo(metadata: PluginMetadata): string;
//# sourceMappingURL=config-helper.d.ts.map