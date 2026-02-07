# 向量数据库资源索引系统实现指南

## 📋 概述

已实现基于向量数据库的项目资源索引和智能调度系统，支持：
- Composables、组件、图标、国际化、Skills 等资源的自动索引
- 基于语义相似度的资源搜索
- 智能资源推荐和调度

## 🚀 快速开始

### 1. 安装依赖

```bash
cd btc-shopflow-monorepo
pnpm add chromadb @tiktoken/tiktoken openai @babel/parser @babel/traverse glob
```

### 2. 配置环境变量

```bash
# 设置 OpenAI API Key（用于生成向量）
export OPENAI_API_KEY="your-api-key"
```

或在 `.cursor/skills-meta/vector-store-config.json` 中配置。

### 3. 初始化向量数据库

```bash
node scripts/commands/skills/vector-store/init.mjs
```

### 4. 索引资源

```bash
# 索引所有资源
node scripts/commands/skills/vector-store/index-resources.mjs

# 只索引特定类型
node scripts/commands/skills/vector-store/index-resources.mjs --type=composable
```

### 5. 搜索资源

```javascript
import { searchResources } from './scripts/commands/skills/vector-store/search.mjs';

const results = await searchResources('用户认证', {
  resourceTypes: ['composable'],
  limit: 5
});
```

## 📁 文件结构

```
scripts/commands/skills/vector-store/
├── README.md                 # 系统文档
├── package.json              # 依赖配置
├── config.mjs                # 配置文件
├── init.mjs                  # 初始化脚本
├── index.mjs                 # 主入口
├── resource-scanner.mjs      # 资源扫描器
├── resource-extractor.mjs    # 资源提取器
├── embedding.mjs             # 向量化服务
├── search.mjs                # 搜索服务
├── scheduler.mjs             # 调度引擎
└── index-resources.mjs       # 索引脚本
```

## 🔧 核心功能

### 1. 资源扫描

自动扫描项目中的各种资源：

```javascript
import { scanResources } from './vector-store/resource-scanner.mjs';

const resources = await scanResources();
// 返回: [{ type, path, relativePath, size, modifiedTime }, ...]
```

### 2. 资源提取

从资源文件中提取元数据：

```javascript
import { extractResource } from './vector-store/resource-extractor.mjs';

const extracted = extractResource(resource);
// 返回: { type, name, description, ... }
```

### 3. 向量化

将资源描述转换为向量：

```javascript
import { generateEmbedding } from './vector-store/embedding.mjs';

const embedding = await generateEmbedding('用户认证相关的 composable');
// 返回: [0.123, -0.456, ...] (1536维向量)
```

### 4. 语义搜索

基于语义相似度搜索资源：

```javascript
import { searchResources } from './vector-store/search.mjs';

const results = await searchResources('表单验证', {
  resourceTypes: ['composable', 'component'],
  limit: 10,
  minScore: 0.7
});
```

### 5. 智能推荐

根据任务自动推荐相关资源：

```javascript
import { recommendResources } from './vector-store/scheduler.mjs';

const recommendations = await recommendResources(
  '创建一个用户管理页面，包含列表、新增、编辑功能',
  {
    app: 'system-app',
    module: 'user-management',
    resourceTypes: ['composable', 'component', 'icon', 'skill']
  }
);
```

## 📊 资源类型

### Composables

- **位置**：`packages/**/composables/**/*.ts`
- **提取内容**：函数名、参数、返回值、注释、依赖
- **示例**：`useUser`, `useForm`, `useCrud`

### 组件

- **位置**：`packages/**/components/**/*.vue`
- **提取内容**：组件名、Props、Events、Slots、文档
- **示例**：`BtcForm`, `BtcTable`, `BtcButton`

### 图标

- **位置**：`**/assets/icons/**/*.svg`
- **提取内容**：图标名、分类、用途
- **示例**：`user.svg`, `export.svg`, `add.svg`

### 国际化

- **位置**：`**/locales/**/*.json`
- **提取内容**：语言、键名、翻译内容
- **示例**：`zh-CN.json`, `en-US.json`

### Skills

- **位置**：`.cursor/skills/**/SKILL.md`
- **提取内容**：技能名、描述、使用场景
- **示例**：`page-creation-guide`, `common-mistakes-prevention`

### 工具函数

- **位置**：`packages/**/utils/**/*.ts`
- **提取内容**：函数名、功能描述、参数
- **示例**：`formatDate`, `validateEmail`

## 🎯 使用场景

### 场景 1：创建新页面时自动推荐资源

