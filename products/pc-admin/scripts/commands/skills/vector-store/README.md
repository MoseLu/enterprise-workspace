# 项目资源向量数据库系统

## 📋 概述

本系统使用向量数据库存储项目中的各种资源（composables、组件、图标、国际化框架、Skills等），实现智能的资源检索和调度。

## 🎯 核心功能

1. **资源自动扫描**：自动扫描项目中的各种资源
2. **向量化存储**：将资源描述转换为向量并存储
3. **语义搜索**：基于语义相似度搜索资源
4. **智能调度**：根据任务需求自动匹配最佳资源
5. **Skills 集成**：Skills 作为可调度的资源

## 📦 资源类型

### 1. Composables
- 位置：`packages/**/composables/**/*.ts`
- 提取：函数名、参数、返回值、注释、使用示例

### 2. 组件
- 位置：`packages/**/components/**/*.vue`
- 提取：组件名、Props、Events、Slots、文档

### 3. 图标
- 位置：`**/assets/icons/**/*.svg`
- 提取：图标名、分类、用途描述

### 4. 国际化资源
- 位置：`**/locales/**/*.json`
- 提取：键名、翻译内容、使用场景

### 5. Skills
- 位置：`.cursor/skills/**/SKILL.md`
- 提取：技能名称、描述、使用场景、示例

### 6. 工具函数
- 位置：`packages/**/utils/**/*.ts`
- 提取：函数名、功能描述、参数、返回值

## 🏗️ 架构设计

```
资源扫描器 (Resource Scanner)
    ↓
资源提取器 (Resource Extractor)
    ↓
向量化服务 (Embedding Service)
    ↓
向量数据库 (Vector Database)
    ↓
检索服务 (Retrieval Service)
    ↓
调度引擎 (Scheduler)
```

## 📚 技术栈

- **向量数据库**：Chroma（轻量级，易于集成）
- **Embedding 模型**：使用 OpenAI API 或本地模型
- **资源扫描**：TypeScript AST 解析
- **存储**：Chroma 集合（Collections）

## 🔧 使用方式

### 初始化

```bash
# 安装依赖
pnpm add chromadb @tiktoken/tiktoken

# 初始化向量数据库
node scripts/commands/skills/vector-store/init.mjs
```

### 索引资源

```bash
# 扫描并索引所有资源
node scripts/commands/skills/vector-store/index-resources.mjs
```

### 搜索资源

```javascript
import { searchResources } from './vector-store/search.mjs';

// 语义搜索
const results = await searchResources('用户认证相关的 composable', {
  resourceTypes: ['composable'],
  limit: 5
});
```

## 📊 数据结构

### 资源元数据

```typescript
interface ResourceMetadata {
  id: string;              // 唯一标识
  type: ResourceType;      // 资源类型
  name: string;            // 资源名称
  path: string;            // 文件路径
  description: string;      // 描述
  tags: string[];          // 标签
  usage: string;           // 使用示例
  dependencies: string[]; // 依赖关系
  createdAt: number;       // 创建时间
  updatedAt: number;      // 更新时间
}
```

### 向量存储

```typescript
interface VectorDocument {
  id: string;
  metadata: ResourceMetadata;
  embedding: number[];     // 向量表示
  content: string;         // 原始内容
}
```

## 🔍 搜索示例

### 1. 搜索 Composables

```javascript
// 查找用户相关的 composable
const composables = await searchResources('用户信息获取', {
  resourceTypes: ['composable'],
  limit: 3
});
```

### 2. 搜索组件

```javascript
// 查找表单相关的组件
const components = await searchResources('表单输入组件', {
  resourceTypes: ['component'],
  limit: 5
});
```

### 3. 搜索图标

```javascript
// 查找导出相关的图标
const icons = await searchResources('导出图标', {
  resourceTypes: ['icon'],
  limit: 10
});
```

### 4. 搜索 Skills

```javascript
// 查找页面创建相关的技能
const skills = await searchResources('创建新页面', {
  resourceTypes: ['skill'],
  limit: 3
});
```

## 🚀 智能调度

### 自动资源推荐

```javascript
import { recommendResources } from './vector-store/scheduler.mjs';

// 根据任务描述推荐资源
const recommendations = await recommendResources({
  task: '创建一个用户管理页面，包含列表、新增、编辑功能',
  context: {
    app: 'system-app',
    module: 'user-management'
  }
});

// 返回：
// - 推荐的组件：BtcTable, BtcForm, BtcCrud
// - 推荐的 composables：useUser, useCrud
// - 推荐的 skills：page-creation-guide
// - 推荐的图标：user, add, edit
```

## 📈 性能优化

1. **增量更新**：只更新变更的资源
2. **批量处理**：批量向量化和存储
3. **缓存机制**：缓存常用查询结果
4. **异步处理**：资源扫描和向量化异步执行

## 🔄 更新机制

### 自动更新

- 监听文件变化
- 自动重新索引变更的资源
- 定期全量更新

### 手动更新

```bash
# 更新特定资源类型
node scripts/commands/skills/vector-store/index-resources.mjs --type=composable

# 更新特定路径
node scripts/commands/skills/vector-store/index-resources.mjs --path=packages/shared-components
```

## 📝 配置

配置文件：`.cursor/skills-meta/vector-store-config.json`

```json
{
  "chroma": {
    "path": ".cursor/skills-meta/vector-store",
    "collectionName": "project-resources"
  },
  "embedding": {
    "provider": "openai",
    "model": "text-embedding-3-small",
    "apiKey": "${OPENAI_API_KEY}"
  },
  "scanning": {
    "include": [
      "packages/**/composables/**/*.ts",
      "packages/**/components/**/*.vue",
      "**/assets/icons/**/*.svg",
      "**/locales/**/*.json",
      ".cursor/skills/**/SKILL.md"
    ],
    "exclude": [
      "node_modules/**",
      "dist/**",
      "**/*.test.ts"
    ]
  },
  "indexing": {
    "batchSize": 100,
    "concurrency": 5
  }
}
```

## 🔗 与 Skills 系统集成

### Skills 作为资源

Skills 会被自动索引，可以通过语义搜索找到：

```javascript
// 搜索相关技能
const skills = await searchResources('如何创建页面', {
  resourceTypes: ['skill']
});
```

### Skills 使用资源

Skills 可以在执行时查询和推荐资源：

```markdown
# page-creation-guide SKILL.md

当用户需要创建页面时：
1. 搜索推荐的组件：使用 vector-store 搜索表单、表格相关组件
2. 搜索推荐的 composables：搜索 CRUD、表单处理相关 composables
3. 推荐图标：搜索操作相关的图标
```

## 📚 相关文档

- [Chroma 文档](https://docs.trychroma.com/)
- [向量数据库对比](./vector-database-status.md)
- [Skills 系统文档](../README.md)
