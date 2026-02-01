#!/usr/bin/env node

/**
 * 并行执行示例
 * 演示如何在 skill 中使用并行执行功能
 */

import { 
  executeSubTasksInParallel, 
  openChatForChildSkill,
  getParallelExecutionInfo 
} from './parallel-executor.mjs';
import { createExecution } from './execution-tracker.mjs';
import { logger } from './utils/logger.mjs';

/**
 * 示例：复杂任务分解为并行子任务
 */
async function exampleParallelExecution() {
  logger.info('📋 示例：并行执行子任务\n');
  
  // 创建父级执行记录
  const parentExecutionId = createExecution('example-parent-skill', {
    description: '复杂任务：需要并行处理多个子任务'
  });
  
  // 定义子任务列表
  const subTasks = [
    {
      skillName: 'dev-workflow',
      description: '启动开发服务器并检查端口'
    },
    {
      skillName: 'build-guide',
      description: '构建共享包和依赖'
    },
    {
      skillName: 'i18n-toolkit',
      description: '检查并更新国际化翻译'
    }
  ];
  
  logger.info(`🚀 准备为 ${subTasks.length} 个子任务打开新的 Chat 对话...\n`);
  
  // 并行执行子任务
  await executeSubTasksInParallel(
    'example-parent-skill',
    parentExecutionId,
    { description: '复杂任务示例' },
    subTasks
  );
  
  logger.info('\n✅ 所有子任务的新 Chat 已打开\n');
  
  // 获取并行执行信息（演示统一管理功能）
  const parallelInfo = getParallelExecutionInfo(parentExecutionId);
  logger.info('📊 并行执行信息：');
  logger.info(`   总子任务数: ${parallelInfo.total}`);
  logger.info(`   Chat IDs: ${parallelInfo.chatIds.join(', ')}`);
  logger.info(`   状态统计: 已打开=${parallelInfo.stats.opened}, 进行中=${parallelInfo.stats.started}, 已完成=${parallelInfo.stats.completed}`);
  
  logger.info('\n💡 提示：');
  logger.info('   - 每个子任务在独立的 Chat 中执行');
  logger.info('   - 可以并行处理，互不干扰');
  logger.info('   - 主对话可以继续处理其他任务');
  logger.info(`   - 主 skill 可以通过 Chat ID 管理所有子任务\n`);
  logger.info(`💡 查看并行执行信息:`);
  logger.info(`   node scripts/commands/skills/cli.mjs parallel ${parentExecutionId}\n`);
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  exampleParallelExecution().catch(error => {
    logger.error('示例执行失败:', error);
    process.exit(1);
  });
}
