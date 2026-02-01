/**
 * 并行执行管理器
 * 提供统一管理接口，让主 skill 可以查询和管理子任务的 Chat ID、状态等信息
 */

import { getDbManager } from './database/db.mjs';
import { logger } from './utils/logger.mjs';
import { randomBytes } from 'crypto';

/**
 * 生成唯一的 Chat ID
 */
function generateChatId() {
  return `chat_${Date.now()}_${randomBytes(4).toString('hex')}`;
}

/**
 * 记录并行执行信息
 * @param {string} parentExecutionId - 父级执行 ID
 * @param {string} childSkillName - 子级 skill 名称
 * @param {string} taskDescription - 任务描述
 * @param {object} metadata - 额外元数据（chat_id, process_info 等）
 * @returns {string} 并行执行记录 ID
 */
export function recordParallelExecution(parentExecutionId, childSkillName, taskDescription, metadata = {}) {
  const db = getDbManager();
  
  const chatId = metadata.chatId || generateChatId();
  const processInfo = metadata.processInfo ? JSON.stringify(metadata.processInfo) : null;
  const fullMetadata = metadata.metadata ? JSON.stringify(metadata.metadata) : null;
  
  try {
    const result = db.prepare(`
      INSERT INTO parallel_executions (
        parent_execution_id,
        child_skill_name,
        chat_id,
        chat_url,
        process_info,
        task_description,
        status,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, 'opened', ?)
    `).run(
      parentExecutionId,
      childSkillName,
      chatId,
      metadata.chatUrl || null,
      processInfo,
      taskDescription,
      fullMetadata
    );
    
    logger.info(`[ParallelManager] 记录并行执行: ${childSkillName} (Chat ID: ${chatId})`);
    return chatId;
  } catch (error) {
    logger.error(`[ParallelManager] 记录并行执行失败:`, error);
    throw error;
  }
}

/**
 * 更新并行执行状态
 * @param {string} chatId - Chat ID
 * @param {string} status - 新状态 (opened, started, completed, failed, cancelled)
 * @param {object} updates - 其他更新字段
 */
export function updateParallelExecutionStatus(chatId, status, updates = {}) {
  const db = getDbManager();
  
  const updateFields = ['status = ?'];
  const updateValues = [status];
  
  if (updates.childExecutionId) {
    updateFields.push('child_execution_id = ?');
    updateValues.push(updates.childExecutionId);
  }
  
  if (updates.startedAt) {
    updateFields.push('started_at = ?');
    updateValues.push(updates.startedAt);
  }
  
  if (updates.completedAt) {
    updateFields.push('completed_at = ?');
    updateValues.push(updates.completedAt);
  }
  
  if (updates.processInfo) {
    updateFields.push('process_info = ?');
    updateValues.push(JSON.stringify(updates.processInfo));
  }
  
  if (updates.metadata) {
    updateFields.push('metadata = ?');
    updateValues.push(JSON.stringify(updates.metadata));
  }
  
  updateFields.push('updated_at = strftime(\'%s\', \'now\')');
  updateValues.push(chatId);
  
  try {
    const sql = `UPDATE parallel_executions SET ${updateFields.join(', ')} WHERE chat_id = ?`;
    db.prepare(sql).run(...updateValues);
    logger.info(`[ParallelManager] 更新并行执行状态: ${chatId} -> ${status}`);
  } catch (error) {
    logger.error(`[ParallelManager] 更新并行执行状态失败:`, error);
    throw error;
  }
}

/**
 * 获取父级执行的所有子任务
 * @param {string} parentExecutionId - 父级执行 ID
 * @returns {Array} 子任务列表
 */
