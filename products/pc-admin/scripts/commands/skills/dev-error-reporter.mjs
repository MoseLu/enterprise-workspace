/**
 * 开发错误上报模块
 * 支持上报到 Cursor Chat 或错误监控服务器
 */

import { openCursorAgent } from '../tools/open-cursor-agent.mjs';
import { logger } from './utils/logger.mjs';
import { SEVERITY } from './dev-error-classifier.mjs';
import { getMonitorServer } from './dev-error-monitor-server.mjs';

/**
 * 格式化错误信息用于上报
 * @param {object} error - 错误对象
 * @param {object} dbRecord - 数据库记录
 * @returns {string} 格式化的错误信息
 */
function formatErrorForReport(error, dbRecord) {
  const lines = [];
  
  lines.push(`🚨 开发错误检测到`);
  lines.push('');
  
  // 严重程度
  const severityEmoji = {
    [SEVERITY.CRITICAL]: '🔴',
    [SEVERITY.ERROR]: '❌',
    [SEVERITY.WARNING]: '⚠️',
    [SEVERITY.INFO]: 'ℹ️'
  };
  
  lines.push(`${severityEmoji[error.severity] || '❓'} 严重程度: ${error.severity.toUpperCase()}`);
  lines.push(`📦 类型: ${error.errorType || 'unknown'}`);
  
  if (error.packageName) {
    lines.push(`📁 工作空间: ${error.packageName}`);
  }
  
  if (error.filePath) {
    lines.push(`📄 文件: ${error.filePath}`);
    if (error.lineNumber) {
      lines.push(`📍 位置: 第 ${error.lineNumber} 行${error.columnNumber ? `, 第 ${error.columnNumber} 列` : ''}`);
    }
  }
  
  lines.push('');
  lines.push('错误信息:');
  lines.push('```');
  lines.push(error.errorMessage);
  lines.push('```');
  
  if (error.rawOutput && error.rawOutput !== error.errorMessage) {
    lines.push('');
    lines.push('原始输出:');
    lines.push('```');
    lines.push(error.rawOutput.substring(0, 500)); // 限制长度
    lines.push('```');
  }
  
  if (dbRecord && dbRecord.occurrence_count > 1) {
    lines.push('');
    lines.push(`⚠️ 此错误已出现 ${dbRecord.occurrence_count} 次`);
  }
  
  lines.push('');
  lines.push('请帮我解决这个问题。');
  
  return lines.join('\n');
}

/**
 * 上报错误到监控服务器
 * @param {object} error - 错误对象
 * @param {object} dbRecord - 数据库记录
 * @param {object} options - 选项
 */
export async function reportErrorToMonitor(error, dbRecord, options = {}) {
  try {
    const monitorServer = getMonitorServer();
    
    // 合并错误信息和数据库记录
    const errorData = {
      ...error,
      occurrence_count: dbRecord?.occurrence_count || 1,
      timestamp: error.timestamp || Date.now()
    };
    
    // 广播到监控服务器（实时推送）
    monitorServer.broadcastError(errorData);
    
    logger.debug(`[DevErrorReporter] 错误已实时发送到监控服务器: ${error.errorHash.substring(0, 8)}...`);
    
    return true;
  } catch (error) {
    logger.error('[DevErrorReporter] 上报到监控服务器失败:', error);
    return false;
  }
}

/**
 * 上报错误到 Cursor
 * @param {object} error - 错误对象
 * @param {object} dbRecord - 数据库记录
 * @param {object} options - 选项
 */
export async function reportErrorToCursor(error, dbRecord, options = {}) {
  try {
    const formattedMessage = formatErrorForReport(error, dbRecord);
    
    logger.info(`[DevErrorReporter] 准备上报错误: ${error.errorHash.substring(0, 8)}...`);
    
    // 打开新的 Cursor Chat
    await openCursorAgent({
      context: `开发错误 - ${error.packageName || '未知工作空间'}`,
      initialPrompt: formattedMessage,
      shortcut: 'Ctrl+L'
    });
    
    logger.info(`[DevErrorReporter] 错误已上报到 Cursor Chat`);
    
    return true;
  } catch (error) {
    logger.error('[DevErrorReporter] 上报错误失败:', error);
    return false;
  }
}

/**
 * 上报错误（默认使用监控服务器）
 * @param {object} error - 错误对象
 * @param {object} dbRecord - 数据库记录
 * @param {object} options - 选项
 */
export async function reportError(error, dbRecord, options = {}) {
  // 默认使用监控服务器，如果 options.useCursor 为 true，则使用 Cursor
  if (options.useCursor) {
    return await reportErrorToCursor(error, dbRecord, options);
  } else {
    return await reportErrorToMonitor(error, dbRecord, options);
  }
}

/**
 * 批量上报错误
 * @param {Array} errors - 错误列表
 * @param {object} options - 选项
 */
export async function reportErrorsBatch(errors, options = {}) {
  if (!errors || errors.length === 0) {
    return;
  }
  
  // 按严重程度排序
  const severityOrder = {
    [SEVERITY.CRITICAL]: 4,
    [SEVERITY.ERROR]: 3,
    [SEVERITY.WARNING]: 2,
    [SEVERITY.INFO]: 1
  };
  
  errors.sort((a, b) => {
    const aLevel = severityOrder[a.severity] || 0;
    const bLevel = severityOrder[b.severity] || 0;
    return bLevel - aLevel;
  });
  
  // 只上报最严重的错误（避免打开太多 Chat）
  const topErrors = errors.slice(0, options.maxReports || 3);
  
  logger.info(`[DevErrorReporter] 准备批量上报 ${topErrors.length} 个错误`);
  
  for (const error of topErrors) {
    // 获取数据库记录
    const { getDbManager } = await import('./database/db.mjs');
    const db = getDbManager();
    const dbRecord = db.prepare(`
      SELECT * FROM dev_errors WHERE error_hash = ?
    `).get(error.errorHash);
    
    // 使用监控服务器上报（默认），除非明确指定使用 Cursor
    await reportError(error, dbRecord, options);
  }
}
