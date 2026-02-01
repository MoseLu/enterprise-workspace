/**
 * IndexedDB 工具类型定义
 */

import type { Dexie, Transaction } from 'dexie';

/**
 * 默认看板数据项结构
 * 适用于 MES 系统的生产流程追踪场景
 */
export interface DashboardDataItem {
  /** 主键（自动生成） */
  id?: number;
  /** 时间戳（索引，用于时间范围查询） */
  time: number;
  /** 操作人（索引，用于按人筛选） */
  operator: string;
  /** 操作类型（索引，用于按类型筛选，如 IQC、IPQC、测试、OQC 等） */
  type: string;
  /** 业务分类（索引，可选，用于多维度筛选） */
  category?: string;
  /** 数值（用于计算和统计） */
  value: number;
  /** 其他扩展数据（JSON 格式） */
  data?: Record<string, any>;
}

/**
 * 数据库表结构配置
 */
export interface StoreSchema {
  /** 表名 */
  [tableName: string]: string;
}

/**
 * 数据库配置选项
 */
export interface DatabaseConfig {
  /** 数据库版本 */
  version: number;
  /** 表结构定义 */
  stores: StoreSchema;
  /** 版本升级迁移函数（可选） */
  upgrade?: (trans: Transaction) => void | Promise<void>;
}

/**
 * 查询过滤器
 */
export interface QueryFilters {
  /** 时间范围：开始时间 */
  startTime?: number;
  /** 时间范围：结束时间 */
  endTime?: number;
  /** 操作人筛选 */
  operator?: string;
  /** 操作类型筛选 */
  type?: string;
  /** 业务分类筛选 */
  category?: string;
  /** 自定义筛选函数 */
  customFilter?: (item: any) => boolean;
}

/**
 * 查询选项
 */
export interface QueryOptions {
  /** 排序字段 */
  orderBy?: string;
  /** 排序方向：'asc' | 'desc' */
  orderDirection?: 'asc' | 'desc';
  /** 限制返回数量 */
  limit?: number;
  /** 跳过记录数（用于分页） */
  offset?: number;
}
