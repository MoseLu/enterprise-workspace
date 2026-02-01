/**
 * 数据库初始化脚本
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TABLES, INDEXES, SCHEMA_VERSION } from './schema.mjs';
import { logger } from '../../../utils/logger.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取数据库路径
 */
function getDbPath() {
  const rootDir = join(__dirname, '../../../../');
  return join(rootDir, '.claude', 'skills-meta', 'database', 'skills.db');
}

/**
 * 初始化数据库
 */
export function initDatabase() {
  const dbPath = getDbPath();
  const fs = require('fs');
  const path = require('path');
  
  // 确保数据库目录存在
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // 检查数据库文件是否存在
  const dbExists = fs.existsSync(dbPath);
  
  if (dbExists) {
    logger.info(`[Skills DB] 数据库已存在: ${dbPath}`);
  } else {
    logger.info(`[Skills DB] 初始化数据库: ${dbPath}`);
  }
  
  const db = new Database(dbPath);
  
  // 启用外键约束
  db.pragma('foreign_keys = ON');
  
  // 检查是否需要初始化
  let needsInit = false;
  try {
    // 检查 schema_version 表是否存在
    const versionCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'").get();
    if (!versionCheck) {
      needsInit = true;
      logger.info('[Skills DB] schema_version 表不存在，需要初始化');
    } else {
      // 检查版本
      const currentVersion = db.prepare('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1').get();
      const currentVersionNum = currentVersion ? currentVersion.version : 0;
      if (currentVersionNum < SCHEMA_VERSION) {
        needsInit = true;
        logger.info(`[Skills DB] 检测到schema版本需要升级: ${currentVersionNum} -> ${SCHEMA_VERSION}`);
      } else {
        logger.info(`[Skills DB] 数据库已是最新版本 (${SCHEMA_VERSION})，跳过初始化`);
      }
    }
  } catch (error) {
    // 如果查询失败，说明数据库可能损坏或需要初始化
    needsInit = true;
    logger.info('[Skills DB] 无法检查数据库版本，需要初始化');
  }
  
  // 即使版本是最新的，也检查表是否存在（防止表缺失的情况）
  if (!needsInit) {
    // 检查新表是否存在
    const newTables = [
      'execution_errors',
      'project_state_snapshots',
      'skill_versions',
      'issue_patterns',
      'optimization_validations',
      'implicit_feedback'
    ];
    
    let missingTables = [];
    for (const tableName of newTables) {
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `).get(tableName);
      if (!tableExists) {
        missingTables.push(tableName);
      }
    }
    
    if (missingTables.length > 0) {
      logger.info(`[Skills DB] 检测到缺失的表: ${missingTables.join(', ')}, 执行迁移`);
      // 直接创建缺失的表，不设置needsInit（避免重复创建所有表）
      for (const tableName of missingTables) {
        if (TABLES[tableName]) {
          try {
            db.exec(TABLES[tableName]);
            logger.info(`[Skills DB] 表 ${tableName} 创建成功`);
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn(`[Skills DB] 创建表 ${tableName} 时出错:`, e.message);
            }
          }
        }
      }
      
      // 创建缺失表的索引
      const newIndexes = INDEXES.filter(idx => 
        missingTables.some(table => idx.includes(table))
      );
      for (const indexSql of newIndexes) {
        try {
          db.exec(indexSql);
        } catch (e) {
          if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
            logger.warn('[Skills DB] 创建索引时出错:', e.message);
          }
        }
      }
      
      return db;
    } else {
      return db;
    }
  }
  
  // 先创建 schema_version 表（如果不存在）
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    )
  `);
  
  // 获取当前版本（在创建表之后）
  let currentVersionNum = 0;
  try {
    const currentVersion = db.prepare('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1').get();
    currentVersionNum = currentVersion ? currentVersion.version : 0;
  } catch (error) {
    // 如果查询失败，版本为 0
    currentVersionNum = 0;
  }
  
  // 创建表（只有在版本为 0 或需要完整初始化时才创建所有表）
  if (currentVersionNum === 0) {
    logger.info('[Skills DB] 创建表结构...');
    for (const [tableName, createSql] of Object.entries(TABLES)) {
      try {
        db.exec(createSql);
        logger.info(`[Skills DB] 表 ${tableName} 创建成功`);
      } catch (error) {
        // 如果表已存在，忽略错误
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
          logger.debug(`[Skills DB] 表 ${tableName} 已存在，跳过`);
        } else {
          logger.error(`[Skills DB] 创建表 ${tableName} 失败:`, error);
          throw error;
        }
      }
    }
    
    // 创建索引
    logger.info('[Skills DB] 创建索引...');
    for (const indexSql of INDEXES) {
      try {
        db.exec(indexSql);
      } catch (error) {
        // 如果索引已存在，忽略错误
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
          logger.debug(`[Skills DB] 索引已存在，跳过`);
        } else {
          logger.error(`[Skills DB] 创建索引失败:`, error);
          throw error;
        }
      }
    }
  }
  
  // 执行迁移（如果需要）
  if (currentVersionNum < SCHEMA_VERSION) {
    if (currentVersionNum > 0) {
      logger.info(`[Skills DB] 执行schema版本迁移: ${currentVersionNum} -> ${SCHEMA_VERSION}`);
    }
      
      // 执行迁移
      if (currentVersionNum < 2) {
        // 创建新表（已经在TABLES中定义）
        if (TABLES.conversation_scenarios) {
          try {
            db.exec(TABLES.conversation_scenarios);
            logger.info('[Skills DB] 表 conversation_scenarios 创建成功');
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建表 conversation_scenarios 时出错:', e.message);
            }
          }
        }
        if (TABLES.conversation_skill_mapping) {
          try {
            db.exec(TABLES.conversation_skill_mapping);
            logger.info('[Skills DB] 表 conversation_skill_mapping 创建成功');
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建表 conversation_skill_mapping 时出错:', e.message);
            }
          }
        }
        
        // 创建新索引
        const newIndexes = INDEXES.filter(idx => 
          idx.includes('conversation_scenarios') || idx.includes('conversation_skill_mapping')
        );
        for (const indexSql of newIndexes) {
          try {
            db.exec(indexSql);
          } catch (e) {
            // 忽略已存在的索引错误
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建索引时出错:', e.message);
            }
          }
        }
      }
      
      if (currentVersionNum < 3) {
        // 创建 parallel_executions 表
        if (TABLES.parallel_executions) {
          try {
            db.exec(TABLES.parallel_executions);
            logger.info('[Skills DB] 表 parallel_executions 创建成功');
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建表 parallel_executions 时出错:', e.message);
            }
          }
        }
        
        // 创建新索引
        const newIndexes = INDEXES.filter(idx => idx.includes('parallel_executions'));
        for (const indexSql of newIndexes) {
          try {
            db.exec(indexSql);
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建索引时出错:', e.message);
            }
          }
        }
      }
      
      if (currentVersionNum < 4) {
        // 创建 dev_errors 表
        if (TABLES.dev_errors) {
          try {
            db.exec(TABLES.dev_errors);
            logger.info('[Skills DB] 表 dev_errors 创建成功');
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建表 dev_errors 时出错:', e.message);
            }
          }
        }
        
        // 创建新索引
        const newIndexes = INDEXES.filter(idx => idx.includes('dev_errors'));
        for (const indexSql of newIndexes) {
          try {
            db.exec(indexSql);
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建索引时出错:', e.message);
            }
          }
        }
      }
      
      // 版本5的新表迁移（即使版本已经是5，也可能表缺失）
      if (currentVersionNum < 5 || needsInit) {
        // 创建新表（版本5的新表）
        const newTables = [
          'execution_errors',
          'project_state_snapshots',
          'skill_versions',
          'issue_patterns',
          'optimization_validations',
          'implicit_feedback'
        ];
        
        for (const tableName of newTables) {
          if (TABLES[tableName]) {
            try {
              // 先检查表是否存在
              const exists = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name=?
              `).get(tableName);
              
              if (!exists) {
                db.exec(TABLES[tableName]);
                logger.info(`[Skills DB] 表 ${tableName} 创建成功`);
              } else {
                logger.debug(`[Skills DB] 表 ${tableName} 已存在，跳过`);
              }
            } catch (e) {
              if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
                logger.warn(`[Skills DB] 创建表 ${tableName} 时出错:`, e.message);
              }
            }
          }
        }
        
        // 创建新索引
        const newIndexes = INDEXES.filter(idx => 
          idx.includes('execution_errors') ||
          idx.includes('project_state_snapshots') ||
          idx.includes('skill_versions') ||
          idx.includes('issue_patterns') ||
          idx.includes('optimization_validations') ||
          idx.includes('implicit_feedback')
        );
        for (const indexSql of newIndexes) {
          try {
            db.exec(indexSql);
          } catch (e) {
            if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
              logger.warn('[Skills DB] 创建索引时出错:', e.message);
            }
          }
        }
      }
    
    // 更新版本号（如果版本小于当前版本）
    if (currentVersionNum < SCHEMA_VERSION) {
      const stmt = db.prepare('INSERT OR REPLACE INTO schema_version (version) VALUES (?)');
      stmt.run(SCHEMA_VERSION);
      logger.info(`[Skills DB] Schema版本已更新为 ${SCHEMA_VERSION}`);
    }
  }
  
  logger.info('[Skills DB] 数据库初始化完成');
  return db;
}

/**
 * 获取数据库连接
 */
export function getDatabase() {
  const dbPath = getDbPath();
  const fs = require('fs');
  const path = require('path');
  
  // 确保数据库目录存在
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
}

/**
 * 检查数据库是否需要迁移
 */
export function checkMigration() {
  const db = getDatabase();
  try {
    const result = db.prepare('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1').get();
    const currentVersion = result ? result.version : 0;
    
    if (currentVersion < SCHEMA_VERSION) {
      logger.info(`[Skills DB] 检测到schema版本差异: ${currentVersion} -> ${SCHEMA_VERSION}`);
      return true;
    }
    return false;
  } catch (error) {
    // 如果schema_version表不存在，需要初始化
    logger.info('[Skills DB] schema_version表不存在，需要初始化');
    return true;
  } finally {
    db.close();
  }
}
