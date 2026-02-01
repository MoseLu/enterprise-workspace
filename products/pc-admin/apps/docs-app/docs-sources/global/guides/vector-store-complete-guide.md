# 向量数据库资源索引系统 - 完整指南

## 📋 系统概述

已实现基于**本地 SQLite + 文件存储**的向量数据库系统，支持项目资源的智能索引和搜索。

## ✅ 当前状态

### 已完成功能

1. ✅ **本地向量存储**（SQLite + JSON 文件）
2. ✅ **资源扫描和索引**（135 个图标已索引）
3. ✅ **关键词搜索**（无需 Embedding，立即可用）
4. ✅ **本地 Embedding 支持**（Transformers.js，可选）
5. ✅ **OpenAI Embedding 支持**（可选）

### 技术栈

- **存储**：better-sqlite3 + 本地文件
- **Embedding**：@xenova/transformers（本地）或 OpenAI API
- **搜索**：余弦相似度 + 关键词匹配

## 🚀 快速使用

### 方式 1：关键词搜索（推荐，立即可用）⭐

**无需任何配置，直接使用**：

```bash
# 搜索导出相关的图标
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"

# 搜索用户相关的图标
node scripts/commands/skills/vector-store/search-icons-simple.mjs "用户"

# 搜索设置相关的图标
node scripts/commands/skills/vector-store/search-icons-simple.mjs "设置"
```

**优点**：
- ✅ 无需配置
- ✅ 无需 API Key
- ✅ 无需下载模型
- ✅ 立即可用

### 方式 2：使用本地 Embedding（需要首次下载模型）

```bash
# 首次运行会自动下载模型（~50MB）
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

**优点**：
- ✅ 完全本地化
- ✅ 语义搜索
- ✅ 无需 API Key

**缺点**：
- ⚠️ 首次需要下载模型
- ⚠️ CPU 运行，速度较慢

### 方式 3：使用 OpenAI API

```bash
# 设置 API Key
export OPENAI_API_KEY="your-api-key"

# 搜索
node scripts/commands/skills/vector-store/search-icons.mjs "导出操作"
```

**优点**：
- ✅ 高质量向量
- ✅ 快速
- ✅ 1536 维，更精确

**缺点**：
- ❌ 需要 API Key
- ❌ 有使用成本

## 📊 项目图标总览（使用向量数据库）

### 统计信息

- **总图标数**：135 个
- **已索引**：135 个 ✅
- **存储位置**：`.cursor/skills-meta/vector-store/`

### 图标分类

#### 1. ACTIONS（操作类）- 36 个
**用途**：按钮、工具栏等操作场景

**常用图标**：
- `export` - 导出操作
- `import` - 导入操作
- `edit` - 编辑操作
- `delete` - 删除操作
- `plus` - 新增操作
- `refresh` - 刷新操作
- `search` - 搜索操作
- `sync` - 同步操作

**搜索示例**：
```bash
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"
# 找到：export, download, download-alt
```

#### 2. ANALYTICS（数据分析类）- 17 个
**用途**：统计、报表、监控等场景

**常用图标**：`stats`, `data`, `trend`, `monitor`, `rank`

#### 3. COMMERCE（商业类）- 10 个
**用途**：订单、商品、购物等场景

**常用图标**：`order`, `goods`, `cart`, `tag`, `vip`

#### 4. COMMUNICATION（通信类）- 7 个
**用途**：消息、通知、社交等场景

**常用图标**：`call`, `phone`, `like`, `favor`

#### 5. IOT（物联网类）- 2 个
**用途**：设备、IoT 相关场景

**图标**：`device`, `iot`

#### 6. LOCATION（位置类）- 3 个
**用途**：地图、定位等场景

**图标**：`map`, `local`, `discover`

#### 7. MEDIA（媒体类）- 8 个
**用途**：文件、图片、视频等场景

**常用图标**：`file`, `image`, `video`, `folder`, `camera`

#### 8. MICRO（微应用类）- 4 个
**用途**：各子应用的标识

**图标**：`engineering`, `logistics`, `production`, `quality`

#### 9. MISC（杂项）- 7 个
**用途**：通用、设计、组件等

**图标**：`component`, `design`, `tutorial`, `star`, `windmill`

#### 10. NAVIGATION（导航类）- 12 个
**用途**：菜单、导航、方向指示

**常用图标**：`home`, `menu`, `back`, `arrow-left`, `arrow-right`

#### 11. PEOPLE（人员类）- 7 个
**用途**：用户、团队、部门等场景

**常用图标**：`user`, `team`, `dept`, `workbench`

**搜索示例**：
```bash
node scripts/commands/skills/vector-store/search-icons-simple.mjs "用户"
# 找到：user, team, people 相关图标
```

#### 12. STATUS（状态类）- 9 个
**用途**：成功、失败、警告等状态提示

**常用图标**：`success`, `fail`, `warn`, `info`, `404`

#### 13. SYSTEM（系统类）- 13 个
**用途**：系统设置、主题、语言等

**常用图标**：`settings`, `theme`, `dark`, `light`, `lang`, `auth`

**搜索示例**：
```bash
node scripts/commands/skills/vector-store/search-icons-simple.mjs "设置"
# 找到：settings, set, config 相关图标
```

## 🔍 搜索功能

### 关键词搜索（当前可用）

```bash
# 搜索导出相关
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"

