/**
 * 系统管理相关 API
 * 存放不属于 EPS 的系统管理类接口
 */

import type { ApiClient } from '../types';

/**
 * 创建系统 API 服务
 * @param apiClient API 客户端实例
 * @returns 系统 API 服务对象
 */
export function createSystemApi(apiClient: ApiClient) {
  return {
    /**
     * 接口文档相关 API
     */
    apiDocs: {
      /**
       * 分页查询接口文档列表
       */
      page(params?: Record<string, any>) {
        return apiClient.get('system', '/docs', params);
      },

      /**
       * 获取接口文档列表（不分页）
       */
      list(params?: Record<string, any>) {
        return apiClient.get('system', '/docs', params);
      }
    }
  };
}
