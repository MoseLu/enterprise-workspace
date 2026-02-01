/**
 * 插件资源加载器
 * 用于加载插件的静态资源（SVG、图片等）
 * 每个插件有独立的资源目录，避免冲突
 */
/**
 * SVG 资源配置
 */
export interface SvgResource {
    /**
     * SVG 名称（文件名）
     */
    name: string;
    /**
     * SVG 内容或路径
     */
    content: string;
    /**
     * 所属插件
     */
    plugin: string;
}
/**
 * 资源加载器
 */
export declare class ResourceLoader {
    private svgCache;
    /**
     * 注册 SVG 资源
     * @param pluginName 插件名称
     * @param svgModules import.meta.glob 返回的模块对象
     */
    registerSvgFromGlob(pluginName: string, svgModules: Record<string, () => Promise<any>>): Promise<void>;
    /**
     * 手动注册单个 SVG
     */
    registerSvg(pluginName: string, name: string, content: string): void;
    /**
     * 获取 SVG 资源
     * @param pluginName 插件名称
     * @param name SVG 名称
     */
    getSvg(pluginName: string, name: string): SvgResource | undefined;
    /**
     * 获取插件的所有 SVG
     */
    getPluginSvgs(pluginName: string): SvgResource[];
    /**
     * 获取所有 SVG
     */
    getAllSvgs(): SvgResource[];
    /**
     * 清除插件的所有资源
     */
    clearPlugin(pluginName: string): void;
    /**
     * 从路径中提取文件名
     */
    private extractFileName;
}
/**
 * 获取资源加载器实例（单例模式）
 */
export declare function useResourceLoader(): ResourceLoader;
/**
 * 重置资源加载器（用于测试）
 */
export declare function resetResourceLoader(): void;
//# sourceMappingURL=resource-loader.d.ts.map