/**
 * EPS 服务工具函数
 * 提供 EPS 服务的标准化处理，包括参数标准化、响应格式标准化和 CrudService 包装
 */
import type { CrudService } from '../crud/types';
type AnyRecord = Record<string, any>;
/**
 * 标准化 keyword 对象
 * 将 keyword 统一为对象格式
 */
export declare function normalizeKeywordObject(input: any): AnyRecord;
/**
 * 标准化分页参数
 * 统一处理 page、size、keyword 等参数
 */
export declare function normalizePageParams(params: AnyRecord | undefined | null, serviceNode?: any): AnyRecord;
/**
 * 包装服务树
 * 自动为所有 page 和 list 方法添加参数标准化处理
 */
export declare function wrapServiceTree<T extends AnyRecord>(svc: T): T;
/**
 * 标准化分页响应格式
 * 将各种不同的响应格式统一为 { list, total, pagination } 格式
 */
export declare function normalizePageResponse(response: any, page: number, size: number): {
    list: any[];
    total: number;
    pagination: {
        page: number;
        size: number;
        total: number;
    };
};
/**
 * 从 EPS 服务创建 CrudService
 * @param servicePath EPS 服务路径，例如 'logistics.base.position' 或 ['logistics', 'base', 'position']
 * @param serviceRoot EPS 服务根对象
 * @returns CrudService 实例
 */
export declare function createCrudServiceFromEps(servicePath: string | string[], serviceRoot: any): CrudService<any>;
export {};
//# sourceMappingURL=eps-utils.d.ts.map