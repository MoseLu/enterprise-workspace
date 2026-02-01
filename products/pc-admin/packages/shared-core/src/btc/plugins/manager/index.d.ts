import type { App } from 'vue';
import type { Plugin, PluginOptions, PluginManagerOptions, PluginRecord, PluginLifecycleEvents, ToolbarConfig, LayoutConfig } from './types';
import { PluginStatus } from './types';
/**
 * 插件管理器（增强版）
 * 支持组件、指令、路由的自动注册
 * 支持 toolbar、layout 的管理
 * 支持生命周期钩子
 */
export declare class PluginManager {
    private plugins;
    private app;
    private router;
    private options;
    private lifecycleEvents;
    private toolbarComponents;
    private layoutComponents;
    constructor(options?: PluginManagerOptions);
    /**
     * 设置 Vue 应用实例
     */
    setApp(app: App): void;
    /**
     * 设置 Vue Router 实例
     */
    setRouter(router: any): void;
    /**
     * 注册插件
     * @param plugin 插件对象
     * @returns 插件管理器实例（支持链式调用）
     */
    register<T = any>(plugin: Plugin<T>): this;
    /**
     * 安装插件（增强版）
     * @param name 插件名称
     * @param options 插件配置选项
     */
    install(name: string, options?: PluginOptions): Promise<void>;
    /**
     * 注册组件
     */
    private registerComponents;
    /**
     * 注册指令
     */
    private registerDirectives;
    /**
     * 注册路由
     */
    private registerRoutes;
    /**
     * 从组件加载器中提取组件名称
     */
    private extractComponentName;
    /**
     * 卸载插件
     * @param name 插件名称
     */
    uninstall(name: string): Promise<void>;
    /**
     * 获取插件
     * @param name 插件名称
     * @returns 插件对象
     */
    get<T = any>(name: string): Plugin<T> | undefined;
    /**
     * 获取插件 API
     * @param name 插件名称
     * @returns 插件 API 对象
     */
    getApi<T = any>(name: string): T | undefined;
    /**
     * 检查插件是否存在
     * @param name 插件名称
     * @returns 是否存在
     */
    has(name: string): boolean;
    /**
     * 检查插件是否已安装
     * @param name 插件名称
     * @returns 是否已安装
     */
    isInstalled(name: string): boolean;
    /**
     * 获取所有插件名称
     * @returns 插件名称数组
     */
    list(): string[];
    /**
     * 获取所有已安装的插件
     * @returns 已安装插件名称数组
     */
    listInstalled(): string[];
    /**
     * 获取插件状态
     * @param name 插件名称
     * @returns 插件状态
     */
    getStatus(name: string): PluginStatus | undefined;
    /**
     * 获取插件记录（包含状态和元数据）
     * @param name 插件名称
     * @returns 插件记录
     */
    getRecord<T = any>(name: string): PluginRecord<T> | undefined;
    /**
     * 批量安装插件（支持按 order 排序）
     * @param names 插件名称数组
     * @param options 通用配置选项
     */
    installAll(names: string[], options?: PluginOptions): Promise<void>;
    /**
     * 获取所有工具栏组件（按 order 排序）
     */
    getToolbarComponents(): ToolbarConfig[];
    /**
     * 获取指定位置的布局组件（按 order 排序）
     */
    getLayoutComponents(position?: 'header' | 'sidebar' | 'footer' | 'global'): LayoutConfig[];
    /**
     * 获取插件的 qiankun 配置
     */
    getQiankunConfig(name: string): import("./types").QiankunConfig | undefined;
    /**
     * 获取所有共享给子应用的插件
     */
    getSharedPlugins(): Plugin[];
    /**
     * 获取生命周期事件（供其他插件使用）
     */
    getLifecycleEvents(): PluginLifecycleEvents;
    /**
     * 获取插件配置参数
     */
    getPluginOptions(name: string): PluginOptions | undefined;
    /**
     * 移除插件（从管理器中删除）
     * @param name 插件名称
     */
    remove(name: string): Promise<void>;
    /**
     * 清空所有插件
     */
    clear(): void;
    /**
     * 获取插件元数据
     * @param name 插件名称
     * @returns 插件元数据
     */
    getPluginMetadata(name: string): import("./types").PluginMetadata | undefined;
    /**
     * 按作者筛选插件
     * @param author 作者名称
     * @returns 插件名称数组
     */
    getPluginsByAuthor(author: string): string[];
    /**
     * 按版本筛选插件
     * @param version 版本号（支持通配符）
     * @returns 插件名称数组
     */
    getPluginsByVersion(version: string): string[];
    /**
     * 按分类筛选插件
     * @param category 分类名称
     * @returns 插件名称数组
     */
    getPluginsByCategory(category: string): string[];
    /**
     * 获取推荐插件
     * @returns 插件名称数组
     */
    getRecommendedPlugins(): string[];
    /**
     * 搜索插件
     * @param query 搜索关键词
     * @returns 插件名称数组
     */
    searchPlugins(query: string): string[];
    /**
     * 获取所有插件的详细信息
     * @returns 插件详细信息数组
     */
    getPluginsInfo(): {
        name: string;
        config: import("./types").PluginMetadata | undefined;
        version: string | undefined;
        author: string | undefined;
        description: string | undefined;
        status: PluginStatus | undefined;
        installedAt: Date | undefined;
        error: Error | undefined;
        hasApi: boolean;
        hasComponents: boolean;
        hasDirectives: boolean;
        hasToolbar: boolean;
        hasLayout: boolean;
    }[];
    /**
     * 输出插件统计信息（仅在 debug 模式下）
     */
    logPluginStats(): void;
}
export * from './types';
export * from './resource-loader';
export * from './config-helper';
/**
 * 获取插件管理器实例（单例模式）
 */
export declare function usePluginManager(options?: PluginManagerOptions): PluginManager;
/**
 * 重置插件管理器（主要用于测试）
 */
export declare function resetPluginManager(): void;
//# sourceMappingURL=index.d.ts.map