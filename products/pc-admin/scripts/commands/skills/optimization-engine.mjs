/**
 * 自动优化引擎
 * 分析执行数据，识别优化机会，生成并应用优化方案
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readSkillFile, writeSkillFile, backupSkillFile } from './utils/file-helper.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractOptimizationSuggestionsFromConversations } from './conversation-analyzer.mjs';
import { createSkillVersion, getCurrentMetrics } from './version-manager.mjs';
import { validateOptimization } from './skill-validator.mjs';
import { autoUpdateSkillRules } from './rule-updater.mjs';

/**
 * 读取配置
 */
function getConfig() {
  try {
    const configPath = join(process.cwd(), '.claude', 'skills-meta', 'config.json');
    const configContent = readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    return {
      optimization_thresholds: {
        min_success_rate: 0.8,
        min_avg_rating: 3.5,
        max_avg_iterations: 3
      },
      analysis_window: 20,
      auto_optimize_enabled: true,
      backup_before_optimize: true
    };
  }
}

/**
 * 检查是否需要优化
 * @param {string} skillName - skill名称
 * @returns {object} 优化检查结果
 */
export function checkOptimizationNeeded(skillName) {
  const db = getDbManager();
  const config = getConfig();
  const thresholds = config.optimization_thresholds || {};
  
  try {
    const metrics = db.prepare('SELECT * FROM skill_metrics WHERE skill_name = ?').get(skillName);
    
    // 检查对话场景中的优化建议
    const conversationSuggestions = extractOptimizationSuggestionsFromConversations(skillName);
    if (conversationSuggestions.length > 0) {
      return {
        needed: true,
        reasons: [`从对话场景中发现 ${conversationSuggestions.length} 条优化建议`],
        metrics: metrics || null,
        conversationBased: true
      };
    }
    
    if (!metrics || metrics.total_executions < 5) {
      return {
        needed: false,
        reason: '执行次数不足，需要至少5次执行记录，且无对话场景数据'
      };
    }
    
    const reasons = [];
    
    if (metrics.success_rate < (thresholds.min_success_rate || 0.8)) {
      reasons.push(`成功率过低: ${(metrics.success_rate * 100).toFixed(1)}% < ${(thresholds.min_success_rate * 100)}%`);
    }
    
    if (metrics.avg_rating < (thresholds.min_avg_rating || 3.5)) {
      reasons.push(`平均评分过低: ${metrics.avg_rating.toFixed(2)} < ${thresholds.min_avg_rating}`);
    }
    
    if (metrics.avg_iterations > (thresholds.max_avg_iterations || 3)) {
      reasons.push(`平均迭代次数过高: ${metrics.avg_iterations.toFixed(2)} > ${thresholds.max_avg_iterations}`);
    }
    
    return {
      needed: reasons.length > 0,
      reasons,
      metrics
    };
  } catch (error) {
    logger.error(`[OptimizationEngine] 检查优化需求失败:`, error);
    return {
      needed: false,
      reason: '检查失败: ' + error.message
    };
  }
}

/**
 * 分析执行数据，识别优化机会
 * @param {string} skillName - skill名称
 * @returns {array} 优化建议列表
 */
