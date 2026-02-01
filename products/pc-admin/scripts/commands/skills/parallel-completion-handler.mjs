/**
 * 并行执行完成处理器（已废弃）
 * 请使用 task-completion-handler.mjs 中的 confirmTaskCompletion
 * 
 * @deprecated 使用 task-completion-handler.mjs 替代
 */

import { logger } from './utils/logger.mjs';
import { 
  closeAllChildChats,
  getParallelExecutionInfo 
} from './parallel-manager.mjs';
import { getParallelExecutionInfo as getParallelInfo } from './parallel-executor.mjs';
import { completeExecution } from './execution-tracker.mjs';

/**
 * 处理并行任务的完成逻辑
 * @param {string} parentExecutionId - 父级执行 ID
 * @param {object} options - 选项
 * @param {Function} options.askQuestion - AskQuestion 工具函数
 * @param {boolean} options.autoClose - 是否自动关闭（默认 false，需要确认）
 * @param {string} options.completionMessage - 完成消息
 * @returns {Promise<object>} 处理结果
 */
export async function handleParallelTaskCompletion(parentExecutionId, options = {}) {
  logger.warn(`[ParallelCompletion] handleParallelTaskCompletion 已废弃，请使用 task-completion-handler.mjs 中的 confirmTaskCompletion`);
  
  const { askQuestion, autoClose = false, completionMessage } = options;
  
  logger.info(`[ParallelCompletion] 处理任务完成: ${parentExecutionId}`);
  
  // 获取并行执行信息
  const parallelInfo = getParallelInfo(parentExecutionId);
  
  if (parallelInfo.total === 0) {
    logger.info(`[ParallelCompletion] 没有并行子任务，直接完成`);
    if (completionMessage) {
      logger.info(completionMessage);
    }
    return {
      completed: true,
      closedChats: 0,
      message: '任务完成（无并行子任务）'
    };
  }
  
  // 检查是否有活跃的子任务
  const activeCount = parallelInfo.active.length;
  
  if (activeCount > 0) {
    logger.info(`[ParallelCompletion] 检测到 ${activeCount} 个活跃的子任务`);
    
    // 关闭所有子任务 Chat（直接关闭，不再单独确认）
    const closeResult = closeAllChildChats(parentExecutionId, false);
    
    logger.info(`[ParallelCompletion] 子任务 Chat 关闭结果: ${closeResult.message}`);
    
    return {
      completed: true,
      closedChats: closeResult.closed,
      chatIds: closeResult.chatIds,
      message: closeResult.message,
      userChoice: closeResult.userChoice
    };
  } else {
    logger.info(`[ParallelCompletion] 所有子任务已完成，无需关闭`);
    if (completionMessage) {
      logger.info(completionMessage);
    }
    return {
      completed: true,
      closedChats: 0,
      message: '任务完成（所有子任务已完成）'
    };
  }
}

/**
 * 完成主任务并关闭所有子 Chat 的便捷函数
 * @param {string} parentExecutionId - 父级执行 ID
 * @param {object} executionData - 执行完成数据
 * @param {object} options - 选项
 * @returns {Promise<object>} 处理结果
 */
export async function completeParallelTask(parentExecutionId, executionData = {}, options = {}) {
  const { askQuestion, autoClose = false } = options;
  
  // 1. 处理子 Chat 关闭
  const closeResult = await handleParallelTaskCompletion(parentExecutionId, {
    askQuestion,
    autoClose,
    completionMessage: executionData.completionMessage
  });
  
  // 2. 完成主任务执行记录
  try {
    completeExecution(parentExecutionId, {
      ...executionData,
      status: 'completed'
    });
    logger.info(`[ParallelCompletion] ✅ 主任务执行记录已更新`);
  } catch (error) {
    logger.warn(`[ParallelCompletion] 更新主任务执行记录失败:`, error.message);
  }
  
  return {
    ...closeResult,
    parentExecutionCompleted: true
  };
}
