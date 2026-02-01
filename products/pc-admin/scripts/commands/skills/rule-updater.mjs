/**
 * 规则驱动型技能自动更新器
 * 从问题知识库中提取规则，自动更新技能检测逻辑
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readSkillFile, writeSkillFile } from './utils/file-helper.mjs';
import { searchIssuePatterns, getPatternSolution } from './shared-issues-center.mjs';
import { createSkillVersion } from './version-manager.mjs';

/**
 * 更新技能规则
 * @param {string} skillName - skill名称
 * @param {array} ruleUpdates - 规则更新列表
 * @returns {object} 更新结果
 */
export function updateSkillRules(skillName, ruleUpdates) {
  try {
    // 读取当前skill内容
    let content = readSkillFile(skillName);
    
    const appliedUpdates = [];
    
    // 应用每个规则更新
    for (const update of ruleUpdates) {
      const result = applyRuleUpdate(content, update);
      if (result.success) {
        content = result.newContent;
        appliedUpdates.push({
          rule: update.rule,
          success: true,
          description: update.description
        });
      } else {
        appliedUpdates.push({
          rule: update.rule,
          success: false,
          error: result.error
        });
      }
    }
    
    if (appliedUpdates.filter(u => u.success).length === 0) {
      return {
        success: false,
        message: '没有规则更新被应用',
        updates: appliedUpdates
      };
    }
    
    // 保存更新后的内容
    writeSkillFile(skillName, content);
    
    // 创建新版本
    const versionResult = createSkillVersion(skillName, {
      changeSummary: `自动更新规则: ${appliedUpdates.filter(u => u.success).length} 条规则已应用`
    });
    
    logger.info(`[RuleUpdater] 技能规则已更新: ${skillName}, 应用=${appliedUpdates.filter(u => u.success).length}条`);
    
    return {
      success: true,
      skillName,
      version: versionResult.version,
      updates: appliedUpdates
    };
  } catch (error) {
    logger.error(`[RuleUpdater] 更新技能规则失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 应用单个规则更新
 * @param {string} content - 当前内容
 * @param {object} update - 规则更新
 * @returns {object} 结果
 */
function applyRuleUpdate(content, update) {
  try {
    const { rule, type, description } = update;
    
    // 根据规则类型应用更新
    switch (type) {
      case 'add_detection_rule':
        // 添加检测规则
        return addDetectionRule(content, rule, description);
      
      case 'update_detection_rule':
        // 更新检测规则
        return updateDetectionRule(content, rule, description);
      
      case 'add_solution':
        // 添加解决方案
        return addSolution(content, rule, description);
      
      default:
        return {
          success: false,
          error: `未知的规则更新类型: ${type}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 添加检测规则
 */
function addDetectionRule(content, rule, description) {
  // 在适当的位置插入检测规则
  // 这里使用简单的字符串插入，实际可以更智能
  const marker = '## 检测规则';
  const insertionPoint = content.indexOf(marker);
  
  if (insertionPoint === -1) {
    // 如果没有标记，在文件末尾添加
    const newSection = `\n\n## 检测规则\n\n${description}\n\n${rule}\n`;
    return {
      success: true,
      newContent: content + newSection
    };
  }
  
  // 在标记后插入
  const before = content.substring(0, insertionPoint + marker.length);
  const after = content.substring(insertionPoint + marker.length);
  const newContent = before + `\n\n${description}\n\n${rule}\n` + after;
  
  return {
    success: true,
    newContent
  };
}

/**
 * 更新检测规则
 */
function updateDetectionRule(content, rule, description) {
  // 查找并替换现有规则
  // 这里使用简单的字符串替换，实际可以更智能
  const oldRulePattern = new RegExp(rule.oldPattern || rule.pattern, 'g');
  
  if (oldRulePattern.test(content)) {
    const newContent = content.replace(oldRulePattern, rule.newPattern || rule.pattern);
    return {
      success: true,
      newContent
    };
  }
  
  // 如果找不到旧规则，添加新规则
  return addDetectionRule(content, rule, description);
}

/**
 * 添加解决方案
 */
function addSolution(content, rule, description) {
  const marker = '## 常见问题';
  const insertionPoint = content.indexOf(marker);
  
  if (insertionPoint === -1) {
    // 如果没有标记，在文件末尾添加
    const newSection = `\n\n## 常见问题\n\n### ${description}\n\n${rule}\n`;
    return {
      success: true,
      newContent: content + newSection
    };
  }
  
  // 在标记后插入
  const before = content.substring(0, insertionPoint + marker.length);
  const after = content.substring(insertionPoint + marker.length);
  const newContent = before + `\n\n### ${description}\n\n${rule}\n` + after;
  
  return {
    success: true,
    newContent
  };
}

/**
 * 从问题知识库自动提取规则更新
 * @param {string} skillName - skill名称
 * @returns {array} 规则更新列表
 */
export function extractRuleUpdatesFromKnowledgeBase(skillName) {
  const db = getDbManager();
  
  try {
    // 获取相关的问题模式
    const patterns = searchIssuePatterns({
      skill_name: skillName,
      limit: 10
    });
    
    const updates = [];
    
    for (const pattern of patterns) {
      if (pattern.issue_type === 'rule_defect' && pattern.solution) {
        // 从解决方案中提取规则
        const solution = getPatternSolution(pattern.pattern_id);
        
        if (solution && solution.solution) {
          updates.push({
            rule: solution.solution,
            type: 'add_detection_rule',
            description: pattern.pattern_description,
            source: 'issue_pattern',
            patternId: pattern.pattern_id,
            confidence: pattern.confidence_score
          });
        }
      }
    }
    
    // 按置信度排序
    updates.sort((a, b) => b.confidence - a.confidence);
    
    logger.info(`[RuleUpdater] 从知识库提取规则更新: ${skillName}, 规则数=${updates.length}`);
    
    return updates;
  } catch (error) {
    logger.error(`[RuleUpdater] 提取规则更新失败:`, error);
    return [];
  }
}

/**
 * 自动更新技能规则（从知识库）
 * @param {string} skillName - skill名称
 * @returns {object} 更新结果
 */
export function autoUpdateSkillRules(skillName) {
  try {
    // 从知识库提取规则更新
    const ruleUpdates = extractRuleUpdatesFromKnowledgeBase(skillName);
    
    if (ruleUpdates.length === 0) {
      return {
        success: false,
        message: '没有找到可用的规则更新'
      };
    }
    
    // 应用规则更新
    return updateSkillRules(skillName, ruleUpdates);
  } catch (error) {
    logger.error(`[RuleUpdater] 自动更新技能规则失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}
