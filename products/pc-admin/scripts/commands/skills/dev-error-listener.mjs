/**
 * 开发错误监听器
 * 监听开发进程的输出，捕获并分类错误
 */

import { EventEmitter } from 'events';
import { classifyError, extractErrorDetails, generateErrorHash, SEVERITY } from './dev-error-classifier.mjs';
import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { getMonitorServer } from './dev-error-monitor-server.mjs';

/**
 * 开发错误监听器类
 */
export class DevErrorListener extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      minSeverity: options.minSeverity || SEVERITY.WARNING, // 最低报告级别
      autoReport: options.autoReport !== false, // 是否自动上报
      reportThreshold: options.reportThreshold || 1, // 出现多少次后上报
      debounceMs: options.debounceMs || 2000, // 防抖时间（毫秒）
      ...options
    };
    
    this.buffer = [];
    this.maxBufferSize = 1000; // 限制缓冲区大小，防止内存泄漏
    this.errorBuffer = new Map(); // errorHash -> errorData
    this.maxErrorBufferSize = 500; // 限制错误缓冲区大小，防止内存泄漏
    this.debounceTimer = null;
    this.isListening = false;
  }
  
  /**
   * 开始监听
   */
  start() {
    if (this.isListening) {
      return;
    }
    this.isListening = true;
    this.emit('start');
    logger.info('[DevErrorListener] 开始监听开发错误...');
  }
  
  /**
   * 停止监听
   */
  stop() {
    if (!this.isListening) {
      return;
    }
    this.isListening = false;
    this.flush();
    
    // 清理资源，防止内存泄漏
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    // 清理缓冲区（保留少量数据用于调试）
    this.buffer = [];
    // 清空错误缓冲区，释放内存
    this.errorBuffer.clear();
    
    this.emit('stop');
    logger.info('[DevErrorListener] 停止监听开发错误');
  }
  
  /**
   * 处理一行输出
   * @param {string} line - 输出行
   * @param {string} source - 来源（stdout/stderr）
   */
  processLine(line, source = 'stdout') {
    if (!this.isListening) {
      return;
    }
    
    // 分类错误
    const classification = classifyError(line);
    
    if (!classification) {
      // 不是错误，直接返回
      return;
    }
    
    // 调试日志：记录捕获到的错误
    logger.debug(`[DevErrorListener] 捕获到错误: ${classification.type} - ${classification.severity} - ${line.substring(0, 100)}`);
    
    // 检查严重程度阈值
    const severityLevels = {
      [SEVERITY.CRITICAL]: 4,
      [SEVERITY.ERROR]: 3,
      [SEVERITY.WARNING]: 2,
      [SEVERITY.INFO]: 1
    };
    
    const minLevel = severityLevels[this.options.minSeverity] || 2;
    const errorLevel = severityLevels[classification.severity] || 0;
    
    if (errorLevel < minLevel) {
      return; // 低于阈值，忽略
    }
    
    // 提取错误详情
    const errorDetails = extractErrorDetails(line, classification);
    const errorHash = generateErrorHash(errorDetails);
    
    // 构建完整错误对象
    const errorData = {
      errorHash,
      severity: classification.severity,
      errorType: classification.type,
      isError: classification.isError,
      fixable: classification.fixable || false,  // 标记是否可修复（用于构建警告等）
      suggestion: classification.suggestion,  // 解决建议
      errorMessage: errorDetails.errorMessage,
      filePath: errorDetails.filePath,
      lineNumber: errorDetails.lineNumber,
      columnNumber: errorDetails.columnNumber,
      workspaceName: errorDetails.workspaceName,
      packageName: errorDetails.packageName,
      rawOutput: line,
      source,
      timestamp: Date.now()
    };
    
    // 限制缓冲区大小，防止内存泄漏
    if (this.buffer.length >= this.maxBufferSize) {
      this.buffer.shift(); // 删除最旧的条目
    }
    
    // 存储到缓冲区
    this.buffer.push(errorData);
    
    // 限制错误缓冲区大小，防止内存泄漏
    if (this.errorBuffer.size >= this.maxErrorBufferSize) {
      // 删除最旧的错误（按插入顺序）
      const firstKey = this.errorBuffer.keys().next().value;
      if (firstKey) {
        this.errorBuffer.delete(firstKey);
      }
    }
    
    this.errorBuffer.set(errorHash, errorData);
    
    // 根据错误类型触发不同的事件
    // 注意：EventEmitter 的 'error' 事件如果没有监听器会抛出未处理的错误
    // 所以对于警告，使用 'warning' 事件；对于真正的错误，使用 'error' 事件
    if (errorData.isError) {
      // 真正的错误：触发 'error' 事件（需要调用者监听）
      this.emit('error', errorData);
    } else {
      // 警告：触发 'warning' 事件，避免未处理的错误
      this.emit('warning', errorData);
    }
    
    // 立即广播到监控服务器（实时显示，不等待防抖）
    // 这样所有错误都能实时显示在监控界面上
    try {
      const monitorServer = getMonitorServer();
      if (monitorServer) {
        if (monitorServer.server) {
          // 合并错误信息和统计
          const errorDataForMonitor = {
            ...errorData,
            occurrence_count: 1, // 临时值，实际值会在保存后更新
            timestamp: errorData.timestamp || Date.now()
          };
          monitorServer.broadcastError(errorDataForMonitor);
          // 只在 debug 模式下输出日志
          logger.debug(`[DevErrorListener] 已广播错误到监控服务器: ${errorData.errorType} - ${errorData.packageName || '未知'}`);
        } else {
          logger.debug('[DevErrorListener] 监控服务器未启动，跳过广播');
        }
      } else {
        logger.debug('[DevErrorListener] 无法获取监控服务器实例');
      }
    } catch (err) {
      // 监控服务器可能还未启动，记录错误但不阻塞错误处理流程
      logger.debug(`[DevErrorListener] 广播到监控服务器失败: ${err.message}`);
    }
    
    // 对于严重错误（CRITICAL/ERROR），立即保存并检查上报，不等待防抖
    // 这样可以确保严重错误实时上报到监控界面
    if (errorData.severity === SEVERITY.CRITICAL || errorData.severity === SEVERITY.ERROR) {
      // 立即保存并检查上报（异步执行，不阻塞主流程）
      (async () => {
        try {
          // 先保存到数据库
          await this.saveErrors([errorData]);
          // 保存完成后立即检查并上报（如果满足条件）
          if (this.options.autoReport) {
            await this.checkAndReport([errorData]);
          }
        } catch (err) {
          logger.error('[DevErrorListener] 立即保存错误失败:', err);
        }
      })();
    }
    
    // 防抖处理：延迟保存和上报（用于警告和非严重错误）
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.options.debounceMs);
  }
  
  /**
   * 处理输出块（可能包含多行）
   * @param {Buffer|string} chunk - 输出块
   * @param {string} source - 来源
   */
  processChunk(chunk, source = 'stdout') {
    if (!chunk) {
      return;
    }
    
    const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    const lines = text.split(/\r?\n/);
    
    for (const line of lines) {
      if (line.trim()) {
        this.processLine(line, source);
      }
    }
  }
  
  /**
   * 刷新缓冲区，保存到数据库
   */
  async flush() {
    if (this.buffer.length === 0) {
      return Promise.resolve();
    }
    
    const errorsToSave = [...this.buffer];
    this.buffer = [];
    
    try {
      await this.saveErrors(errorsToSave);
      
      // 检查是否需要上报
      if (this.options.autoReport) {
        await this.checkAndReport(errorsToSave);
      }
    } catch (error) {
      logger.error('[DevErrorListener] 保存错误失败:', error);
    }
  }
  
  /**
   * 保存错误到数据库
   * @param {Array} errors - 错误列表
   */
  async saveErrors(errors) {
    const db = getDbManager();
    
    for (const error of errors) {
      try {
        // 检查是否已存在
        const existing = db.prepare(`
          SELECT id, occurrence_count, reported_to_cursor
          FROM dev_errors
          WHERE error_hash = ?
        `).get(error.errorHash);
        
        if (existing) {
          // 更新现有记录
          db.prepare(`
            UPDATE dev_errors SET
              occurrence_count = occurrence_count + 1,
              last_seen_at = strftime('%s', 'now'),
              updated_at = strftime('%s', 'now'),
              raw_output = ?,
              error_message = ?,
              file_path = ?,
              line_number = ?,
              column_number = ?,
              workspace_name = ?,
              package_name = ?,
              context = ?
            WHERE error_hash = ?
          `).run(
              error.rawOutput,
              error.errorMessage,
              error.filePath,
              error.lineNumber,
              error.columnNumber,
              error.workspaceName,
              error.packageName,
              JSON.stringify({
                source: error.source,
                timestamp: error.timestamp,
                fixable: error.fixable || false  // 标记是否可修复（用于构建警告等）
              }),
              error.errorHash
          );
        } else {
          // 插入新记录
          db.prepare(`
            INSERT INTO dev_errors (
              error_hash, severity, error_type, workspace_name, package_name,
              error_message, error_stack, file_path, line_number, column_number,
              raw_output, occurrence_count, context
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
          `).run(
            error.errorHash,
            error.severity,
            error.errorType,
            error.workspaceName,
            error.packageName,
            error.errorMessage,
            null, // error_stack
            error.filePath,
            error.lineNumber,
            error.columnNumber,
            error.rawOutput,
            JSON.stringify({
              source: error.source,
              timestamp: error.timestamp,
              fixable: error.fixable || false  // 标记是否可修复（用于构建警告等）
            })
          );
        }
      } catch (dbError) {
        logger.error(`[DevErrorListener] 保存错误到数据库失败:`, dbError);
      }
    }
    
    logger.debug(`[DevErrorListener] 已保存 ${errors.length} 个错误到数据库`);
  }
  
  /**
   * 检查并上报错误
   * @param {Array} errors - 错误列表
   */
  async checkAndReport(errors) {
    const db = getDbManager();
    
    for (const error of errors) {
      try {
        // 获取数据库中的记录（重新查询，确保获取最新的 occurrence_count）
        const dbRecord = db.prepare(`
          SELECT id, occurrence_count, reported_to_cursor, severity
          FROM dev_errors
          WHERE error_hash = ?
        `).get(error.errorHash);
        
        if (!dbRecord) {
          // 如果记录不存在，可能是保存失败，跳过
          continue;
        }
        
        // 检查是否需要上报
        // 对于严重错误，只要达到阈值就立即上报（不等待防抖）
        const isSevereError = error.severity === SEVERITY.CRITICAL || error.severity === SEVERITY.ERROR;
        const shouldReport = 
          !dbRecord.reported_to_cursor && // 未上报过
          dbRecord.occurrence_count >= this.options.reportThreshold && // 达到阈值（默认是1）
          isSevereError; // 只上报严重错误
        
        if (shouldReport) {
          // 立即触发上报事件（实时上报到监控服务器）
          this.emit('report', error, dbRecord);
          
          // 标记为已上报（避免重复上报）
          db.prepare(`
            UPDATE dev_errors SET
              reported_to_cursor = 1,
              reported_at = strftime('%s', 'now'),
              updated_at = strftime('%s', 'now')
            WHERE error_hash = ?
          `).run(error.errorHash);
        }
      } catch (err) {
        logger.error(`[DevErrorListener] 检查上报失败:`, err);
      }
    }
  }
  
  /**
   * 获取统计信息
   */
  getStats() {
    const db = getDbManager();
    
    try {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
          SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as errors,
          SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warnings,
          SUM(CASE WHEN reported_to_cursor = 1 THEN 1 ELSE 0 END) as reported,
          SUM(CASE WHEN resolved = 1 THEN 1 ELSE 0 END) as resolved
        FROM dev_errors
        WHERE last_seen_at >= strftime('%s', 'now', '-1 day')
      `).get();
      
      return stats || {
        total: 0,
        critical: 0,
        errors: 0,
        warnings: 0,
        reported: 0,
        resolved: 0
      };
    } catch (error) {
      logger.error('[DevErrorListener] 获取统计信息失败:', error);
      return {
        total: 0,
        critical: 0,
        errors: 0,
        warnings: 0,
        reported: 0,
        resolved: 0
      };
    }
  }
}
