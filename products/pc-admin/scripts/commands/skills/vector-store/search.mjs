/**
 * 资源搜索服务
 * 基于向量相似度搜索资源
 * 支持本地 Embedding 和 OpenAI Embedding
 */

import { getStore } from './local-vector-store.mjs';
import { generateEmbedding } from './embedding.mjs';
import { generateEmbeddingLocal } from './local-embedding.mjs';

// 简单的 logger
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
};

/**
 * 搜索资源（支持层级过滤）
 */
export async function searchResources(query, options = {}) {
  const {
    resourceTypes = [],
    limit = 10,
    minScore = 0.7,
    appName = null,
    appType = null,
    resourceCategory = null,
    hierarchyPath = null,
    depth = null,
  } = options;

  try {
    const store = getStore();
    
    // 生成查询向量（优先使用本地模型）
    let queryEmbedding;
    try {
      // 尝试使用本地 Embedding
      queryEmbedding = await generateEmbeddingLocal(query);
      logger.info('使用本地 Embedding 模型生成查询向量');
    } catch (error) {
      // 降级到 OpenAI 或通用方法
      logger.warn('本地 Embedding 不可用，尝试其他方法:', error.message);
      queryEmbedding = await generateEmbedding(query);
    }

    // 执行搜索（支持层级过滤）
    const results = store.searchResources(queryEmbedding, {
      resourceTypes,
      limit,
      minScore,
      appName,
      appType,
      resourceCategory,
      hierarchyPath,
      depth,
    });

    logger.info(`Found ${results.length} resources for query: "${query}"`);
    return results;
  } catch (error) {
    logger.error('Failed to search resources:', error);
    throw error;
  }
}

/**
 * 搜索特定类型的资源
 */
export async function searchResourcesByType(query, resourceType, limit = 10) {
  return searchResources(query, {
    resourceTypes: [resourceType],
    limit,
  });
}

/**
 * 获取相关资源（基于已有资源）
 */
export async function getRelatedResources(resourceId, limit = 5) {
  try {
    const store = getStore();
    const resource = store.db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
    
    if (!resource || !resource.embedding_path) {
      return [];
    }

    // 读取向量
    const { readFileSync, existsSync } = await import('fs');
    if (!existsSync(resource.embedding_path)) {
      return [];
    }

    const embedding = JSON.parse(readFileSync(resource.embedding_path, 'utf-8'));

    // 搜索相似资源
    const results = store.searchResources(embedding, {
      limit: limit + 1, // +1 因为会包含自己
      minScore: 0.5,
    });

    // 过滤掉自己
    const related = results
      .filter(r => r.id !== resourceId)
      .slice(0, limit);

    return related;
  } catch (error) {
    logger.error('Failed to get related resources:', error);
    throw error;
  }
}
