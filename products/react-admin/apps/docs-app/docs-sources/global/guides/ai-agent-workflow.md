# AI Agent 完整工作流程

## 📋 流程概述

AI Agent 在得到具体的页面功能任务指标后，执行以下完整流程：

```
1. 查找参考页面 → 2. 推导资源需求 → 3. 调度资源 → 4. 生成方案 → 5. 用户确认 → 6. 实现并存储
```

## 🔄 详细流程

### 步骤 1：查找参考页面

**目标**：根据任务描述，在页面数据库中找到最接近的实现作为参考

**实现**：
```javascript
const referencePages = await findReferencePages('创建一个简单的CRUD页面', {
  pageType: 'crud',
  layoutType: 'splitter',
  appName: 'system-app'
});
```

**输出**：
- 相似页面列表（按相似度排序）
- 页面类型、布局类型、使用的资源

### 步骤 2：推导资源需求

**目标**：通过参考页面，推导出需要的资源类型

**实现**：
```javascript
const derivedResources = deriveResourcesFromPages(referencePages);
// 返回: {
//   layout: [{ path: '...' }],
//   components: [{ path: '...' }],
//   composables: [{ path: '...' }],
//   icons: [{ path: '...' }],
//   locales: [{ path: '...' }],
//   services: [{ path: '...' }],
//   configs: [{ path: '...' }]
// }
```

**输出**：
- 布局组件需求
- 页面组件需求
- Composables 需求
- 图标需求
- 国际化需求
- 服务需求（标记为 TODO）
- 配置文件需求

### 步骤 3：调度资源数据库

**目标**：通过资源数据库调度，找出最适合的方案

**实现**：
```javascript
const scheduledResources = await scheduleResources(
  '创建一个简单的CRUD页面',
  derivedResources,
  referencePages
);
```

**过程**：
1. 使用 `smartRecommend()` 获取推荐资源
2. 合并参考页面的资源和推荐的资源
3. 优先使用推荐的资源，参考页面资源作为补充

**输出**：
- 完整的资源组合（布局 + 组件 + Composables + 图标 + 配置 + 服务）

### 步骤 4：生成实现方案

**目标**：生成完整的实现方案，以问答形式让用户确认

**实现**：
```javascript
const plan = generateImplementationPlan(
  task,
  scenario,
  scheduledResources,
  referencePages
);
```

**方案内容**：
- 任务描述
- 场景类型
- 布局方案
- 组件列表（btc-xxx）
- Composables 列表
- 图标列表
- 国际化配置
- 服务列表（标记 TODO）
- 参考页面列表

### 步骤 5：用户确认

**目标**：以问答形式让用户确认方案

**格式**：
```
## 🎯 实现方案确认

**任务**: 创建一个简单的CRUD页面
**场景**: CRUD 页面

### 📦 推荐的资源组合

**布局组件**: btc-splitter
- 路径: `packages/shared-components/src/components/basic/btc-splitter/index.vue`

**页面组件**:
1. btc-master-table-group (`packages/.../btc-master-table-group/index.vue`)
2. btc-form (`packages/.../btc-form/index.vue`)

**Composables**:
1. useCrud (`packages/shared-core/src/composables/useCrud.ts`)

**图标**: export, import, edit, delete, plus

**服务** (待实现):
1. user.service.ts [TODO]

**参考页面**:
1. user-list.vue (`apps/system-app/src/views/user/list.vue`)

### ❓ 请确认
1. 以上资源组合是否满足需求？
2. 是否需要调整或补充？
3. 服务是否需要等待实现，还是使用测试服务？
```

### 步骤 6：确认并实现

**目标**：用户确认后，添加到数据库并实现功能

**实现**：
```javascript
await confirmAndImplement(solutionId, userFeedback, {
  resources: adjustedResources,  // 用户调整的资源
  pageData: {  // 新页面的数据
    appName: 'system-app',
    moduleName: 'user',
    pageName: 'user-list',
    pageType: 'crud',
    layoutType: 'splitter',
    filePath: 'apps/system-app/src/views/user/list.vue'
  }
});
```

**操作**：
1. 确认方案（更新状态为 'confirmed'）
2. 将新资源添加到资源数据库
3. 将实现添加到页面数据库
4. 标记方案为已实现
5. 实际实现功能（生成代码）

## 🗄️ 数据库结构

### 页面数据库（page-database.db）

**page_implementations 表**：
- `id`: 页面ID
- `app_name`: 应用名
- `module_name`: 模块名
- `page_name`: 页面名
- `page_type`: 页面类型（crud, form, detail, dashboard）
- `layout_type`: 布局类型（splitter, dual-menu, etc.）
- `resources`: JSON，使用的资源列表
- `file_path`: 文件路径

