/**
 * 使用示例
 */

import { 
  initChroma,
  scanResources,
  indexResources,
  searchResources,
  recommendResources,
  formatRecommendations
} from './index.mjs';
import { logger } from '../utils/logger.mjs';

/**
 * 示例 1：初始化并索引资源
 */
async function example1_IndexResources() {
  logger.info('=== 示例 1: 初始化并索引资源 ===');
  
  // 1. 初始化向量数据库
  await initChroma();
  
  // 2. 扫描资源
  const resources = await scanResources();
  logger.info(`找到 ${resources.length} 个资源`);
  
  // 3. 索引资源
  await indexResources(resources);
  
  logger.info('✅ 资源索引完成');
}

/**
 * 示例 2：搜索资源
 */
async function example2_SearchResources() {
  logger.info('=== 示例 2: 搜索资源 ===');
  
  // 搜索 composables
  const composables = await searchResources('用户认证', {
    resourceTypes: ['composable'],
    limit: 5
  });
  
  logger.info(`找到 ${composables.length} 个相关 composables:`);
  composables.forEach((comp, index) => {
    logger.info(`${index + 1}. ${comp.metadata.name} (相似度: ${comp.score.toFixed(2)})`);
    logger.info(`   路径: ${comp.metadata.path}`);
  });
  
  // 搜索组件
  const components = await searchResources('表单输入', {
    resourceTypes: ['component'],
    limit: 5
  });
  
  logger.info(`找到 ${components.length} 个相关组件`);
}

/**
 * 示例 3：智能推荐
 */
async function example3_RecommendResources() {
  logger.info('=== 示例 3: 智能推荐资源 ===');
  
  const recommendations = await recommendResources(
    '创建一个用户管理页面，包含列表、搜索、新增、编辑、删除功能',
    {
      app: 'system-app',
      module: 'user-management',
      resourceTypes: ['composable', 'component', 'icon', 'skill']
    }
  );
  
  logger.info('\n' + formatRecommendations(recommendations));
}

/**
 * 示例 4：在 Skills 中使用
 */
async function example4_UseInSkills() {
  logger.info('=== 示例 4: 在 Skills 中使用 ===');
  
  // 模拟 Skill 执行时的资源推荐
  const task = '创建新页面';
  const recommendations = await recommendResources(task, {
    resourceTypes: ['component', 'composable', 'skill']
  });
  
  logger.info(`\n为任务 "${task}" 推荐了以下资源:`);
  logger.info(formatRecommendations(recommendations));
}

/**
 * 主函数
 */
async function main() {
  const example = process.argv[2] || '1';
  
  try {
    switch (example) {
      case '1':
        await example1_IndexResources();
        break;
      case '2':
        await example2_SearchResources();
        break;
      case '3':
        await example3_RecommendResources();
        break;
      case '4':
        await example4_UseInSkills();
        break;
      default:
        logger.error(`Unknown example: ${example}`);
        logger.info('Available examples: 1, 2, 3, 4');
    }
  } catch (error) {
    logger.error('Example failed:', error);
    process.exit(1);
  }
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
