/**
 * 并行 Skill 执行器
 * 支持在独立的 Chat 对话中执行子级 skills，实现并行子任务
 * 提供统一管理接口，让主 skill 可以查询和管理子任务
 */

import { openCursorAgent } from '../tools/open-cursor-agent.mjs';
import { logger } from './utils/logger.mjs';
import { 
  recordParallelExecution, 
  updateParallelExecutionStatus,
  getChildExecutions,
  getParallelExecutionStats,
  getActiveChildExecutions,
  closeAllChildChats,
  getChildChatsToClose
} from './parallel-manager.mjs';
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
    return {
      parallel_execution: {
        enabled: true,
        auto_open_chat: true,
        shortcut: 'Ctrl+L'
      }
    };
  }
}

/**
 * 为子级 skill 打开新的 Chat 对话
 * @param {string} childSkillName - 子级 skill 名称
 * @param {string} parentExecutionId - 父级执行 ID
 * @param {string} taskDescription - 任务描述
 * @param {string} initialPrompt - 初始提示（可选）
 * @returns {Promise<object>} 执行结果，包含 success 和 chatId
 */
export async function openChatForChildSkill(childSkillName, parentExecutionId, taskDescription, initialPrompt = '') {
  const config = getConfig();
  const parallelConfig = config.parallel_execution || {};
  
  if (!parallelConfig.enabled || !parallelConfig.auto_open_chat) {
    logger.info(`[ParallelExecutor] 并行执行已禁用，跳过为 ${childSkillName} 打开新 Chat`);
    return { success: false, chatId: null };
  }
  
  logger.info(`[ParallelExecutor] 为子级 skill "${childSkillName}" 打开新的 Chat 对话...`);
  
  // 构建初始提示
  const prompt = initialPrompt || `请使用 skill "${childSkillName}" 执行以下任务：${taskDescription}`;
  
  // 生成 Chat ID（在实际打开 Chat 之前）
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 先记录并行执行信息
  try {
    recordParallelExecution(
      parentExecutionId,
      childSkillName,
      taskDescription,
      {
        chatId,
        chatUrl: null, // Cursor Chat URL（如果可获取）
        processInfo: {
          platform: process.platform,
          nodeVersion: process.version,
          timestamp: Date.now()
        },
        metadata: {
          initialPrompt: prompt,
          openedBy: 'parallel-executor'
        }
      }
    );
    logger.info(`[ParallelExecutor] 已记录并行执行，Chat ID: ${chatId}`);
  } catch (error) {
    logger.warn(`[ParallelExecutor] 记录并行执行信息失败:`, error.message);
  }
  
  // 打开新的 Chat
  try {
    const success = await openCursorAgent({
      context: `子任务: ${childSkillName}`,
      initialPrompt: prompt,
      shortcut: parallelConfig.shortcut || 'Ctrl+L',
      autoClick: false
    });
    
    if (success) {
      // 更新状态为已打开
      try {
        updateParallelExecutionStatus(chatId, 'opened');
      } catch (error) {
        logger.debug(`[ParallelExecutor] 更新状态失败（可忽略）:`, error.message);
      }
      
      logger.info(`[ParallelExecutor] ✅ 已为 ${childSkillName} 打开新 Chat (Chat ID: ${chatId})`);
      return { success: true, chatId };
    }
    
    return { success: false, chatId };
  } catch (error) {
    logger.error(`[ParallelExecutor] 打开新 Chat 失败:`, error);
    // 更新状态为失败
    try {
      updateParallelExecutionStatus(chatId, 'failed', {
        metadata: { error: error.message }
      });
    } catch (e) {
      // 忽略
    }
    return { success: false, chatId: null };
  }
}

/**
 * 检查是否需要并行执行子任务
 * @param {string} skillName - 当前 skill 名称
 * @param {number} currentStepCount - 当前步骤数
 * @param {number} estimatedRemainingSteps - 预计剩余步骤数
 * @returns {boolean} 是否需要并行执行
 */
export function shouldExecuteInParallel(skillName, currentStepCount, estimatedRemainingSteps) {
  const config = getConfig();
  const parallelConfig = config.parallel_execution || {};
  
  if (!parallelConfig.enabled) {
    return false;
  }
  
  // 如果剩余步骤数超过阈值，建议并行执行
  const threshold = parallelConfig.step_threshold || 5;
  return estimatedRemainingSteps > threshold;
}

/**
 * 为并行执行的子任务生成执行指令
 * @param {string} childSkillName - 子级 skill 名称
 * @param {string} taskDescription - 任务描述
 * @param {object} context - 上下文信息
 * @returns {string} 执行指令
 */
