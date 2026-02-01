# 本地 Embedding 使用指南（@xenova/transformers）

## 📋 什么是本地 Embedding？

使用 **@xenova/transformers** 在本地生成文本向量，无需 OpenAI API，完全免费。

### 特点

- ✅ **完全免费**：无需 API Key，无需付费
- ✅ **完全本地**：数据不离开本地
- ✅ **离线可用**：模型下载后可在离线环境使用
- ⚠️ **精度略低**：384 维向量（vs OpenAI 的 1536 维）
- ⚠️ **首次下载**：需要下载模型文件（~50MB）

## 🚀 快速开始

### 步骤 1：确认依赖已安装

```bash
# 检查是否已安装
pnpm list @xenova/transformers

# 如果未安装，执行：
pnpm add -w @xenova/transformers
```

### 步骤 2：配置使用本地 Embedding

编辑配置文件：`.cursor/skills-meta/vector-store-config.json`

```json
{
  "embedding": {
    "provider": "local",
    "localModel": "Xenova/all-MiniLM-L6-v2",
    "dimensions": 384
  }
}
```

或者直接修改 `config.mjs`：

```javascript
embedding: {
  provider: 'local', // 改为 'local'
  localModel: 'Xenova/all-MiniLM-L6-v2',
  dimensions: 384,
}
```

### 步骤 3：首次运行（自动下载模型）

```bash
# 运行搜索脚本，首次会自动下载模型
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

**首次运行时会看到**：
```
📥 正在加载本地 Embedding 模型（首次运行需要下载）...
✅ 本地 Embedding 模型加载完成
```

**模型会自动下载到**：`./.models/Xenova/all-MiniLM-L6-v2/`

## 📥 模型下载说明

### 自动下载（推荐）

模型会在**首次使用时自动下载**，无需手动操作。

**下载位置**：
- Windows: `项目根目录\.models\Xenova\all-MiniLM-L6-v2\`
- Linux/Mac: `项目根目录/.models/Xenova/all-MiniLM-L6-v2/`

**下载大小**：约 50-80MB（取决于是否使用量化版本）

**下载时间**：取决于网络速度，通常 1-5 分钟

### 手动触发下载

如果需要提前下载模型，可以创建一个测试脚本：

```javascript
// test-download-model.mjs
import { initLocalEmbedding } from './local-embedding.mjs';

console.log('开始下载模型...');
await initLocalEmbedding();
console.log('模型下载完成！');
```

运行：
```bash
node scripts/commands/skills/vector-store/test-download-model.mjs
```

### 模型文件结构

下载后的模型文件结构：

```
.models/
└── Xenova/
    └── all-MiniLM-L6-v2/
        ├── config.json
        ├── tokenizer.json
        ├── model.safetensors
        └── ...
```

## 🔧 配置选项

### 模型选择

系统支持多种模型，可在 `local-embedding.mjs` 中修改：

```javascript
// 选项 1：多语言模型（推荐，已配置）
'Xenova/all-MiniLM-L6-v2'
// - 384 维
// - 支持多语言（包括中文）
// - 快速，内存占用小

// 选项 2：英文优化模型
'Xenova/bge-small-en-v1.5'
// - 384 维
// - 英文优化
// - 英文搜索效果更好

// 选项 3：多语言 E5 模型
'Xenova/multilingual-e5-small'
// - 384 维
// - 多语言支持
// - 效果略好但速度稍慢
```

### 模型缓存路径

默认路径：`./.models`

可以修改 `local-embedding.mjs`：

```javascript
env.localModelPath = './.models'; // 默认
// 或
env.localModelPath = 'C:/Users/YourName/.cache/transformers'; // 自定义
```

### 量化选项

默认使用量化模型（减少内存占用）：

```javascript
embeddingPipeline = await pipeline(
  'feature-extraction',
  'Xenova/all-MiniLM-L6-v2',
  {
    quantized: true, // 量化模型（推荐）
    // quantized: false, // 完整模型（精度更高但更大）
  }
);
```

## ✅ 验证安装

### 方法 1：运行测试脚本

```bash
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

如果成功，会看到：
```
📥 正在加载本地 Embedding 模型（首次运行需要下载）...
✅ 本地 Embedding 模型加载完成
[INFO] 使用本地 Embedding 模型生成查询向量
```

### 方法 2：检查模型文件

```bash
# Windows PowerShell
Test-Path .\.models\Xenova\all-MiniLM-L6-v2\model.safetensors

# Linux/Mac
ls -la .models/Xenova/all-MiniLM-L6-v2/
```

### 方法 3：创建简单测试

```javascript
// test-local-embedding.mjs
import { generateEmbeddingLocal } from './local-embedding.mjs';

const text = '测试文本';
const embedding = await generateEmbeddingLocal(text);
console.log('向量维度:', embedding.length); // 应该是 384
console.log('向量示例:', embedding.slice(0, 5));
```

