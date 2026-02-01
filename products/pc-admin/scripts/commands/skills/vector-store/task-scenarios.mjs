/**
 * 任务场景配置
 * 定义不同任务场景需要的资源组合
 */

/**
 * 任务场景模板
 * 每个场景定义了：
 * - 关键词：触发该场景的关键词
 * - 资源需求：需要的资源类型和数量
 * - 查询策略：如何构建搜索查询
 */
export const taskScenarios = {
  'crud-page': {
    name: 'CRUD 页面',
    keywords: ['crud', '增删改查', '列表页面', '管理页面', '数据管理'],
    resourceTypes: {
      layout: { type: 'component', query: '布局 layout', limit: 3, filter: 'btc' },
      table: { type: 'component', query: '表格 table master-table-group', limit: 3, filter: 'btc' },
      form: { type: 'component', query: '表单 form', limit: 3, filter: 'btc' },
      composable: { type: 'composable', query: 'crud useCrud 增删改查', limit: 3 },
      icon: { type: 'icon', query: '操作 编辑 删除 新增', limit: 10 },
      locale: { type: 'locale', query: 'crud 增删改查', limit: 1 },
    },
    priority: ['layout', 'table', 'composable', 'form', 'icon', 'locale'],
  },
  'form-page': {
    name: '表单页面',
    keywords: ['表单', 'form', '输入', '提交'],
    resourceTypes: {
      layout: { type: 'component', query: '布局 layout', limit: 2, filter: 'btc' },
      form: { type: 'component', query: '表单 form input select', limit: 5, filter: 'btc' },
      composable: { type: 'composable', query: 'form useForm 表单验证', limit: 3 },
      icon: { type: 'icon', query: '提交 保存 确认', limit: 5 },
    },
    priority: ['form', 'layout', 'composable', 'icon'],
  },
  'detail-page': {
    name: '详情页面',
    keywords: ['详情', 'detail', '查看', '详情页'],
    resourceTypes: {
      layout: { type: 'component', query: '布局 layout', limit: 2, filter: 'btc' },
      card: { type: 'component', query: '卡片 card', limit: 3, filter: 'btc' },
      composable: { type: 'composable', query: 'detail useDetail 详情', limit: 2 },
      icon: { type: 'icon', query: '查看 详情 信息', limit: 5 },
    },
    priority: ['card', 'layout', 'composable', 'icon'],
  },
  'dashboard': {
    name: '仪表盘',
    keywords: ['仪表盘', 'dashboard', '统计', '数据展示'],
    resourceTypes: {
      layout: { type: 'component', query: '布局 layout', limit: 2, filter: 'btc' },
      chart: { type: 'component', query: '图表 chart', limit: 5, filter: 'btc' },
      card: { type: 'component', query: '卡片 card', limit: 3, filter: 'btc' },
      composable: { type: 'composable', query: 'chart 图表 统计', limit: 2 },
      icon: { type: 'icon', query: '统计 数据 图表', limit: 10 },
    },
    priority: ['chart', 'card', 'layout', 'composable', 'icon'],
  },
};

/**
 * 检测任务场景
 * @param {string} task - 任务描述
 * @returns {string|null} 场景名称
 */
export function detectTaskScenario(task) {
  const taskLower = task.toLowerCase();
  
  for (const [scenarioKey, scenario] of Object.entries(taskScenarios)) {
    for (const keyword of scenario.keywords) {
      if (taskLower.includes(keyword.toLowerCase())) {
        return scenarioKey;
      }
    }
  }
  
  return null;
}

/**
 * 获取场景配置
 * @param {string} scenarioKey - 场景键
 * @returns {object|null} 场景配置
 */
export function getScenarioConfig(scenarioKey) {
  return taskScenarios[scenarioKey] || null;
}

/**
 * 构建多条件查询
 * @param {string} baseQuery - 基础查询
 * @param {Array<string>} additionalTerms - 附加查询词
 * @returns {string} 组合查询
 */
export function buildMultiQuery(baseQuery, additionalTerms = []) {
  const terms = [baseQuery, ...additionalTerms].filter(Boolean);
  return terms.join(' ');
}
