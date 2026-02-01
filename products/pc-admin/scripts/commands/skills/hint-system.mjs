/**
 * 智能提示系统
 * 支持首次执行详细询问和经验模式智能提示
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * 读取配置
 */
function getConfig() {
  try {
    const configPath = join(process.cwd(), '.claude', 'skills-meta', 'config.json');
    const configContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    logger.warn('[HintSystem] 读取配置失败，使用默认配置');
    return {
      hint_system: {
        enable_hints: true,
        first_execution_mode: true,
        detailed_questioning_enabled: true,
        hint_accuracy_threshold: 0.5,
        hint_success_threshold: 0.8,
        min_hint_confidence: 0.6,
        hint_weight_increment: 0.1,
        hint_weight_decrement: 0.1
      }
    };
  }
}

/**
 * 检查是否为首次执行
 * @param {string} skillName - skill名称
 * @returns {boolean}
 */
export function isFirstExecution(skillName) {
  const db = getDbManager();
  
  try {
    const result = db.prepare(`
      SELECT is_first_execution FROM skill_metrics WHERE skill_name = ?
    `).get(skillName);
    
    return result ? result.is_first_execution === 1 : true;
  } catch (error) {
    logger.error(`[HintSystem] 检查首次执行失败:`, error);
    return true; // 默认视为首次执行
  }
}

/**
 * 生成首次执行询问清单
 * @param {string} skillName - skill名称
 * @param {string} skillType - skill类型（可选）
 * @returns {array} 询问项列表
 */
export function generateFirstExecutionQuestions(skillName, skillType = null) {
  const config = getConfig();
  
  if (!config.hint_system?.detailed_questioning_enabled) {
    return [];
  }
  
  // 基于skill类型生成通用询问清单
  const baseQuestions = [
    {
      question: '是否需要检查依赖项或服务配置？',
      category: 'dependency',
      hint_type: 'dependency_check'
    },
    {
      question: '是否需要更新配置文件？',
      category: 'config',
      hint_type: 'config_update'
    },
    {
      question: '是否需要更新国际化文件？',
      category: 'i18n',
      hint_type: 'i18n_update'
    },
    {
      question: '是否需要添加路由配置？',
      category: 'routing',
      hint_type: 'routing_config'
    },
    {
      question: '是否需要添加权限配置？',
      category: 'permission',
      hint_type: 'permission_config'
    },
    {
      question: '是否需要检查常见错误或拼写错误？',
      category: 'error_check',
      hint_type: 'error_prevention'
    }
  ];
  
  // 根据skill类型添加特定问题
  const typeSpecificQuestions = [];
  
  if (skillType === 'page-creator' || skillName.includes('page')) {
    typeSpecificQuestions.push(
      {
        question: '是否需要添加新增、删除、批量删除、编辑、打印、导出功能？',
        category: 'features',
        hint_type: 'feature_completeness'
      },
      {
        question: '是否需要检查后端服务是否存在？是否拼写正确？',
        category: 'service',
        hint_type: 'service_validation'
      }
    );
  }
  
  return [...baseQuestions, ...typeSpecificQuestions];
}

/**
 * 获取提示建议
 * @param {string} skillName - skill名称
 * @param {string} stepPattern - 步骤模式
 * @param {object} context - 执行上下文
 * @returns {array} 提示列表
 */
export function getHintSuggestions(skillName, stepPattern, context = {}) {
  const db = getDbManager();
  const config = getConfig();
  
  if (!config.hint_system?.enable_hints) {
    return [];
  }
  
  // 检查是否为首次执行
  if (isFirstExecution(skillName)) {
    return generateFirstExecutionQuestions(skillName, context.skillType);
  }
  
  // 经验模式：从提示库获取
  try {
    const hints = db.prepare(`
      SELECT * FROM hint_suggestions
      WHERE skill_name = ? 
        AND is_active = 1
        AND accuracy_score >= ?
      ORDER BY accuracy_score DESC, success_count DESC
      LIMIT 10
    `).all(skillName, config.hint_system.hint_accuracy_threshold || 0.5);
    
    // 根据步骤模式过滤
    const matchedHints = hints.filter(hint => {
      if (!hint.step_pattern) return true;
      
      // 简单的模式匹配（可以后续优化）
      return stepPattern.includes(hint.step_pattern) || 
             hint.step_pattern.includes(stepPattern);
    });
    
    return matchedHints.map(hint => ({
      hintId: hint.id,
      question: hint.hint_text,
      hintType: hint.hint_type,
      accuracyScore: hint.accuracy_score,
      category: hint.hint_type
    }));
  } catch (error) {
    logger.error(`[HintSystem] 获取提示建议失败:`, error);
    return [];
  }
}

