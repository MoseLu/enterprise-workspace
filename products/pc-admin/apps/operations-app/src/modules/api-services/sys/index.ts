/**
 * 系统级别自定义 API 服务
 * 存放不属于 EPS 的系统管理类接口
 */

import { requestAdapter } from '@/utils/requestAdapter';
import type { CrudService } from '@btc/shared-core';
import { getLogFilterOptions } from '@btc/shared-core';

/**
 * 系统 API 服务对象
 */
export const sysApi = {
  apiDocs: {
    /**
     * 分页查询接口文档列表
     */
    page(_params?: Record<string, any>) {
      return Promise.reject(new Error('Not implemented'));
    },

    /**
     * 获取接口文档列表（不分页）
     */
    list(_params?: Record<string, any>) {
      return Promise.reject(new Error('Not implemented'));
    }
  },
  logs: {
    /**
     * 获取日志筛选选项
     * 从 shared-core 的日志中心统一获取所有下拉菜单选项
     */
    getFilterOptions() {
      return getLogFilterOptions();
    },

    /**
     * 日志查询服务
     * 用于 btc-crud 组件
     */
    getService(): CrudService {
      return {
        async page(params: Record<string, any> = {}) {
          const { page = 1, size = 10, keyword = {} } = params;

          const response = await requestAdapter.post<{
            list: Array<{
              id: number;
              appId: string;
              appName: string;
              timestamp: string;
              createdAt: string;
              logs: Array<{
                timestamp: string;
                logLevel: string;
                loggerName: string;
                message: string;
                microApp?: {
                  microAppType: string;
                  microAppName: string;
                  microAppInstanceId: string;
                  microAppLifecycle: string;
                };
                data?: any;
              }>;
            }>;
            page: number;
            size: number;
            total: number;
            category: string | null;
          }>('/api/system/logs/page', {
            page,
            size,
            keyword,
          }, {
            // 查询操作不需要显示成功提示
            silent: true
          });

          // 响应拦截器已经提取了 data.data，所以 response 直接就是业务数据
          const data = response || { list: [], page: 1, size: 10, total: 0, category: null };

          // TODO: 分页问题修复
          // 当前实现：前端展开批次为日志条目（临时方案）
          // 问题：后端返回20条批次，但 total 是28条日志，导致分页统计不准确
          // 解决方案：后端应该展开批次为日志条目，返回展开后的日志列表，分页基于日志条数
          // 参考文档：docs/monitoring/pagination-solution.md
          // 
          // 后端调整后，这里应该直接返回 data.list（已经是展开后的日志列表）
          // 如果后端返回的是批次列表，则继续使用下面的展开逻辑（向后兼容）

          // 检查后端是否已经展开（如果 list 中的项没有 logs 字段，说明已经展开）
          const isAlreadyExpanded = data.list && data.list.length > 0 && !data.list[0].logs;
          
          if (isAlreadyExpanded) {
            // 后端已经展开，需要解析 data 和 extensions 字段（它们是 JSON 字符串）
            const parsedList = data.list.map((item: any) => {
              const parsedItem = { ...item };
              
              // 字段映射：将 logTimestamp 映射为 timestamp（向后兼容）
              if (parsedItem.logTimestamp && !parsedItem.timestamp) {
                parsedItem.timestamp = parsedItem.logTimestamp;
              }
              
              // 解析 data 字段（如果存在且是字符串）
              if (parsedItem.data && typeof parsedItem.data === 'string') {
                try {
                  parsedItem.data = JSON.parse(parsedItem.data);
                } catch (e) {
                  // 解析失败，保持原值
                  console.warn('[LogService] Failed to parse data field:', e);
                }
              }
              
              // 解析 extensions 字段（如果存在且是字符串）
              if (parsedItem.extensions && typeof parsedItem.extensions === 'string') {
                try {
                  parsedItem.extensions = JSON.parse(parsedItem.extensions);
                } catch (e) {
                  // 解析失败，保持原值
                  console.warn('[LogService] Failed to parse extensions field:', e);
                }
              }
              
              return parsedItem;
            });
            
            return {
              list: parsedList,
              total: data.total || 0,
            };
          }

          // 向后兼容：将批次记录展开为日志条目（临时方案，等待后端调整）
          // 每个批次可能包含多条日志，需要展开为多条记录
          const expandedList: any[] = [];

          for (const batch of data.list || []) {
            // 如果批次中没有日志，仍然显示批次信息
            if (!batch.logs || batch.logs.length === 0) {
              expandedList.push({
                batchId: batch.id,
                appId: batch.appId,
                appName: batch.appName,
                timestamp: batch.timestamp || batch.createdAt,
                createdAt: batch.createdAt,
                // 日志条目字段为空
                logLevel: null,
                loggerName: null,
                message: '（无日志）',
                microAppType: null,
                microAppName: null,
                microAppInstanceId: null,
                microAppLifecycle: null,
                logData: null,
              });
            } else {
              // 将批次下的每条日志展开为一条记录
              for (const log of batch.logs) {
                // 解析 data 字段（如果存在且是字符串）
                let parsedData = log.data || null;
                if (parsedData && typeof parsedData === 'string') {
                  try {
                    parsedData = JSON.parse(parsedData);
                  } catch (e) {
                    // 解析失败，保持原值
                    console.warn('[LogService] Failed to parse log data field:', e);
                  }
                }
                
                // 解析 extensions 字段（如果存在且是字符串）
                let parsedExtensions = log.extensions || null;
                if (parsedExtensions && typeof parsedExtensions === 'string') {
                  try {
                    parsedExtensions = JSON.parse(parsedExtensions);
                  } catch (e) {
                    // 解析失败，保持原值
                    console.warn('[LogService] Failed to parse log extensions field:', e);
                  }
                }
                
                expandedList.push({
                  batchId: batch.id,
                  appId: batch.appId,
                  appName: batch.appName,
                  timestamp: log.timestamp || batch.timestamp || batch.createdAt,
                  createdAt: batch.createdAt,
                  logLevel: log.logLevel,
                  loggerName: log.loggerName,
                  message: log.message,
                  microAppType: log.microApp?.microAppType || null,
                  microAppName: log.microApp?.microAppName || null,
                  microAppInstanceId: log.microApp?.microAppInstanceId || null,
                  microAppLifecycle: log.microApp?.microAppLifecycle || null,
                  data: parsedData,
                  extensions: parsedExtensions,
                });
              }
            }
          }

          return {
            list: expandedList,
            total: data.total || 0,
          };
        },
        async add(_data: any) {
          return Promise.reject(new Error('Not implemented'));
        },
        async update(_data: any) {
          return Promise.reject(new Error('Not implemented'));
        },
        async delete(_id: string | number) {
          return Promise.reject(new Error('Not implemented'));
        },
        async deleteBatch(_ids: (string | number)[]) {
          return Promise.reject(new Error('Not implemented'));
        },
      };
    }
  }
};
