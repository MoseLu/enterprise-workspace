/**
 * 日志相关 API
 */

import type { ApiClient } from '../types';

/**
 * 创建日志 API 服务
 * @param apiClient API 客户端实例
 * @returns 日志 API 服务对象
 */
export function createLogApi(apiClient: ApiClient) {
  return {
    /**
     * 删除日志相关 API（占位，待实现）
     */
    deleteLog: {
      /**
       * 分页查询删除日志
       */
      page(data?: Record<string, any>) {
        return apiClient.post('log', '/deletelog/page', data, { notifySuccess: false });
      },

      /**
       * 恢复删除的日志
       */
      restore(data: Record<string, any>) {
        return apiClient.post('log', '/deletelog/restore', data, { notifySuccess: false });
      },

      /**
       * 批量恢复删除的日志
       */
      restoreBatch(data: Record<string, any>) {
        return apiClient.post('log', '/deletelog/restore/batch', data, { notifySuccess: false });
      }
    }
  };
}
