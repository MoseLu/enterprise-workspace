/**
 * 测试图标搜索（使用本地 Embedding）
 */

import { searchResources } from './search.mjs';
import { getStore } from './local-vector-store.mjs';

async function testSearch() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   图标向量数据库搜索测试（本地 Embedding）');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  const store = getStore();
  const count = store.getCount();
  console.log(`📊 当前已索引资源: ${count} 个\n`);
  
  if (count === 0) {
    console.log('⚠️  没有已索引的资源，请先运行索引命令：');
    console.log('   node scripts/commands/skills/vector-store/index-icons-only.mjs\n');
    return;
  }
  
  // 测试多个查询
  const queries = [
    '导出操作',
    '用户相关',
    '设置和配置',
    '成功状态',
    '导航菜单',
  ];
  
  for (const query of queries) {
    console.log(`\n🔍 搜索: "${query}"`);
    console.log('─'.repeat(80));
    
    try {
      const results = await searchResources(query, {
        resourceTypes: ['icon'],
        limit: 5,
        minScore: 0.2, // 降低阈值，适配本地 Embedding（384维）
      });
      
      if (results.length === 0) {
        console.log('  ❌ 未找到相关图标');
        continue;
      }
      
      console.log(`  ✅ 找到 ${results.length} 个相关图标:\n`);
      results.forEach((icon, index) => {
        console.log(`  ${index + 1}. ${icon.metadata.name} (${icon.metadata.category})`);
        console.log(`     相似度: ${(icon.score * 100).toFixed(1)}%`);
        console.log(`     路径: ${icon.metadata.path}`);
      });
    } catch (error) {
      console.error(`  ❌ 搜索失败:`, error.message);
      if (error.message.includes('OpenAI')) {
        console.log('  💡 提示: 正在尝试使用本地 Embedding 模型...');
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
}

testSearch().catch(console.error);
