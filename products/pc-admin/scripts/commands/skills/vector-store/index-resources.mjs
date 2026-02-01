/**
 * 索引资源到向量数据库
 */

import { getStore } from './local-vector-store.mjs';
import { scanResources, scanResourcesByType } from './resource-scanner.mjs';
import { extractResource } from './resource-extractor.mjs';
import { generateEmbedding, buildResourceDescription } from './embedding.mjs';
import { config } from './config.mjs';

// 简单的 logger
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
};

/**
 * 索引资源
 */
async function indexResources(resources) {
  const store = getStore();

  logger.info(`索引 ${resources.length} 个资源...`);

  for (let i = 0; i < resources.length; i++) {
    const resource = resources[i];
    logger.info(`[${i + 1}/${resources.length}] Processing ${resource.relativePath}`);

    try {
      // 提取资源信息
      const extracted = await extractResource(resource);
      if (!extracted) {
        logger.warn(`Failed to extract ${resource.relativePath}, skipping`);
        continue;
      }

      // 构建描述文本
      const description = buildResourceDescription(resource, extracted);

      // 生成向量
      const embedding = await generateEmbedding(description);

      // 构建元数据
      const metadata = {
        type: resource.type,
        path: resource.relativePath,
        name: extracted.name || resource.relativePath,
        description: extracted.description || '',
        category: extracted.category || '',
        tags: [],
      };

      // 添加到存储
      const id = `${resource.type}:${resource.relativePath}`;
      store.addResource(id, metadata, embedding);

      logger.info(`[${i + 1}/${resources.length}] ✅ 已索引: ${resource.relativePath}`);
    } catch (error) {
      logger.error(`Failed to index ${resource.relativePath}:`, error.message);
    }
  }

  logger.info(`\n✅ 资源索引完成！共索引 ${resources.length} 个资源`);
  logger.info(`📊 当前存储中的资源总数: ${store.getCount()} 个`);
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find((arg) => arg.startsWith('--type='));
  const pathArg = args.find((arg) => arg.startsWith('--path='));

  try {
    let resources;

    if (typeArg) {
      const type = typeArg.split('=')[1];
      logger.info(`Scanning ${type} resources...`);
      resources = await scanResourcesByType(type);
    } else if (pathArg) {
      const path = pathArg.split('=')[1];
      logger.info(`Scanning resources in ${path}...`);
      // TODO: 实现路径扫描
      resources = await scanResources();
    } else {
      logger.info('Scanning all resources...');
      resources = await scanResources();
    }

    if (resources.length === 0) {
      logger.warn('No resources found to index');
      return;
    }

    await indexResources(resources);
  } catch (error) {
    logger.error('Failed to index resources:', error);
    process.exit(1);
  }
}

// 如果直接运行
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { indexResources };