运行：
```bash
node scripts/commands/skills/vector-store/test-local-embedding.mjs
```

## 🎯 使用场景

### 场景 1：索引资源时使用本地 Embedding

```bash
# 确保配置为 'local'
# 运行索引脚本
node scripts/commands/skills/vector-store/index-icons-only.mjs
```

### 场景 2：搜索时使用本地 Embedding

```bash
# 确保配置为 'local' 或 'auto'
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

### 场景 3：在代码中使用

```javascript
import { generateEmbeddingLocal } from './local-embedding.mjs';

// 生成单个向量
const embedding = await generateEmbeddingLocal('导出操作');

// 批量生成向量
import { generateEmbeddingsBatchLocal } from './local-embedding.mjs';
const embeddings = await generateEmbeddingsBatchLocal([
  '导出操作',
  '用户管理',
  '设置配置'
]);
```

## ⚠️ 常见问题

### 问题 1：模型下载失败

**错误信息**：
```
❌ 加载本地 Embedding 模型失败: Failed to fetch model
```

**解决方案**：
1. 检查网络连接
2. 检查防火墙设置
3. 尝试使用代理：
   ```javascript
   env.allowRemoteModels = true;
   // 如果需要代理
   // env.proxy = 'http://proxy.example.com:8080';
   ```

### 问题 2：模型下载很慢

**原因**：模型文件较大（~50MB），首次下载需要时间

**解决方案**：
1. 耐心等待（通常 1-5 分钟）
2. 使用更快的网络
3. 考虑使用代理或镜像

### 问题 3：内存不足

**错误信息**：
```
Error: Out of memory
```

**解决方案**：
1. 使用量化模型（默认已启用）
2. 减少批量处理大小
3. 关闭其他占用内存的程序

### 问题 4：模型文件损坏

**解决方案**：
1. 删除模型目录：
   ```bash
   # Windows
   Remove-Item -Recurse -Force .\.models\Xenova\all-MiniLM-L6-v2
   
   # Linux/Mac
   rm -rf .models/Xenova/all-MiniLM-L6-v2
   ```
2. 重新运行脚本，会自动重新下载

## 📊 性能对比

### 本地 Embedding vs OpenAI Embedding

| 特性 | 本地 Embedding | OpenAI Embedding |
|------|--------------|------------------|
| **成本** | 免费 | 付费（约 $0.02/1M tokens） |
| **速度** | 较慢（CPU） | 快（API） |
| **精度** | 384 维 | 1536 维 |
| **离线** | ✅ 支持 | ❌ 需要网络 |
| **隐私** | ✅ 完全本地 | ⚠️ 数据发送到 API |
| **首次设置** | 需要下载模型 | 需要 API Key |

### 推荐使用场景

**使用本地 Embedding**：
- ✅ 预算有限
- ✅ 需要离线使用
- ✅ 数据隐私要求高
- ✅ 资源数量较少（< 1000）

**使用 OpenAI Embedding**：
- ✅ 需要最高精度
- ✅ 需要快速处理大量资源
- ✅ 有 API 预算
- ✅ 网络稳定

## 🔄 切换方案

### 从 OpenAI 切换到本地

1. 修改配置：
   ```json
   {
     "embedding": {
       "provider": "local"
     }
   }
   ```

2. 重新索引（可选）：
   ```bash
   # 如果需要使用本地向量重新索引
   node scripts/commands/skills/vector-store/index-icons-only.mjs
   ```

### 从本地切换到 OpenAI

1. 设置 API Key：
   ```powershell
   $env:OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```

2. 修改配置：
   ```json
   {
     "embedding": {
       "provider": "openai"
     }
   }
   ```

3. 重新索引（可选）

## 📚 相关文档

- [OPENAI_API_KEY 使用指南](./openai-api-key-guide.md)
- [向量数据库完整指南](./vector-store-complete-guide.md)
- [替代方案对比](./vector-store-alternatives.md)
- [Transformers.js 文档](https://huggingface.co/docs/transformers.js/)

## ✅ 总结

### 快速开始步骤

1. ✅ 确认 `@xenova/transformers` 已安装
2. ✅ 配置 `provider: 'local'`
3. ✅ 运行脚本，自动下载模型
4. ✅ 开始使用本地 Embedding

### 优势

- ✅ **完全免费**：无需 API Key
- ✅ **完全本地**：数据不离开本地
- ✅ **离线可用**：模型下载后离线使用
- ✅ **已集成**：系统已支持，开箱即用

### 注意事项

- ⚠️ 首次需要下载模型（~50MB）
- ⚠️ 精度略低于 OpenAI（384 vs 1536 维）
- ⚠️ CPU 运行，速度较慢

**推荐**：对于大多数场景，本地 Embedding 已经足够使用！🎉
