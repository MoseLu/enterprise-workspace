import type { App as VueApp } from 'vue';
import type { QiankunProps } from '../../types/qiankun';
import type { SubAppContext, SubAppOptions } from './types';
/**
 * 设置独立运行时的插件（标准化模板）
 */
declare function setupStandalonePlugins(app: VueApp, router: any): Promise<void>;
/**
 * 创建子应用实例（标准化模板）
 * 以财务应用为标准，所有子应用使用相同的逻辑
 */
export declare function createSubApp(options: SubAppOptions, props?: QiankunProps): Promise<SubAppContext>;
/**
 * 挂载子应用（标准化模板）
 */
export declare function mountSubApp(context: SubAppContext, options: SubAppOptions, props?: QiankunProps): Promise<void>;
/**
 * 更新子应用配置（标准化模板）
 */
export declare function updateSubApp(context: SubAppContext, props: QiankunProps): void;
/**
 * 卸载子应用（标准化模板）
 */
export declare function unmountSubApp(context: SubAppContext, props?: QiankunProps): Promise<void>;
export { setupStandalonePlugins };
//# sourceMappingURL=useSubAppLifecycle.d.ts.map