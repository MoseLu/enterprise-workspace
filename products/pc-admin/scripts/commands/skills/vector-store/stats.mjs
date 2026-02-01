/**
 * 资源统计脚本
 */

import { getStore } from './local-vector-store.mjs';

const store = getStore();

console.log('📊 RAG 数据库资源统计\n');
console.log(`总资源数: ${store.getCount()} 个\n`);

// 按应用类型统计
console.log('按应用类型统计:');
const byAppType = store.db.prepare(`
  SELECT app_type, COUNT(*) as count
  FROM resources
  WHERE app_type IS NOT NULL
  GROUP BY app_type
  ORDER BY count DESC
`).all();

byAppType.forEach(stat => {
  console.log(`  ${stat.app_type || 'unknown'}: ${stat.count} 个`);
});
console.log('');

// 按资源类型统计
console.log('按资源类型统计:');
const byResourceCategory = store.db.prepare(`
  SELECT resource_category, COUNT(*) as count
  FROM resources
  WHERE resource_category IS NOT NULL
  GROUP BY resource_category
  ORDER BY count DESC
`).all();

byResourceCategory.forEach(stat => {
  console.log(`  ${stat.resource_category || 'unknown'}: ${stat.count} 个`);
});
console.log('');

// 按应用统计（前10个）
console.log('按应用统计（前10个）:');
const byApp = store.db.prepare(`
  SELECT app_name, app_type, COUNT(*) as count
  FROM resources
  WHERE app_name IS NOT NULL
  GROUP BY app_name, app_type
  ORDER BY count DESC
  LIMIT 10
`).all();

byApp.forEach(stat => {
  console.log(`  ${stat.app_name} (${stat.app_type}): ${stat.count} 个`);
});
console.log('');

// 层级深度统计
console.log('按层级深度统计:');
const byDepth = store.db.prepare(`
  SELECT depth, COUNT(*) as count
  FROM resources
  WHERE depth IS NOT NULL
  GROUP BY depth
  ORDER BY depth
`).all();

byDepth.forEach(stat => {
  console.log(`  深度 ${stat.depth}: ${stat.count} 个资源`);
});
