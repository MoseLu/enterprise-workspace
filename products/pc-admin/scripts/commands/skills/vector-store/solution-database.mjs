/**
 * 方案数据库
 * 存储实现方案（待确认和已确认）
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取数据库路径
 */
function getDbPath() {
  const configDir = join(__dirname, '../../../../.cursor/skills-meta/vector-store');
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }
  return join(configDir, 'solution-database.db');
}

let dbInstance = null;

/**
 * 获取数据库实例
 */
export function getSolutionDatabase() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new Database(dbPath);
    
    // 初始化表结构
    initTables(dbInstance);
  }
  return dbInstance;
}

/**
 * 初始化表结构
 */
function initTables(db) {
  // 方案表
  db.exec(`
    CREATE TABLE IF NOT EXISTS solutions (
      id TEXT PRIMARY KEY,
      task_description TEXT NOT NULL,
      scenario_type TEXT, -- 'crud-page', 'form-page', etc.
      status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'rejected', 'implemented'
      version TEXT DEFAULT '1.0.0', -- 方案版本
      parent_solution_id TEXT, -- 父方案ID（用于版本链）
      implementation_plan TEXT, -- JSON: 完整实现方案
      resources TEXT, -- JSON: 推荐的资源列表
      reference_pages TEXT, -- JSON: 参考的页面列表
      metadata TEXT, -- JSON: 方案元数据（结构化数据）
      user_feedback TEXT, -- 用户反馈
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      confirmed_at INTEGER,
      implemented_at INTEGER
    )
  `);

  // 方案资源关联表
  db.exec(`
    CREATE TABLE IF NOT EXISTS solution_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solution_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      resource_path TEXT,
      is_new INTEGER DEFAULT 0, -- 是否是新资源
      FOREIGN KEY (solution_id) REFERENCES solutions(id)
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_solution_status ON solutions(status);
    CREATE INDEX IF NOT EXISTS idx_solution_scenario ON solutions(scenario_type);
    CREATE INDEX IF NOT EXISTS idx_solution_resources_solution ON solution_resources(solution_id);
  `);
}

/**
 * 创建方案
 */
export function createSolution(solutionData) {
  const db = getSolutionDatabase();
  const {
    id,
    taskDescription,
    scenarioType,
    version = '1.0.0',
    parentSolutionId = null,
    implementationPlan,
    resources,
    referencePages,
    metadata = {},
  } = solutionData;

  db.prepare(`
    INSERT INTO solutions 
    (id, task_description, scenario_type, version, parent_solution_id, implementation_plan, resources, reference_pages, metadata, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(
    id,
    taskDescription,
    scenarioType || null,
    version,
    parentSolutionId,
    JSON.stringify(implementationPlan || {}),
    JSON.stringify(resources || {}),
    JSON.stringify(referencePages || []),
    JSON.stringify(metadata)
  );

  // 添加资源关联
  if (resources) {
    const insertResource = db.prepare(`
      INSERT INTO solution_resources (solution_id, resource_type, resource_id, resource_path, is_new)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((resources, solutionId) => {
      for (const [type, items] of Object.entries(resources)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            insertResource.run(
              solutionId,
              type,
              item.id || item.path || '',
              item.path || '',
              item.isNew ? 1 : 0
            );
          }
        }
      }
    });

    insertMany(resources, id);
  }

  return id;
}

/**
 * 确认方案
 */
export function confirmSolution(solutionId, userFeedback = null) {
  const db = getSolutionDatabase();
  
  db.prepare(`
    UPDATE solutions 
    SET status = 'confirmed', 
        user_feedback = ?,
        confirmed_at = strftime('%s', 'now'),
        updated_at = strftime('%s', 'now')
    WHERE id = ?
  `).run(userFeedback, solutionId);
}

/**
 * 标记方案为已实现
 */
export function markSolutionImplemented(solutionId) {
  const db = getSolutionDatabase();
  
  db.prepare(`
    UPDATE solutions 
    SET status = 'implemented',
        implemented_at = strftime('%s', 'now'),
        updated_at = strftime('%s', 'now')
    WHERE id = ?
  `).run(solutionId);
}

