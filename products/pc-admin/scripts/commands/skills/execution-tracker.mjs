/**
 * 执行跟踪器
 * 记录skill执行的详细信息，包括步骤级别跟踪
 * 使用 pino logger 自动上报日志
 */

import { getDbManager } from './database/db.mjs';
import { getPinoLogger } from '../../utils/pino-logger.mjs';
import { randomBytes } from 'crypto';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';

// 创建专用的 pino logger
const logger = getPinoLogger({
  name: 'execution-tracker',
  appName: 'agent-skill',
  enableReport: true,
  reportMinLevel: 'info',
});

/**
 * 生成执行ID
 */
function generateExecutionId() {
  const timestamp = Date.now();
  const random = randomBytes(4).toString('hex');
  return `exec_${timestamp}_${random}`;
}

/**
 * 创建执行记录
 * @param {string} skillName - skill名称
 * @param {object} context - 执行上下文
 * @returns {string} execution_id
 */
export function createExecution(skillName, context = {}) {
  const db = getDbManager();
  const executionId = generateExecutionId();
  const startTime = Date.now();
  
  try {
    const stmt = db.prepare(`
      INSERT INTO executions (
        skill_name, execution_id, start_time, status, context, iterations
      ) VALUES (?, ?, ?, 'running', ?, 0)
    `);
    
    stmt.run(skillName, executionId, startTime, JSON.stringify(context));
    
    // 自动捕获项目状态（如果启用）
    try {
      const config = getConfig();
      if (config.data_collection?.capture_project_state) {
        captureProjectState(executionId);
      }
    } catch (err) {
      logger.warn(`[ExecutionTracker] 捕获项目状态失败:`, err.message);
    }
    
    logger.info(`[ExecutionTracker] 创建执行记录: ${skillName} (${executionId})`);
    return executionId;
  } catch (error) {
    logger.error(`[ExecutionTracker] 创建执行记录失败:`, error);
    throw error;
  }
}

/**
 * 更新执行记录
 * @param {string} executionId - 执行ID
 * @param {object} updates - 更新数据
 */
