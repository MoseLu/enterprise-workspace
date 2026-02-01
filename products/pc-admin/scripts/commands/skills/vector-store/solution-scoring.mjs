/**
 * 方案评分库
 * 用于给方案进行各种维度的评级
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
  return join(configDir, 'solution-scoring.db');
}

let dbInstance = null;

/**
 * 获取数据库实例
 */
function getScoringDatabase() {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new Database(dbPath);
    initTables(dbInstance);
  }
  return dbInstance;
}

/**
 * 初始化表结构
 */
function initTables(db) {
  // 方案评分表
  // 注意：solution_id 引用 solution-database 中的 solutions 表，但无法使用 FOREIGN KEY（跨数据库）
  db.exec(`
    CREATE TABLE IF NOT EXISTS solution_scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solution_id TEXT NOT NULL UNIQUE,
      iteration_count INTEGER DEFAULT 1, -- 迭代次数（根据版本计算）
      generality_score REAL DEFAULT 0.5, -- 通用程度 (0-1)，1=通用，0=特定
      similarity_score REAL DEFAULT 0.0, -- 接近程度 (0-1)，与其他方案的相似度
      usage_count INTEGER DEFAULT 0, -- 使用次数（被其他方案参考的次数）
      success_rate REAL DEFAULT 0.0, -- 成功率 (0-1)，实现后用户满意度
      performance_score REAL DEFAULT 0.0, -- 性能评分 (0-1)
      maintainability_score REAL DEFAULT 0.0, -- 可维护性评分 (0-1)
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 方案版本历史表
  // 注意：solution_id 引用 solution-database 中的 solutions 表，但无法使用 FOREIGN KEY（跨数据库）
  db.exec(`
    CREATE TABLE IF NOT EXISTS solution_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solution_id TEXT NOT NULL,
      version TEXT NOT NULL, -- '1.0.0', '1.1.0', etc.
      parent_version_id INTEGER, -- 父版本ID
      changes TEXT, -- JSON: 变更内容
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (parent_version_id) REFERENCES solution_versions(id)
    )
  `);

  // 方案使用记录表
  // 注意：solution_id 引用 solution-database 中的 solutions 表，但无法使用 FOREIGN KEY（跨数据库）
  db.exec(`
    CREATE TABLE IF NOT EXISTS solution_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solution_id TEXT NOT NULL,
      used_in_solution_id TEXT, -- 被哪个方案使用
      used_in_page_id TEXT, -- 被哪个页面使用
      usage_type TEXT, -- 'reference', 'template', 'copy'
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);

  // 创建索引
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_scores_solution ON solution_scores(solution_id);
    CREATE INDEX IF NOT EXISTS idx_scores_generality ON solution_scores(generality_score);
    CREATE INDEX IF NOT EXISTS idx_scores_similarity ON solution_scores(similarity_score);
    CREATE INDEX IF NOT EXISTS idx_versions_solution ON solution_versions(solution_id);
    CREATE INDEX IF NOT EXISTS idx_usage_solution ON solution_usage(solution_id);
  `);
}

/**
 * 计算迭代次数（根据版本历史）
 */
export function calculateIterationCount(solutionId) {
  const db = getScoringDatabase();
  const versions = db.prepare(`
    SELECT COUNT(*) as count 
    FROM solution_versions 
    WHERE solution_id = ?
  `).get(solutionId);
  
  return (versions?.count || 0) + 1; // +1 因为初始版本也算一次迭代
}

/**
 * 计算通用程度
 * 基于方案被使用的场景数量和多样性
 */
export async function calculateGeneralityScore(solutionId) {
  const db = getScoringDatabase();
  
  // 获取方案信息（从 solution-database）
  let solution = null;
  try {
    const { getSolutionDatabase } = await import('./solution-database.mjs');
    const solutionDb = getSolutionDatabase();
    solution = solutionDb.prepare('SELECT * FROM solutions WHERE id = ?').get(solutionId);
  } catch (error) {
    // 如果无法导入或查询失败，返回默认值
    return 0.5;
  }
  
  if (!solution) {
    return 0.5; // 默认值
  }

  // 计算使用次数
  const usageCount = db.prepare(`
    SELECT COUNT(DISTINCT used_in_solution_id) as count 
    FROM solution_usage 
    WHERE solution_id = ?
  `).get(solutionId)?.count || 0;

  // 计算场景多样性（基于 scenario_type）
  // 注意：solutions 表在 solution-database 中，不在 scoring 数据库中
  // 这里只使用 solution_usage 表中的信息
  const scenarioTypes = db.prepare(`
    SELECT COUNT(DISTINCT usage_type) as count
    FROM solution_usage 
    WHERE solution_id = ?
  `).get(solutionId)?.count || 0;

  // 通用程度 = 使用次数权重 + 场景多样性权重
  const usageScore = Math.min(usageCount / 10, 1.0); // 最多10次使用 = 1.0
  const scenarioScore = Math.min(scenarioTypes / 5, 1.0); // 最多5种场景 = 1.0
  
  return (usageScore * 0.6 + scenarioScore * 0.4);
}

/**
 * 计算接近程度（与其他方案的相似度）
 */
export async function calculateSimilarityScore(solutionId, otherSolutionIds = []) {
  const db = getScoringDatabase();
  
  // 动态导入 solution-database 以避免循环依赖
  let solutionDb;
  try {
    const { getSolutionDatabase } = await import('./solution-database.mjs');
    solutionDb = getSolutionDatabase();
  } catch (error) {
    // 如果无法导入，返回默认值
    return 0.0;
  }
  
  if (otherSolutionIds.length === 0) {
    // 如果没有指定其他方案，查找所有已实现的方案
    const allSolutions = solutionDb.prepare(`
      SELECT id FROM solutions 
      WHERE status = 'implemented' AND id != ?
    `).all(solutionId);
    otherSolutionIds = allSolutions.map(s => s.id);
  }

  if (otherSolutionIds.length === 0) {
    return 0.0; // 没有其他方案可比较
  }

  // 获取当前方案的资源
  const currentSolution = solutionDb.prepare('SELECT resources FROM solutions WHERE id = ?').get(solutionId);
  if (!currentSolution) {
    return 0.0;
  }

  const currentResources = JSON.parse(currentSolution.resources || '{}');
  const currentResourceSet = new Set();
  for (const items of Object.values(currentResources)) {
    if (Array.isArray(items)) {
      items.forEach(item => {
        currentResourceSet.add(item.id || item.path || '');
      });
    }
  }

  // 计算与其他方案的相似度
  let totalSimilarity = 0;
  for (const otherId of otherSolutionIds) {
    const otherSolution = solutionDb.prepare('SELECT resources FROM solutions WHERE id = ?').get(otherId);
    if (!otherSolution) continue;

    const otherResources = JSON.parse(otherSolution.resources || '{}');
    const otherResourceSet = new Set();
    for (const items of Object.values(otherResources)) {
      if (Array.isArray(items)) {
        items.forEach(item => {
          otherResourceSet.add(item.id || item.path || '');
        });
      }
    }

    // 计算交集和并集
    const intersection = new Set([...currentResourceSet].filter(x => otherResourceSet.has(x)));
    const union = new Set([...currentResourceSet, ...otherResourceSet]);
    
    // Jaccard 相似度
    const similarity = union.size > 0 ? intersection.size / union.size : 0;
    totalSimilarity += similarity;
  }

  return otherSolutionIds.length > 0 ? totalSimilarity / otherSolutionIds.length : 0.0;
}

/**
 * 更新方案评分
 */
export async function updateSolutionScore(solutionId) {
  const db = getScoringDatabase();
  
  // 首先检查方案是否存在（在 solution-database 中）
  let solutionExists = false;
  try {
    const { getSolutionDatabase } = await import('./solution-database.mjs');
    const solutionDb = getSolutionDatabase();
    const solution = solutionDb.prepare('SELECT id FROM solutions WHERE id = ?').get(solutionId);
    solutionExists = !!solution;
  } catch (error) {
    // 如果无法检查，跳过评分更新
    return;
  }
  
  if (!solutionExists) {
    // 方案不存在，跳过评分更新
    return;
  }
  
  const iterationCount = calculateIterationCount(solutionId);
  const generalityScore = await calculateGeneralityScore(solutionId);
  const similarityScore = await calculateSimilarityScore(solutionId);

  // 检查是否已存在评分记录
  const existing = db.prepare('SELECT id FROM solution_scores WHERE solution_id = ?').get(solutionId);
  
  if (existing) {
    // 更新
    db.prepare(`
      UPDATE solution_scores 
      SET iteration_count = ?,
          generality_score = ?,
          similarity_score = ?,
          updated_at = strftime('%s', 'now')
      WHERE solution_id = ?
    `).run(iterationCount, generalityScore, similarityScore, solutionId);
  } else {
    // 插入
    db.prepare(`
      INSERT INTO solution_scores 
      (solution_id, iteration_count, generality_score, similarity_score)
      VALUES (?, ?, ?, ?)
    `).run(solutionId, iterationCount, generalityScore, similarityScore);
  }
}

/**
 * 记录方案使用
 */
export function recordSolutionUsage(solutionId, usedInSolutionId = null, usedInPageId = null, usageType = 'reference') {
  const db = getScoringDatabase();
  
  db.prepare(`
    INSERT INTO solution_usage (solution_id, used_in_solution_id, used_in_page_id, usage_type)
    VALUES (?, ?, ?, ?)
  `).run(solutionId, usedInSolutionId, usedInPageId, usageType);

  // 更新使用次数
  db.prepare(`
    UPDATE solution_scores 
    SET usage_count = usage_count + 1,
        updated_at = strftime('%s', 'now')
    WHERE solution_id = ?
  `).run(solutionId);
}

/**
 * 添加方案版本
 */
export async function addSolutionVersion(solutionId, version, parentVersionId = null, changes = {}) {
  const db = getScoringDatabase();
  
  db.prepare(`
    INSERT INTO solution_versions (solution_id, version, parent_version_id, changes)
    VALUES (?, ?, ?, ?)
  `).run(solutionId, version, parentVersionId, JSON.stringify(changes));

  // 更新迭代次数
  await updateSolutionScore(solutionId);
}

/**
 * 获取方案评分
 */
export async function getSolutionScore(solutionId) {
  const db = getScoringDatabase();
  const score = db.prepare('SELECT * FROM solution_scores WHERE solution_id = ?').get(solutionId);
  
  if (!score) {
    // 如果不存在，创建默认评分
    await updateSolutionScore(solutionId);
    return await getSolutionScore(solutionId);
  }

  return score;
}

/**
 * 获取高评分方案（用于推荐）
 */
export async function getHighScoreSolutions(criteria = {}) {
  const db = getScoringDatabase();
  const {
    minGenerality = 0.5,
    minSimilarity = 0.0,
    minUsageCount = 0,
    limit = 10,
  } = criteria;

  // 从评分数据库获取评分信息
  const scores = db.prepare(`
    SELECT *
    FROM solution_scores
    WHERE generality_score >= ?
      AND similarity_score >= ?
      AND usage_count >= ?
    ORDER BY 
      (generality_score * 0.4 + similarity_score * 0.3 + (usage_count / 10.0) * 0.3) DESC
    LIMIT ?
  `).all(minGenerality, minSimilarity, minUsageCount, limit);

  // 从 solution-database 获取方案详细信息
  const solutions = [];
  try {
    const { getSolutionDatabase } = await import('./solution-database.mjs');
    const solutionDb = getSolutionDatabase();
    
    for (const score of scores) {
      const solution = solutionDb.prepare('SELECT * FROM solutions WHERE id = ?').get(score.solution_id);
      if (solution && solution.status === 'implemented') {
        solutions.push({
          ...score,
          task_description: solution.task_description,
          scenario_type: solution.scenario_type,
          status: solution.status,
        });
      }
    }
  } catch (error) {
    // 如果无法导入，只返回评分信息
    return scores;
  }

  return solutions;
}

/**
 * 关闭数据库
 */
export function closeScoringDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
