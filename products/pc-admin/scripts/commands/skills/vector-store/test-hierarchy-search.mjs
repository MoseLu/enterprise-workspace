/**
 * 测试层级搜索功能
 */

import { searchByHierarchy, getHierarchyTree, getResourcesByAppAndCategory } from './hierarchy-search.mjs';
import { getStore } from './local-vector-store.mjs';

async function main() {
  console.log('🔍 测试层级搜索功能...\n');
  
  const store = getStore();
  console.log(`📊 当前资源总数: ${store.getCount()} 个\n`);
  
  // 1. 测试获取层级树
  console.log('📊 获取层级树结构...\n');
  const tree = getHierarchyTree();
  
  console.log('应用层级结构:');
  for (const [appName, appData] of Object.entries(tree)) {
    console.log(`\n  📁 ${appName} (${appData.appType || 'unknown'}) - 总计 ${appData.totalResources} 个资源`);
    for (const [category, catData] of Object.entries(appData.categories)) {
      console.log(`    └─ ${category}: ${catData.totalResources} 个`);
    }
  }
  console.log('');
  
  // 2. 测试按应用和资源类型搜索
  console.log('🔍 测试按应用和资源类型搜索...\n');
  
  // 搜索主应用的 composables
  console.log('搜索主应用的 composables:');
  const mainAppComposables = await searchByHierarchy('表单处理', {
    appType: 'main',
    resourceCategory: 'composables',
  }, { limit: 5 });
  
  mainAppComposables.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.metadata.name} (${r.metadata.hierarchyPath}) - 相似度: ${(r.score * 100).toFixed(1)}%`);
  });
  console.log('');
  
  // 搜索子应用的路由
  console.log('搜索 system-app 的路由配置:');
  const systemRoutes = await getResourcesByAppAndCategory('system-app', 'routes', 5);
  systemRoutes.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.name} - ${r.path}`);
  });
  console.log('');
  
  // 3. 测试层级路径搜索
  console.log('🔍 测试层级路径搜索...\n');
  const hierarchyResults = await searchByHierarchy('CRUD', {
    hierarchyPath: 'system-app',
  }, { limit: 10 });
  
  console.log(`找到 ${hierarchyResults.length} 个相关资源:`);
  hierarchyResults.slice(0, 5).forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.metadata.resourceCategory}] ${r.metadata.name} - ${r.metadata.hierarchyPath}`);
  });
  console.log('');
  
  // 4. 统计各应用的资源数量
  console.log('📊 各应用资源统计:');
  const appStats = store.db.prepare(`
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
  
  const byApp = {};
  for (const stat of appStats) {
    if (!byApp[stat.app_name]) {
      byApp[stat.app_name] = {
        appType: stat.app_type,
        categories: {},
        total: 0,
      };
    }
    byApp[stat.app_name].categories[stat.resource_category] = stat.count;
    byApp[stat.app_name].total += stat.count;
  }
  
  for (const [appName, data] of Object.entries(byApp)) {
    console.log(`\n  ${appName} (${data.appType}): ${data.total} 个资源`);
    for (const [cat, count] of Object.entries(data.categories)) {
      console.log(`    - ${cat}: ${count} 个`);
    }
  }
  console.log('');
}

main().catch(console.error);
