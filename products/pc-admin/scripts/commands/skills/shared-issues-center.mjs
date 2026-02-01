/**
 * 共享问题中心
 * 记录跨skill的通用问题，提供问题搜索和参考
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';

/**
 * 上报问题
 * @param {object} issue - 问题数据
 * @returns {number} 问题ID
 */
export function reportIssue(issue) {
  const db = getDbManager();
  
  try {
    const stmt = db.prepare(`
      INSERT INTO shared_issues (
        skill_name, issue_type, description, solution, tags
      ) VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      issue.skill_name || null,
      issue.issue_type || 'general',
      issue.description,
      issue.solution || null,
      issue.tags ? JSON.stringify(issue.tags) : null
    );
    
    const issueId = result.lastInsertRowid;
    logger.info(`[SharedIssues] 问题已上报: issue_id=${issueId}`);
    return issueId;
  } catch (error) {
    logger.error(`[SharedIssues] 上报问题失败:`, error);
    throw error;
  }
}

/**
 * 搜索问题
 * @param {object} criteria - 搜索条件
 * @returns {array} 问题列表
 */
export function searchIssues(criteria = {}) {
  const db = getDbManager();
  
  try {
    let sql = 'SELECT * FROM shared_issues WHERE 1=1';
    const params = [];
    
    if (criteria.skill_name) {
      sql += ' AND skill_name = ?';
      params.push(criteria.skill_name);
    }
    
    if (criteria.issue_type) {
      sql += ' AND issue_type = ?';
      params.push(criteria.issue_type);
    }
    
    if (criteria.search) {
      sql += ' AND (description LIKE ? OR solution LIKE ?)';
      const searchTerm = `%${criteria.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (criteria.tags) {
      // 简单的标签搜索
      sql += ' AND tags LIKE ?';
      params.push(`%${criteria.tags}%`);
    }
    
    sql += ' ORDER BY reference_count DESC, reported_at DESC';
    
    if (criteria.limit) {
      sql += ' LIMIT ?';
      params.push(criteria.limit);
    }
    
    const issues = db.prepare(sql).all(...params);
    
    return issues.map(issue => {
      const result = { ...issue };
      if (result.tags) {
        try {
          result.tags = JSON.parse(result.tags);
        } catch (e) {
          result.tags = [];
        }
      }
      return result;
    });
  } catch (error) {
    logger.error(`[SharedIssues] 搜索问题失败:`, error);
    return [];
  }
}

/**
 * 标记问题已解决
 * @param {number} issueId - 问题ID
 * @param {string} solution - 解决方案（可选）
 */
export function resolveIssue(issueId, solution = null) {
  const db = getDbManager();
  
  try {
    const updates = {
      resolved_at: Math.floor(Date.now() / 1000)
    };
    
    if (solution) {
      db.prepare(`
        UPDATE shared_issues SET
          solution = ?,
          resolved_at = ?,
          updated_at = strftime('%s', 'now')
        WHERE id = ?
      `).run(solution, updates.resolved_at, issueId);
    } else {
      db.prepare(`
        UPDATE shared_issues SET
          resolved_at = ?,
          updated_at = strftime('%s', 'now')
        WHERE id = ?
      `).run(updates.resolved_at, issueId);
    }
    
    logger.info(`[SharedIssues] 问题已标记为已解决: issue_id=${issueId}`);
  } catch (error) {
    logger.error(`[SharedIssues] 标记问题解决失败:`, error);
  }
}

/**
 * 增加问题引用计数
 * @param {number} issueId - 问题ID
 */
export function incrementIssueReference(issueId) {
  const db = getDbManager();
  
  try {
    db.prepare(`
      UPDATE shared_issues SET
        reference_count = reference_count + 1,
        updated_at = strftime('%s', 'now')
      WHERE id = ?
    `).run(issueId);
  } catch (error) {
    logger.error(`[SharedIssues] 增加引用计数失败:`, error);
  }
}

/**
 * 获取相关问题（供其他skills参考）
 * @param {string} skillName - skill名称
 * @param {string} issueType - 问题类型（可选）
 * @returns {array} 相关问题列表
 */
export function getRelatedIssues(skillName, issueType = null) {
  const criteria = {
    issue_type: issueType,
    limit: 10
  };
  
  // 搜索相同类型的问题
  const sameTypeIssues = searchIssues(criteria);
  
  // 搜索相同skill的问题
  const sameSkillIssues = searchIssues({
    skill_name: skillName,
    limit: 10
  });
  
  // 合并并去重
  const issueMap = new Map();
  for (const issue of [...sameTypeIssues, ...sameSkillIssues]) {
    if (!issueMap.has(issue.id)) {
      issueMap.set(issue.id, issue);
    }
  }
  
  return Array.from(issueMap.values())
    .sort((a, b) => b.reference_count - a.reference_count)
    .slice(0, 10);
}

/**
 * 搜索问题模式
 * @param {object} criteria - 搜索条件
 * @returns {array} 问题模式列表
 */
export function searchIssuePatterns(criteria = {}) {
  const db = getDbManager();
  
  try {
    let sql = 'SELECT * FROM issue_patterns WHERE 1=1';
    const params = [];
    
    if (criteria.skill_name) {
      sql += ' AND skill_name = ?';
      params.push(criteria.skill_name);
    }
    
    if (criteria.issue_type) {
      sql += ' AND issue_type = ?';
      params.push(criteria.issue_type);
    }
    
    if (criteria.scenario_tags) {
      // 搜索包含特定场景标签的模式
      const tags = Array.isArray(criteria.scenario_tags) 
        ? criteria.scenario_tags 
        : [criteria.scenario_tags];
      const tagConditions = tags.map(() => 'scenario_tags LIKE ?');
      sql += ` AND (${tagConditions.join(' OR ')})`;
      tags.forEach(tag => params.push(`%"${tag}"%`));
    }
    
    sql += ' ORDER BY match_count DESC, confidence_score DESC';
    
    if (criteria.limit) {
      sql += ' LIMIT ?';
      params.push(criteria.limit);
    }
    
    const patterns = db.prepare(sql).all(...params);
    
    return patterns.map(pattern => {
      const result = { ...pattern };
      if (result.scenario_tags) {
        try {
          result.scenario_tags = JSON.parse(result.scenario_tags);
        } catch (e) {
          result.scenario_tags = [];
        }
      }
      if (result.root_cause) {
        try {
          result.root_cause = JSON.parse(result.root_cause);
        } catch (e) {
          // 保持原样
        }
      }
      return result;
    });
  } catch (error) {
    logger.error(`[SharedIssues] 搜索问题模式失败:`, error);
    return [];
  }
}

/**
 * 匹配问题模式
 * @param {string} skillName - skill名称
 * @param {object} error - 错误信息
 * @param {object} context - 上下文
 * @returns {array} 匹配的模式列表
 */
export function matchIssuePatterns(skillName, error, context = {}) {
  const db = getDbManager();
  
  try {
    // 获取相关的问题模式
    const patterns = searchIssuePatterns({
      skill_name: skillName,
      limit: 20
    });
    
    const matched = [];
    
    for (const pattern of patterns) {
      let matchScore = 0;
      
      // 简单的匹配逻辑：检查错误消息和上下文是否匹配模式描述
      const errorMessage = error.error_message || '';
      const patternDesc = pattern.pattern_description || '';
      
      // 关键词匹配
      const keywords = patternDesc.toLowerCase().split(/\s+/);
      const errorLower = errorMessage.toLowerCase();
      const matchedKeywords = keywords.filter(k => errorLower.includes(k));
      matchScore += matchedKeywords.length / keywords.length * 0.5;
      
      // 场景标签匹配
      if (pattern.scenario_tags && context.scenario_tags) {
        const patternTags = Array.isArray(pattern.scenario_tags) 
          ? pattern.scenario_tags 
          : JSON.parse(pattern.scenario_tags || '[]');
        const contextTags = Array.isArray(context.scenario_tags)
          ? context.scenario_tags
          : [];
        
        const matchedTags = patternTags.filter(t => contextTags.includes(t));
        matchScore += matchedTags.length / Math.max(patternTags.length, 1) * 0.5;
      }
      
      if (matchScore > 0.3) {
        matched.push({
          pattern,
          matchScore,
          confidence: pattern.confidence_score * matchScore
        });
      }
    }
    
    // 按匹配度排序
    matched.sort((a, b) => b.confidence - a.confidence);
    
    // 更新匹配计数
    if (matched.length > 0) {
      const topPattern = matched[0].pattern;
      db.prepare(`
        UPDATE issue_patterns SET
          match_count = match_count + 1,
          last_matched_at = strftime('%s', 'now'),
          updated_at = strftime('%s', 'now')
        WHERE pattern_id = ?
      `).run(topPattern.pattern_id);
    }
    
    return matched;
  } catch (error) {
    logger.error(`[SharedIssues] 匹配问题模式失败:`, error);
    return [];
  }
}

/**
 * 获取问题模式的解决方案
 * @param {string} patternId - 模式ID
 * @returns {object|null} 解决方案
 */
export function getPatternSolution(patternId) {
  const db = getDbManager();
  
  try {
    const pattern = db.prepare(`
      SELECT solution, root_cause, pattern_description
      FROM issue_patterns
      WHERE pattern_id = ?
    `).get(patternId);
    
    if (!pattern) {
      return null;
    }
    
    return {
      solution: pattern.solution,
      rootCause: pattern.root_cause ? JSON.parse(pattern.root_cause) : null,
      description: pattern.pattern_description
    };
  } catch (error) {
    logger.error(`[SharedIssues] 获取模式解决方案失败:`, error);
    return null;
  }
}