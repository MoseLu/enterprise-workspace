/**
 * 日志系统集成
 * 将skill执行数据统一上报到日志平台
 * 使用 pino logger 自动上报
 */

import { getPinoLogger } from '../../utils/pino-logger.mjs';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// 创建专用的 pino logger
const logger = getPinoLogger({
  name: 'skill-execution',
  appName: 'agent-skill',
  enableReport: true,
  reportMinLevel: 'info',
});

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
 * 获取日志namespace
 * @param {string} skillName - skill名称
 * @returns {string} namespace
 */
function getLogNamespace(skillName) {
  const config = getConfig();
  const prefix = config.data_collection?.log_namespace_prefix || 'agent-skill';
  return `${prefix}:${skillName}`;
}

/**
 * 上报skill执行数据到日志平台
 * @param {string} skillName - skill名称
 * @param {string} executionId - 执行ID
 * @param {object} data - 执行数据
 */
export function logSkillExecution(skillName, executionId, data) {
  const namespace = getLogNamespace(skillName);
  
  try {
    // 使用现有的日志系统记录
    logger.info(`[${namespace}] 执行记录`, {
      execution_id: executionId,
      skill_name: skillName,
      ...data
    });
    
    // 如果存在dev-error-monitor服务，可以上报到那里
    // 这里先使用logger，后续可以扩展为HTTP上报
    if (process.env.DEV_ERROR_MONITOR_URL) {
      // TODO: 实现HTTP上报到监控服务
      // fetch(process.env.DEV_ERROR_MONITOR_URL, {
      //   method: 'POST',
      //   body: JSON.stringify({ namespace, executionId, data })
      // });
    }
  } catch (error) {
    logger.error(`[LoggingIntegration] 上报日志失败:`, error);
  }
}

/**
 * 上报skill错误到日志平台
 * @param {string} skillName - skill名称
 * @param {string} executionId - 执行ID
 * @param {Error} error - 错误对象
 * @param {object} context - 上下文
 */
export function logSkillError(skillName, executionId, error, context = {}) {
  const namespace = getLogNamespace(skillName);
  
  try {
    logger.error(`[${namespace}] 执行错误`, {
      execution_id: executionId,
      skill_name: skillName,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      ...context
    });
  } catch (err) {
    logger.error(`[LoggingIntegration] 上报错误日志失败:`, err);
  }
}

/**
 * 上报skill性能指标
 * @param {string} skillName - skill名称
 * @param {string} executionId - 执行ID
 * @param {object} metrics - 性能指标
 */
export function logSkillMetrics(skillName, executionId, metrics) {
  const namespace = getLogNamespace(skillName);
  
  try {
    logger.info(`[${namespace}] 性能指标`, {
      execution_id: executionId,
      skill_name: skillName,
      metrics
    });
  } catch (error) {
    logger.error(`[LoggingIntegration] 上报性能指标失败:`, error);
  }
}
