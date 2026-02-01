/**
 * 搜索组件（使用向量数据库）
 * 示例：node search-components.mjs "分栏布局"
 */

import { searchResources } from './search.mjs';
import { getStore } from './local-vector-store.mjs';

async function main() {
  const query = process.argv[2];
  
  if (!query) {
    console.log('用法: node search-components.mjs "查询词"');
    console.log('示例: node search-components.mjs "分栏布局"');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   组件搜索（向量数据库）');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  const store = getStore();
  const count = store.getCount();
  console.log(`📊 当前已索引资源: ${count} 个\n`);
  
  if (count === 0) {
    console.log('⚠️  没有已索引的资源，请先运行索引命令：');
    console.log('   node scripts/commands/skills/vector-store/index-components-only.mjs\n');
    return;
  }
  
  console.log(`🔍 搜索: "${query}"\n`);
  
  try {
    const results = await searchResources(query, {
      resourceTypes: ['component'],
      limit: 10,
      minScore: 0.2, // 适配本地 Embedding（384维）
    });
    
    if (results.length === 0) {
      console.log('❌ 未找到相关组件\n');
      return;
    }
    
    // 过滤：只返回 btc-xxx 格式的自定义组件
    const btcComponents = results.filter(result => {
      const name = result.metadata.name || '';
      const path = result.metadata.path || '';
      // 检查组件名或路径是否包含 btc-
      return name.toLowerCase().includes('btc-') || 
             path.toLowerCase().includes('btc-') ||
             name.toLowerCase().startsWith('btc');
    });
    
    if (btcComponents.length === 0) {
      console.log('❌ 未找到 btc-xxx 格式的自定义组件\n');
      console.log('💡 提示：搜索结果中可能没有 btc-xxx 组件，显示所有结果：\n');
      // 如果没有 btc 组件，显示所有结果
      var displayResults = results;
    } else {
      var displayResults = btcComponents;
    }
    
    console.log(`✅ 找到 ${displayResults.length} 个相关组件:\n`);
    
    // 按分类分组
    const byCategory = {};
    displayResults.forEach(result => {
      const category = result.metadata.category || '其他';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(result);
    });
    
    for (const [category, components] of Object.entries(byCategory)) {
      console.log(`📁 ${category.toUpperCase()} (${components.length} 个)`);
      components.forEach((component, index) => {
        console.log(`  ${index + 1}. ${component.metadata.name}`);
        console.log(`     相似度: ${(component.score * 100).toFixed(1)}%`);
        console.log(`     路径: ${component.metadata.path}`);
        if (component.metadata.description) {
          const desc = component.metadata.description.substring(0, 80);
          console.log(`     描述: ${desc}${component.metadata.description.length > 80 ? '...' : ''}`);
        }
        if (component.metadata.props && component.metadata.props.length > 0) {
          console.log(`     Props: ${component.metadata.props.slice(0, 3).join(', ')}${component.metadata.props.length > 3 ? '...' : ''}`);
        }
      });
      console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ 搜索失败:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
