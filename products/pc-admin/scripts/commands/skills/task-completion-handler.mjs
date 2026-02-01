/**
 * 任务完成处理器
 * 处理任务完成时的所有完成阶段操作：
 * 1. 用户确认任务完成
 * 2. 生成执行摘要
 * 3. 写入参考文件
 * 4. 对skills评级
 * 5. 关闭子Chat
 * 6. 完成主任务执行记录
 */

import { logger } from './utils/logger.mjs';
import { 
  getExecution, 
  getExecutionSteps,
  completeExecution,
  generateSummary,
  updateExecution
} from './execution-tracker.mjs';
import { 
  closeAllChildChats,
  getChildExecutions,
  getParallelExecutionStats,
  getActiveChildExecutions
} from './parallel-manager.mjs';
import { generateHealthReport } from './analyzer.mjs';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 获取项目根目录
 */
function getRootDir() {
  return join(__dirname, '../../../../');
}

/**
 * 生成执行总结并写入参考文件
 * @param {string} executionId - 执行ID
 * @param {object} execution - 执行记录
 * @param {Array} steps - 执行步骤
 * @param {object} parallelInfo - 并行执行信息
 * @returns {string} 总结文件路径
 */
function writeExecutionSummary(executionId, execution, steps, parallelInfo) {
  const rootDir = getRootDir();
  const summaryDir = join(rootDir, '.claude', 'skills-meta', 'executions', 'summaries');
  
  // 确保目录存在
  if (!existsSync(summaryDir)) {
    mkdirSync(summaryDir, { recursive: true });
  }
  
  const summaryPath = join(summaryDir, `${executionId}.md`);
  
  const duration = execution.end_time 
    ? ((execution.end_time - execution.start_time) / 1000).toFixed(2)
    : '进行中';
  
  const summary = `# 执行总结: ${execution.skill_name}

**执行ID**: ${executionId}  
**执行时间**: ${new Date(execution.start_time).toLocaleString('zh-CN')}  
**完成时间**: ${execution.end_time ? new Date(execution.end_time).toLocaleString('zh-CN') : '未完成'}  
**耗时**: ${duration}秒  
**状态**: ${execution.status}  
**迭代次数**: ${execution.iterations || 0}  
**评分**: ${execution.explicit_rating || execution.inferred_rating || 'N/A'}

## 执行步骤

${steps.map((step, index) => {
  const stepDuration = step.end_time 
    ? ((step.end_time - step.start_time) / 1000).toFixed(1) + 's'
    : '进行中';
  return `${index + 1}. **${step.step_name}** [${step.status}] ${stepDuration} (评分: ${step.completion_score || 'N/A'})`;
}).join('\n')}

## 并行子任务

${parallelInfo.total > 0 ? `
- 总子任务数: ${parallelInfo.total}
- 已完成: ${parallelInfo.stats.completed || 0}
- 已关闭: ${parallelInfo.stats.closed || 0}
- 失败: ${parallelInfo.stats.failed || 0}

${parallelInfo.all.map((child, index) => 
  `${index + 1}. ${child.child_skill_name} - ${child.task_description} (状态: ${child.status}, Chat ID: ${child.chat_id || 'N/A'})`
).join('\n')}
` : '无并行子任务'}

## 执行摘要

\`\`\`
${generateSummary(executionId)}
\`\`\`

## 用户反馈

${execution.user_feedback_raw || '无反馈'}

${execution.user_feedback_analyzed ? `\n**分析结果**: ${execution.user_feedback_analyzed}` : ''}

## 多维度评分

${execution.multi_dimension_scores ? `
\`\`\`json
${JSON.stringify(JSON.parse(execution.multi_dimension_scores), null, 2)}
\`\`\`
` : '无评分数据'}

---
*生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

  try {
    writeFileSync(summaryPath, summary, 'utf-8');
    logger.info(`[TaskCompletion] ✅ 执行总结已写入: ${summaryPath}`);
    return summaryPath;
  } catch (error) {
    logger.error(`[TaskCompletion] 写入执行总结失败:`, error);
    return null;
  }
}

/**
 * 对skill进行评级
 * @param {string} skillName - skill名称
 * @returns {object} 健康度报告
 */
function rateSkill(skillName) {
  try {
    const healthReport = generateHealthReport(skillName);
    logger.info(`[TaskCompletion] Skill评级: ${skillName} - ${healthReport.status} (${healthReport.healthScore || 'N/A'})`);
    return healthReport;
  } catch (error) {
    logger.warn(`[TaskCompletion] 生成skill评级失败:`, error.message);
    return null;
  }
}

