# 向量数据库资源索引系统 - 快速开始

## 🎯 目标

通过向量数据库实现项目资源的智能索引和调度，包括：
- Composables、组件、图标、国际化框架等资源的自动索引
- Skills 作为可调度的资源
- 基于语义相似度的智能搜索和推荐

## 🚀 快速开始（5分钟）

### 步骤 1：安装依赖

```bash
cd btc-shopflow-monorepo
pnpm add chromadb glob openai
pnpm add -D @babel/parser @babel/traverse
```

### 步骤 2：配置 API Key

```bash
# 设置 OpenAI API Key（用于生成向量）
export OPENAI_API_KEY="your-api-key-here"
```

### 步骤 3：初始化数据库

```bash
node scripts/commands/skills/vector-store/init.mjs
```

### 步骤 4：索引资源

```bash
# 索引所有资源（首次运行可能需要几分钟）
node scripts/commands/skills/vector-store/index-resources.mjs
```

### 步骤 5：测试搜索

```bash
# 运行示例
node scripts/commands/skills/vector-store/example-usage.mjs 2
```

## 📝 基本使用

### 搜索 Composables

```javascript
import { searchResources } from './scripts/commands/skills/vector-store/search.mjs';

const results = await searchResources('用户认证', {
  resourceTypes: ['composable'],
  limit: 5
});

console.log(results);
// [
//   {
//     id: 'composable:packages/shared-core/src/composables/useUser.ts',
//     score: 0.85,
//     metadata: { name: 'useUser', path: '...', ... }
//   },
//   ...
// ]
```

### 搜索组件

```javascript
const components = await searchResources('表单输入组件', {
  resourceTypes: ['component'],
  limit: 5
});
```

### 智能推荐

```javascript
import { recommendResources } from './scripts/commands/skills/vector-store/scheduler.mjs';

const recommendations = await recommendResources(
  '创建一个用户管理页面，包含列表、新增、编辑功能',
  {
    app: 'system-app',
    resourceTypes: ['composable', 'component', 'icon', 'skill']
  }
);

console.log(recommendations);
// {
//   composables: [...],
//   components: [...],
//   icons: [...],
//   skills: [...]
// }
```

## 🔧 在 Skills 中使用

### 方式 1：在 Skill 文件中直接使用

```markdown
# page-creation-guide SKILL.md

当用户需要创建页面时：

1. 使用向量数据库搜索推荐的组件
   ```javascript
   import { recommendResources } from './vector-store/scheduler.mjs';
   const recommendations = await recommendResources('创建CRUD页面');
   ```

2. 推荐相关资源给用户
```

### 方式 2：在 AI 对话中自动使用

AI 会自动：
1. 识别用户需求
2. 使用向量数据库搜索相关资源
3. 推荐最佳实践和组件

## 📊 资源类型

系统会自动索引以下资源：

| 类型 | 位置 | 提取内容 |
|------|------|---------|
| **Composables** | `packages/**/composables/**/*.ts` | 函数名、参数、注释 |
| **组件** | `packages/**/components/**/*.vue` | 组件名、Props、文档 |
| **图标** | `**/assets/icons/**/*.svg` | 图标名、分类 |
| **国际化** | `**/locales/**/*.json` | 语言、键名、翻译 |
| **Skills** | `.cursor/skills/**/SKILL.md` | 技能名、描述、场景 |
| **工具函数** | `packages/**/utils/**/*.ts` | 函数名、功能描述 |

## 🔄 更新资源

### 自动更新（推荐）

系统会检测文件变更，自动重新索引。

### 手动更新

```bash
# 更新所有资源
node scripts/commands/skills/vector-store/index-resources.mjs

# 只更新特定类型
node scripts/commands/skills/vector-store/index-resources.mjs --type=component
```

## 💡 使用场景

### 场景 1：创建新功能时

```
用户："我想创建一个数据管理页面"

AI 行为：
1. 使用向量数据库搜索相关资源
2. 推荐：BtcTable, BtcForm, useCrud, page-creation-guide
3. 提供代码示例和最佳实践
```

### 场景 2：查找相似实现

```
用户："有没有类似的用户列表组件？"

AI 行为：
1. 搜索组件资源
2. 找到相似度高的组件
3. 展示实现方式
```

### 场景 3：Skills 自动推荐

```
用户："如何创建页面？"

AI 行为：
1. 匹配 page-creation-guide skill
2. Skill 执行时自动搜索相关资源
3. 推荐组件、composables、图标
```

## ⚙️ 配置

编辑 `.cursor/skills-meta/vector-store-config.json`：

```json
{
  "embedding": {
    "provider": "openai",
    "model": "text-embedding-3-small",
    "apiKey": "${OPENAI_API_KEY}"
  },
  "scanning": {
    "include": [
      "packages/**/composables/**/*.ts",
      "packages/**/components/**/*.vue"
    ]
  }
}
```

## 🐛 常见问题

### Q: 需要 OpenAI API Key 吗？

A: 是的，目前使用 OpenAI 生成向量。未来可能支持本地模型。

### Q: 索引需要多长时间？

A: 首次索引可能需要 5-10 分钟（取决于资源数量）。后续增量更新很快。

### Q: 如何提高搜索准确性？

A: 使用更具体的查询，例如：
- ❌ "用户"
- ✅ "获取当前登录用户信息的 composable"

## 📚 更多信息

- [完整实现文档](./vector-store-implementation.md)
- [向量数据库状态](./vector-database-status.md)
- [Skills 系统文档](../../scripts/commands/skills/README.md)
