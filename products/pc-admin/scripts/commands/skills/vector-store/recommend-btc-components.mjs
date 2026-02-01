/**
 * 推荐 btc-xxx 自定义组件（供 Skills 调用）
 * 只返回 btc-xxx 格式的自定义组件
 */

import { searchResources } from './search.mjs';
import { getStore } from './local-vector-store.mjs';

/**
 * 推荐 btc-xxx 组件
 * @param {string} query - 搜索查询
 * @param {object} options - 搜索选项
 * @returns {Promise<Array>} 推荐的组件列表
 */
export async function recommendBtcComponents(query, options = {}) {
  const {
    limit = 10,
    minScore = 0.2,
  } = options;

  try {
    // 搜索组件
    const results = await searchResources(query, {
      resourceTypes: ['component'],
      limit: limit * 2, // 多搜索一些，因为要过滤
      minScore,
    });

    // 过滤：只返回 btc-xxx 格式的自定义组件
    const btcComponents = results.filter(result => {
      const name = result.metadata.name || '';
      const path = result.metadata.path || '';
      
      // 检查是否是 btc-xxx 格式
      const isBtcComponent = 
        name.toLowerCase().includes('btc-') || 
        path.toLowerCase().includes('btc-') ||
        name.toLowerCase().startsWith('btc');
      
      // 排除项目内部使用的组件（如 app-layout, notification-icon 等）
      const isInternalComponent = 
        path.includes('app-layout') ||
        path.includes('notification-icon') ||
        path.includes('message-icon') ||
        path.includes('user-info') ||
        path.includes('top-left-sidebar') ||
        path.includes('top-menu') ||
        path.includes('dual-menu');
      
      return isBtcComponent && !isInternalComponent;
    });

    // 限制返回数量
    return btcComponents.slice(0, limit);
  } catch (error) {
    console.error('Failed to recommend btc components:', error);
    return [];
  }
}

/**
 * 主函数（命令行使用）
 */
async function main() {
  const query = process.argv[2];
  
  if (!query) {
    console.log('用法: node recommend-btc-components.mjs "查询词"');
    console.log('示例: node recommend-btc-components.mjs "分栏布局"');
    process.exit(1);
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   BTC 自定义组件推荐（向量数据库）');
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
  
  const components = await recommendBtcComponents(query, {
    limit: 10,
    minScore: 0.2,
  });
  
  if (components.length === 0) {
    console.log('❌ 未找到相关的 btc-xxx 自定义组件\n');
    console.log('💡 提示：');
    console.log('   - 确保已索引组件：node scripts/commands/skills/vector-store/index-components-only.mjs');
    console.log('   - 尝试使用其他关键词搜索\n');
    return;
  }
  
  console.log(`✅ 推荐 ${components.length} 个 btc-xxx 自定义组件:\n`);
  
  // 按分类分组
  const byCategory = {};
  components.forEach(component => {
    const category = component.metadata.category || '其他';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(component);
  });
  
  for (const [category, comps] of Object.entries(byCategory)) {
    console.log(`📁 ${category.toUpperCase()} (${comps.length} 个)`);
    comps.forEach((comp, index) => {
      console.log(`\n  ${index + 1}. ${comp.metadata.name}`);
      console.log(`     相似度: ${(comp.score * 100).toFixed(1)}%`);
      console.log(`     路径: ${comp.metadata.path}`);
      if (comp.metadata.description) {
        const desc = comp.metadata.description.substring(0, 100);
        console.log(`     描述: ${desc}${comp.metadata.description.length > 100 ? '...' : ''}`);
      }
      if (comp.metadata.props && comp.metadata.props.length > 0) {
        console.log(`     Props: ${comp.metadata.props.slice(0, 5).join(', ')}${comp.metadata.props.length > 5 ? '...' : ''}`);
      }
    });
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

// 如果直接运行，执行主函数
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main().catch(console.error);
} else {
  // 直接运行
  main().catch(console.error);
}
