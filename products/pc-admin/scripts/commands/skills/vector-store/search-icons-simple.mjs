/**
 * 使用关键词匹配搜索图标
 */

import { getStore } from './local-vector-store.mjs';

/**
 * 中文关键词映射
 */
const keywordMap = {
  '导出': ['export', 'download', 'download-alt'],
  '导入': ['import', 'upload', 'upload-example'],
  '删除': ['delete', 'delete-alt', 'delete-batch', 'recycle-bin'],
  '编辑': ['edit', 'modify-bind'],
  '新增': ['plus', 'plus-border', 'add'],
  '搜索': ['search', 'search-alt'],
  '刷新': ['refresh', 'sync'],
  '用户': ['user', 'people', 'team'],
  '设置': ['settings', 'set', 'config'],
  '成功': ['success', 'check'],
  '失败': ['fail', 'error'],
  '警告': ['warn', 'warning'],
  '信息': ['info', 'info-alt', 'msg'],
  '导航': ['navigation', 'menu', 'home', 'back'],
  '状态': ['status', 'success', 'fail', 'warn'],
};

/**
 * 使用关键词匹配搜索
 */
function searchIconsByKeyword(query, store) {
  const allResources = store.getAllResources();
  const iconResources = allResources.filter(r => r.type === 'icon');
  
  // 提取关键词
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(/[\s，,、]+/).filter(k => k.length > 0);
  
  // 扩展关键词（中文映射）
  const expandedKeywords = new Set(keywords);
  for (const [chinese, english] of Object.entries(keywordMap)) {
    if (queryLower.includes(chinese)) {
      english.forEach(en => expandedKeywords.add(en));
    }
  }
  
  const matched = iconResources.map(resource => {
    const name = resource.name.toLowerCase();
    const description = (resource.description || '').toLowerCase();
    const category = (resource.category || '').toLowerCase();
    const tags = JSON.parse(resource.tags || '[]').map(t => t.toLowerCase());
    
    // 计算匹配分数
    let score = 0;
    
    // 精确匹配名称
    expandedKeywords.forEach(keyword => {
      if (name === keyword) {
        score += 1.0;
      } else if (name.includes(keyword)) {
        score += 0.8;
      } else if (description.includes(keyword)) {
        score += 0.5;
      } else if (category.includes(keyword)) {
        score += 0.3;
      } else if (tags.some(t => t.includes(keyword))) {
        score += 0.2;
      }
    });
    
    // 原始查询匹配
    keywords.forEach(keyword => {
      if (name.includes(keyword)) score += 0.3;
      if (description.includes(keyword)) score += 0.2;
    });
    
    return {
      resource,
      score: Math.min(score, 1.0),
    };
  });
  
  // 过滤并排序
  const filtered = matched
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return filtered.slice(0, 10).map(item => ({
    id: item.resource.id,
    score: item.score,
    metadata: {
      type: item.resource.type,
      name: item.resource.name,
      path: item.resource.path,
      description: item.resource.description,
      category: item.resource.category,
      tags: JSON.parse(item.resource.tags || '[]'),
    },
  }));
}

/**
 * 主函数
 */
function main() {
  const query = process.argv[2] || '导出操作';
  
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   图标搜索（关键词匹配）');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  const store = getStore();
  const count = store.getCount();
  console.log(`📊 当前已索引资源: ${count} 个\n`);
  
  if (count === 0) {
    console.log('⚠️  没有已索引的资源，请先运行索引命令：');
    console.log('   node scripts/commands/skills/vector-store/index-icons-only.mjs\n');
    return;
  }
  
  console.log(`🔍 搜索: "${query}"\n`);
  
  const results = searchIconsByKeyword(query, store);
  
  if (results.length === 0) {
    console.log('❌ 未找到相关图标\n');
    return;
  }
  
  // 按分类分组
  const byCategory = {};
  results.forEach(result => {
    const category = result.metadata.category || '其他';
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category].push(result);
  });
  
  console.log(`✅ 找到 ${results.length} 个相关图标:\n`);
  
  for (const [category, icons] of Object.entries(byCategory)) {
    console.log(`📁 ${category.toUpperCase()} (${icons.length} 个)`);
    icons.forEach((icon, index) => {
      console.log(`  ${index + 1}. ${icon.metadata.name} (匹配度: ${(icon.score * 100).toFixed(1)}%)`);
      console.log(`     路径: ${icon.metadata.path}`);
      if (icon.metadata.description) {
        const desc = icon.metadata.description.substring(0, 60);
        console.log(`     描述: ${desc}${icon.metadata.description.length > 60 ? '...' : ''}`);
      }
    });
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  console.log('💡 提示：');
  console.log('   - 当前使用关键词匹配搜索');
  console.log('   - 设置 OPENAI_API_KEY 后可以使用语义搜索');
  console.log('   - 或安装本地 Embedding 模型后使用语义搜索\n');
}

main();
