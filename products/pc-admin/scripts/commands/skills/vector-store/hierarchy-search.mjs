/**
 * 层级搜索服务
 * 支持按应用层级和资源类型快速检索
 */

import { getStore } from './local-vector-store.mjs';
import { generateEmbeddingLocal } from './local-embedding.mjs';

/**
 * 按层级搜索资源
 * @param {string} query - 搜索查询
 * @param {object} filters - 层级过滤器
 * @param {object} options - 其他选项
 */
export async function searchByHierarchy(query, filters = {}, options = {}) {
  const {
    appName = null,
    appType = null, // 'main' | 'sub' | 'package'
    resourceCategory = null, // 'composables' | 'routes' | 'stores' | 'components' | 'utils' | 'docs'
    hierarchyPath = null,
    depth = null,
    resourceTypes = [],
    limit = 10,
    minScore = 0.2,
  } = { ...filters, ...options };

  try {
    const store = getStore();
    
    // 生成查询向量
    const queryEmbedding = await generateEmbeddingLocal(query);
    
    // 执行层级搜索
    const results = store.searchResources(queryEmbedding, {
      resourceTypes,
      appName,
      appType,
      resourceCategory,
      hierarchyPath,
      depth,
      limit,
      minScore,
    });

    return results;
  } catch (error) {
    console.error('层级搜索失败:', error);
    throw error;
  }
}

/**
 * 获取应用的所有资源（按资源类型分组）
 * @param {string} appName - 应用名称
 */
export function getAppResourcesByCategory(appName) {
  const store = getStore();
  
  const resources = store.db.prepare(`
    SELECT 
      resource_category,
      COUNT(*) as count,
      GROUP_CONCAT(DISTINCT type) as types
    FROM resources
    WHERE app_name = ?
    GROUP BY resource_category
    ORDER BY resource_category
  `).all(appName);

  return resources;
}

/**
 * 获取层级树结构
 * @param {object} filters - 过滤条件
 */
export function getHierarchyTree(filters = {}) {
  const { appType = null, maxDepth = 3 } = filters;
  const store = getStore();
  
  let sql = `
    SELECT 
      app_name,
      app_type,
      resource_category,
      hierarchy_path,
      depth,
      COUNT(*) as resource_count
    FROM resources
    WHERE 1=1
  `;
  const params = [];
  
  if (appType) {
    sql += ' AND app_type = ?';
    params.push(appType);
  }
  
  sql += `
    GROUP BY app_name, resource_category, hierarchy_path, depth
    ORDER BY app_name, resource_category, depth
  `;
  
  const nodes = store.db.prepare(sql).all(...params);
  
  // 构建树结构
  const tree = {};
  
  for (const node of nodes) {
    const appName = node.app_name || 'packages';
    const category = node.resource_category || 'other';
    
    if (!tree[appName]) {
      tree[appName] = {
        appName,
        appType: node.app_type,
        categories: {},
        totalResources: 0,
      };
    }
    
    if (!tree[appName].categories[category]) {
      tree[appName].categories[category] = {
        category,
        paths: [],
        totalResources: 0,
      };
    }
    
    tree[appName].categories[category].paths.push({
      hierarchyPath: node.hierarchy_path,
      depth: node.depth,
      resourceCount: node.resource_count,
    });
    
    tree[appName].categories[category].totalResources += node.resource_count;
    tree[appName].totalResources += node.resource_count;
  }
  
  return tree;
}

/**
 * 快速获取指定应用和资源类型的资源
 * @param {string} appName - 应用名称
 * @param {string} resourceCategory - 资源类型
 * @param {number} limit - 限制数量
 */
export async function getResourcesByAppAndCategory(appName, resourceCategory, limit = 50) {
  const store = getStore();
  
  const resources = store.db.prepare(`
    SELECT *
    FROM resources
    WHERE app_name = ? AND resource_category = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(appName, resourceCategory, limit);
  
  return resources.map(r => ({
    id: r.id,
    type: r.type,
    name: r.name,
    path: r.path,
    description: r.description,
    category: r.category,
    tags: JSON.parse(r.tags || '[]'),
    metadata: {
      appName: r.app_name,
      appType: r.app_type,
      resourceCategory: r.resource_category,
      hierarchyPath: r.hierarchy_path,
      depth: r.depth,
      moduleName: r.module_name,
    },
  }));
}

/**
 * 搜索主应用的资源
 */
export async function searchMainAppResources(query, resourceCategory = null, limit = 10) {
  return searchByHierarchy(query, {
    appType: 'main',
    resourceCategory,
  }, { limit });
}

/**
 * 搜索子应用的资源
 */
export async function searchSubAppResources(query, appName = null, resourceCategory = null, limit = 10) {
  return searchByHierarchy(query, {
    appType: 'sub',
    appName,
    resourceCategory,
  }, { limit });
}
