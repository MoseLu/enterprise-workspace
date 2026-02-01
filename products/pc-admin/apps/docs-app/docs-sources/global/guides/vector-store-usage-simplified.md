# 向量数据库简化使用指南

## 📋 当前使用方式

### 方式 1：使用命令行脚本（当前）

```bash
# 搜索组件
node scripts/commands/skills/vector-store/search-components.mjs "分栏布局"

# 搜索图标
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"
```

**优点**：
- ✅ 简单直接
- ✅ 无需编程知识
- ✅ 适合快速查找

**缺点**：
- ⚠️ 需要记住脚本路径
- ⚠️ 需要手动运行命令

### 方式 2：在代码中直接使用（推荐）⭐

```javascript
// 在任何 Node.js 脚本或 Skill 中
import { searchResources } from './scripts/commands/skills/vector-store/search.mjs';

// 搜索组件
const components = await searchResources('分栏布局', {
  resourceTypes: ['component'],
  limit: 5,
  minScore: 0.2
});

// 使用结果
components.forEach(comp => {
  console.log(`${comp.metadata.name}: ${comp.metadata.path}`);
});
```

**优点**：
- ✅ 可以集成到任何代码中
- ✅ 可以在 Skills 中使用
- ✅ 更灵活

### 方式 3：创建统一的 CLI 工具（未来改进）

可以创建一个统一的命令行工具：

```bash
# 统一入口
node scripts/commands/skills/vector-store/cli.mjs search component "分栏布局"
node scripts/commands/skills/vector-store/cli.mjs search icon "导出"
node scripts/commands/skills/vector-store/cli.mjs index component
```

## 🎯 推荐：在 Skills 中集成

### 创建资源推荐 Skill

创建一个 Skill，自动使用向量数据库推荐资源：

```markdown
# resource-recommender SKILL.md

当用户需要组件、图标等资源时，自动搜索向量数据库并推荐。

## 使用方式

用户说："我需要一个分栏布局组件"
→ AI 自动调用向量数据库搜索
→ 返回推荐结果
```

### 在对话中直接使用

AI 可以在对话中直接调用向量数据库：

```javascript
// AI 内部使用（无需用户手动调用）
const results = await searchResources('分栏布局', {
  resourceTypes: ['component']
});
```

## 💡 关于"是否需要手动写 mjs 脚本"

### 当前状态

**需要**：目前需要手动运行脚本或编写代码调用。

**原因**：
- 向量数据库是底层服务
- 需要封装成更友好的接口

### 改进方向

#### 1. 创建统一的 CLI 工具

```bash
# 统一命令
pnpm vector-search component "分栏布局"
pnpm vector-search icon "导出"
```

#### 2. 集成到 Skills 系统

让 AI 自动调用，用户无需手动操作：

```
用户："推荐一个分栏布局组件"
→ AI 自动搜索向量数据库
→ 返回推荐结果
```

#### 3. 创建 VS Code 扩展

在编辑器中直接搜索和插入组件。

## ✅ 最佳实践

### 对于开发者

**推荐**：在代码中直接使用 API

```javascript
import { searchResources } from './vector-store/search.mjs';
const results = await searchResources('分栏布局', { resourceTypes: ['component'] });
```

### 对于 AI 助手

**推荐**：在 Skills 中集成，自动调用

```markdown
# 在 Skill 中
当用户需要组件时，自动搜索向量数据库
```

### 对于快速查找

**推荐**：使用命令行脚本

```bash
node scripts/commands/skills/vector-store/search-components.mjs "分栏布局"
```

## 🚀 未来改进

1. **统一 CLI 工具**：`pnpm vector-search`
2. **Skills 自动集成**：AI 自动调用
3. **VS Code 扩展**：编辑器集成
4. **Web 界面**：可视化搜索

## 📚 相关文档

- [向量数据库完整指南](./vector-store-complete-guide.md)
- [搜索问题修复](./vector-store-search-fix.md)
- [本地 Embedding 指南](./local-embedding-guide.md)
