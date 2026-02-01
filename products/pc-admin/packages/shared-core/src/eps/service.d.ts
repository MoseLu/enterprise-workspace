/**
 * EPS 服务模块
 * 提供统一的 EPS 服务加载和共享功能
 *
 * 此模块用于所有应用共享 EPS 服务代码，避免每个应用都独立打包
 */
/**
 * EPS 服务数据接口
 */
export interface EpsServiceData {
    service: any;
    list: any[];
    isUpdate?: boolean;
}
/**
 * 获取全局共享的 EPS 服务
 * 优先从 window.__APP_EPS_SERVICE__ 获取（由 system-app、layout-app 或其他应用提供）
 */
export declare function getGlobalEpsService(): any;
/**
 * 创建 EPS 服务
 * 从 virtual:eps 模块加载 EPS 数据，并包装为服务对象
 *
 * @param epsModule - 从 virtual:eps 导入的模块
 * @returns EPS 服务对象和列表
 */
export declare function createEpsService(epsModule: any): {
    service: any;
    list: any[];
};
/**
 * 加载 EPS 服务
 * 优先使用全局共享的服务，如果没有则从 virtual:eps 加载本地服务
 *
 * @param epsModule - 从 virtual:eps 导入的模块（可选）
 * @returns EPS 服务对象和列表
 */
export declare function loadEpsService(epsModule?: any): {
    service: any;
    list: any[];
};
/**
 * 导出 EPS 服务到全局
 * 确保其他模块也能访问
 *
 * @param service - EPS 服务对象
 */
export declare function exportEpsServiceToGlobal(service: any): void;
//# sourceMappingURL=service.d.ts.map