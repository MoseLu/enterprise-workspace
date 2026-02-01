/**
 * 判定标准库管理
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';

/**
 * 初始化判定标准库
 */
export function initJudgmentCriteria() {
  const db = getDbManager();
  
  const criteria = [
    {
      dimension: 'accuracy',
      criteria_text: '准确性：是否正确理解需求，执行结果是否符合预期',
      examples: '完全正确理解需求(5分) -> 完全理解错误(1分)',
      weight: 0.3
    },
    {
      dimension: 'completeness',
      criteria_text: '完整性：是否覆盖所有要点，无遗漏',
      examples: '覆盖所有要点(5分) -> 遗漏关键要点(1分)',
      weight: 0.25
    },
    {
      dimension: 'efficiency',
      criteria_text: '效率：执行速度和迭代次数',
      examples: '一次成功(5分) -> 超过5次迭代(1分)',
      weight: 0.2
    },
    {
      dimension: 'usability',
      criteria_text: '易用性：指令是否清晰易懂',
      examples: '非常清晰(5分) -> 难以理解(1分)',
      weight: 0.15
    },
    {
      dimension: 'practicality',
      criteria_text: '实用性：是否解决实际问题',
      examples: '完全解决(5分) -> 无法解决(1分)',
      weight: 0.1
    }
  ];
  
  try {
    // 检查是否已初始化
    const existing = db.prepare('SELECT COUNT(*) as count FROM judgment_criteria').get();
    if (existing.count > 0) {
      logger.info('[JudgmentCriteria] 判定标准库已存在，跳过初始化');
      return;
    }
    
    // 插入标准
    const stmt = db.prepare(`
      INSERT INTO judgment_criteria (dimension, criteria_text, examples, weight)
      VALUES (?, ?, ?, ?)
    `);
    
    for (const criterion of criteria) {
      stmt.run(criterion.dimension, criterion.criteria_text, criterion.examples, criterion.weight);
    }
    
    logger.info(`[JudgmentCriteria] 已初始化 ${criteria.length} 条判定标准`);
  } catch (error) {
    logger.error('[JudgmentCriteria] 初始化判定标准库失败:', error);
  }
}

/**
 * 获取判定标准
 * @param {string} dimension - 维度（可选）
 * @returns {array} 判定标准列表
 */
export function getJudgmentCriteria(dimension = null) {
  const db = getDbManager();
  
  try {
    if (dimension) {
      return db.prepare('SELECT * FROM judgment_criteria WHERE dimension = ?').all(dimension);
    }
    return db.prepare('SELECT * FROM judgment_criteria ORDER BY weight DESC').all();
  } catch (error) {
    logger.error('[JudgmentCriteria] 获取判定标准失败:', error);
    return [];
  }
}