/**
 * 记录提示反馈
 * @param {string} executionId - 执行ID
 * @param {number} stepId - 步骤ID（可选）
 * @param {number} hintId - 提示ID
 * @param {object} feedback - 反馈数据
 */
export function recordHintFeedback(executionId, stepId, hintId, feedback) {
  const db = getDbManager();
  const config = getConfig();
  
  try {
    // 记录反馈
    db.prepare(`
      INSERT INTO hint_feedback (
        execution_id, step_id, hint_id, user_response, 
        is_helpful, feedback_type, feedback_time
      ) VALUES (?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `).run(
      executionId,
      stepId || null,
      hintId,
      feedback.user_response || null,
      feedback.is_helpful ? 1 : 0,
      feedback.feedback_type || 'explicit'
    );
    
    // 更新提示统计
    const hint = db.prepare('SELECT * FROM hint_suggestions WHERE id = ?').get(hintId);
    if (hint) {
      const isHelpful = feedback.is_helpful === true;
      const newSuccessCount = hint.success_count + (isHelpful ? 1 : 0);
      const newFailureCount = hint.failure_count + (isHelpful ? 0 : 1);
      const total = newSuccessCount + newFailureCount;
      const newAccuracyScore = total > 0 ? newSuccessCount / total : 0;
      
      // 更新权重
      let weightChange = 0;
      if (isHelpful) {
        weightChange = config.hint_system?.hint_weight_increment || 0.1;
      } else {
        weightChange = -(config.hint_system?.hint_weight_decrement || 0.1);
      }
      
      // 如果准确率太低，禁用提示
      const shouldDisable = newAccuracyScore < (config.hint_system?.hint_accuracy_threshold || 0.5);
      
      db.prepare(`
        UPDATE hint_suggestions SET
          success_count = ?,
          failure_count = ?,
          accuracy_score = ?,
          last_used_at = strftime('%s', 'now'),
          is_active = ?
        WHERE id = ?
      `).run(
        newSuccessCount,
        newFailureCount,
        newAccuracyScore,
        shouldDisable ? 0 : 1,
        hintId
      );
      
      logger.info(`[HintSystem] 提示反馈已记录: hint_id=${hintId}, is_helpful=${isHelpful}, accuracy=${newAccuracyScore.toFixed(2)}`);
    }
  } catch (error) {
    logger.error(`[HintSystem] 记录提示反馈失败:`, error);
  }
}

/**
 * 将首次执行的询问结果转换为提示库条目
 * @param {string} skillName - skill名称
 * @param {array} questionResults - 询问结果
 */
export function convertQuestionsToHints(skillName, questionResults) {
  const db = getDbManager();
  
  try {
    for (const result of questionResults) {
      if (!result.question || !result.hint_type) continue;
      
      // 检查是否已存在
      const existing = db.prepare(`
        SELECT id FROM hint_suggestions
        WHERE skill_name = ? AND hint_text = ?
      `).get(skillName, result.question);
      
      if (existing) {
        continue; // 已存在，跳过
      }
      
      // 创建新提示
      const isHelpful = result.user_response === 'yes' || result.user_response === true;
      
      db.prepare(`
        INSERT INTO hint_suggestions (
          skill_name, step_pattern, hint_text, hint_type,
          trigger_conditions, success_count, failure_count,
          accuracy_score, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        skillName,
        result.step_pattern || null,
        result.question,
        result.hint_type,
        JSON.stringify(result.trigger_conditions || {}),
        isHelpful ? 1 : 0,
        isHelpful ? 0 : 1,
        isHelpful ? 1.0 : 0.0,
        1
      );
    }
    
    logger.info(`[HintSystem] 已将 ${questionResults.length} 个询问结果转换为提示库条目`);
  } catch (error) {
    logger.error(`[HintSystem] 转换询问结果为提示失败:`, error);
  }
}
