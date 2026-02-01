/**
 * 持续迭代触发机制
 * 实现定时触发、阈值触发、场景触发三种方式
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { checkOptimizationNeeded, autoOptimize } from './optimization-engine.mjs';
import { analyzeRootCause } from './root-cause-analyzer.mjs';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
 * 定时触发优化（每周）
 * @param {string} skillName - skill名称（可选，不提供则处理所有skills）
 * @returns {object} 触发结果
 */
export function scheduleWeeklyOptimization(skillName = null) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.iteration_scheduling?.enable_auto_iteration) {
    return {
      success: false,
      message: '自动迭代未启用'
    };
  }
  
  try {
    const skills = skillName 
      ? [skillName]
      : db.prepare(`
          SELECT skill_name FROM skill_metrics
          WHERE total_executions >= 5
        `).all().map(r => r.skill_name);
    
    const results = [];
    
    for (const skill of skills) {
      // 检查是否需要优化
      const optimizationCheck = checkOptimizationNeeded(skill);
      
      if (optimizationCheck.needed) {
        logger.info(`[IterationScheduler] 定时优化触发: ${skill}`);
        
        // 执行优化
        const optimizationResult = autoOptimize(skill);
        
        results.push({
          skillName: skill,
          triggered: true,
          reason: 'scheduled_weekly',
          optimizationResult
        });
      } else {
        results.push({
          skillName: skill,
          triggered: false,
          reason: optimizationCheck.reason || '不需要优化'
        });
      }
    }
    
    logger.info(`[IterationScheduler] 定时优化完成: 处理=${results.length}个skills, 触发=${results.filter(r => r.triggered).length}个`);
    
    return {
      success: true,
      triggerType: 'scheduled_weekly',
      results
    };
  } catch (error) {
    logger.error(`[IterationScheduler] 定时优化失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 阈值触发优化
 * @param {string} skillName - skill名称
 * @returns {object} 触发结果
 */
export function triggerThresholdOptimization(skillName) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.iteration_scheduling?.enable_auto_iteration) {
    return {
      success: false,
      message: '自动迭代未启用'
    };
  }
  
  try {
    const thresholds = config.iteration_scheduling?.threshold_triggers || {};
    const metrics = db.prepare(`
      SELECT * FROM skill_metrics WHERE skill_name = ?
    `).get(skillName);
    
    if (!metrics) {
      return {
        success: false,
        message: '技能指标不存在'
      };
    }
    
    const triggers = [];
    
    // 检查成功率阈值
    if (thresholds.success_rate && metrics.success_rate < thresholds.success_rate) {
      triggers.push({
        metric: 'success_rate',
        value: metrics.success_rate,
        threshold: thresholds.success_rate,
        severity: 'high'
      });
    }
    
    // 检查平均评分阈值
    if (thresholds.avg_rating && metrics.avg_rating < thresholds.avg_rating) {
      triggers.push({
        metric: 'avg_rating',
        value: metrics.avg_rating,
        threshold: thresholds.avg_rating,
        severity: 'high'
      });
    }
    
    if (triggers.length === 0) {
      return {
        success: false,
        message: '未达到触发阈值'
      };
    }
    
    logger.warn(`[IterationScheduler] 阈值触发优化: ${skillName}, 触发数=${triggers.length}`);
    
    // 执行紧急优化
    const optimizationResult = autoOptimize(skillName, {
      priority: 'urgent',
      triggers
    });
    
    return {
      success: true,
      triggerType: 'threshold',
      skillName,
      triggers,
      optimizationResult
    };
  } catch (error) {
    logger.error(`[IterationScheduler] 阈值触发优化失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 场景触发优化
 * @param {string} skillName - skill名称
 * @param {string} scenario - 场景类型
 * @returns {object} 触发结果
 */
export function triggerScenarioOptimization(skillName, scenario) {
  const config = getConfig();
  
  if (!config.iteration_scheduling?.enable_auto_iteration) {
    return {
      success: false,
      message: '自动迭代未启用'
    };
  }
  
  const scenarioTriggers = config.iteration_scheduling?.scenario_triggers || [];
  
  if (!scenarioTriggers.includes(scenario)) {
    return {
      success: false,
      message: `场景 ${scenario} 不在触发列表中`
    };
  }
  
  try {
    logger.info(`[IterationScheduler] 场景触发优化: ${skillName}, 场景=${scenario}`);
    
    // 执行根因分析，识别场景适配问题
    const rootCauseAnalysis = analyzeRootCause(skillName);
    
    // 执行优化
    const optimizationResult = autoOptimize(skillName, {
      priority: 'scenario_adaptation',
      scenario,
      rootCauseAnalysis
    });
    
    return {
      success: true,
      triggerType: 'scenario',
      skillName,
      scenario,
      rootCauseAnalysis,
      optimizationResult
    };
  } catch (error) {
    logger.error(`[IterationScheduler] 场景触发优化失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 检查并触发所有类型的优化
 * @param {object} options - 选项
 * @returns {object} 触发结果
 */
export function checkAndTriggerOptimizations(options = {}) {
  const config = getConfig();
  const db = getDbManager();
  
  if (!config.iteration_scheduling?.enable_auto_iteration) {
    return {
      success: false,
      message: '自动迭代未启用'
    };
  }
  
  try {
    // 获取所有skills
    const skills = db.prepare(`
      SELECT skill_name FROM skill_metrics
      WHERE total_executions >= 3
    `).all().map(r => r.skill_name);
    
    const results = {
      thresholdTriggers: [],
      scenarioTriggers: [],
      scheduledTriggers: []
    };
    
    // 检查阈值触发
    for (const skillName of skills) {
      const thresholdResult = triggerThresholdOptimization(skillName);
      if (thresholdResult.success) {
        results.thresholdTriggers.push(thresholdResult);
      }
    }
    
    // 检查场景触发（如果提供了场景）
    if (options.scenario) {
      for (const skillName of skills) {
        const scenarioResult = triggerScenarioOptimization(skillName, options.scenario);
        if (scenarioResult.success) {
          results.scenarioTriggers.push(scenarioResult);
        }
      }
    }
    
    // 检查定时触发（如果启用）
    if (options.includeScheduled) {
      const scheduledResult = scheduleWeeklyOptimization();
      if (scheduledResult.success) {
        results.scheduledTriggers = scheduledResult.results.filter(r => r.triggered);
      }
    }
    
    const totalTriggered = 
      results.thresholdTriggers.length +
      results.scenarioTriggers.length +
      results.scheduledTriggers.length;
    
    logger.info(`[IterationScheduler] 优化检查完成: 阈值=${results.thresholdTriggers.length}, 场景=${results.scenarioTriggers.length}, 定时=${results.scheduledTriggers.length}`);
    
    return {
      success: true,
      totalTriggered,
      results
    };
  } catch (error) {
    logger.error(`[IterationScheduler] 检查并触发优化失败:`, error);
    return {
      success: false,
      error: error.message
    };
  }
}
