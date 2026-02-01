/**
 * AI Agent 完整工作流程
 * 
 * 流程：
 * 1. 根据任务描述，在页面数据库中找到最接近的实现作为参考
 * 2. 通过参考页面推导需要的资源（布局、组件、国际化、配置、服务等）
 * 3. 通过资源数据库调度，找出最适合的方案
 * 4. 生成完整实现方案，以问答形式让用户确认
 * 5. 用户确认后，添加到方案数据库和资源数据库，并实现功能
 */

import { findSimilarPages, addPageImplementation, getPageResources } from './page-database.mjs';
import { createSolution, confirmSolution, markSolutionImplemented, getSolution } from './solution-database.mjs';
import { smartRecommend } from './smart-recommender.mjs';
import { detectTaskScenario } from './task-scenarios.mjs';
import { getStore } from './local-vector-store.mjs';
import { updateSolutionScore, recordSolutionUsage, getHighScoreSolutions } from './solution-scoring.mjs';
import { randomUUID } from 'crypto';

/**
 * 步骤 1：查找最接近的页面实现作为参考
 * 优先使用高评分的方案作为参考
 */
export async function findReferencePages(task, criteria = {}) {
  console.log('\n📚 步骤 1: 查找参考页面...\n');

  // 检测任务场景
  const scenario = detectTaskScenario(task);
  
    // 首先尝试从高评分方案中查找
    try {
      const { getHighScoreSolutions } = await import('./solution-scoring.mjs');
      const highScoreSolutions = await getHighScoreSolutions({
        minGenerality: 0.3,
        minUsageCount: 1,
        limit: 3,
      });

    if (highScoreSolutions.length > 0) {
      console.log(`✅ 找到 ${highScoreSolutions.length} 个高评分参考方案:\n`);
      highScoreSolutions.forEach((sol, index) => {
        console.log(`  ${index + 1}. ${sol.task_description} (${sol.scenario_type})`);
        console.log(`     通用程度: ${(sol.generality_score * 100).toFixed(1)}%`);
        console.log(`     使用次数: ${sol.usage_count}\n`);
      });
    }
  } catch (error) {
    // 评分系统不可用时，使用页面数据库
    console.log('💡 使用页面数据库查找参考...\n');
  }
  
  // 查找相似页面
  const similarPages = findSimilarPages({
    pageType: scenario || criteria.pageType,
    layoutType: criteria.layoutType,
    appName: criteria.appName,
    limit: 5,
  });

  if (similarPages.length === 0) {
    console.log('⚠️  未找到相似的页面实现，将使用通用推荐\n');
    return [];
  }

  console.log(`✅ 找到 ${similarPages.length} 个参考页面:\n`);
  similarPages.forEach((page, index) => {
    console.log(`  ${index + 1}. ${page.page_name} (${page.page_type})`);
    console.log(`     应用: ${page.app_name}`);
    console.log(`     布局: ${page.layout_type || '未指定'}`);
    console.log(`     路径: ${page.file_path}\n`);
  });

  return similarPages;
}

/**
 * 步骤 2：从参考页面推导需要的资源
 */
