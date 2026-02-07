/**
 * 系统级别自定义 API 服务
 * 存放不属于 EPS 的系统管理类接口
 */
/**
 * 系统 API 服务对象
 */
export declare const sysApi: {
    apiDocs: {
        /**
         * 分页查询接口文档列表
         */
        page(params?: Record<string, any>): any;
        /**
         * 获取接口文档列表（不分页）
         */
        list(params?: Record<string, any>): any;
    };
};
