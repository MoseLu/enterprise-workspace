import type { App } from 'vue';
import { type DynamicService, type EpsData } from './service/builder';
export interface BtcOptions {
    apiBaseUrl?: string;
    timeout?: number;
}
/**
 * 核心功能钩子
 * 提供服务对象、CRUD、插件等
 */
export declare function useCore(): {
    service: DynamicService;
};
/**
 * 初始化 EPS 数据（由应用调用）
 */
export declare function initEpsData(epsData: EpsData): void;
export declare function installBtc(app: App, options?: BtcOptions): void;
//# sourceMappingURL=index.d.ts.map