export function deriveResourcesFromPages(referencePages) {
  console.log('\n🔍 步骤 2: 从参考页面推导资源需求...\n');

  const resourceNeeds = {
    layout: new Set(),
    components: new Set(),
    composables: new Set(),
    icons: new Set(),
    locales: new Set(),
    utilities: new Set(),
    routes: new Set(),
    stores: new Set(),
    docs: new Set(),
    services: new Set(),
    configs: new Set(),
  };

  // 从每个参考页面提取资源
  for (const page of referencePages) {
    const resources = page.resources || {};
    
    if (resources.layout) {
      resources.layout.forEach(l => resourceNeeds.layout.add(l.path || l));
    }
    if (resources.components) {
      resources.components.forEach(c => resourceNeeds.components.add(c.path || c));
    }
    if (resources.composables) {
      resources.composables.forEach(c => resourceNeeds.composables.add(c.path || c));
    }
    if (resources.icons) {
      resources.icons.forEach(i => resourceNeeds.icons.add(i.path || i));
    }
    if (resources.locales) {
      resources.locales.forEach(l => resourceNeeds.locales.add(l.path || l));
    }
    if (resources.utilities) {
      resources.utilities.forEach(u => resourceNeeds.utilities.add(u.path || u));
    }
    if (resources.routes) {
      resources.routes.forEach(r => resourceNeeds.routes.add(r.path || r));
    }
    if (resources.stores) {
      resources.stores.forEach(s => resourceNeeds.stores.add(s.path || s));
    }
    if (resources.docs) {
      resources.docs.forEach(d => resourceNeeds.docs.add(d.path || d));
    }
    if (resources.services) {
      resources.services.forEach(s => resourceNeeds.services.add(s.path || s));
    }
    if (resources.configs) {
      resources.configs.forEach(c => resourceNeeds.configs.add(c.path || c));
    }
  }

  // 转换为数组
  const derivedResources = {};
  for (const [type, set] of Object.entries(resourceNeeds)) {
    if (set.size > 0) {
      derivedResources[type] = Array.from(set).map(path => ({ path }));
    }
  }

  console.log('📋 推导的资源需求:');
  for (const [type, items] of Object.entries(derivedResources)) {
    console.log(`  - ${type}: ${items.length} 个`);
  }
  console.log('');

  return derivedResources;
}

/**
 * 步骤 3：通过资源数据库调度，找出最适合的方案
 */
export async function scheduleResources(task, derivedResources, referencePages) {
  console.log('\n🎯 步骤 3: 调度资源数据库，找出最适合的方案...\n');

  // 使用智能推荐器获取推荐资源
  const recommendations = await smartRecommend(task, {
    minScore: 0.2,
  });

  // 合并推导的资源和推荐的资源
  const scheduledResources = {
    layout: [],
    components: [],
    composables: [],
    icons: [],
    locales: [],
    utilities: [],
    routes: [],
    stores: [],
    docs: [],
    services: [],
    configs: [],
  };

  // 从推荐结果中提取
  if (recommendations.resources.components) {
    // 布局组件
    const layouts = recommendations.resources.components.filter(c => 
      c.metadata.category === 'layout' || 
      c.metadata.name.includes('splitter') ||
      c.metadata.name.includes('layout')
    );
    scheduledResources.layout.push(...layouts);

    // 其他组件
    const otherComponents = recommendations.resources.components.filter(c => 
      !layouts.includes(c)
    );
    scheduledResources.components.push(...otherComponents);
  }

  if (recommendations.resources.composables) {
    scheduledResources.composables.push(...recommendations.resources.composables);
  }

  if (recommendations.resources.icons) {
    scheduledResources.icons.push(...recommendations.resources.icons);
  }

  if (recommendations.resources.locales) {
    scheduledResources.locales.push(...recommendations.resources.locales);
  }

  if (recommendations.resources.utilities) {
    scheduledResources.utilities.push(...recommendations.resources.utilities);
  }

  if (recommendations.resources.routes) {
    scheduledResources.routes.push(...recommendations.resources.routes);
  }

  if (recommendations.resources.stores) {
    scheduledResources.stores.push(...recommendations.resources.stores);
  }

  if (recommendations.resources.docs) {
    scheduledResources.docs.push(...recommendations.resources.docs);
  }

  // 从参考页面补充资源（如果推荐中没有）
  for (const [type, derived] of Object.entries(derivedResources)) {
    if (derived.length > 0 && scheduledResources[type].length === 0) {
      // 如果推荐中没有，使用参考页面的资源
      scheduledResources[type] = derived;
    }
  }

  console.log('✅ 资源调度完成:');
  for (const [type, items] of Object.entries(scheduledResources)) {
    if (items.length > 0) {
      console.log(`  - ${type}: ${items.length} 个`);
    }
  }
  console.log('');

  return scheduledResources;
}

/**
 * 步骤 4：生成完整实现方案
 */
