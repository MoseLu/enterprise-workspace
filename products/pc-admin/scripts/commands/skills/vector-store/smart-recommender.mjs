/**
 * 智能推荐器
 * 支持任务驱动的组合推荐和多条件联合查询
 */

import { searchResources } from './search.mjs';
import { recommendBtcComponents } from './recommend-btc-components.mjs';
import { detectTaskScenario, getScenarioConfig, buildMultiQuery } from './task-scenarios.mjs';
import { getStore } from './local-vector-store.mjs';

/**
 * 智能推荐资源组合（任务驱动）
 * @param {string} task - 任务描述（如"创建一个简单的CRUD页面"）
 * @param {object} options - 选项
 * @returns {Promise<object>} 推荐的资源组合
 */
export async function smartRecommend(task, options = {}) {
  const {
    context = {},
    minScore = 0.2,
  } = options;

  console.log(`\n🎯 任务分析: "${task}"\n`);

  // 1. 检测任务场景
  const scenarioKey = detectTaskScenario(task);
  let scenario = null;
  
  if (scenarioKey) {
    scenario = getScenarioConfig(scenarioKey);
    console.log(`✅ 检测到任务场景: ${scenario.name} (${scenarioKey})\n`);
  } else {
    console.log(`⚠️  未检测到特定场景，使用通用推荐\n`);
  }

  // 2. 构建推荐结果
  const recommendations = {
    scenario: scenarioKey,
    scenarioName: scenario?.name,
    resources: {
      components: [],
      composables: [],
      icons: [],
      locales: [],
      utilities: [],
      routes: [],
      stores: [],
      docs: [],
    },
    summary: {
      total: 0,
      byType: {},
    },
  };

  // 3. 根据场景或通用策略推荐资源
  if (scenario) {
    // 使用场景配置
    await recommendByScenario(task, scenario, recommendations, { minScore, context });
  } else {
    // 通用推荐
    await recommendGeneric(task, recommendations, { minScore, context });
  }

  // 4. 计算统计
  for (const [type, resources] of Object.entries(recommendations.resources)) {
    recommendations.summary.byType[type] = resources.length;
    recommendations.summary.total += resources.length;
  }

  return recommendations;
}

/**
 * 根据场景推荐资源
 */
async function recommendByScenario(task, scenario, recommendations, options) {
  const { minScore, context } = options;
  const { priority, resourceTypes } = scenario;

  // 按优先级顺序推荐
  for (const resourceKey of priority) {
    const config = resourceTypes[resourceKey];
    if (!config) continue;

    try {
      console.log(`🔍 搜索 ${resourceKey} (${config.type})...`);

      // 构建查询（结合任务和场景特定查询）
      const query = buildMultiQuery(task, [config.query]);
      
      let results = [];
      
      if (config.type === 'component' && config.filter === 'btc') {
        // 使用 btc 组件推荐
        results = await recommendBtcComponents(query, {
          limit: config.limit || 5,
          minScore,
        });
      } else {
        // 通用搜索（支持层级过滤）
        results = await searchResources(query, {
          resourceTypes: [config.type],
          limit: config.limit || 5,
          minScore,
          appName: context.appName,
          appType: context.appType,
          resourceCategory: context.resourceCategory,
        });
      }

      // 存储结果
      const typeKey = config.type === 'component' ? 'components' :
                      config.type === 'composable' ? 'composables' :
                      config.type === 'icon' ? 'icons' :
                      config.type === 'locale' ? 'locales' :
                      config.type === 'utility' ? 'utilities' : 'components';

      recommendations.resources[typeKey].push(...results);
      
      console.log(`   ✅ 找到 ${results.length} 个 ${resourceKey} 资源\n`);
    } catch (error) {
      console.warn(`   ⚠️  搜索 ${resourceKey} 失败:`, error.message);
    }
  }
}

/**
 * 通用推荐（未检测到特定场景时）
 */
