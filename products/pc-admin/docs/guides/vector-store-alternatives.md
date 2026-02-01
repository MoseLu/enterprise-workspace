# 向量数据库替代方案指南

## 📋 问题背景

Chroma 3.x 需要服务器模式，不适合纯本地开发。需要找到替代方案。

## ✅ 已实现的方案：本地 SQLite + 文件存储

### 方案概述

使用 **SQLite + 本地文件** 存储向量，完全本地化，无需外部服务。

**实现文件**：`scripts/commands/skills/vector-store/local-vector-store.mjs`

### 优点

- ✅ **完全本地化**：无需外部服务
- ✅ **轻量级**：只依赖 better-sqlite3
- ✅ **已实现**：基础功能已完成
- ✅ **已索引**：135 个图标已成功索引

### 当前状态

- ✅ 存储系统：SQLite + JSON 文件
- ✅ 索引功能：已实现并测试
- ⚠️ 搜索功能：需要 Embedding 生成查询向量

## 🔧 Embedding 方案选择

### 方案 A：使用本地 Embedding 模型（推荐）⭐

**技术**：`@xenova/transformers`

**优点**：
- ✅ 完全本地，无需 API
- ✅ 首次下载后离线使用
- ✅ 支持多语言

**缺点**：
- ⚠️ 首次需要下载模型（~50MB）
- ⚠️ CPU 运行，速度较慢

**实现**：`local-embedding.mjs`

**使用方式**：
```javascript
import { generateEmbeddingLocal } from './local-embedding.mjs';
const embedding = await generateEmbeddingLocal('导出操作');
```

### 方案 B：使用 OpenAI API

**优点**：
- ✅ 高质量向量
- ✅ 快速
- ✅ 1536 维，更精确

**缺点**：
- ❌ 需要 API Key
- ❌ 有使用成本
- ❌ 需要网络连接

### 方案 C：使用 LangChain + 本地 Embedding

**技术栈**：
- `@langchain/community` - LangChain 社区集成
- `@xenova/transformers` - 本地 Embedding
- `MemoryVectorStore` 或 `FAISS` - 向量存储

**优点**：
- ✅ 功能丰富
- ✅ 支持多种后端
- ✅ 社区支持好

**缺点**：
- ⚠️ 依赖较多
- ⚠️ 可能过于复杂

**示例代码**：
```javascript
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { MemoryVectorStore } from "@langchain/vectorstores/memory";

const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
```

### 方案 D：使用 Qdrant（本地模式）

**技术**：Qdrant + Docker 或本地二进制

**优点**：
- ✅ 高性能
- ✅ 功能完整
- ✅ 支持本地文件存储

**缺点**：
- ⚠️ 需要运行服务
- ⚠️ 需要 Docker 或安装二进制

**使用方式**：
```bash
# 使用 Docker
docker run -d --name qdrant -p 6333:6333 qdrant/qdrant

# 或下载二进制
# https://github.com/qdrant/qdrant/releases
```

### 方案 E：使用 FAISS（Node.js）

**技术**：`faiss-node` 或 `@langchain/community/vectorstores/faiss`

**优点**：
- ✅ 高性能
- ✅ Facebook 开源
- ✅ 支持本地存储

**缺点**：
- ⚠️ Node.js 支持有限
- ⚠️ 主要是 Python 生态

## 🎯 推荐方案

### 当前推荐：本地 SQLite + Transformers.js

**理由**：
1. ✅ 已实现基础功能
2. ✅ 完全本地化
3. ✅ 无需外部服务
4. ✅ 图标已成功索引

**下一步**：
1. 修复 Transformers.js 配置，允许首次下载模型
2. 或使用关键词匹配作为降级方案（已实现）

### 长期方案：LangChain + 本地 Embedding

如果未来需要更丰富的功能，可以考虑迁移到 LangChain。

## 📊 方案对比

| 方案 | 本地化 | 性能 | 复杂度 | 成本 | 推荐度 |
|------|-------|------|--------|------|--------|
| **SQLite + Transformers.js** | ✅ | ⭐⭐⭐ | ⭐⭐ | 免费 | ⭐⭐⭐⭐⭐ |
| **SQLite + OpenAI** | ❌ | ⭐⭐⭐⭐⭐ | ⭐ | 付费 | ⭐⭐⭐ |
| **LangChain + Transformers** | ✅ | ⭐⭐⭐ | ⭐⭐⭐ | 免费 | ⭐⭐⭐⭐ |
| **Qdrant 本地** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐⭐ |
| **FAISS Node.js** | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 免费 | ⭐⭐ |

## 🔧 当前实现状态

### ✅ 已完成

1. **本地向量存储**（`local-vector-store.mjs`）
   - SQLite 数据库
   - 向量文件存储
   - 余弦相似度搜索

2. **资源索引**
   - 135 个图标已索引
   - 支持增量更新

3. **关键词搜索**（降级方案）
   - 不依赖 Embedding
   - 基于关键词匹配

### ⏳ 进行中

1. **本地 Embedding 集成**
   - Transformers.js 配置修复
   - 模型下载支持

2. **搜索功能完善**
   - 支持本地 Embedding
   - 支持 OpenAI Embedding
   - 自动降级机制

## 🚀 快速使用（当前可用）

### 方式 1：关键词搜索（无需 Embedding）

```bash
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"
```

### 方式 2：使用本地 Embedding（需要修复配置）

```bash
# 首次运行需要下载模型
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

### 方式 3：使用 OpenAI API

```bash
# 设置 API Key
export OPENAI_API_KEY="your-api-key"

# 搜索
node scripts/commands/skills/vector-store/search-icons.mjs "导出操作"
```

## 📝 配置说明

### 当前配置（`config.mjs`）

```javascript
embedding: {
  provider: 'auto', // 'openai' | 'local' | 'auto'
  model: 'text-embedding-3-small', // OpenAI 模型
  localModel: 'Xenova/all-MiniLM-L6-v2', // 本地模型
  dimensions: 384, // 本地模型维度
}
```

### 推荐配置

**完全本地化**：
```json
{
  "embedding": {
    "provider": "local",
    "localModel": "Xenova/all-MiniLM-L6-v2"
  }
}
```

**使用 OpenAI**：
```json
{
  "embedding": {
    "provider": "openai",
    "model": "text-embedding-3-small"
  }
}
```

**自动选择**：
```json
{
  "embedding": {
    "provider": "auto"
  }
}
```

## 🔄 迁移到 LangChain（可选）

如果未来需要迁移到 LangChain：

```javascript
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import { MemoryVectorStore } from "@langchain/vectorstores/memory";

// 初始化
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

// 从现有数据迁移
const docs = loadResourcesAsDocuments(); // 从 SQLite 加载
const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
```

## 📚 相关文档

- [本地向量存储实现](./vector-store-implementation.md)
- [快速开始指南](./vector-store-quick-start.md)
- [LangChain 文档](https://js.langchain.com/)
- [Transformers.js 文档](https://huggingface.co/docs/transformers.js/)

## ✅ 总结

**当前最佳方案**：本地 SQLite + 文件存储 + 关键词搜索（已实现）

**未来可选**：
1. 集成 Transformers.js 本地 Embedding
2. 或迁移到 LangChain
3. 或使用 Qdrant 本地服务

系统已可用，图标已索引，可以使用关键词搜索功能。