export function generateParallelExecutionInstruction(childSkillName, taskDescription, context = {}) {
  const instruction = `
请在新打开的 Chat 中执行以下任务：

**Skill**: ${childSkillName}
**任务**: ${taskDescription}
${context.parentSkill ? `**父级 Skill**: ${context.parentSkill}` : ''}
${context.parentExecutionId ? `**父级执行 ID**: ${context.parentExecutionId}` : ''}
${context.chatId ? `**Chat ID**: ${context.chatId}` : ''}

**执行步骤**:
1. 使用 skill "${childSkillName}" 
2. 执行任务: ${taskDescription}
3. 完成后，可以继续处理其他任务或关闭此 Chat

**注意**: 这是并行执行的子任务，与主对话独立运行。
`;
  
  return instruction.trim();
}

/**
 * 在技能执行系统中集成并行执行
 * 当检测到复杂任务时，自动打开新 Chat 执行子任务
 * @param {string} skillName - 当前 skill 名称
 * @param {string} executionId - 执行 ID
 * @param {object} taskInfo - 任务信息
 * @param {Array<object>} subTasks - 子任务列表
 * @returns {Promise<object>} 执行结果，包含所有子任务的 Chat ID 和状态
 */
export async function executeSubTasksInParallel(skillName, executionId, taskInfo, subTasks = []) {
  if (!subTasks || subTasks.length === 0) {
    return { total: 0, chatIds: [], childExecutions: [] };
  }
  
  logger.info(`[ParallelExecutor] 检测到 ${subTasks.length} 个子任务，准备并行执行...`);
  
  const config = getConfig();
  const parallelConfig = config.parallel_execution || {};
  
  if (!parallelConfig.enabled) {
    logger.info(`[ParallelExecutor] 并行执行已禁用，跳过`);
    return { total: 0, chatIds: [], childExecutions: [] };
  }
  
  const openedChatIds = [];
  
  // 为每个子任务打开新的 Chat
  for (let i = 0; i < subTasks.length; i++) {
    const subTask = subTasks[i];
    const childSkillName = subTask.skillName || skillName;
    const taskDescription = subTask.description || subTask;
    
    logger.info(`[ParallelExecutor] 为子任务 ${i + 1}/${subTasks.length} 打开新 Chat: ${taskDescription}`);
    
    // 生成执行指令
    const instruction = generateParallelExecutionInstruction(
      childSkillName,
      taskDescription,
      {
        parentSkill: skillName,
        parentExecutionId: executionId
      }
    );
    
    // 打开新 Chat
    const result = await openChatForChildSkill(
      childSkillName,
      executionId,
      taskDescription,
      instruction
    );
    
    // 记录 Chat ID
    if (result && result.success && result.chatId) {
      openedChatIds.push(result.chatId);
      logger.info(`[ParallelExecutor] 子任务 ${i + 1} Chat ID: ${result.chatId}`);
    }
    
    // 避免过快打开多个 Chat，给用户时间操作
    if (i < subTasks.length - 1) {
      await new Promise(resolve => setTimeout(resolve, parallelConfig.delay_between_chats || 2000));
    }
  }
  
  logger.info(`[ParallelExecutor] ✅ 已为所有子任务打开新 Chat`);
  
  // 返回所有子任务的 Chat ID 列表和详细信息，供主 skill 管理
  const childExecutions = getChildExecutions(executionId);
  const stats = getParallelExecutionStats(executionId);
  
  return {
    total: subTasks.length,
    chatIds: openedChatIds,
    childExecutions,
    stats
  };
}

/**
 * 获取主 skill 的所有子任务信息（供主 skill 查询使用）
 * @param {string} parentExecutionId - 父级执行 ID
 * @returns {object} 子任务信息
 */
export function getParallelExecutionInfo(parentExecutionId) {
  const childExecutions = getChildExecutions(parentExecutionId);
  const stats = getParallelExecutionStats(parentExecutionId);
  const activeExecutions = getActiveChildExecutions(parentExecutionId);
  
  return {
    total: stats.total,
    stats,
    all: childExecutions,
    active: activeExecutions,
    chatIds: childExecutions.map(exec => exec.chat_id).filter(Boolean)
  };
}

/**
 * 任务完成时关闭所有子 Chat（已废弃）
 * 请使用 task-completion-handler.mjs 中的 confirmTaskCompletion
 * 
 * @deprecated 使用 task-completion-handler.mjs 替代
 */
export async function closeAllChildChatsOnCompletion(parentExecutionId, options = {}) {
  logger.warn(`[ParallelExecutor] closeAllChildChatsOnCompletion 已废弃，请使用 task-completion-handler.mjs 中的 confirmTaskCompletion`);
  
  // 直接关闭，不再单独确认（确认应该在任务完成确认时进行）
  const result = closeAllChildChats(parentExecutionId, false);
  
  logger.info(`[ParallelExecutor] ✅ 已关闭 ${result.closed} 个子任务的 Chat`);
  
  return result;
}
