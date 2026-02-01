/**
 * 模块自动扫描器
 * 参考 cool-admin-vue 的实现，自动扫描 modules 和 plugins 目录下的配置文件
 */
import type { App } from 'vue';
import type { Plugin } from '@btc/shared-core';
/**
 * 自动扫描并注册所有插件
 */
export declare function scanAndRegisterPlugins(app: App): Promise<Plugin[]>;
/**
 * 获取扫描统计信息
 */
export declare function getScanStats(): {
    totalFiles: number;
    moduleFiles: number;
    pluginFiles: number;
    pluginIndexFiles: number;
};
