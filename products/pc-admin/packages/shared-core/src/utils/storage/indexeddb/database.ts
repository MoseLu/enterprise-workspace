/**
 * IndexedDB 数据库初始化和管理
 * 基于 Dexie.js 封装
 */
;

import Dexie, { type Table } from 'dexie';
import type { DatabaseConfig, DashboardDataItem } from './types';
import { logger } from '../../logger/index';

/**
 * 默认数据库名称
 */
const DEFAULT_DB_NAME = 'BTCDashboardDB';

/**
 * 默认数据库版本
 */
const DEFAULT_DB_VERSION = 1;

/**
 * 默认表结构（看板场景）
 */
const DEFAULT_STORES = {
  dashboardData: 'id, time, operator, type, category',
};

/**
 * 默认看板数据库类
 */
class DashboardDatabase extends Dexie {
  dashboardData!: Table<DashboardDataItem, number>;

  constructor() {
    super(DEFAULT_DB_NAME);
    
    // 定义表结构
    this.version(DEFAULT_DB_VERSION).stores(DEFAULT_STORES);
  }
}

/**
 * 创建默认看板数据库实例
 * @returns 数据库实例
 */
export function createDashboardDB(): DashboardDatabase {
  if (typeof window === 'undefined') {
    throw new Error('[IndexedDB] 只能在浏览器环境中使用');
  }

  try {
    const db = new DashboardDatabase();
    return db;
  } catch (error) {
    logger.error('[IndexedDB] 创建数据库失败:', error);
    throw error;
  }
}

/**
 * 创建自定义数据库实例
 * @param dbName 数据库名称
 * @param config 数据库配置
 * @returns 数据库实例
 */
export function createIndexedDB(dbName: string, config: DatabaseConfig): Dexie {
  if (typeof window === 'undefined') {
    throw new Error('[IndexedDB] 只能在浏览器环境中使用');
  }

  try {
    // 使用匿名类避免类型推断问题
    const CustomDatabase = class extends Dexie {
      constructor() {
        super(dbName);
        
        // 定义表结构
        const version = this.version(config.version);
        version.stores(config.stores);
        
        // 执行升级迁移（如果提供）
        if (config.upgrade) {
          version.upgrade(config.upgrade);
        }
      }
    };

    // @ts-expect-error - Dexie 类型系统导致的类型推断过深问题
    return new CustomDatabase() as Dexie;
  } catch (error) {
    logger.error(`[IndexedDB] 创建数据库 "${dbName}" 失败:`, error);
    throw error;
  }
}

/**
 * 检查浏览器是否支持 IndexedDB
 * @returns 是否支持
 */
export function isIndexedDBSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * 获取默认数据库实例（单例模式）
 */
let defaultDBInstance: DashboardDatabase | null = null;

/**
 * 获取或创建默认数据库实例
 * @returns 数据库实例
 */
export function getDefaultDashboardDB(): DashboardDatabase {
  if (!defaultDBInstance) {
    defaultDBInstance = createDashboardDB();
  }
  return defaultDBInstance;
}