export function getChildExecutions(parentExecutionId) {
  const db = getDbManager();
  
  try {
    const rows = db.prepare(`
      SELECT 
        id,
        parent_execution_id,
        child_execution_id,
        child_skill_name,
        chat_id,
        chat_url,
        process_info,
        task_description,
        status,
        opened_at,
        started_at,
        completed_at,
        metadata
      FROM parallel_executions
      WHERE parent_execution_id = ?
      ORDER BY opened_at ASC
    `).all(parentExecutionId);
    
    return rows.map(row => ({
      ...row,
      processInfo: row.process_info ? JSON.parse(row.process_info) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  } catch (error) {
    logger.error(`[ParallelManager] 获取子任务失败:`, error);
    return [];
  }
}

/**
 * 根据 Chat ID 获取并行执行信息
 * @param {string} chatId - Chat ID
 * @returns {object|null} 并行执行信息
 */
export function getParallelExecutionByChatId(chatId) {
  const db = getDbManager();
  
  try {
    const row = db.prepare(`
      SELECT 
        id,
        parent_execution_id,
        child_execution_id,
        child_skill_name,
        chat_id,
        chat_url,
        process_info,
        task_description,
        status,
        opened_at,
        started_at,
        completed_at,
        metadata
      FROM parallel_executions
      WHERE chat_id = ?
    `).get(chatId);
    
    if (!row) {
      return null;
    }
    
    return {
      ...row,
      processInfo: row.process_info ? JSON.parse(row.process_info) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    };
  } catch (error) {
    logger.error(`[ParallelManager] 获取并行执行信息失败:`, error);
    return null;
  }
}

/**
 * 获取并行执行统计信息
 * @param {string} parentExecutionId - 父级执行 ID
 * @returns {object} 统计信息
 */
export function getParallelExecutionStats(parentExecutionId) {
  const db = getDbManager();
  
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened,
        SUM(CASE WHEN status = 'started' THEN 1 ELSE 0 END) as started,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM parallel_executions
      WHERE parent_execution_id = ?
    `).get(parentExecutionId);
    
    return stats || {
      total: 0,
      opened: 0,
      started: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      closed: 0
    };
  } catch (error) {
    logger.error(`[ParallelManager] 获取统计信息失败:`, error);
    return {
      total: 0,
      opened: 0,
      started: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      closed: 0
    };
  }
}

/**
 * 获取所有活跃的并行执行（未完成的）
 * @param {string} parentExecutionId - 父级执行 ID
 * @returns {Array} 活跃的子任务列表
 */
export function getActiveChildExecutions(parentExecutionId) {
  const db = getDbManager();
  
  try {
    const rows = db.prepare(`
      SELECT 
        id,
        parent_execution_id,
        child_execution_id,
        child_skill_name,
        chat_id,
        chat_url,
        process_info,
        task_description,
        status,
        opened_at,
        started_at,
        metadata
      FROM parallel_executions
      WHERE parent_execution_id = ? 
        AND status IN ('opened', 'started')
      ORDER BY opened_at ASC
    `).all(parentExecutionId);
    
    return rows.map(row => ({
      ...row,
      processInfo: row.process_info ? JSON.parse(row.process_info) : null,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    }));
  } catch (error) {
    logger.error(`[ParallelManager] 获取活跃子任务失败:`, error);
    return [];
  }
}

/**
 * 标记所有子任务为已完成（用于主任务完成时）
 * @param {string} parentExecutionId - 父级执行 ID
 */
export function markAllChildrenCompleted(parentExecutionId) {
  const db = getDbManager();
  
  try {
    const result = db.prepare(`
      UPDATE parallel_executions
      SET status = 'completed',
          completed_at = strftime('%s', 'now'),
          updated_at = strftime('%s', 'now')
      WHERE parent_execution_id = ? 
        AND status IN ('opened', 'started')
    `).run(parentExecutionId);
    
    logger.info(`[ParallelManager] 标记 ${result.changes} 个子任务为已完成`);
    return result.changes;
  } catch (error) {
    logger.error(`[ParallelManager] 标记子任务完成失败:`, error);
    return 0;
  }
}

/**
 * 取消所有未完成的子任务
 * @param {string} parentExecutionId - 父级执行 ID
 */
export function cancelAllChildExecutions(parentExecutionId) {
  const db = getDbManager();
  
  try {
    const result = db.prepare(`
      UPDATE parallel_executions
      SET status = 'cancelled',
          updated_at = strftime('%s', 'now')
      WHERE parent_execution_id = ? 
        AND status IN ('opened', 'started')
    `).run(parentExecutionId);
    
    logger.info(`[ParallelManager] 取消 ${result.changes} 个子任务`);
    return result.changes;
  } catch (error) {
    logger.error(`[ParallelManager] 取消子任务失败:`, error);
    return 0;
  }
}

/**
 * 关闭所有子任务的 Chat（标记为已关闭）
 * @param {string} parentExecutionId - 父级执行 ID
 * @param {boolean} force - 是否强制关闭（不检查状态）
 * @returns {object} 关闭结果
 */
export function closeAllChildChats(parentExecutionId, force = false) {
  const db = getDbManager();
  
  try {
    // 获取所有需要关闭的子任务
    const activeChildren = getActiveChildExecutions(parentExecutionId);
    
    if (activeChildren.length === 0 && !force) {
      logger.info(`[ParallelManager] 没有活跃的子任务需要关闭`);
      return {
        closed: 0,
        chatIds: [],
        message: '没有活跃的子任务需要关闭'
      };
    }
    
    // 更新状态为已关闭（使用 'closed' 状态）
    const statusCondition = force 
      ? "status IN ('opened', 'started', 'completed')"
      : "status IN ('opened', 'started')";
    
    const result = db.prepare(`
      UPDATE parallel_executions
      SET status = 'closed',
          completed_at = CASE 
            WHEN completed_at IS NULL THEN strftime('%s', 'now')
            ELSE completed_at
          END,
          updated_at = strftime('%s', 'now'),
          metadata = json_set(
            COALESCE(metadata, '{}'),
            '$.closed_at', strftime('%s', 'now'),
            '$.closed_reason', 'parent_task_completed'
          )
      WHERE parent_execution_id = ? 
        AND ${statusCondition}
    `).run(parentExecutionId);
    
    const closedChatIds = activeChildren.map(child => child.chat_id).filter(Boolean);
    
    logger.info(`[ParallelManager] 已关闭 ${result.changes} 个子任务的 Chat`);
    
    return {
      closed: result.changes,
      chatIds: closedChatIds,
      message: `已关闭 ${result.changes} 个子任务的 Chat`
    };
  } catch (error) {
    logger.error(`[ParallelManager] 关闭子任务 Chat 失败:`, error);
    return {
      closed: 0,
      chatIds: [],
      message: `关闭失败: ${error.message}`
    };
  }
}

/**
 * 获取需要关闭的子任务列表（用于显示给用户）
 * @param {string} parentExecutionId - 父级执行 ID
 * @returns {Array} 需要关闭的子任务列表
 */
export function getChildChatsToClose(parentExecutionId) {
  const activeChildren = getActiveChildExecutions(parentExecutionId);
  
  return activeChildren.map(child => ({
    chatId: child.chat_id,
    skillName: child.child_skill_name,
    taskDescription: child.task_description,
    status: child.status,
    openedAt: child.opened_at
  }));
}
