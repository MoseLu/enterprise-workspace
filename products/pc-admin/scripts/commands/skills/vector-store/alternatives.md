# 向量数据库替代方案

## 📋 当前问题

Chroma 3.x 需要服务器模式，不适合本地开发。需要找到替代方案。

## 🎯 可选方案

### 方案 1：本地 SQLite + 文件存储（已实现）✅

**优点**：
- ✅ 无需外部服务
- ✅ 完全本地化
- ✅ 轻量级
- ✅ 已实现基础功能

**缺点**：
- ⚠️ 搜索时需要 OpenAI API 生成查询向量
- ⚠️ 可以使用本地 Embedding 模型替代

**实现文件**：`local-vector-store.mjs`

### 方案 2：使用 LangChain + 本地 Embedding

**优点**：
- ✅ 支持多种向量数据库后端
- ✅ 支持本地 Embedding 模型
- ✅ 功能丰富

**缺点**：
- ⚠️ 依赖较多
- ⚠️ 可能过于复杂

### 方案 3：使用 FAISS（Facebook AI Similarity Search）

**优点**：
- ✅ 高性能
- ✅ 支持本地存储
- ✅ 无需服务器

**缺点**：
- ⚠️ 主要是 Python，Node.js 支持有限

### 方案 4：使用 Qdrant（本地模式）

**优点**：
- ✅ 支持本地文件存储
- ✅ 高性能
- ✅ 功能完整

**缺点**：
- ⚠️ 需要运行本地服务或使用 Docker

### 方案 5：改进当前方案 + 本地 Embedding

**推荐**：改进当前的 `local-vector-store.mjs`，添加本地 Embedding 支持

**可选本地 Embedding 模型**：
- `@xenova/transformers` - 使用 Transformers.js（完全本地）
- `@huggingface/inference` - Hugging Face Inference API（可选 API）
- `tiktoken` - 用于文本处理

## 🚀 推荐方案：改进本地存储 + Transformers.js

使用 `@xenova/transformers` 提供完全本地的 Embedding，无需任何外部 API。
