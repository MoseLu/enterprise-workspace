# RAG 数据库层级结构（B树）指南

## 📊 概述

RAG 数据库现在使用 B树层级结构来组织资源，支持快速、精确的层级查询。资源总数已从 732 个增加到 **1047+ 个**。

## 🌳 层级结构

### 层级定义

资源按以下层级组织：

```
应用层级 (app_name, app_type)
  └─ 资源类型层级 (resource_category)
      └─ 模块层级 (module_name, 可选)
          └─ 具体资源
```

### 应用类型 (app_type)

- **`main`**: 主应用（main-app）
- **`sub`**: 子应用（system-app, admin-app, finance-app 等）
- **`package`**: 共享包（shared-components, shared-core 等）

### 资源类型 (resource_category)

- **`composables`**: Composables 函数
- **`routes`**: 路由配置
- **`stores`**: 状态管理
- **`components`**: Vue 组件
- **`utils`**: 工具函数
- **`docs`**: 文档
- **`icons`**: 图标
- **`locales`**: 国际化资源
- **`config`**: 配置文件
- **`services`**: 服务
- **`modules`**: 模块

## 📊 当前资源统计

### 总资源数：1047+ 个

#### 主应用 (main-app)
- composables: 3 个
- routes: 22 个
- stores: 12 个
- config: 12 个
- utils: 17 个
- 总计：83 个资源

#### 子应用（多个）
- **admin-app**: 135 个资源
- **system-app**: 79 个资源
- **logistics-app**: 58 个资源
- **quality-app**: 50 个资源
- **finance-app**: 26 个资源
- **mobile-app**: 28 个资源
- 其他子应用：100+ 个资源
- **总计：500+ 个资源**

#### 共享包 (packages)
- **shared-core**: 145 个资源
- **shared-components**: 84 个资源
- **总计：400+ 个资源**

## 🔍 快速查询API

### 1. 直接查询（最快）

当明确知道应用和资源类型时，使用直接查询：

```javascript
import { quickGetByAppAndCategory } from './quick-query.mjs';

// 获取 system-app 的所有路由配置
const routes = await quickGetByAppAndCategory('system-app', 'routes', 50);
```

### 2. 语义搜索 + 层级过滤

需要语义搜索但想限制在特定层级：

```javascript
import { quickSearch } from './quick-query.mjs';

// 搜索主应用的 composables
const composables = await quickSearch('表单处理', {
  appType: 'main',
  resourceCategory: 'composables',
});
```

### 3. 统一查询接口

```javascript
import { quickQuery } from './quick-query.mjs';

// 统一接口，自动选择最优查询方式
const results = await quickQuery({
  text: '路由配置',           // 可选：搜索文本
  appName: 'system-app',     // 可选：应用名称
  appType: 'sub',            // 可选：应用类型
  resourceCategory: 'routes', // 可选：资源类型
  limit: 10,
  minScore: 0.2,
});
```

## 🎯 Skills 使用示例

### 示例 1：获取应用的资源概览

```javascript
import { getAppOverview } from './quick-query.mjs';

const overview = getAppOverview('system-app');
console.log(overview);
// {
//   appName: 'system-app',
//   categories: [
//     { category: 'composables', count: 5 },
//     { category: 'routes', count: 4 },
//     ...
//   ],
//   total: 79
// }
```

### 示例 2：快速获取特定资源

```javascript
import { quickGetByAppAndCategory } from './quick-query.mjs';

// 获取 main-app 的所有 composables
const composables = await quickGetByAppAndCategory('main-app', 'composables');

// 获取 system-app 的所有 stores
const stores = await quickGetByAppAndCategory('system-app', 'stores');
```

### 示例 3：层级搜索

```javascript
import { searchByHierarchy } from './hierarchy-search.mjs';

// 搜索所有子应用的路由配置
const routes = await searchByHierarchy('用户管理', {
  appType: 'sub',
  resourceCategory: 'routes',
}, { limit: 10 });
```

### 示例 4：获取层级树

```javascript
import { getHierarchyTree } from './hierarchy-search.mjs';

// 获取完整的层级树结构
const tree = getHierarchyTree();
// {
//   'main-app': {
//     appType: 'main',
//     categories: {
//       'routes': { totalResources: 22, ... },
//       'stores': { totalResources: 12, ... },
//       ...
//     }
//   },
//   ...
// }
```

## 🚀 性能优化

### B树索引

数据库已创建以下索引以支持快速查询：

- `idx_app_name`: 应用名称索引
- `idx_app_type`: 应用类型索引
- `idx_resource_category`: 资源类型索引
- `idx_hierarchy_path`: 层级路径索引
- `idx_parent_path`: 父路径索引
- `idx_depth`: 层级深度索引
- `idx_app_category`: 复合索引（app_name + resource_category）
- `idx_app_type_category`: 复合索引（app_type + resource_category）
- `idx_hierarchy_depth`: 复合索引（hierarchy_path + depth）

### 查询优化策略

1. **直接查询**：当明确知道 `appName` 和 `resourceCategory` 时，使用 `quickGetByAppAndCategory`（最快）
2. **层级过滤**：使用 `appType` 和 `resourceCategory` 过滤，减少搜索范围
3. **语义搜索**：仅在需要语义匹配时使用，配合层级过滤提高精度

## 📝 数据库结构

### resources 表字段

```sql
CREATE TABLE resources (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT,
  embedding_path TEXT,
  -- 层级结构字段
  app_name TEXT,              -- 应用名称
  app_type TEXT,              -- 应用类型
  resource_category TEXT,    -- 资源分类
  hierarchy_path TEXT,       -- 层级路径
  parent_path TEXT,          -- 父路径
  depth INTEGER DEFAULT 0,   -- 层级深度
  module_name TEXT,          -- 模块名称
  extended_metadata TEXT,    -- 扩展元数据（JSON）
  created_at INTEGER,
  updated_at INTEGER
);
```

## 🔧 使用建议

### 对于 Skills

1. **优先使用层级过滤**：明确指定 `appName` 和 `resourceCategory` 可以大幅提高查询速度
2. **使用快速查询API**：`quick-query.mjs` 提供了优化的查询接口
3. **利用层级树**：使用 `getHierarchyTree()` 了解资源分布

### 查询模式

```javascript
// 模式 1：直接查询（最快，推荐）
const resources = await quickGetByAppAndCategory('system-app', 'routes');

// 模式 2：层级过滤 + 语义搜索
const resources = await quickSearch('CRUD', {
  appType: 'sub',
  resourceCategory: 'components',
});

// 模式 3：统一接口
const resources = await quickQuery({
  text: '表单',
  appName: 'main-app',
  resourceCategory: 'composables',
});
```

## 📚 相关文件

- **层级工具**: `hierarchy-utils.mjs` - 从路径提取层级信息
- **层级搜索**: `hierarchy-search.mjs` - 层级搜索API
- **快速查询**: `quick-query.mjs` - 为Skills优化的快速查询API
- **向量存储**: `local-vector-store.mjs` - 支持层级结构的存储实现

## ✅ 总结

- ✅ **资源数量**：从 732 个增加到 **1047+ 个**
- ✅ **层级结构**：完整的 B树层级结构（应用 -> 资源类型 -> 模块 -> 资源）
- ✅ **快速查询**：支持直接查询和层级过滤的语义搜索
- ✅ **Skills 优化**：提供专门的快速查询API
- ✅ **索引优化**：多个复合索引支持快速层级查询