/**
 * 获取方案
 */
export function getSolution(solutionId) {
  const db = getSolutionDatabase();
  const solution = db.prepare('SELECT * FROM solutions WHERE id = ?').get(solutionId);
  
  if (!solution) {
    return null;
  }

  return {
    ...solution,
    implementationPlan: JSON.parse(solution.implementation_plan || '{}'),
    resources: JSON.parse(solution.resources || '{}'),
    referencePages: JSON.parse(solution.reference_pages || '[]'),
  };
}

/**
 * 获取待确认的方案
 */
export function getPendingSolutions() {
  const db = getSolutionDatabase();
  const solutions = db.prepare(`
    SELECT * FROM solutions 
    WHERE status = 'pending' 
    ORDER BY created_at DESC
  `).all();

  return solutions.map(s => ({
    ...s,
    implementationPlan: JSON.parse(s.implementation_plan || '{}'),
    resources: JSON.parse(s.resources || '{}'),
    referencePages: JSON.parse(s.reference_pages || '[]'),
    metadata: JSON.parse(s.metadata || '{}'),
  }));
}

/**
 * 比较两个方案的版本差异
 */
export function compareSolutionVersions(solutionId1, solutionId2) {
  const db = getSolutionDatabase();
  const solution1 = getSolution(solutionId1);
  const solution2 = getSolution(solutionId2);

  if (!solution1 || !solution2) {
    return null;
  }

  const differences = {
    resources: {
      added: [],
      removed: [],
      modified: [],
    },
    implementationPlan: {
      changed: false,
      details: [],
    },
  };

  // 比较资源
  const resources1 = solution1.resources || {};
  const resources2 = solution2.resources || {};

  // 找出新增和移除的资源
  const allResourceTypes = new Set([
    ...Object.keys(resources1),
    ...Object.keys(resources2),
  ]);

  for (const type of allResourceTypes) {
    const items1 = resources1[type] || [];
    const items2 = resources2[type] || [];
    const ids1 = new Set(items1.map(item => item.id || item.path));
    const ids2 = new Set(items2.map(item => item.id || item.path));

    // 新增的资源
    for (const id of ids2) {
      if (!ids1.has(id)) {
        differences.resources.added.push({ type, id });
      }
    }

    // 移除的资源
    for (const id of ids1) {
      if (!ids2.has(id)) {
        differences.resources.removed.push({ type, id });
      }
    }
  }

  // 比较实现方案（简化：比较 JSON 字符串）
  const plan1Str = JSON.stringify(solution1.implementationPlan || {});
  const plan2Str = JSON.stringify(solution2.implementationPlan || {});
  differences.implementationPlan.changed = plan1Str !== plan2Str;

  return differences;
}

/**
 * 获取方案的版本历史
 */
export function getSolutionVersionHistory(solutionId) {
  const db = getSolutionDatabase();
  
  // 获取当前方案
  const currentSolution = getSolution(solutionId);
  if (!currentSolution) {
    return null;
  }

  // 获取所有相关版本（通过 parent_solution_id 链）
  const versions = [currentSolution];
  let currentId = solutionId;
  let parentId = currentSolution.parent_solution_id;

  // 向上查找父版本
  while (parentId) {
    const parent = getSolution(parentId);
    if (!parent) break;
    versions.unshift(parent);
    parentId = parent.parent_solution_id;
  }

  // 查找子版本（通过 parent_solution_id 指向当前方案）
  const children = db.prepare(`
    SELECT * FROM solutions 
    WHERE parent_solution_id = ?
    ORDER BY created_at ASC
  `).all(solutionId);

  for (const child of children) {
    const childSolution = {
      ...child,
      implementationPlan: JSON.parse(child.implementation_plan || '{}'),
      resources: JSON.parse(child.resources || '{}'),
      referencePages: JSON.parse(child.reference_pages || '[]'),
      metadata: JSON.parse(child.metadata || '{}'),
    };
    versions.push(childSolution);
  }

  return {
    current: currentSolution,
    versions,
    versionCount: versions.length,
  };
}

/**
 * 关闭数据库
 */
export function closeSolutionDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
