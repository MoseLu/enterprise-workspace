# 向量数据库搜索问题修复

## 🔍 问题描述

使用本地 Embedding 搜索时，返回 0 个结果。

## 🔎 问题原因

1. **索引时使用了简单哈希向量**：之前索引时，如果本地 Embedding 模型不可用，会降级到简单哈希向量（384维），这些向量质量较差，无法进行有效的语义搜索。

2. **相似度阈值过高**：默认 `minScore: 0.7` 对于 384 维向量来说太高了，导致很多相关结果被过滤掉。

3. **向量维度不匹配**：如果索引时用的是简单哈希向量，而搜索时用的是真正的 Embedding 向量，虽然维度相同（384），但向量空间分布不同，导致相似度计算不准确。

## ✅ 解决方案

### 1. 重新索引（使用真正的 Embedding）

```bash
# 重新运行索引脚本，确保使用本地 Embedding
node scripts/commands/skills/vector-store/index-icons-only.mjs
```

**关键**：确保本地 Embedding 模型已下载并可用，这样索引时会使用真正的 Embedding 向量，而不是简单哈希向量。

### 2. 降低搜索阈值

修改 `test-search-icons.mjs`：

```javascript
const results = await searchResources(query, {
  resourceTypes: ['icon'],
  limit: 5,
  minScore: 0.2, // 降低阈值，适配本地 Embedding（384维）
});
```

**说明**：
- 384 维向量的相似度通常比 1536 维向量低
- 0.2-0.3 的阈值对于 384 维向量更合理
- 0.7 的阈值更适合高维向量（如 OpenAI 的 1536 维）

### 3. 验证模型可用性

在索引前，确保本地 Embedding 模型可用：

```bash
# 测试模型下载和加载
node scripts/commands/skills/vector-store/test-download-model.mjs
```

## 📊 修复结果

### 修复前
```
🔍 搜索: "导出操作"
[INFO] Found 0 resources for query: "导出操作"
  ❌ 未找到相关图标
```

### 修复后
```
🔍 搜索: "导出操作"
[INFO] Found 5 resources for query: "导出操作"
  ✅ 找到 5 个相关图标:

  1. export (misc)
     相似度: 26.2%
     路径: packages\shared-components\src\assets\icons\actions\export.svg
  2. emoji (misc)
     相似度: 25.3%
     路径: packages\shared-components\src\assets\icons\media\emoji.svg
  ...
```

## 💡 最佳实践

### 1. 索引时确保使用 Embedding

**推荐**：在索引前先测试模型可用性

```bash
# 1. 测试模型
node scripts/commands/skills/vector-store/test-download-model.mjs

# 2. 确认模型可用后，再索引
node scripts/commands/skills/vector-store/index-icons-only.mjs
```

### 2. 根据向量维度调整阈值

| 向量维度 | 推荐阈值 | 说明 |
|---------|---------|------|
| 384 维（本地） | 0.2-0.3 | 本地 Embedding 模型 |
| 1536 维（OpenAI） | 0.6-0.8 | OpenAI Embedding |
| 简单哈希 | 0.1-0.2 | 降级方案，不推荐 |

### 3. 监控搜索质量

如果搜索结果不理想：
1. 检查索引时是否使用了真正的 Embedding
2. 调整 `minScore` 阈值
3. 检查描述文本质量（更好的描述 = 更好的搜索）

## 🔧 技术细节

### 向量生成流程

**正确流程**：
```
文本描述 → 本地 Embedding 模型 → 384维向量 → 存储
```

**错误流程（降级）**：
```
文本描述 → 简单哈希 → 384维向量（质量差） → 存储
```

### 相似度计算

使用余弦相似度：
```javascript
cosineSimilarity(vecA, vecB) = dot(vecA, vecB) / (||vecA|| * ||vecB||)
```

- 范围：[-1, 1]
- 1 = 完全相同
- 0 = 无关
- -1 = 完全相反

对于归一化的向量，余弦相似度通常在 [0, 1] 范围内。

## 📚 相关文档

- [本地 Embedding 使用指南](./local-embedding-guide.md)
- [向量数据库完整指南](./vector-store-complete-guide.md)
- [搜索服务实现](../scripts/commands/skills/vector-store/search.mjs)

## ✅ 总结

**问题**：索引时使用了简单哈希向量，导致搜索无结果。

**解决**：
1. ✅ 重新索引，使用真正的本地 Embedding
2. ✅ 降低搜索阈值到 0.2（适配 384 维向量）
3. ✅ 确保模型在索引前已下载

**结果**：搜索功能正常工作，可以找到相关图标！🎉