```javascript
import { getTaskResources, formatRecommendations } from './vector-store/scheduler.mjs';

const taskResources = await getTaskResources(
  '创建一个数据管理页面，包含列表、搜索、新增、编辑、删除功能',
  {
    app: 'system-app',
    module: 'data-management'
  }
);

console.log(formatRecommendations(taskResources.recommendations));
```

### 场景 2：Skills 中使用资源推荐

在 Skill 文件中：

```markdown
# page-creation-guide SKILL.md

当用户需要创建页面时：

1. 使用向量数据库搜索推荐的组件
   ```javascript
   import { recommendResources } from './vector-store/scheduler.mjs';
   const recommendations = await recommendResources('创建CRUD页面');
   ```

2. 推荐相关资源：
   - 组件：BtcTable, BtcForm, BtcCrud
   - Composables：useCrud, useForm
   - 图标：add, edit, delete
   - Skills：common-mistakes-prevention
```

### 场景 3：查找相似实现

```javascript
import { searchResources } from './vector-store/search.mjs';

// 查找与现有组件相似的实现
const similar = await searchResources('用户列表组件', {
  resourceTypes: ['component'],
  limit: 5
});
```

## 🔄 更新机制

### 自动更新

系统会检测文件变更，自动重新索引：

```bash
# 监听文件变化并自动更新
node scripts/commands/skills/vector-store/watch.mjs
```

### 手动更新

```bash
# 更新所有资源
node scripts/commands/skills/vector-store/index-resources.mjs

# 更新特定类型
node scripts/commands/skills/vector-store/index-resources.mjs --type=component

# 更新特定路径
node scripts/commands/skills/vector-store/index-resources.mjs --path=packages/shared-components
```

## 📈 性能优化

1. **批量处理**：资源向量化批量进行，提高效率
2. **增量更新**：只更新变更的资源，减少计算量
3. **缓存机制**：缓存常用查询结果
4. **异步处理**：资源扫描和向量化异步执行

## 🔍 搜索优化

### 提高搜索准确性

1. **使用更具体的查询**：
   ```javascript
   // ❌ 不够具体
   searchResources('用户')
   
   // ✅ 更具体
   searchResources('获取当前登录用户信息的 composable')
   ```

2. **设置合适的 minScore**：
   ```javascript
   searchResources('表单验证', { minScore: 0.8 })
   ```

3. **限制资源类型**：
   ```javascript
   searchResources('表单', { resourceTypes: ['component'] })
   ```

## 🛠️ 配置说明

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
    "apiKey": "${OPENAI_API_KEY}",
    "dimensions": 1536
  },
  "scanning": {
    "include": [
      "packages/**/composables/**/*.ts",
      "packages/**/components/**/*.vue"
    ],
    "exclude": [
      "node_modules/**",
      "dist/**"
    ]
  },
  "indexing": {
    "batchSize": 100,
    "concurrency": 5
  }
}
```

## 📚 与 Skills 系统集成

### Skills 作为资源

Skills 会被自动索引，可以通过语义搜索找到：

```javascript
const skills = await searchResources('如何创建页面', {
  resourceTypes: ['skill']
});
```

### Skills 使用资源推荐

Skills 可以在执行时查询和推荐资源：

```markdown
# 在 Skill 中使用

当执行此技能时：
1. 使用 vector-store 搜索相关资源
2. 推荐最佳实践和组件
3. 提供代码示例
```

## 🐛 故障排查

### 问题 1：OpenAI API Key 未设置

**错误**：`OpenAI API key is required`

**解决**：
```bash
export OPENAI_API_KEY="your-api-key"
```

### 问题 2：Chroma 数据库未初始化

**错误**：`Collection not found`

**解决**：
```bash
node scripts/commands/skills/vector-store/init.mjs
```

### 问题 3：资源提取失败

**错误**：`Failed to extract resource`

**解决**：
- 检查文件格式是否正确
- 查看日志了解具体错误
- 确保依赖已安装（@babel/parser, @babel/traverse）

## 📝 下一步

1. **添加更多资源类型**：工具函数、类型定义、配置文件等
2. **优化提取器**：提高元数据提取的准确性
3. **添加本地 Embedding 模型**：减少对 OpenAI API 的依赖
4. **实现增量更新**：只更新变更的资源
5. **添加资源关系图**：可视化资源之间的依赖关系

## 🔗 相关文档

- [向量数据库状态](./vector-database-status.md)
- [Skills 系统文档](../README.md)
- [Chroma 文档](https://docs.trychroma.com/)
