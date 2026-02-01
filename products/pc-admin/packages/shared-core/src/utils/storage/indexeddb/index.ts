/**
 * IndexedDB 工具主入口
 * 提供统一的 IndexedDB 操作接口，基于 Dexie.js
 */
;

import type { Dexie, Table } from 'dexie';
import { createDashboardDB, createIndexedDB, getDefaultDashboardDB, isIndexedDBSupported } from './database';
import type { DashboardDataItem, QueryFilters, QueryOptions } from './types';
import { logger } from '../../logger/index';

// 导出数据库创建函数
export { createDashboardDB, createIndexedDB, getDefaultDashboardDB, isIndexedDBSupported };

// 导出 Vue3 响应式查询 Composable
export { useLiveQuery, useLiveQueryWithState } from './useLiveQuery';

// 导出类型
export type { DashboardDataItem, DatabaseConfig, QueryFilters, QueryOptions } from './types';

/**
 * 时间范围查询
 * @param table 数据表
 * @param startTime 开始时间戳
 * @param endTime 结束时间戳
 * @param options 查询选项
 * @returns 查询结果数组
 */
export async function queryByTimeRange<T = any>(
  table: Table<T, any>,
  startTime: number,
  endTime: number,
  options?: QueryOptions
): Promise<T[]> {
  try {
    const baseQuery = table.where('time').between(startTime, endTime, true, true);

    let results: T[];
    if (options?.orderBy) {
      results = await baseQuery.sortBy(options.orderBy);
    } else {
      results = await baseQuery.sortBy('time');
    }
    
    // 处理排序方向
    if (options?.orderDirection === 'desc') {
      results.reverse();
    }

    // 处理分页
    if (options?.offset || options?.limit) {
      const offset = options.offset || 0;
      const limit = options.limit;
      return limit ? results.slice(offset, offset + limit) : results.slice(offset);
    }

    return results;
  } catch (error) {
    logger.error('[IndexedDB] 时间范围查询失败:', error);
    throw error;
  }
}

/**
 * 按操作人查询
 * @param table 数据表
 * @param operator 操作人
 * @param options 查询选项
 * @returns 查询结果数组
 */
