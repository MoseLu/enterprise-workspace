#!/usr/bin/env node

/**
 * 并行执行完成示例
 * 演示如何在任务完成时关闭所有子 Chat
 */

import { 
  createExecution,
  completeExecution 
} from './execution-tracker.mjs';
import { 
  executeSubTasksInParallel,
  getParallelExecutionInfo 
} from './parallel-executor.mjs';
import { 
  confirmTaskCompletion,
  completeTaskWithAllPhases 
} from './task-completion-handler.mjs';
import { logger } from './utils/logger.mjs';

/**
 * 模拟 AskQuestion 工具
 * 在实际使用中，这应该是 Cursor 提供的 AskQuestion 工具
 */
async function mockAskQuestion({ question, options = [] }) {
  logger.info('\n' + '='.repeat(80));
  logger.info('❓ AskQuestion:');
  logger.info('='.repeat(80));
  logger.info(question);
  if (options.length > 0) {
    logger.info('\n选项:');
    options.forEach((opt, index) => {
      logger.info(`  ${index + 1}. ${opt}`);
    });
  }
  logger.info('='.repeat(80));
  
  // 模拟用户选择（在实际使用中，这会等待用户输入）
  // 这里默认选择第一个选项
  return options[0] || '是';
}

/**
 * 示例：任务完成时关闭子 Chat
 */
async function exampleParallelCompletion() {
  logger.info('📋 示例：任务完成时关闭子 Chat\n');
  
  // 1. 创建主执行记录
  const parentExecutionId = createExecution('example-completion-skill', {
    description: '示例：任务完成时关闭子 Chat'
  });
  
  // 2. 执行并行子任务
  const subTasks = [
    { skillName: 'dev-workflow', description: '启动开发服务器' },
    { skillName: 'build-guide', description: '构建共享包' },
    { skillName: 'i18n-toolkit', description: '检查翻译' }
  ];
  
  logger.info(`🚀 执行 ${subTasks.length} 个并行子任务...\n`);
  const result = await executeSubTasksInParallel(
    'example-completion-skill',
    parentExecutionId,
    { description: '示例任务' },
    subTasks
  );
  
  logger.info(`✅ 已为 ${result.total} 个子任务打开新 Chat`);
  logger.info(`Chat IDs: ${result.chatIds.join(', ')}\n`);
  
  // 3. 模拟任务执行过程...
  logger.info('⏳ 模拟任务执行中...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. 确认任务完成并执行完成阶段操作
  logger.info('🎉 准备确认任务完成并执行完成阶段操作...\n');
  
  const completionResult = await confirmTaskCompletion(parentExecutionId, {
    askQuestion: mockAskQuestion,
    skipConfirm: false, // 需要用户确认
    completionMessage: '✅ 所有子任务已完成！'
  });
  
  logger.info(`\n📊 完成结果:`);
  logger.info(`  确认状态: ${completionResult.confirmed ? '已确认' : '未确认'}`);
  if (completionResult.results) {
    logger.info(`  总结已写入: ${completionResult.results.summaryWritten ? '是' : '否'}`);
    if (completionResult.results.summaryPath) {
      logger.info(`  总结文件: ${completionResult.results.summaryPath}`);
    }
    logger.info(`  Skill已评级: ${completionResult.results.skillRated ? '是' : '否'}`);
    logger.info(`  关闭的 Chat 数量: ${completionResult.results.closedChats || 0}`);
    logger.info(`  执行记录已更新: ${completionResult.results.executionCompleted ? '是' : '否'}`);
  }
  if (completionResult.userChoice) {
    logger.info(`  用户选择: ${completionResult.userChoice}`);
  }
  
  logger.info('\n✅ 示例完成！');
}

/**
 * 示例：使用 completeParallelTask（一步完成）
 */
async function exampleCompleteParallelTask() {
  logger.info('📋 示例：使用 completeParallelTask 一步完成\n');
  
  const parentExecutionId = createExecution('example-one-step-skill', {
    description: '示例：一步完成主任务和子 Chat 关闭'
  });
  
  // 执行并行子任务...
  const result = await executeSubTasksInParallel(
    'example-one-step-skill',
    parentExecutionId,
    { description: '示例任务' },
    [
      { skillName: 'dev-workflow', description: '启动开发服务器' }
    ]
  );
  
  // 一步完成：确认任务完成并执行所有完成阶段操作
  const completionResult = await completeTaskWithAllPhases(parentExecutionId, {
    status: 'completed',
    completionMessage: '✅ 任务已完成！'
  }, {
    askQuestion: mockAskQuestion,
    skipConfirm: false
  });
  
  logger.info(`\n✅ 完成结果: ${completionResult.message}`);
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const example = process.argv[2] || 'completion';
  
  if (example === 'completion') {
    exampleParallelCompletion().catch(error => {
      logger.error('示例执行失败:', error);
      process.exit(1);
    });
  } else if (example === 'one-step') {
    exampleCompleteParallelTask().catch(error => {
      logger.error('示例执行失败:', error);
      process.exit(1);
    });
  } else {
    logger.info('用法: node parallel-completion-example.mjs [completion|one-step]');
  }
}
