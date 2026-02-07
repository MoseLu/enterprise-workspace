/**
 * 插件系统集成模块
 * 负责自动发现和注册插件
 */
import type { App } from 'vue';
import { usePluginManager } from '@btc/shared-core';
export declare let globalPluginManager: ReturnType<typeof usePluginManager>;
/**
 * 自动发现并注册插件
 * 类似 Cool-Admin 的模块发现机制
 */
export declare function autoDiscoverPlugins(app: App): Promise<any>;