export function generateImplementationPlan(task, scenario, scheduledResources, referencePages) {
  console.log('\n📝 步骤 4: 生成完整实现方案...\n');

  const plan = {
    task,
    scenario,
    layout: {
      type: scheduledResources.layout[0]?.metadata?.name || '未指定',
      component: scheduledResources.layout[0]?.metadata?.path || null,
    },
    components: scheduledResources.components.map(c => ({
      name: c.metadata?.name || c.path,
      path: c.metadata?.path || c.path,
      type: c.metadata?.category || '其他',
      usage: c.metadata?.description || '',
    })),
    composables: scheduledResources.composables.map(c => ({
      name: c.metadata?.name || c.path,
      path: c.metadata?.path || c.path,
      usage: c.metadata?.description || '',
    })),
    icons: scheduledResources.icons.map(i => ({
      name: i.metadata?.name || i.path,
      path: i.metadata?.path || i.path,
      category: i.metadata?.category || '其他',
    })),
    utilities: scheduledResources.utilities.map(u => ({
      name: u.metadata?.name || u.path,
      path: u.metadata?.path || u.path,
      usage: u.metadata?.description || '',
    })),
    routes: scheduledResources.routes.map(r => ({
      name: r.metadata?.name || r.path,
      path: r.metadata?.path || r.path,
      appName: r.metadata?.appName || '',
    })),
    stores: scheduledResources.stores.map(s => ({
      name: s.metadata?.name || s.path,
      path: s.metadata?.path || s.path,
      appName: s.metadata?.appName || '',
    })),
    docs: scheduledResources.docs.map(d => ({
      name: d.metadata?.name || d.path,
      path: d.metadata?.path || d.path,
      category: d.metadata?.category || 'general',
    })),
    locales: scheduledResources.locales.map(l => ({
      path: l.path || l,
      type: 'config',
    })),
    services: scheduledResources.services.map(s => ({
      path: s.path || s,
      status: 'todo', // 标记为待实现
    })),
    configs: scheduledResources.configs.map(c => ({
      path: c.path || c,
      type: 'columns' || 'forms',
    })),
    referencePages: referencePages.map(p => ({
      id: p.id,
      name: p.page_name,
      path: p.file_path,
      type: p.page_type,
    })),
  };

  console.log('✅ 实现方案已生成\n');
  return plan;
}

/**
 * 步骤 5：格式化方案为问答形式
 */
export function formatSolutionAsQuestions(plan) {
  const questions = [];

  questions.push('## 🎯 实现方案确认\n');
  questions.push(`**任务**: ${plan.task}\n`);
  questions.push(`**场景**: ${plan.scenario || '通用'}\n`);

  questions.push('### 📦 推荐的资源组合\n');

  if (plan.layout.component) {
    questions.push(`**布局组件**: ${plan.layout.type}`);
    questions.push(`- 路径: \`${plan.layout.component}\`\n`);
  }

  if (plan.components.length > 0) {
    questions.push('**页面组件**:');
    plan.components.forEach((comp, i) => {
      questions.push(`${i + 1}. ${comp.name} (\`${comp.path}\`)`);
    });
    questions.push('');
  }

  if (plan.composables.length > 0) {
    questions.push('**Composables**:');
    plan.composables.forEach((comp, i) => {
      questions.push(`${i + 1}. ${comp.name} (\`${comp.path}\`)`);
    });
    questions.push('');
  }

  if (plan.icons.length > 0) {
    questions.push('**图标**:');
    const iconNames = plan.icons.slice(0, 10).map(i => i.name).join(', ');
    questions.push(`${iconNames}${plan.icons.length > 10 ? '...' : ''}\n`);
  }

  if (plan.services.length > 0) {
    questions.push('**服务** (待实现):');
    plan.services.forEach((s, i) => {
      questions.push(`${i + 1}. ${s.path} [TODO]`);
    });
    questions.push('');
  }

  if (plan.referencePages.length > 0) {
    questions.push('**参考页面**:');
    plan.referencePages.forEach((p, i) => {
      questions.push(`${i + 1}. ${p.name} (\`${p.path}\`)`);
    });
    questions.push('');
  }

  questions.push('### ❓ 请确认\n');
  questions.push('1. 以上资源组合是否满足需求？');
  questions.push('2. 是否需要调整或补充？');
  questions.push('3. 服务是否需要等待实现，还是使用测试服务？\n');

  return questions.join('\n');
}