/**
 * 执行完成阶段操作
 * @param {string} parentExecutionId - 父级执行ID
 * @param {object} options - 选项
 * @returns {Promise<object>} 完成结果
 */
async function performCompletionTasks(parentExecutionId, options = {}) {
  const { skipSummary = false, skipRating = false } = options;
  
  logger.info(`[TaskCompletion] 开始执行完成阶段操作: ${parentExecutionId}`);
  
  // 1. 获取执行信息
  const execution = getExecution(parentExecutionId);
  if (!execution) {
    logger.error(`[TaskCompletion] 执行记录不存在: ${parentExecutionId}`);
    return { success: false, message: '执行记录不存在' };
  }
  
  const steps = getExecutionSteps(parentExecutionId);
  
  // 获取并行执行信息（避免循环导入）
  const childExecutions = getChildExecutions(parentExecutionId);
  const stats = getParallelExecutionStats(parentExecutionId);
  const activeExecutions = getActiveChildExecutions(parentExecutionId);
  const parallelInfo = {
    total: stats.total,
    stats,
    all: childExecutions,
    active: activeExecutions,
    chatIds: childExecutions.map(exec => exec.chat_id).filter(Boolean)
  };
  
  const results = {
    summaryWritten: false,
    summaryPath: null,
    skillRated: false,
    healthReport: null,
    chatsClosed: false,
    closedChats: 0,
    closedChatIds: [],
    executionCompleted: false
  };
  
  // 2. 生成并写入执行总结
  if (!skipSummary) {
    try {
      const summaryPath = writeExecutionSummary(parentExecutionId, execution, steps, parallelInfo);
      if (summaryPath) {
        results.summaryWritten = true;
        results.summaryPath = summaryPath;
        
        // 更新执行记录的summary字段
        updateExecution(parentExecutionId, {
          summary: generateSummary(parentExecutionId)
        });
      }
    } catch (error) {
      logger.warn(`[TaskCompletion] 写入总结失败:`, error.message);
    }
  }
  
  // 3. 对skill进行评级
  if (!skipRating) {
    try {
      const healthReport = rateSkill(execution.skill_name);
      if (healthReport) {
        results.skillRated = true;
        results.healthReport = healthReport;
      }
    } catch (error) {
      logger.warn(`[TaskCompletion] Skill评级失败:`, error.message);
    }
  }
  
  // 4. 关闭所有子Chat（作为完成阶段操作的一部分）
  if (parallelInfo.total > 0 && parallelInfo.active.length > 0) {
    try {
      logger.info(`[TaskCompletion] 关闭 ${parallelInfo.active.length} 个活跃的子任务 Chat...`);
      const closeResult = closeAllChildChats(parentExecutionId, false);
      if (closeResult.closed > 0) {
        results.chatsClosed = true;
        results.closedChats = closeResult.closed;
        results.closedChatIds = closeResult.chatIds;
        logger.info(`[TaskCompletion] ✅ 已关闭 ${closeResult.closed} 个子任务的 Chat`);
      }
    } catch (error) {
      logger.warn(`[TaskCompletion] 关闭子Chat失败:`, error.message);
    }
  } else if (parallelInfo.total > 0) {
    logger.info(`[TaskCompletion] 所有子任务已完成，无需关闭`);
  }
  
  // 5. 完成主任务执行记录
  try {
    completeExecution(parentExecutionId, {
      status: 'completed'
    });
    results.executionCompleted = true;
    logger.info(`[TaskCompletion] ✅ 主任务执行记录已更新`);
  } catch (error) {
    logger.warn(`[TaskCompletion] 更新主任务执行记录失败:`, error.message);
  }
  
  logger.info(`[TaskCompletion] ✅ 完成阶段操作执行完成`);
  
  return {
    success: true,
    results,
    message: '完成阶段操作执行成功'
  };
}

/**
 * 确认任务完成并执行完成阶段操作
 * @param {string} parentExecutionId - 父级执行ID
 * @param {object} options - 选项
 * @param {Function} options.askQuestion - AskQuestion 工具函数
 * @param {boolean} options.skipConfirm - 是否跳过确认（默认 false）
 * @param {string} options.completionMessage - 完成消息
 * @param {boolean} options.skipSummary - 是否跳过总结（默认 false）
 * @param {boolean} options.skipRating - 是否跳过评级（默认 false）
 * @returns {Promise<object>} 处理结果
 */