export function updateExecution(executionId, updates) {
  const db = getDbManager();
  
  const allowedFields = [
    'status', 'end_time', 'user_feedback_raw', 'user_feedback_analyzed',
    'inferred_rating', 'explicit_rating', 'multi_dimension_scores',
    'step_scores', 'iterations', 'metrics', 'context', 'summary'
  ];
  
  const updateFields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      if (typeof value === 'object' && value !== null) {
        updateFields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
  }
  
  if (updateFields.length === 0) {
    return;
  }
  
  updateFields.push('updated_at = strftime(\'%s\', \'now\')');
  values.push(executionId);
  
  try {
    const sql = `UPDATE executions SET ${updateFields.join(', ')} WHERE execution_id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values);
    
    logger.debug(`[ExecutionTracker] 更新执行记录: ${executionId}`);
  } catch (error) {
    logger.error(`[ExecutionTracker] 更新执行记录失败:`, error);
    throw error;
  }
}

/**
 * 完成执行记录
 * @param {string} executionId - 执行ID
 * @param {object} result - 执行结果
 */
export function completeExecution(executionId, result = {}) {
  const endTime = Date.now();
  
  const updates = {
    status: result.status || 'completed',
    end_time: endTime,
    ...result
  };
  
  updateExecution(executionId, updates);
  
  // 更新skill指标
  updateSkillMetrics(executionId);
  
  logger.info(`[ExecutionTracker] 执行完成: ${executionId}`);
}

/**
 * 创建步骤记录
 * @param {string} executionId - 执行ID
 * @param {string} stepName - 步骤名称
 * @param {number} stepOrder - 步骤顺序
 * @param {string} stepType - 步骤类型
 * @param {object} context - 步骤上下文
 * @returns {number} step_id
 */
export function createStep(executionId, stepName, stepOrder, stepType = null, context = {}) {
  const db = getDbManager();
  const startTime = Date.now();
  
  try {
    const stmt = db.prepare(`
      INSERT INTO execution_steps (
        execution_id, step_name, step_order, start_time, status, step_type, context_snapshot
      ) VALUES (?, ?, ?, ?, 'running', ?, ?)
    `);
    
    const result = stmt.run(
      executionId,
      stepName,
      stepOrder,
      startTime,
      stepType,
      JSON.stringify(context)
    );
    
    const stepId = result.lastInsertRowid;
    logger.debug(`[ExecutionTracker] 创建步骤记录: ${stepName} (step_id: ${stepId})`);
    return stepId;
  } catch (error) {
    logger.error(`[ExecutionTracker] 创建步骤记录失败:`, error);
    throw error;
  }
}

/**
 * 更新步骤记录
 * @param {number} stepId - 步骤ID
 * @param {object} updates - 更新数据
 */
export function updateStep(stepId, updates) {
  const db = getDbManager();
  
  const allowedFields = [
    'end_time', 'status', 'completion_score', 'error_message',
    'hints_shown', 'hints_feedback', 'context_snapshot'
  ];
  
  const updateFields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      if (typeof value === 'object' && value !== null) {
        updateFields.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }
  }
  
  if (updateFields.length === 0) {
    return;
  }
  
  values.push(stepId);
  
  try {
    const sql = `UPDATE execution_steps SET ${updateFields.join(', ')} WHERE id = ?`;
    const stmt = db.prepare(sql);
    stmt.run(...values);
    
    logger.debug(`[ExecutionTracker] 更新步骤记录: step_id ${stepId}`);
  } catch (error) {
    logger.error(`[ExecutionTracker] 更新步骤记录失败:`, error);
    throw error;
  }
}

/**
 * 完成步骤记录
 * @param {number} stepId - 步骤ID
 * @param {object} result - 步骤结果
 */
export function completeStep(stepId, result = {}) {
  const endTime = Date.now();
  
  const updates = {
    end_time: endTime,
    status: result.status || 'completed',
    completion_score: result.completion_score ?? 1.0,
    error_message: result.error_message || null,
    ...result
  };
  
  updateStep(stepId, updates);
  logger.debug(`[ExecutionTracker] 步骤完成: step_id ${stepId}`);
}

/**
 * 计算步骤综合评分
 * @param {string} executionId - 执行ID
 * @param {object} config - 配置（权重等）
 * @returns {object} 评分结果
 */
export function calculateStepScores(executionId, config = {}) {
  const db = getDbManager();
  
  const criticalWeight = config.critical_step_weight || 2.0;
  const normalWeight = config.normal_step_weight || 1.0;
  
  try {
    const steps = db.prepare(`
      SELECT id, step_name, step_order, completion_score, step_type, status
      FROM execution_steps
      WHERE execution_id = ?
      ORDER BY step_order
    `).all(executionId);
    
    if (steps.length === 0) {
      return {
        totalScore: 0,
        averageScore: 0,
        stepCount: 0,
        stepScores: []
      };
    }
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    const stepScores = [];
    
    for (const step of steps) {
      const isCritical = step.step_type === 'critical' || step.status === 'failed';
      const weight = isCritical ? criticalWeight : normalWeight;
      const score = step.completion_score || 0;
      
      totalWeightedScore += score * weight;
      totalWeight += weight;
      
      stepScores.push({
        stepId: step.id,
        stepName: step.step_name,
        stepOrder: step.step_order,
        score,
        weight,
        isCritical
      });
    }
    
    const averageScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    
    return {
      totalScore: totalWeightedScore,
      averageScore,
      stepCount: steps.length,
      stepScores
    };
  } catch (error) {
    logger.error(`[ExecutionTracker] 计算步骤评分失败:`, error);
    return {
      totalScore: 0,
      averageScore: 0,
      stepCount: 0,
      stepScores: []
    };
  }
}

/**
 * 更新skill指标
 * @param {string} executionId - 执行ID
 */
function updateSkillMetrics(executionId) {
  const db = getDbManager();
  
  try {
    const execution = db.prepare(`
      SELECT skill_name, status, end_time, start_time, 
             inferred_rating, explicit_rating, iterations
      FROM executions
      WHERE execution_id = ?
    `).get(executionId);
    
    if (!execution) {
      return;
    }
    
    const { skill_name, status, end_time, start_time, inferred_rating, explicit_rating, iterations } = execution;
    const duration = end_time ? (end_time - start_time) / 1000 : 0; // 秒
    const rating = explicit_rating || inferred_rating || 0;
    const isSuccess = status === 'completed';
    
    // 获取当前指标
    const current = db.prepare('SELECT * FROM skill_metrics WHERE skill_name = ?').get(skill_name);
    
    if (!current) {
      // 创建新记录
      db.prepare(`
        INSERT INTO skill_metrics (
          skill_name, total_executions, success_rate, avg_rating,
          avg_iterations, avg_duration, is_first_execution
        ) VALUES (?, 1, ?, ?, ?, ?, 0)
      `).run(skill_name, isSuccess ? 1.0 : 0.0, rating, iterations || 0, duration);
    } else {
      // 更新现有记录
      const totalExecutions = current.total_executions + 1;
      const successCount = Math.round(current.success_rate * current.total_executions) + (isSuccess ? 1 : 0);
      const newSuccessRate = successCount / totalExecutions;
      
      const currentRatingSum = current.avg_rating * current.total_executions;
      const newAvgRating = (currentRatingSum + rating) / totalExecutions;
      
      const currentIterationsSum = current.avg_iterations * current.total_executions;
      const newAvgIterations = (currentIterationsSum + (iterations || 0)) / totalExecutions;
      
      const currentDurationSum = current.avg_duration * current.total_executions;
      const newAvgDuration = (currentDurationSum + duration) / totalExecutions;
      
      db.prepare(`
        UPDATE skill_metrics SET
          total_executions = ?,
          success_rate = ?,
          avg_rating = ?,
          avg_iterations = ?,
          avg_duration = ?,
          is_first_execution = 0,
          updated_at = strftime('%s', 'now')
        WHERE skill_name = ?
      `).run(
        totalExecutions,
        newSuccessRate,
        newAvgRating,
        newAvgIterations,
        newAvgDuration,
        skill_name
      );
    }
    
    logger.debug(`[ExecutionTracker] 更新skill指标: ${skill_name}`);
  } catch (error) {
    logger.error(`[ExecutionTracker] 更新skill指标失败:`, error);
  }
}

/**
 * 获取执行记录
 * @param {string} executionId - 执行ID
 * @returns {object} 执行记录
 */
export function getExecution(executionId) {
  const db = getDbManager();
  
  try {
    const execution = db.prepare(`
      SELECT * FROM executions WHERE execution_id = ?
    `).get(executionId);
    
    if (!execution) {
      return null;
    }
    
    // 解析JSON字段
    const result = { ...execution };
    if (result.context) result.context = JSON.parse(result.context);
    if (result.metrics) result.metrics = JSON.parse(result.metrics);
    if (result.user_feedback_analyzed) result.user_feedback_analyzed = JSON.parse(result.user_feedback_analyzed);
    if (result.multi_dimension_scores) result.multi_dimension_scores = JSON.parse(result.multi_dimension_scores);
    if (result.step_scores) result.step_scores = JSON.parse(result.step_scores);
    
    return result;
  } catch (error) {
    logger.error(`[ExecutionTracker] 获取执行记录失败:`, error);
    return null;
  }
}

/**
 * 获取执行步骤列表
 * @param {string} executionId - 执行ID
 * @returns {array} 步骤列表
 */
export function getExecutionSteps(executionId) {
  const db = getDbManager();
  
  try {
    const steps = db.prepare(`
      SELECT * FROM execution_steps
      WHERE execution_id = ?
      ORDER BY step_order
    `).all(executionId);
    
    return steps.map(step => {
      const result = { ...step };
      if (result.context_snapshot) result.context_snapshot = JSON.parse(result.context_snapshot);
      if (result.hints_shown) result.hints_shown = JSON.parse(result.hints_shown);
      if (result.hints_feedback) result.hints_feedback = JSON.parse(result.hints_feedback);
      return result;
    });
  } catch (error) {
    logger.error(`[ExecutionTracker] 获取执行步骤失败:`, error);
    return [];
  }
}

/**
 * 生成执行摘要
 * @param {string} executionId - 执行ID
 * @returns {string} 执行摘要
 */
export function generateSummary(executionId) {
  const execution = getExecution(executionId);
  const steps = getExecutionSteps(executionId);
  
  if (!execution) {
    return '执行记录不存在';
  }
  
  const duration = execution.end_time 
    ? ((execution.end_time - execution.start_time) / 1000).toFixed(2)
    : '进行中';
  
  const summary = [
    `Skill: ${execution.skill_name}`,
    `状态: ${execution.status}`,
    `耗时: ${duration}秒`,
    `迭代次数: ${execution.iterations || 0}`,
    `步骤数: ${steps.length}`,
    `评分: ${execution.explicit_rating || execution.inferred_rating || 'N/A'}`
  ];
  
  if (steps.length > 0) {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    summary.push(`完成步骤: ${completedSteps}/${steps.length}`);
    
    const failedSteps = steps.filter(s => s.status === 'failed');
    if (failedSteps.length > 0) {
      summary.push(`失败步骤: ${failedSteps.map(s => s.step_name).join(', ')}`);
    }
  }
  
  return summary.join('\n');
}

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
 * 捕获项目状态快照
 * @param {string} executionId - 执行ID
 */
export function captureProjectState(executionId) {
  const db = getDbManager();
  
  try {
    const projectState = {
      git_commit: null,
      git_branch: null,
      package_versions: null,
      build_config: null,
      env_vars: null,
      node_version: null,
      pnpm_version: null
    };
    
    // 获取Git信息
    try {
      projectState.git_commit = execSync('git rev-parse HEAD', { encoding: 'utf-8', cwd: process.cwd() }).trim();
      projectState.git_branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', cwd: process.cwd() }).trim();
    } catch (err) {
      // Git不可用，忽略
    }
    
    // 获取Node和pnpm版本
    try {
      projectState.node_version = process.version;
      projectState.pnpm_version = execSync('pnpm --version', { encoding: 'utf-8', cwd: process.cwd() }).trim();
    } catch (err) {
      // 忽略
    }
    
    // 获取包版本信息
    try {
      const packageJsonPath = join(process.cwd(), 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        projectState.package_versions = {
          project_version: packageJson.version,
          package_manager: packageJson.packageManager || 'pnpm'
        };
      }
    } catch (err) {
      // 忽略
    }
    
    // 获取构建配置（简化版，只记录关键配置）
    try {
      const viteConfigPath = join(process.cwd(), 'vite.config.ts');
      if (existsSync(viteConfigPath)) {
        projectState.build_config = {
          has_vite_config: true,
          config_type: 'vite'
        };
      }
    } catch (err) {
      // 忽略
    }
    
    // 获取环境变量（只记录关键的环境变量，不记录敏感信息）
    projectState.env_vars = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      has_env_file: existsSync(join(process.cwd(), '.env'))
    };
    
    // 保存到数据库
    const stmt = db.prepare(`
      INSERT INTO project_state_snapshots (
        execution_id, git_commit, git_branch, package_versions,
        build_config, env_vars, node_version, pnpm_version, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'))
    `);
    
    stmt.run(
      executionId,
      projectState.git_commit,
      projectState.git_branch,
      JSON.stringify(projectState.package_versions),
      JSON.stringify(projectState.build_config),
      JSON.stringify(projectState.env_vars),
      projectState.node_version,
      projectState.pnpm_version
    );
    
    logger.debug(`[ExecutionTracker] 项目状态已捕获: ${executionId}`);
  } catch (error) {
    logger.error(`[ExecutionTracker] 捕获项目状态失败:`, error);
  }
}

/**
 * 记录执行错误
 * @param {string} executionId - 执行ID
 * @param {number|null} stepId - 步骤ID（可选）
 * @param {Error|object} error - 错误对象
 * @param {object} context - 额外上下文
 */
export function recordExecutionError(executionId, stepId, error, context = {}) {
  const db = getDbManager();
  
  try {
    const errorType = error.name || 'Error';
    const errorMessage = error.message || String(error);
    const stackTrace = error.stack || null;
    
    // 获取项目状态（如果可用）
    let projectState = null;
    try {
      const snapshot = db.prepare(`
        SELECT * FROM project_state_snapshots WHERE execution_id = ? LIMIT 1
      `).get(executionId);
      if (snapshot) {
        projectState = JSON.stringify(snapshot);
      }
    } catch (err) {
      // 忽略
    }
    
    const stmt = db.prepare(`
      INSERT INTO execution_errors (
        execution_id, step_id, error_type, error_message,
        stack_trace, context_snapshot, project_state
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      executionId,
      stepId,
      errorType,
      errorMessage,
      stackTrace,
      JSON.stringify(context),
      projectState
    );
    
    logger.debug(`[ExecutionTracker] 执行错误已记录: ${executionId}, error_type=${errorType}`);
  } catch (err) {
    logger.error(`[ExecutionTracker] 记录执行错误失败:`, err);
  }
}