/**
 * 完整工作流程
 */
export async function executeAgentWorkflow(task, criteria = {}) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                   AI Agent 完整工作流程');
  console.log('═══════════════════════════════════════════════════════════════════════════════');

  try {
    // 步骤 1：查找参考页面
    const referencePages = await findReferencePages(task, criteria);

    // 步骤 2：推导资源需求
    const derivedResources = deriveResourcesFromPages(referencePages);

    // 步骤 3：调度资源
    const scheduledResources = await scheduleResources(task, derivedResources, referencePages);

    // 步骤 4：生成实现方案
    const scenario = detectTaskScenario(task);
    const plan = generateImplementationPlan(task, scenario, scheduledResources, referencePages);

    // 步骤 5：格式化方案
    const solutionText = formatSolutionAsQuestions(plan);

    // 创建方案记录
    const solutionId = randomUUID();
    createSolution({
      id: solutionId,
      taskDescription: task,
      scenarioType: scenario,
      version: '1.0.0',
      implementationPlan: plan,
      resources: scheduledResources,
      referencePages: referencePages.map(p => ({ id: p.id, name: p.page_name })),
      metadata: {
        layoutType: plan.layout.type,
        componentCount: plan.components.length,
        composableCount: plan.composables.length,
        iconCount: plan.icons.length,
      },
    });

    // 初始化方案评分
    updateSolutionScore(solutionId);

    // 记录参考页面的使用
    for (const refPage of referencePages) {
      recordSolutionUsage(refPage.id, solutionId, null, 'reference');
    }

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                   实现方案（待确认）');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    console.log(solutionText);
    console.log('\n═══════════════════════════════════════════════════════════════════════════════\n');
    console.log(`💾 方案已保存，ID: ${solutionId}\n`);

    return {
      solutionId,
      plan,
      solutionText,
    };
  } catch (error) {
    console.error('❌ 工作流程执行失败:', error);
    throw error;
  }
}

/**
 * 确认并实现方案
 */
export async function confirmAndImplement(solutionId, userFeedback = null, adjustments = {}) {
  console.log('\n✅ 步骤 5: 确认并实现方案...\n');

  // 获取方案
  const solution = getSolution(solutionId);
  if (!solution) {
    throw new Error(`方案不存在: ${solutionId}`);
  }

  // 应用用户调整
  if (adjustments.resources) {
    solution.resources = { ...solution.resources, ...adjustments.resources };
  }

  // 确认方案
  confirmSolution(solutionId, userFeedback);

  // 更新评分（确认后使用次数增加）
  updateSolutionScore(solutionId);

  // 将新资源添加到资源数据库
  const store = getStore();
  for (const [type, items] of Object.entries(solution.resources)) {
    for (const item of items) {
      if (item.isNew && item.metadata) {
        // 添加到向量数据库
        // store.addResource(...)
      }
    }
  }

  // 将实现添加到页面数据库
  if (adjustments.pageData) {
    addPageImplementation({
      id: randomUUID(),
      ...adjustments.pageData,
      resources: solution.resources,
    });
  }

  console.log('✅ 方案已确认并实现\n');
  return solution;
}

/**
 * 主函数（命令行使用）
 */
async function main() {
  const task = process.argv[2];
  
  if (!task) {
    console.log('用法: node ai-agent-workflow.mjs "任务描述"');
    console.log('示例: node ai-agent-workflow.mjs "创建一个简单的CRUD页面"');
    process.exit(1);
  }

  try {
    await executeAgentWorkflow(task);
  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行，执行主函数
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  main().catch(console.error);
} else {
  main().catch(console.error);
}
