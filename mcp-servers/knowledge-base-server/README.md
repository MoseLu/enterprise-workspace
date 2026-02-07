# Knowledge Base MCP Server

> 企业工作空间知识库 MCP 服务器 - 提供 RAG 检索能力

## 概述

Knowledge Base MCP Server 提供与企业工作空间知识库的深度集成能力，支持通过自然语言查询组件、规则、方案等知识条目。通过 MCP 协议，AI 编程助手可以直接检索知识库，减少代码库 grep 操作，显著降低 Token 消耗。

## 功能特性

| 工具 | 功能 | 使用场景 |
|------|------|----------|
| `kb_search` | 搜索知识库 | 自然语言查询组件、规则、方案 |
| `kb_get_entry` | 获取条目详情 | 查看特定知识条目完整信息 |
| `kb_list_rules` | 列出所有规则 | 查看项目规范列表 |
| `kb_list_solutions` | 列出所有方案 | 查看技术方案和实现指南 |
| `kb_get_decision` | 获取架构决策 | 查看 ADR 决策详情 |
| `kb_get_rule_example` | 获取规则示例 | 查看好/坏实践代码对比 |
| `kb_intent_analysis` | 分析查询意图 | 判断用户想查找什么类型知识 |

## 使用方法

### 1. 安装依赖并构建

```bash
cd mcp-servers/knowledge-base-server
npm install
npm run build
```

### 2. 配置 Cursor IDE

在 `~/.cursor/settings.json` 中添加以下配置：

```json
{
  "mcpServers": {
    "knowledge-base": {
      "command": "node",
      "args": ["path/to/knowledge-base-server/dist/index.js"],
      "disabled": false
    }
  }
}
```

### 3. 重启 Cursor IDE

配置完成后重启 Cursor，即可在对话中使用知识库工具。

## 使用示例

### 搜索组件

```
kb_search({
  query: "菜单组件在哪里"
})
```

### 获取规则详情

```
kb_get_entry({
  id: "rule:typescript-strict"
})
```

### 列出所有规则

```
kb_list_rules({})
```

### 查询规范示例

```
kb_get_rule_example({
  ruleId: "rule:error-handling"
})
```

### 分析查询意图

```
kb_intent_analysis({
  query: "如何实现用户认证"
})
```

## 知识库结构

### 知识类型

| 类型 | 说明 | 示例 |
|------|------|------|
| RULE | 项目规范 | TypeScript 严格模式、错误处理规范 |
| SOLUTION | 技术方案 | 用户认证实现、主题切换方案 |
| DECISION | 架构决策 | Monorepo 决策、技术栈选择 |
| COMPONENT | UI 组件 | Menu、Form、Table |
| HOOK | Hooks | useTheme、useForm |
| PATTERN | 设计模式 | 复合组件、Provider 模式 |

### 查询意图

| 意图 | 识别关键词 | 返回类型 |
|------|-----------|----------|
| LOCATE | 在哪里、位置、定义 | 位置信息 |
| LIST | 所有、有哪些、列表 | 条目列表 |
| UNDERSTAND | 如何、怎么、原理 | 详细解释 |
| DECISION | 为什么、决策、背景 | ADR 记录 |
| RULE | 规范、规则、要求 | 规则详情 |
| SOLUTION | 方案、实现、做法 | 方案指南 |

## 预期效果

| 场景 | 优化前 Token | 优化后 Token | 节省 |
|------|-------------|--------------|------|
| 查询组件位置 | ~500 | ~100 | 80% |
| 理解代码逻辑 | ~800 | ~200 | 75% |
| 查找规范规则 | ~300 | ~50 | 83% |
| 了解架构决策 | ~400 | ~100 | 75% |

## 文件结构

```
mcp-servers/knowledge-base-server/
├── src/
│   └── index.ts        # MCP 服务器主文件
├── dist/               # 编译输出目录
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── README.md          # 服务器文档
```

## 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 知识库架构 | `knowledge-base/RAG/knowledge-base-architecture.md` | RAG 系统完整架构 |
| 知识索引 | `knowledge-base/RAG/knowledge-index.json` | 知识条目总索引 |
| 知识图谱 | `knowledge-base/RAG/knowledge-graph.json` | 概念关联图谱 |
| 项目配置 | `CLAUDE.md` | 企业工作空间主配置 |

## 后续规划

- [ ] 集成向量搜索（pgvector/milvus）
- [ ] 支持实时索引更新
- [ ] 添加缓存层（Redis）
- [ ] 支持多种数据库后端
- [ ] 添加查询推荐功能

---

**文档版本**：1.0.0
**最后更新**：2026-02-07
**维护者**：企业架构组