async function recommendGeneric(task, recommendations, options) {
  const { minScore, context } = options;

  // 推荐各种类型的资源
  const resourceTypes = [
    { type: 'component', key: 'components', query: task, filter: 'btc', limit: 5 },
    { type: 'composable', key: 'composables', query: task, limit: 3 },
    { type: 'icon', key: 'icons', query: task, limit: 10 },
  ];

  for (const config of resourceTypes) {
    try {
      console.log(`🔍 搜索 ${config.key}...`);

      let results = [];
      
      if (config.filter === 'btc') {
        results = await recommendBtcComponents(config.query, {
          limit: config.limit,
          minScore,
        });
      } else {
        results = await searchResources(config.query, {
          resourceTypes: [config.type],
          limit: config.limit,
          minScore,
        });
      }

      recommendations.resources[config.key].push(...results);
      console.log(`   ✅ 找到 ${results.length} 个资源\n`);
    } catch (error) {
      console.warn(`   ⚠️  搜索 ${config.key} 失败:`, error.message);
    }
  }
}

/**
 * 格式化推荐结果（用于输出）
 */
export function formatSmartRecommendations(recommendations) {
  const lines = [];
  
  if (recommendations.scenarioName) {
    lines.push(`## 🎯 任务场景: ${recommendations.scenarioName}\n`);
  }

  // 组件推荐
  if (recommendations.resources.components.length > 0) {
    lines.push('### 📦 推荐的组件 (btc-xxx)');
    recommendations.resources.components.forEach((comp, index) => {
      lines.push(`${index + 1}. **${comp.metadata.name}**`);
      lines.push(`   - 路径: \`${comp.metadata.path}\``);
      lines.push(`   - 相似度: ${(comp.score * 100).toFixed(1)}%`);
      if (comp.metadata.description) {
        const desc = comp.metadata.description.substring(0, 100);
        lines.push(`   - 描述: ${desc}${comp.metadata.description.length > 100 ? '...' : ''}`);
      }
      lines.push('');
    });
  }

  // Composables 推荐
  if (recommendations.resources.composables.length > 0) {
    lines.push('### 🔧 推荐的 Composables');
    recommendations.resources.composables.forEach((comp, index) => {
      lines.push(`${index + 1}. **${comp.metadata.name}**`);
      lines.push(`   - 路径: \`${comp.metadata.path}\``);
      lines.push(`   - 相似度: ${(comp.score * 100).toFixed(1)}%`);
      lines.push('');
    });
  }

  // 图标推荐
  if (recommendations.resources.icons.length > 0) {
    lines.push('### 🎨 推荐的图标');
    const iconGroups = {};
    recommendations.resources.icons.forEach(icon => {
      const category = icon.metadata.category || '其他';
      if (!iconGroups[category]) {
        iconGroups[category] = [];
      }
      iconGroups[category].push(icon);
    });
    
    for (const [category, icons] of Object.entries(iconGroups)) {
      lines.push(`**${category}**: ${icons.map(i => i.metadata.name).join(', ')}`);
    }
    lines.push('');
  }

  // 统计
  lines.push('### 📊 推荐统计');
  lines.push(`- 总计: ${recommendations.summary.total} 个资源`);
  for (const [type, count] of Object.entries(recommendations.summary.byType)) {
    if (count > 0) {
      lines.push(`- ${type}: ${count} 个`);
    }
  }

  return lines.join('\n');
}

/**
 * 主函数（命令行使用）
 */
async function main() {
  const task = process.argv[2];
  
  if (!task) {
    console.log('用法: node smart-recommender.mjs "任务描述"');
    console.log('示例: node smart-recommender.mjs "创建一个简单的CRUD页面"');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   智能资源推荐（任务驱动）');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  const store = getStore();
  const count = store.getCount();
  console.log(`\n📊 当前已索引资源: ${count} 个\n`);

  if (count === 0) {
    console.log('⚠️  没有已索引的资源，请先运行索引命令\n');
    return;
  }

  try {
    const recommendations = await smartRecommend(task, {
      minScore: 0.2,
    });

    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('                   推荐结果');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    
    console.log(formatSmartRecommendations(recommendations));
    
    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ 推荐失败:', error);
    process.exit(1);
  }
}

// 如果直接运行，执行主函数
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main().catch(console.error);
} else {
  main().catch(console.error);
}