export function analyzeOptimizationOpportunities(skillName) {
  const db = getDbManager();
  const config = getConfig();
  const window = config.analysis_window || 20;
  
  try {
    const suggestions = [];
    
    // 从对话场景中提取优化建议
    try {
      const conversationSuggestions = extractOptimizationSuggestionsFromConversations(skillName);
      
      for (const suggestion of conversationSuggestions) {
        suggestions.push({
          type: suggestion.type,
          priority: 'medium',
          description: `[来自对话] ${suggestion.description} (出现${suggestion.occurrenceCount}次)`,
          recommendation: suggestion.recommendation,
          source: 'conversation'
        });
      }
    } catch (error) {
      logger.warn(`[OptimizationEngine] 从对话中提取建议失败:`, error);
    }
    
    // 获取最近的执行记录
    const recentExecutions = db.prepare(`
      SELECT * FROM executions
      WHERE skill_name = ?
      ORDER BY start_time DESC
      LIMIT ?
    `).all(skillName, window);
    
    if (recentExecutions.length === 0) {
      return suggestions;
    }
    
    // 分析失败模式
    const failedExecutions = recentExecutions.filter(e => e.status === 'failed');
    if (failedExecutions.length > recentExecutions.length * 0.3) {
      suggestions.push({
        type: 'failure_pattern',
        priority: 'high',
        description: `失败率过高: ${((failedExecutions.length / recentExecutions.length) * 100).toFixed(1)}%`,
        recommendation: '分析失败原因，在SKILL.md中添加常见问题解决方案',
        source: 'execution'
      });
    }
    
    // 分析步骤完成度
    const steps = db.prepare(`
      SELECT es.* FROM execution_steps es
      INNER JOIN executions e ON es.execution_id = e.execution_id
      WHERE e.skill_name = ?
        AND e.start_time >= (SELECT start_time FROM executions WHERE skill_name = ? ORDER BY start_time DESC LIMIT 1 OFFSET ?)
      ORDER BY es.step_order
    `).all(skillName, skillName, window - 1);
    
    const stepCompletion = {};
    for (const step of steps) {
      if (!stepCompletion[step.step_name]) {
        stepCompletion[step.step_name] = { total: 0, completed: 0, avgScore: 0, scores: [] };
      }
      stepCompletion[step.step_name].total++;
      if (step.status === 'completed') {
        stepCompletion[step.step_name].completed++;
      }
      if (step.completion_score) {
        stepCompletion[step.step_name].scores.push(step.completion_score);
      }
    }
    
    for (const [stepName, stats] of Object.entries(stepCompletion)) {
      const completionRate = stats.completed / stats.total;
      const avgScore = stats.scores.length > 0 
        ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length 
        : 0;
      
      if (completionRate < 0.7 || avgScore < 0.7) {
        suggestions.push({
          type: 'step_improvement',
          priority: 'medium',
          description: `步骤 "${stepName}" 完成度低: ${(completionRate * 100).toFixed(1)}%, 平均评分: ${avgScore.toFixed(2)}`,
          recommendation: `在SKILL.md中加强该步骤的说明，添加更多示例`,
          source: 'execution'
        });
      }
    }
    
    // 分析用户反馈
    const feedbackAnalysis = db.prepare(`
      SELECT user_feedback_raw, user_feedback_analyzed
      FROM executions
      WHERE skill_name = ? AND user_feedback_raw IS NOT NULL
      ORDER BY start_time DESC
      LIMIT ?
    `).all(skillName, window);
    
    const commonIssues = {};
    for (const feedback of feedbackAnalysis) {
      if (feedback.user_feedback_analyzed) {
        try {
          const analyzed = JSON.parse(feedback.user_feedback_analyzed);
          if (analyzed.issues) {
            for (const issue of analyzed.issues) {
              commonIssues[issue] = (commonIssues[issue] || 0) + 1;
            }
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
    
    for (const [issue, count] of Object.entries(commonIssues)) {
      if (count >= 3) {
        suggestions.push({
          type: 'common_issue',
          priority: 'high',
          description: `常见问题: "${issue}" (出现${count}次)`,
          recommendation: `在SKILL.md的"常见问题"部分添加该问题的解决方案`,
          source: 'execution'
        });
      }
    }
    
    return suggestions;
  } catch (error) {
    logger.error(`[OptimizationEngine] 分析优化机会失败:`, error);
    return [];
  }
}

/**
 * 生成优化后的SKILL.md内容
 * @param {string} skillName - skill名称
 * @param {array} suggestions - 优化建议
 * @returns {string} 优化后的内容
 */
export function generateOptimizedContent(skillName, suggestions) {
  try {
    const originalContent = readSkillFile(skillName);
    let optimizedContent = originalContent;
    
    // 根据建议应用优化
    for (const suggestion of suggestions) {
      if (suggestion.type === 'common_issue') {
        // 添加常见问题部分
        if (!optimizedContent.includes('## 常见问题')) {
          optimizedContent += '\n\n## 常见问题\n\n';
        }
        optimizedContent += `${suggestion.description}\n解决方案: ${suggestion.recommendation}\n\n`;
      } else if (suggestion.type === 'step_improvement') {
        // 在相关步骤处添加说明
        const stepName = suggestion.description.match(/"([^"]+)"/)?.[1];
        if (stepName && optimizedContent.includes(stepName)) {
          // 在步骤后添加注意事项
          const stepPattern = new RegExp(`(${stepName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\n]*)`, 'g');
          optimizedContent = optimizedContent.replace(stepPattern, (match) => {
            return match + `\n> 注意: ${suggestion.recommendation}`;
          });
        }
      }
    }
    
    return optimizedContent;
  } catch (error) {
    logger.error(`[OptimizationEngine] 生成优化内容失败:`, error);
    return null;
  }
}

/**
 * 应用优化
 * @param {string} skillName - skill名称
 * @param {array} suggestions - 优化建议
 * @returns {object} 优化结果
 */
export function applyOptimization(skillName, suggestions, options = {}) {
  const config = getConfig();
  
  if (!config.auto_optimize_enabled) {
    return {
      success: false,
      reason: '自动优化已禁用'
    };
  }
  
  try {
    // 获取优化前的指标
    const metricsBefore = getCurrentMetrics(skillName);
    
    // 备份原文件
    let beforeContent = readSkillFile(skillName);
    if (config.backup_before_optimize || config.skill_versioning?.auto_backup) {
      backupSkillFile(skillName);
    }
    
    // 生成优化内容
    const optimizedContent = generateOptimizedContent(skillName, suggestions);
    if (!optimizedContent) {
      return {
        success: false,
        reason: '生成优化内容失败'
      };
    }
    
    // 如果是规则更新类型的优化，使用规则更新器
    const ruleUpdates = suggestions.filter(s => s.type === 'rule_update');
    if (ruleUpdates.length > 0) {
      const ruleUpdateResult = autoUpdateSkillRules(skillName);
      if (ruleUpdateResult.success) {
        logger.info(`[OptimizationEngine] 规则已自动更新: ${skillName}`);
      }
    }
    
    // 应用优化
    writeSkillFile(skillName, optimizedContent);
    
    // 创建新版本
    const versionResult = createSkillVersion(skillName, {
      changeSummary: `自动优化: ${suggestions.length} 条建议`,
      createdBy: options.createdBy || 'optimization-engine'
    });
    
    // 记录优化历史
    const db = getDbManager();
    const optimizationId = `opt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    db.prepare(`
      INSERT INTO optimizations (
        skill_name, optimization_id, trigger_reason, before_content,
        after_content, metrics_improvement
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      skillName,
      optimizationId,
      JSON.stringify(suggestions.map(s => s.description)),
      beforeContent,
      optimizedContent,
      JSON.stringify({ before: metricsBefore })
    );
    
    // 更新skill版本
    db.prepare(`
      UPDATE skill_metrics SET
        last_optimized_at = strftime('%s', 'now'),
        current_version = ?,
        updated_at = strftime('%s', 'now')
      WHERE skill_name = ?
    `).run(versionResult.version, skillName);
    
    // 如果启用验证，执行验证
    if (config.validation?.enable_pre_update_validation) {
      setTimeout(() => {
        // 异步验证，不阻塞优化流程
        validateOptimization(optimizationId).catch(err => {
          logger.warn(`[OptimizationEngine] 验证失败:`, err.message);
        });
      }, 1000);
    }
    
    logger.info(`[OptimizationEngine] 优化已应用: ${skillName} (${optimizationId}), 版本=${versionResult.version}`);
    
    return {
      success: true,
      optimizationId,
      version: versionResult.version,
      suggestionsApplied: suggestions.length,
      metricsBefore
    };
  } catch (error) {
    logger.error(`[OptimizationEngine] 应用优化失败:`, error);
    return {
      success: false,
      reason: error.message
    };
  }
}

/**
 * 自动优化流程
 * @param {string} skillName - skill名称
 * @param {object} options - 选项
 * @returns {object} 优化结果
 */
export function autoOptimize(skillName, options = {}) {
  logger.info(`[OptimizationEngine] 开始自动优化: ${skillName}`);
  
  // 检查是否需要优化（包括对话场景数据）
  const checkResult = checkOptimizationNeeded(skillName);
  if (!checkResult.needed && !options.force) {
    logger.info(`[OptimizationEngine] 无需优化: ${checkResult.reason || '指标正常'}`);
    return {
      optimized: false,
      reason: checkResult.reason
    };
  }
  
  // 分析优化机会（包括从对话场景中提取的建议）
  const suggestions = analyzeOptimizationOpportunities(skillName);
  if (suggestions.length === 0) {
    logger.info(`[OptimizationEngine] 未发现优化机会`);
    return {
      optimized: false,
      reason: '未发现优化机会'
    };
  }
  
  logger.info(`[OptimizationEngine] 发现 ${suggestions.length} 条优化建议（${suggestions.filter(s => s.source === 'conversation').length}条来自对话）`);
  
  // 应用优化
  const result = applyOptimization(skillName, suggestions, options);
  
  return {
    optimized: result.success,
    ...result
  };
}
