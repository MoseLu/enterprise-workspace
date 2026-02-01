/**
 * 测试快速查询API
 */

import { quickQuery, getAppOverview, getAllAppsOverview, quickGetByAppAndCategory, quickSearch } from './quick-query.mjs';

async function main() {
  console.log('🚀 测试快速查询API（为Skills优化）...\n');
  
  // 1. 测试快速获取（无搜索，直接查询）
  console.log('1️⃣ 快速获取 system-app 的 routes（直接查询，最快）:');
  const systemRoutes = await quickGetByAppAndCategory('system-app', 'routes', 5);
  if (Array.isArray(systemRoutes)) {
    systemRoutes.forEach((r, i) => {
      const name = r.metadata?.name || r.name;
      const path = r.metadata?.path || r.path;
      console.log(`   ${i + 1}. ${name} - ${path}`);
    });
  } else {
    console.log('   结果:', systemRoutes);
  }
  console.log('');
  
  // 2. 测试应用概览
  console.log('2️⃣ 获取 main-app 的资源概览:');
  const mainAppOverview = getAppOverview('main-app');
  console.log(`   应用: ${mainAppOverview.appName}`);
  console.log(`   总计: ${mainAppOverview.total} 个资源`);
  mainAppOverview.categories.forEach(cat => {
    console.log(`     - ${cat.category}: ${cat.count} 个`);
  });
  console.log('');
  
  // 3. 测试快速搜索（带层级过滤）
  console.log('3️⃣ 快速搜索主应用的 composables（语义搜索 + 层级过滤）:');
  const mainComposables = await quickSearch('表单处理', {
    appType: 'main',
    resourceCategory: 'composables',
  });
  mainComposables.forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.metadata.name} (${r.metadata.hierarchyPath}) - ${(r.score * 100).toFixed(1)}%`);
  });
  console.log('');
  
  // 4. 测试所有应用概览
  console.log('4️⃣ 所有应用资源概览:');
  const allApps = getAllAppsOverview();
  allApps.slice(0, 5).forEach(app => {
    console.log(`   ${app.appName} (${app.appType}): ${app.total} 个资源`);
  });
  console.log(`   ... 共 ${allApps.length} 个应用\n`);
  
  // 5. 测试快速查询（统一接口）
  console.log('5️⃣ 使用统一查询接口（quickQuery）:');
  const results = await quickQuery({
    text: '路由配置',
    appType: 'sub',
    resourceCategory: 'routes',
    limit: 5,
  });
  results.forEach((r, i) => {
    const name = r.metadata?.name || r.name;
    const path = r.metadata?.path || r.path;
    console.log(`   ${i + 1}. ${name} - ${path}`);
  });
  console.log('');
  
  console.log('✅ 快速查询API测试完成！\n');
}

main().catch(console.error);
