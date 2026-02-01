/**
 * 技能验证系统
 * 技能更新前，在测试环境验证
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getExecution, getExecutionSteps } from './execution-tracker.mjs';
import { checkSkillMetricsThreshold } from './metrics-definition.mjs';

/**
 * 读取配置
 */
function getConfig() {
  try {
    const configPath = join(process.cwd(), '.claude', 'skills-meta', 'config.json');
    if (existsSync(configPath)) {
      const configContent = readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    }
  } catch (error) {
    // 忽略配置读取错误
  }
  return {};
}

/**
 * 验证优化效果
 * @param {string} optimizationId - 优化ID
 * @param {object} options - 选项
 * @returns {object} 验证结果
 */
export function validateOptimization(optimizationId, options = {}) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.validation?.enable_pre_update_validation) {
    return {
      success: false,
      message: '验证未启用'
    };
  }
  
  try {
    // 获取优化记录
    const optimization = db.prepare(`
      SELECT * FROM optimizations WHERE optimization_id = ?
    `).get(optimizationId);
    
    if (!optimization) {
      return {
        success: false,
        message: '优化记录不存在'
      };
    }
    
    const { skill_name, metrics_improvement } = optimization;
    
    // 获取优化前后的指标
    const metricsBefore = optimization.metrics_improvement 
      ? JSON.parse(optimization.metrics_improvement).before 
      : null;
    
    // 获取当前指标（优化后）
    const metricsAfter = getCurrentMetrics(skill_name);
    
    // 使用历史执行数据验证
    const testResults = validateWithHistoricalData(skill_name, options);
    
    // 计算改进分数
    const improvementScore = calculateImprovementScore(metricsBefore, metricsAfter);
    
    // 检查是否达到最小改进阈值
    const minThreshold = config.validation?.min_improvement_threshold || 0.05;
    const passed = improvementScore >= minThreshold;
    
    // 保存验证结果
    const validationStatus = passed ? 'passed' : 'failed';
    const stmt = db.prepare(`
      INSERT INTO optimization_validations (
        optimization_id, validation_status, test_results,
        metrics_comparison, improvement_score, validated_at
      ) VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
    stmt.run(
      optimizationId,
      validationStatus,
      JSON.stringify(testResults),
      JSON.stringify({ before: metricsBefore, after: metricsAfter }),
      improvementScore
    );
    
    logger.info(`[SkillValidator] 优化验证完成: ${optimizationId}, 状态=${validationStatus}, 改进分数=${improvementScore.toFixed(3)}`);
    
    return {
      success: true,
      optimizationId,
      validationStatus,
      improvementScore,
      passed,
      metricsBefore,
      metricsAfter,
      testResults
    };
  } catch (error) {
    logger.error(`[SkillValidator] 验证优化失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 使用历史数据验证
 * @param {string} skillName - skill名称
 * @param {object} options - 选项
 * @returns {object} 测试结果
 */
function validateWithHistoricalData(skillName, options = {}) {
  const config = getConfig();
  const db = getDbManager();
  
  const dataSources = config.validation?.test_data_sources || ['historical_executions'];
  const results = {
    historicalExecutions: null,
    conversationScenarios: null
  };
  
  try {
    // 从历史执行数据验证
    if (dataSources.includes('historical_executions')) {
      const executions = db.prepare(`
        SELECT execution_id, status, inferred_rating, explicit_rating
        FROM executions
        WHERE skill_name = ?
        ORDER BY start_time DESC
        LIMIT 20
      `).all(skillName);
      
      if (executions.length > 0) {
        const successCount = executions.filter(e => e.status === 'completed').length;
        const avgRating = executions.reduce((sum, e) => {
          const rating = e.explicit_rating || e.inferred_rating || 0;
          return sum + rating;
        }, 0) / executions.length;
        
        results.historicalExecutions = {
          total: executions.length,
          successCount,
          successRate: successCount / executions.length,
          avgRating
        };
      }
    }
    
    // 从对话场景验证
    if (dataSources.includes('conversation_scenarios')) {
      const scenarios = db.prepare(`
        SELECT confidence_score, optimization_suggestions
        FROM conversation_scenarios
        WHERE related_skill_name = ?
        ORDER BY created_at DESC
        LIMIT 20
      `).all(skillName);
      
      if (scenarios.length > 0) {
        const avgConfidence = scenarios.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / scenarios.length;
        const hasSuggestions = scenarios.filter(s => s.optimization_suggestions).length;
        
        results.conversationScenarios = {
          total: scenarios.length,
          avgConfidence,
          hasSuggestions,
          suggestionRate: hasSuggestions / scenarios.length
        };
      }
    }
  } catch (error) {
    logger.error(`[SkillValidator] 历史数据验证失败:`, error);
  }
  
  return results;
}

/**
 * 计算改进分数
 * @param {object} metricsBefore - 优化前指标
 * @param {object} metricsAfter - 优化后指标
 * @returns {number} 改进分数
 */
function calculateImprovementScore(metricsBefore, metricsAfter) {
  if (!metricsBefore || !metricsAfter) {
    return 0;
  }
  
  let totalImprovement = 0;
  let weightSum = 0;
  
  // 成功率改进（权重0.4）
  if (metricsBefore.success_rate !== undefined && metricsAfter.success_rate !== undefined) {
    const improvement = metricsAfter.success_rate - metricsBefore.success_rate;
    totalImprovement += improvement * 0.4;
    weightSum += 0.4;
  }
  
  // 平均评分改进（权重0.3）
  if (metricsBefore.avg_rating !== undefined && metricsAfter.avg_rating !== undefined) {
    const improvement = (metricsAfter.avg_rating - metricsBefore.avg_rating) / 5; // 归一化到0-1
    totalImprovement += improvement * 0.3;
    weightSum += 0.3;
  }
  
  // 迭代次数改进（权重0.2，迭代越少越好）
  if (metricsBefore.avg_iterations !== undefined && metricsAfter.avg_iterations !== undefined) {
    const improvement = (metricsBefore.avg_iterations - metricsAfter.avg_iterations) / Math.max(metricsBefore.avg_iterations, 1);
    totalImprovement += Math.max(0, improvement) * 0.2;
    weightSum += 0.2;
  }
  
  // 执行时间改进（权重0.1，时间越短越好）
  if (metricsBefore.avg_duration !== undefined && metricsAfter.avg_duration !== undefined) {
    const improvement = (metricsBefore.avg_duration - metricsAfter.avg_duration) / Math.max(metricsBefore.avg_duration, 1);
    totalImprovement += Math.max(0, improvement) * 0.1;
    weightSum += 0.1;
  }
  
  return weightSum > 0 ? totalImprovement / weightSum : 0;
}

/**
 * 获取当前指标
 * @param {string} skillName - skill名称
 * @returns {object} 指标
 */
function getCurrentMetrics(skillName) {
  const db = getDbManager();
  
  try {
    const metrics = db.prepare(`
      SELECT * FROM skill_metrics WHERE skill_name = ?
    `).get(skillName);
    
    if (!metrics) {
      return null;
    }
    
    return {
      success_rate: metrics.success_rate,
      avg_rating: metrics.avg_rating,
      avg_iterations: metrics.avg_iterations,
      avg_duration: metrics.avg_duration
    };
  } catch (error) {
    return null;
  }
}

/**
 * 验证技能是否可以通过测试
 * @param {string} skillName - skill名称
 * @param {array} testCases - 测试用例
 * @returns {object} 验证结果
 */
export function validateSkillWithTestCases(skillName, testCases = []) {
  // 这里可以实现更详细的测试用例验证
  // 例如：使用历史执行数据作为测试用例，模拟执行并验证结果
  
  const results = {
    passed: 0,
    failed: 0,
    total: testCases.length,
    details: []
  };
  
  // TODO: 实现测试用例执行逻辑
  // 这需要能够模拟skill执行并验证输出
  
  return results;
}