export async function confirmTaskCompletion(parentExecutionId, options = {}) {
  const { 
    askQuestion, 
    skipConfirm = false, 
    completionMessage,
    skipSummary = false,
    skipRating = false
  } = options;
  
  logger.info(`[TaskCompletion] 确认任务完成: ${parentExecutionId}`);
  
  // 获取执行信息用于确认消息
  const execution = getExecution(parentExecutionId);
  if (!execution) {
    logger.error(`[TaskCompletion] 执行记录不存在: ${parentExecutionId}`);
    return {
      confirmed: false,
      message: '执行记录不存在'
    };
  }
  
  const steps = getExecutionSteps(parentExecutionId);
  
  // 获取并行执行信息（避免循环导入）
  const childExecutions = getChildExecutions(parentExecutionId);
  const stats = getParallelExecutionStats(parentExecutionId);
  const activeExecutions = getActiveChildExecutions(parentExecutionId);
  const parallelInfo = {
    total: stats.total,
    stats,
    all: childExecutions,
    active: activeExecutions,
    chatIds: childExecutions.map(exec => exec.chat_id).filter(Boolean)
  };
  
  // 计算完成步骤数
  const completedSteps = steps.filter(s => s.status === 'completed').length;
  
  // 构建确认消息
  const defaultMessage = `任务执行情况：

**Skill**: ${execution.skill_name}
**执行ID**: ${parentExecutionId}
**步骤数**: ${steps.length} (已完成: ${completedSteps})
${parallelInfo.total > 0 ? `**并行子任务**: ${parallelInfo.total}个 (活跃: ${parallelInfo.active.length})` : ''}
**状态**: ${execution.status}
**迭代次数**: ${execution.iterations || 0}

${completionMessage || '请确认任务是否已完成？'}

如果确认完成，系统将执行以下操作：
1. 📝 生成执行总结并写入参考文件
2. ⭐ 对skill进行评级（生成健康度报告）
3. 🔒 关闭所有并行子任务的Chat
4. ✅ 完成主任务执行记录`;

  const message = completionMessage 
    ? `${completionMessage}\n\n${defaultMessage.split('\n\n')[1]}`
    : defaultMessage;
  
  // 如果需要确认且提供了 askQuestion 工具
  if (!skipConfirm && askQuestion) {
    try {
      const userResponse = await askQuestion({
        question: message,
        options: ['是，确认完成', '否，继续执行', '稍后确认']
      });
      
      logger.info(`[TaskCompletion] 用户选择: ${userResponse}`);
      
      if (userResponse === '否，继续执行' || userResponse === '稍后确认') {
        logger.info(`[TaskCompletion] 用户选择不确认完成`);
        return {
          confirmed: false,
          message: '用户选择不确认完成',
          userChoice: userResponse
        };
      }
    } catch (error) {
      logger.warn(`[TaskCompletion] 用户确认失败:`, error.message);
      return {
        confirmed: false,
        message: '用户确认失败',
        error: error.message
      };
    }
  } else if (!skipConfirm) {
    // 如果没有提供 askQuestion，记录警告但继续执行
    logger.warn(`[TaskCompletion] 未提供 askQuestion 工具，将自动确认完成`);
  }
  
  // 执行完成阶段操作
  const completionResult = await performCompletionTasks(parentExecutionId, {
    skipSummary,
    skipRating
  });
  
  return {
    confirmed: true,
    ...completionResult
  };
}

/**
 * 完成主任务并执行所有完成阶段操作的便捷函数
 * @param {string} parentExecutionId - 父级执行ID
 * @param {object} executionData - 执行完成数据
 * @param {object} options - 选项
 * @returns {Promise<object>} 处理结果
 */
export async function completeTaskWithAllPhases(parentExecutionId, executionData = {}, options = {}) {
  const { askQuestion, skipConfirm = false, skipSummary = false, skipRating = false } = options;
  
  // 确认任务完成并执行完成阶段操作
  const result = await confirmTaskCompletion(parentExecutionId, {
    askQuestion,
    skipConfirm,
    completionMessage: executionData.completionMessage,
    skipSummary,
    skipRating
  });
  
  if (!result.confirmed) {
    return result;
  }
  
  // 如果执行数据中有额外信息，更新执行记录
  if (Object.keys(executionData).length > 0) {
    try {
      updateExecution(parentExecutionId, executionData);
    } catch (error) {
      logger.warn(`[TaskCompletion] 更新执行数据失败:`, error.message);
    }
  }
  
  return result;
}
