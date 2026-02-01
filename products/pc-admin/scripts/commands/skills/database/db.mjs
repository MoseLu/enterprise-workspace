/**
 * 数据库连接和操作封装
 */

import { getDatabase, initDatabase, checkMigration } from './init.mjs';
import { logger } from '../../../utils/logger.mjs';

/**
 * 确保数据库已初始化
 */
export function ensureDatabase() {
  if (checkMigration()) {
    return initDatabase();
  }
  return getDatabase();
}

/**
 * 数据库操作基类
 */
export class DatabaseManager {
  constructor() {
    this.db = null;
  }
  
  /**
   * 获取数据库连接
   */
  getDb() {
    if (!this.db) {
      this.db = ensureDatabase();
    }
    return this.db;
  }
  
  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
  
  /**
   * 执行事务
   */
  transaction(fn) {
    const db = this.getDb();
    const trans = db.transaction(fn);
    return trans();
  }
  
  /**
   * 执行SQL语句
   */
  exec(sql) {
    return this.getDb().exec(sql);
  }
  
  /**
   * 准备SQL语句
   */
  prepare(sql) {
    return this.getDb().prepare(sql);
  }
}

/**
 * 单例数据库管理器
 */
let dbManager = null;

/**
 * 获取数据库管理器实例
 */
export function getDbManager() {
  if (!dbManager) {
    dbManager = new DatabaseManager();
  }
  return dbManager;
}

/**
 * 关闭数据库连接（清理）
 */
export function closeDatabase() {
  if (dbManager) {
    dbManager.close();
    dbManager = null;
  }
}