**page_resources 表**：
- `page_id`: 页面ID
- `resource_type`: 资源类型
- `resource_id`: 资源ID
- `resource_path`: 资源路径
- `usage_context`: JSON，使用上下文

### 方案数据库（solution-database.db）

**solutions 表**：
- `id`: 方案ID
- `task_description`: 任务描述
- `scenario_type`: 场景类型
- `status`: 状态（pending, confirmed, rejected, implemented）
- `implementation_plan`: JSON，实现方案
- `resources`: JSON，推荐的资源
- `reference_pages`: JSON，参考页面
- `user_feedback`: 用户反馈

**solution_resources 表**：
- `solution_id`: 方案ID
- `resource_type`: 资源类型
- `resource_id`: 资源ID
- `is_new`: 是否是新资源

## 🚀 使用方式

### 方式 1：完整工作流程

```bash
# 执行完整工作流程
node scripts/commands/skills/vector-store/ai-agent-workflow.mjs "创建一个简单的CRUD页面"
```

### 方式 2：在 Skills 中自动调用

```javascript
// 在 Skill 中
import { executeAgentWorkflow } from './ai-agent-workflow.mjs';

// 当用户描述任务时，自动执行
const result = await executeAgentWorkflow('创建一个简单的CRUD页面', {
  appName: 'system-app',
  layoutType: 'splitter'
});

// 显示方案让用户确认
console.log(result.solutionText);
```

### 方式 3：扫描现有页面

```bash
# 扫描项目中的现有页面，添加到页面数据库
node scripts/commands/skills/vector-store/scan-existing-pages.mjs
```

## 📊 工作流程示例

### 示例：创建 CRUD 页面

**用户输入**："创建一个简单的CRUD页面"

**步骤 1：查找参考页面**
```
✅ 找到 3 个参考页面:
  1. user-list (crud) - apps/system-app/src/views/user/list.vue
  2. order-list (crud) - apps/system-app/src/views/order/list.vue
  3. product-list (crud) - apps/system-app/src/views/product/list.vue
```

**步骤 2：推导资源需求**
```
📋 推导的资源需求:
  - layout: 1 个 (btc-splitter)
  - components: 3 个 (btc-master-table-group, btc-form, ...)
  - composables: 2 个 (useCrud, useTable)
  - icons: 10 个 (export, import, edit, delete, ...)
  - locales: 1 个 (config.ts)
  - services: 1 个 (user.service.ts [TODO])
```

**步骤 3：调度资源**
```
✅ 资源调度完成:
  - layout: 1 个 (btc-splitter)
  - components: 5 个 (btc-master-table-group, btc-form, ...)
  - composables: 2 个 (useCrud, useTable)
  - icons: 10 个
```

**步骤 4：生成方案**
```
✅ 实现方案已生成
```

**步骤 5：用户确认**
```
## 🎯 实现方案确认
[显示完整方案]
```

**步骤 6：确认并实现**
```
✅ 方案已确认并实现
```

## 🔧 扩展和定制

### 添加新的页面类型检测

在 `scan-existing-pages.mjs` 中修改 `detectPageType()`：

```javascript
function detectPageType(filePath, content) {
  // 添加新的检测逻辑
  if (content.includes('custom-pattern')) {
    return 'custom-type';
  }
  // ...
}
```

### 添加新的场景配置

在 `task-scenarios.mjs` 中添加新场景：

```javascript
export const taskScenarios = {
  // ... 现有场景
  'custom-scenario': {
    name: '自定义场景',
    keywords: ['关键词1', '关键词2'],
    resourceTypes: { /* ... */ },
    priority: [/* ... */],
  },
};
```

## 📚 相关文档

- [多条件联合查询指南](./vector-store-multi-query.md)
- [向量数据库完整指南](./vector-store-complete-guide.md)
- [BTC 组件推荐器 Skill](../.cursor/skills/btc-component-recommender/SKILL.md)

## ✅ 总结

**完整工作流程**：
1. ✅ 查找参考页面
2. ✅ 推导资源需求
3. ✅ 调度资源数据库
4. ✅ 生成实现方案
5. ✅ 用户确认
6. ✅ 实现并存储

**数据库**：
- ✅ 页面数据库（存储已实现页面）
- ✅ 方案数据库（存储实现方案）
- ✅ 资源数据库（向量数据库）

**自动化**：
- ✅ Skills 自动调用
- ✅ 任务场景检测
- ✅ 资源自动调度
- ✅ 方案自动生成

系统现在可以执行完整的 AI Agent 工作流程！🎉
