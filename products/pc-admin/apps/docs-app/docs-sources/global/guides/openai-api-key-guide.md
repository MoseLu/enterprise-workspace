# OPENAI_API_KEY 使用指南

## 📋 什么是 OPENAI_API_KEY？

`OPENAI_API_KEY` 是 **OpenAI API 的访问密钥**，用于调用 OpenAI 的服务（如生成文本向量、ChatGPT 等）。

## 🎯 在向量数据库系统中的作用

在我们的向量数据库系统中，`OPENAI_API_KEY` 用于：

1. **生成高质量的文本向量（Embedding）**
   - 将文本转换为数值向量
   - 用于语义搜索和相似度匹配
   - 使用 OpenAI 的 `text-embedding-3-small` 模型

2. **提供更精确的搜索**
   - OpenAI 的向量是 1536 维，比本地模型（384 维）更精确
   - 搜索质量更高，语义理解更好

## 🔑 如何获取 OPENAI_API_KEY？

### 步骤 1：注册 OpenAI 账号

1. 访问 [OpenAI 官网](https://platform.openai.com/)
2. 注册或登录账号

### 步骤 2：创建 API Key

1. 登录后，访问 [API Keys 页面](https://platform.openai.com/api-keys)
2. 点击 "Create new secret key"
3. 输入名称（如 "向量数据库"）
4. 复制生成的 API Key（**只显示一次，请妥善保存**）

### 步骤 3：设置使用额度

⚠️ **重要**：OpenAI API 是付费服务，需要：
1. 在 [Billing](https://platform.openai.com/account/billing) 页面添加支付方式
2. 设置使用限额（建议设置每月限额，避免意外费用）

## 💰 费用说明

### Embedding API 价格（2024年）

- **text-embedding-3-small**：$0.02 / 1M tokens
- **text-embedding-3-large**：$0.13 / 1M tokens

### 估算成本

假设索引 1000 个资源，每个资源平均 200 tokens：
- 总 tokens：1000 × 200 = 200,000 tokens
- 成本：200,000 / 1,000,000 × $0.02 = **$0.004**（约 0.03 元）

**搜索成本**：
- 每次搜索查询：约 10-50 tokens
- 成本：几乎可以忽略不计

## 🔧 如何设置 OPENAI_API_KEY？

### 方式 1：环境变量（推荐）⭐

#### Windows (PowerShell)

```powershell
# 临时设置（当前会话）
$env:OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 永久设置（用户级别）
[System.Environment]::SetEnvironmentVariable("OPENAI_API_KEY", "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "User")
```

#### Windows (CMD)

```cmd
# 临时设置
set OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 永久设置（需要重启终端）
setx OPENAI_API_KEY "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

#### Linux/Mac

```bash
# 临时设置
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"' >> ~/.bashrc
source ~/.bashrc
```

### 方式 2：项目配置文件

创建 `.env` 文件（**不要提交到 Git**）：

```bash
# .env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

然后使用 `dotenv` 加载：

```javascript
import dotenv from 'dotenv';
dotenv.config();
```

### 方式 3：直接在代码中设置（不推荐）

⚠️ **不推荐**：会暴露密钥，不安全

```javascript
process.env.OPENAI_API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

## ✅ 验证 API Key 是否设置成功

### 方法 1：检查环境变量

```powershell
# Windows PowerShell
echo $env:OPENAI_API_KEY

# Linux/Mac
echo $OPENAI_API_KEY
```

### 方法 2：运行测试脚本

```bash
# 测试 OpenAI Embedding
node scripts/commands/skills/vector-store/test-search-icons.mjs "导出操作"
```

如果设置成功，会看到：
```
[INFO] 使用 OpenAI Embedding 生成查询向量
```

如果未设置，会看到：
```
[WARN] 本地 Embedding 不可用，尝试其他方法
[ERROR] OpenAI API key is required. Set OPENAI_API_KEY environment variable.
```

## 🎯 使用场景

### 场景 1：索引资源时使用 OpenAI

```bash
# 设置 API Key
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 索引图标（使用 OpenAI Embedding）
node scripts/commands/skills/vector-store/index-icons-only.mjs
```

### 场景 2：搜索时使用 OpenAI

```bash
# 设置 API Key
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# 语义搜索（使用 OpenAI Embedding）
node scripts/commands/skills/vector-store/search-icons.mjs "导出操作"
```

## 🔄 不使用 OPENAI_API_KEY 的替代方案

### 方案 1：使用本地 Embedding（推荐）⭐

**优点**：
- ✅ 完全免费
- ✅ 无需 API Key
- ✅ 完全本地化

**缺点**：
- ⚠️ 首次需要下载模型（~50MB）
- ⚠️ 搜索精度略低（384 维 vs 1536 维）

**使用方式**：
```bash
# 修改配置，使用本地模型
# config.mjs 中设置 provider: 'local'
```

### 方案 2：使用关键词搜索（当前可用）⭐

**优点**：
- ✅ 完全免费
- ✅ 无需任何配置
- ✅ 立即可用

**缺点**：
- ⚠️ 只能匹配关键词，不能语义理解

**使用方式**：
```bash
# 直接使用，无需 API Key
node scripts/commands/skills/vector-store/search-icons-simple.mjs "导出操作"
```

## ⚠️ 安全注意事项

### 1. 不要提交 API Key 到 Git

**错误示例**：
```javascript
// ❌ 不要这样做
const API_KEY = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
```

**正确做法**：
```javascript
// ✅ 使用环境变量
const API_KEY = process.env.OPENAI_API_KEY;
```

### 2. 添加到 .gitignore

确保 `.env` 文件在 `.gitignore` 中：

```gitignore
# .gitignore
.env
.env.local
*.key
```

### 3. 设置使用限额

在 OpenAI 后台设置：
- 每月使用限额
- 每日使用限额
- 告警阈值

### 4. 定期轮换密钥

建议每 3-6 个月更换一次 API Key。

## 📊 配置优先级

系统按以下顺序选择 Embedding 方式：

1. **配置指定**：`config.mjs` 中 `provider: 'local'` 或 `'openai'`
2. **自动选择**：`provider: 'auto'` 时：
   - 优先尝试本地模型
   - 如果本地模型不可用，尝试 OpenAI
   - 如果 OpenAI API Key 未设置，报错

## 🔍 当前项目配置

查看当前配置：

```bash
# 查看配置文件
cat .cursor/skills-meta/vector-store-config.json
```

默认配置（`config.mjs`）：
```javascript
embedding: {
  provider: 'auto', // 自动选择
  model: 'text-embedding-3-small', // OpenAI 模型
  localModel: 'Xenova/all-MiniLM-L6-v2', // 本地模型
  apiKey: process.env.OPENAI_API_KEY || '', // 从环境变量读取
}
```

## ✅ 总结

### 需要 OPENAI_API_KEY 的情况

- ✅ 想要更高质量的语义搜索
- ✅ 需要处理大量资源索引
- ✅ 愿意支付少量费用（通常每月 < $1）

### 不需要 OPENAI_API_KEY 的情况

- ✅ 使用关键词搜索（已实现，立即可用）
- ✅ 使用本地 Embedding 模型（已实现，可选）
- ✅ 预算有限或不想使用付费服务

### 推荐方案

1. **立即使用**：关键词搜索（无需配置）
2. **免费增强**：本地 Embedding（首次下载模型）
3. **最佳质量**：OpenAI Embedding（需要 API Key）

**当前系统已支持所有三种方式，可根据需求选择！** 🎉