export async function queryByOperator<T = any>(
  table: Table<T, any>,
  operator: string,
  options?: QueryOptions
): Promise<T[]> {
  try {
    let results = await table.where('operator').equals(operator).toArray();

    // 处理排序
    if (options?.orderBy) {
      const orderBy = options.orderBy;
      const direction = options.orderDirection || 'asc';
      results.sort((a: any, b: any) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // 处理分页
    if (options?.offset || options?.limit) {
      const offset = options.offset || 0;
      const limit = options.limit;
      return limit ? results.slice(offset, offset + limit) : results.slice(offset);
    }

    return results;
  } catch (error) {
    logger.error('[IndexedDB] 按操作人查询失败:', error);
    throw error;
  }
}

/**
 * 按类型查询
 * @param table 数据表
 * @param type 操作类型
 * @param options 查询选项
 * @returns 查询结果数组
 */
export async function queryByType<T = any>(
  table: Table<T, any>,
  type: string,
  options?: QueryOptions
): Promise<T[]> {
  try {
    let results = await table.where('type').equals(type).toArray();

    // 处理排序
    if (options?.orderBy) {
      const orderBy = options.orderBy;
      const direction = options.orderDirection || 'asc';
      results.sort((a: any, b: any) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // 处理分页
    if (options?.offset || options?.limit) {
      const offset = options.offset || 0;
      const limit = options.limit;
      return limit ? results.slice(offset, offset + limit) : results.slice(offset);
    }

    return results;
  } catch (error) {
    logger.error('[IndexedDB] 按类型查询失败:', error);
    throw error;
  }
}

/**
 * 按分类查询
 * @param table 数据表
 * @param category 业务分类
 * @param options 查询选项
 * @returns 查询结果数组
 */
export async function queryByCategory<T = any>(
  table: Table<T, any>,
  category: string,
  options?: QueryOptions
): Promise<T[]> {
  try {
    let results = await table.where('category').equals(category).toArray();

    // 处理排序
    if (options?.orderBy) {
      const orderBy = options.orderBy;
      const direction = options.orderDirection || 'asc';
      results.sort((a: any, b: any) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // 处理分页
    if (options?.offset || options?.limit) {
      const offset = options.offset || 0;
      const limit = options.limit;
      return limit ? results.slice(offset, offset + limit) : results.slice(offset);
    }

    return results;
  } catch (error) {
    logger.error('[IndexedDB] 按分类查询失败:', error);
    throw error;
  }
}

/**
 * 多条件组合查询
 * @param table 数据表
 * @param filters 查询过滤器
 * @param options 查询选项
 * @returns 查询结果数组
 */
export async function queryWithFilters<T = any>(
  table: Table<T, any>,
  filters: QueryFilters,
  options?: QueryOptions
): Promise<T[]> {
  try {
    let query: any = table.toCollection();

    // 时间范围筛选
    if (filters.startTime !== undefined || filters.endTime !== undefined) {
      const startTime = filters.startTime ?? 0;
      const endTime = filters.endTime ?? Date.now();
      query = table.where('time').between(startTime, endTime, true, true);
    }

    // 操作人筛选
    if (filters.operator) {
      if (query.toCollection) {
        query = query.and((item: any) => item.operator === filters.operator);
      } else {
        const results = await query.toArray();
        return results.filter((item: any) => {
          if (filters.operator && item.operator !== filters.operator) return false;
          if (filters.type && item.type !== filters.type) return false;
          if (filters.category && item.category !== filters.category) return false;
          if (filters.customFilter && !filters.customFilter(item)) return false;
          return true;
        });
      }
    }

    // 类型筛选
    if (filters.type) {
      if (query.and) {
        query = query.and((item: any) => item.type === filters.type);
      }
    }

    // 分类筛选
    if (filters.category) {
      if (query.and) {
        query = query.and((item: any) => item.category === filters.category);
      }
    }

    // 执行查询
    let results: T[];
    if (query.toArray) {
      results = await query.toArray();
    } else {
      results = await query;
    }

    // 自定义筛选
    if (filters.customFilter) {
      results = results.filter(filters.customFilter);
    }

    // 处理排序
    if (options?.orderBy) {
      const orderBy = options.orderBy;
      const direction = options.orderDirection || 'asc';
      results.sort((a: any, b: any) => {
        const aVal = a[orderBy];
        const bVal = b[orderBy];
        if (direction === 'desc') {
          return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // 处理分页
    if (options?.offset || options?.limit) {
      const offset = options.offset || 0;
      const limit = options.limit;
      return limit ? results.slice(offset, offset + limit) : results.slice(offset);
    }

    return results;
  } catch (error) {
    logger.error('[IndexedDB] 多条件查询失败:', error);
    throw error;
  }
}

/**
 * 批量添加数据
 * @param table 数据表
 * @param items 数据项数组
 * @returns 添加的记录数
 */
export async function batchAdd<T = any>(table: Table<T, any>, items: T[]): Promise<number> {
  try {
    await table.bulkAdd(items);
    return items.length;
  } catch (error) {
    logger.error('[IndexedDB] 批量添加失败:', error);
    throw error;
  }
}

/**
 * 批量更新数据
 * @param table 数据表
 * @param items 数据项数组（必须包含主键）
 * @returns 更新的记录数
 */
export async function batchUpdate<T = any>(table: Table<T, any>, items: T[]): Promise<number> {
  try {
    await table.bulkPut(items);
    return items.length;
  } catch (error) {
    logger.error('[IndexedDB] 批量更新失败:', error);
    throw error;
  }
}

/**
 * 批量删除数据
 * @param table 数据表
 * @param keys 主键数组
 * @returns 删除的记录数
 */
export async function batchDelete(table: Table<any, any>, keys: any[]): Promise<number> {
  try {
    await table.bulkDelete(keys);
    return keys.length;
  } catch (error) {
    logger.error('[IndexedDB] 批量删除失败:', error);
    throw error;
  }
}

/**
 * 清空表数据
 * @param table 数据表
 */
export async function clearTable(table: Table<any, any>): Promise<void> {
  try {
    await table.clear();
  } catch (error) {
    logger.error('[IndexedDB] 清空表失败:', error);
    throw error;
  }
}

/**
 * 获取表记录总数
 * @param table 数据表
 * @returns 记录数
 */
export async function getCount(table: Table<any, any>): Promise<number> {
  try {
    return await table.count();
  } catch (error) {
    logger.error('[IndexedDB] 获取记录数失败:', error);
    throw error;
  }
}
