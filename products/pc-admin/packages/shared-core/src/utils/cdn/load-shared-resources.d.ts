/**
 * 从 layout-app 加载共享资源
 *
 * 共享资源包括：
 * - vendor: Vue 生态库 + 共享组件库
 * - echarts-vendor: ECharts 相关库
 * - menu-registry: 菜单注册表
 *
 * 使用说明：
 * 1. 在生产环境，非 layout-app 应用需要先加载共享资源
 * 2. 开发环境仍然使用本地打包的资源，不加载共享资源
 * 3. 通过 manifest.json 获取实际文件名（包含 hash）
 */
/**
 * 从 layout-app 加载共享资源
 *
 * @param options 加载选项
 * @param options.resources 要加载的资源列表，默认为 ['vendor', 'echarts-vendor', 'menu-registry']
 * @param options.onProgress 进度回调，参数为 (loaded, total)
 * @returns Promise，在所有资源加载完成后 resolve
 */
export declare function loadSharedResourcesFromLayoutApp(options?: {
    resources?: string[];
    onProgress?: (loaded: number, total: number) => void;
}): Promise<void>;
/**
 * 检查共享资源是否已加载
 */
export declare function areSharedResourcesLoaded(): boolean;
//# sourceMappingURL=load-shared-resources.d.ts.map