# 搜索用户相关
node scripts/commands/skills/vector-store/search-icons-simple.mjs "用户"

# 搜索设置相关
node scripts/commands/skills/vector-store/search-icons-simple.mjs "设置"
```

### 语义搜索（需要 Embedding）

**使用本地 Embedding**：
```bash
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

**使用 OpenAI**：
```bash
export OPENAI_API_KEY="your-key"
node scripts/commands/skills/vector-store/search-icons.mjs "导出操作"
```

## 🔄 替代方案对比

### 方案 1：当前实现（SQLite + 本地文件）✅

**状态**：✅ 已实现并可用

**优点**：
- 完全本地化
- 无需外部服务
- 轻量级
- 已索引 135 个图标

**缺点**：
- 搜索需要 Embedding（可选）

### 方案 2：LangChain + Transformers.js

**优点**：
- 功能丰富
- 社区支持好
- 支持多种后端

**缺点**：
- 依赖较多
- 可能过于复杂

**迁移成本**：中等

### 方案 3：Qdrant 本地服务

**优点**：
- 高性能
- 功能完整

**缺点**：
- 需要运行服务
- 需要 Docker 或二进制

**迁移成本**：高

### 方案 4：FAISS Node.js

**优点**：
- 高性能
- Facebook 开源

**缺点**：
- Node.js 支持有限
- 主要是 Python 生态

**迁移成本**：高

## 💡 推荐方案

### 当前推荐：继续使用 SQLite + 本地文件存储

**理由**：
1. ✅ 已实现并可用
2. ✅ 完全本地化
3. ✅ 无需外部服务
4. ✅ 图标已成功索引
5. ✅ 关键词搜索已可用

**未来可选增强**：
1. 集成 Transformers.js 本地 Embedding（已准备）
2. 或使用 OpenAI API（已支持）
3. 或迁移到 LangChain（如需要更丰富功能）

## 📝 使用示例

### 示例 1：搜索导出相关图标

```bash
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"
```

**结果**：
- export (80%)
- download (80%)
- download-alt (100%)

### 示例 2：在代码中使用

```javascript
import { searchResources } from './scripts/commands/skills/vector-store/search.mjs';

// 搜索图标
const icons = await searchResources('导出操作', {
  resourceTypes: ['icon'],
  limit: 5
});

// 使用结果
icons.forEach(icon => {
  console.log(`${icon.metadata.name}: ${icon.metadata.path}`);
});
```

### 示例 3：在 Skills 中使用

```markdown
# page-creation-guide SKILL.md

当创建页面时，自动搜索相关图标：

```javascript
import { searchResources } from './vector-store/search.mjs';

const icons = await searchResources('操作按钮', {
  resourceTypes: ['icon']
});
// 推荐：export, import, edit, delete 等
```
```

## 🔧 配置选项

### 完全本地化（推荐）

```json
{
  "embedding": {
    "provider": "local",
    "localModel": "Xenova/all-MiniLM-L6-v2"
  }
}
```

### 使用 OpenAI

```json
{
  "embedding": {
    "provider": "openai",
    "model": "text-embedding-3-small"
  }
}
```

### 自动选择

```json
{
  "embedding": {
    "provider": "auto"
  }
}
```

## 📚 相关文档

- [替代方案对比](./vector-store-alternatives.md)
- [快速开始指南](./vector-store-quick-start.md)
- [完整实现文档](./vector-store-implementation.md)
- [图标目录](./project-icons-catalog.md)

## ✅ 总结

**当前系统状态**：
- ✅ 本地向量存储：已实现
- ✅ 资源索引：135 个图标已索引
- ✅ 关键词搜索：立即可用
- ⏳ 语义搜索：需要 Embedding（可选）

**推荐使用方式**：
1. **立即使用**：关键词搜索（无需配置）
2. **增强搜索**：集成本地 Embedding 或使用 OpenAI API
3. **未来扩展**：如需要更丰富功能，可考虑迁移到 LangChain

系统已可用，可以开始使用关键词搜索功能查找图标！
