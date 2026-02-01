/**
 * 搜索图标示例
 */

import { searchResources } from './search.mjs';
import { getStore } from './local-vector-store.mjs';

/**
 * 搜索图标
 */
async function searchIcons(query) {
  console.log(`\n🔍 搜索图标: "${query}"\n`);
  
  try {
    const results = await searchResources(query, {
      resourceTypes: ['icon'],
      limit: 10,
      minScore: 0.5,
    });
    
    if (results.length === 0) {
      console.log('❌ 未找到相关图标\n');
      return;
    }
    
    console.log(`✅ 找到 ${results.length} 个相关图标:\n`);
    
    // 按分类分组
    const byCategory = {};
    results.forEach(result => {
      const category = result.metadata.category || '其他';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(result);
    });
    
    // 显示结果
    for (const [category, icons] of Object.entries(byCategory)) {
      console.log(`📁 ${category.toUpperCase()} (${icons.length} 个)`);
      icons.forEach((icon, index) => {
        console.log(`  ${index + 1}. ${icon.metadata.name} (相似度: ${(icon.score * 100).toFixed(1)}%)`);
        console.log(`     路径: ${icon.metadata.path}`);
        if (icon.metadata.description) {
          console.log(`     描述: ${icon.metadata.description.substring(0, 60)}...`);
        }
      });
      console.log('');
    }
    
    return results;
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
    if (error.message.includes('OpenAI API key')) {
      console.log('\n💡 提示: 当前使用的是简化向量（基于哈希），搜索准确性有限。');
      console.log('   设置 OPENAI_API_KEY 环境变量后，可以使用真正的语义搜索。\n');
    }
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  const query = process.argv[2] || '导出操作';
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   图标向量数据库搜索示例');
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  
  // 显示存储统计
  const store = getStore();
  const count = store.getCount();
  console.log(`\n📊 当前已索引资源: ${count} 个\n`);
  
  // 执行搜索
  await searchIcons(query);
  
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
