/**
 * 快速查询API
 * 为Skills提供快速、精确的资源查询接口
 * 支持层级过滤，确保快速获取所需内容
 */

import { searchByHierarchy, getResourcesByAppAndCategory } from './hierarchy-search.mjs';
import { getStore } from './local-vector-store.mjs';

/**
 * 快速查询资源（为Skills优化）
 * @param {object} query - 查询参数
 * @returns {Promise<Array>} 资源列表
 */
export async function quickQuery(query) {
  const {
    // 查询文本
    text = '',
    // 层级过滤
    appName = null,
    appType = null, // 'main' | 'sub' | 'package'
    resourceCategory = null, // 'composables' | 'routes' | 'stores' | 'components' | 'utils' | 'docs'
    // 资源类型
    resourceTypes = [],
    // 其他选项
    limit = 10,
    minScore = 0.2,
  } = query;

  const store = getStore();
  
  // 如果指定了应用和资源类型，直接查询（最快）
  if (appName && resourceCategory && !text) {
    return getResourcesByAppAndCategory(appName, resourceCategory, limit);
  }
  
  // 如果有查询文本，使用语义搜索
  if (text) {
    return searchByHierarchy(text, {
      appName,
      appType,
      resourceCategory,
    }, {
      resourceTypes,
      limit,
      minScore,
    });
  }
  
  // 否则返回空结果
  return [];
}

/**
 * 获取应用的资源概览
 * @param {string} appName - 应用名称
 */
export function getAppOverview(appName) {
  const store = getStore();
  
  const stats = store.db.prepare(`
    SELECT 
      resource_category,
      COUNT(*) as count
    FROM resources
    WHERE app_name = ?
    GROUP BY resource_category
    ORDER BY resource_category
  `).all(appName);
  
  return {
    appName,
    categories: stats.map(s => ({
      category: s.resource_category,
      count: s.count,
    })),
    total: stats.reduce((sum, s) => sum + s.count, 0),
  };
}

/**
 * 获取所有应用的资源概览
 */
export function getAllAppsOverview() {
  const store = getStore();
  
  const stats = store.db.prepare(`
    SELECT 
      app_name,
      app_type,
      resource_category,
      COUNT(*) as count
    FROM resources
    WHERE app_name IS NOT NULL
    GROUP BY app_name, app_type, resource_category
    ORDER BY app_name, resource_category
  `).all();
  
  const apps = {};
  for (const stat of stats) {
    if (!apps[stat.app_name]) {
      apps[stat.app_name] = {
        appName: stat.app_name,
        appType: stat.app_type,
        categories: {},
        total: 0,
      };
    }
    apps[stat.app_name].categories[stat.resource_category] = stat.count;
    apps[stat.app_name].total += stat.count;
  }
  
  return Object.values(apps);
}

/**
 * 快速获取指定应用和资源类型的资源（无搜索，直接查询）
 * @param {string} appName - 应用名称
 * @param {string} resourceCategory - 资源类型
 * @param {number} limit - 限制数量
 */
export async function quickGetByAppAndCategory(appName, resourceCategory, limit = 50) {
  return await getResourcesByAppAndCategory(appName, resourceCategory, limit);
}

/**
 * 快速搜索（支持层级过滤）
 * @param {string} query - 搜索查询
 * @param {object} filters - 层级过滤器
 */
export async function quickSearch(query, filters = {}) {
  return searchByHierarchy(query, filters, { limit: 10, minScore: 0.2 });
}
