# 开发者工作站核心架构设计

> **任务编号**: DS-001  
> **优先级**: P0  
> **预估工时**: 1周  
> **所属模块**: 01-architecture/01-system-overview

## 1. 概述

### 1.1 任务目标

设计并文档化开发者工作站（DevStation）的整体架构，为本地 AI 辅助开发环境提供技术基础。DevStation 是一个轻量级、高效的本地开发工具，集成多种 AI 模型和开发工具，提供智能代码补全、上下文感知编程和自动化任务执行能力。

### 1.2 产品定位

DevStation 是一个本地 AI 开发环境，提供以下核心能力：

- **本地 AI 集成**：支持本地大模型（Ollama）和远程 API 无缝切换
- **智能代码补全**：基于上下文的实时代码补全和建议
- **任务自动化**：自动化常见开发任务和代码重构
- **项目管理**：轻量级项目管理和文件浏览
- **隐私优先**：所有数据本地处理，支持完全离线使用

### 1.3 核心用户故事

| 编号 | 角色 | 故事 | 价值 |
|------|------|------|------|
| US-01 | 开发者 | 开发者可以在本地启动 AI 助手，获得代码补全建议 | 提高编码效率 |
| US-02 | 开发者 | 开发者可以配置使用本地或远程 AI 模型 | 灵活选择，平衡性能和成本 |
| US-03 | 开发者 | 开发者可以创建项目，自动管理项目上下文 | 减少配置工作 |
| US-04 | 开发者 | 开发者可以执行自动化任务（如重构、测试生成） | 自动化重复工作 |

## 2. 验收标准

### 2.1 功能验收标准

- [ ] 支持本地 Ollama 模型（Llama 2, CodeLlama, 等）
- [ ] 支持远程 API（OpenAI, Anthropic, 本项目 Agent Orchestrator）
- [ ] 实时代码补全，延迟 < 100ms
- [ ] 支持多项目上下文管理
- [ ] 支持自动化任务定义和执行
- [ ] 支持 VSCode 扩展集成
- [ ] 支持离线使用（本地模型）
- [ ] 配置文件支持多平台（Windows, macOS, Linux）

### 2.2 非功能验收标准

- [ ] 内存占用 < 500MB（空闲状态）
- [ ] 启动时间 < 3秒
- [ ] 代码补全延迟 < 100ms
- [ ] 支持项目大小 < 10000 文件
- [ ] 电池影响 < 10%（笔记本场景）

## 3. 系统架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           用户层                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ VSCode 扩展   │  │ CLI 工具     │  │ Web UI      │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                         核心服务层                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      DevStation Core Engine                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │ 模型管理器    │  │ 上下文管理器  │  │ 任务编排器              │  │    │
│  │  │ ModelManager │  │ ContextMgr   │  │ TaskOrchestrator        │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │    │
│  │  │ 代码分析器    │  │ 补全引擎     │  │ 文件管理器              │  │    │
│  │  │ CodeAnalyzer │  │ CompletionEng│  │ FileManager             │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                         AI 集成层                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Ollama       │  │ OpenAI       │  │ Anthropic    │  │ 本地 Agent   │    │
│  │ 本地模型     │  │ API          │  │ API          │  │ Orchestrator │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
├─────────────────────────────────────────────────────────────────────────────┤
│                         数据层                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ SQLite       │  │ 向量数据库   │  │ 文件系统     │                      │
│  │ (配置/元数据) │  │ (上下文存储)  │  │ (项目代码)   │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 核心组件说明

| 组件 | 职责 | 技术选型 |
|------|------|----------|
| ModelManager | 模型配置、切换、健康检查 | Go + HTTP Client |
| ContextManager | 项目上下文、代码索引、语义搜索 | Go + SQLite + Qdrant/Chroma |
| TaskOrchestrator | 任务定义、执行、状态追踪 | Go + State Machine |
| CodeAnalyzer | 语法分析、类型推断、依赖解析 | Tree-sitter + LSP |
| CompletionEngine | 实时补全、建议排序、缓存 | Go + Prefix Tree |
| FileManager | 文件操作、目录遍历、版本感知 | Go + os/fs |

### 3.3 本地模型支持

```yaml
# 支持的本地模型
models:
  # 代码生成
  - name: "codellama"
    size: "7b,13b,34b"
    capabilities: ["completion", "chat", "infill"]
    
  - name: "deepseek-coder"
    size: "6.7b,33b"
    capabilities: ["completion", "chat", "explain"]
    
  # 对话
  - name: "llama2"
    size: "7b,13b,70b"
    capabilities: ["chat"]
    
  # 专用
  - name: "starcoder"
    size: "3b,7b,15b"
    capabilities: ["completion", "infill"]
```

### 3.4 上下文管理架构

```
上下文层次结构：

┌─────────────────────────────────────────┐
│                 项目上下文               │
│  ┌───────────────────────────────────┐  │
│  │           工作区上下文             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │         文件上下文           │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │     光标位置上下文     │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

上下文检索流程：
1. 确定项目根目录
2. 收集相关文件（imports, references）
3. 提取关键符号和定义
4. 构建上下文窗口（4096 tokens）
5. 发送给 AI 模型
```

## 4. 技术选型

### 4.1 核心语言

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 核心服务 | Go | 1.21+ | 高性能、跨平台、静态编译 |
| 扩展开发 | TypeScript | 5.0+ | VSCode 生态 |
| 配置 | YAML/TOML | - | 人类可读 |

### 4.2 本地存储

| 类别 | 技术 | 用途 |
|------|------|------|
| 结构化数据 | SQLite | 配置、项目元数据 |
| 向量存储 | Qdrant/Chroma | 语义搜索、代码索引 |
| 键值存储 | BoltDB | 缓存、会话状态 |

### 4.3 代码分析

| 类别 | 技术 | 用途 |
|------|------|------|
| 语法分析 | Tree-sitter | 多语言解析 |
| 类型推断 | LSP | 语义分析 |
| 代码补全 | LSP + Custom | 智能补全 |

### 4.4 通信协议

| 场景 | 协议 | 说明 |
|------|------|------|
| VSCode 扩展 ↔ Core | JSON-RPC 2.0 | 进程间通信 |
| Core ↔ 本地模型 | Ollama HTTP API | 标准 API |
| Core ↔ 远程模型 | HTTPS | REST API |

## 5. 数据模型

### 5.1 项目配置

```yaml
# devstation.yaml 项目配置示例
project:
  name: "my-awesome-project"
  path: "/path/to/project"
  type: "go"  # go, node, python, rust, etc.
  
ai:
  default_provider: "ollama"
  providers:
    ollama:
      enabled: true
      host: "http://localhost:11434"
      model: "codellama:7b"
    openai:
      enabled: true
      api_key: "${OPENAI_API_KEY}"
      model: "gpt-4"
    anthropic:
      enabled: false
      api_key: "${ANTHROPIC_API_KEY}"
      model: "claude-3-opus-20240229"
      
context:
  max_tokens: 8192
  include_patterns:
    - "**/*.go"
    - "**/*.md"
  exclude_patterns:
    - "**/vendor/**"
    - "**/node_modules/**"
    
completion:
  enabled: true
  debounce_ms: 100
  max_suggestions: 5
  
tasks:
  definitions:
    - name: "test"
      command: "go test ./..."
      description: "运行所有测试"
    - name: "build"
      command: "go build -o app"
      description: "构建项目"
```

### 5.2 项目数据库 Schema

```sql
-- projects 项目表
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL UNIQUE,
    type TEXT,
    config TEXT,  -- YAML 配置
    last_opened_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- files 文件表
CREATE TABLE files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    path TEXT NOT NULL,
    language TEXT,
    size INTEGER,
    modified_at DATETIME,
    content_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, path)
);

-- symbols 符号表（代码索引）
CREATE TABLE symbols (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    file_id TEXT NOT NULL REFERENCES files(id),
    name TEXT NOT NULL,
    kind TEXT,  -- function, class, variable, etc.
    location TEXT,  -- 文件位置
    signature TEXT,
    doc_comment TEXT,
    dependencies TEXT,  -- JSON 数组
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_symbols_project ON symbols(project_id);
CREATE INDEX idx_symbols_name ON symbols(name);
CREATE INDEX idx_symbols_kind ON symbols(kind);

-- sessions 会话表
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id),
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_at DATETIME,
    context_tokens INTEGER,
    ai_requests INTEGER
);

-- completions 补全历史表
CREATE TABLE completions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    file_id TEXT NOT NULL REFERENCES files(id),
    prefix TEXT,
    suggestions TEXT,  -- JSON 数组
    selected TEXT,
    accepted_at DATETIME
);
```

## 6. API 设计

### 6.1 Core API (JSON-RPC)

```typescript
// JSON-RPC 2.0 接口定义

interface Request {
  jsonrpc: "2.0";
  id: string;
  method: string;
  params?: Record<string, unknown>;
}

// ============ 项目管理 ============

// 打开项目
method: "project/open"
params: { path: string }
response: { project: Project }

// 关闭项目
method: "project/close"
params: { projectId: string }
response: { success: boolean }

// 列出项目
method: "project/list"
params: {}
response: { projects: Project[] }

// ============ 上下文管理 ============

// 获取补全建议
method: "context/completion"
params: {
  projectId: string;
  filePath: string;
  position: { line: number; column: number };
  prefix: string;
}
response: {
  suggestions: CompletionSuggestion[];
  context: ContextInfo;
}

// 获取上下文
method: "context/get"
params: {
  projectId: string;
  filePath: string;
  position: { line: number; column: number };
  maxTokens: number;
}
response: {
  context: Context;
  symbols: Symbol[];
}

// 刷新索引
method: "context/refresh"
params: { projectId: string }
response: { progress: number; status: string }

// ============ 任务执行 ============

// 执行任务
method: "task/execute"
params: {
  projectId: string;
  taskName: string;
  args?: Record<string, unknown>;
}
response: { taskId: string; status: string }

// 查询任务状态
method: "task/status"
params: { taskId: string }
response: {
  taskId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  output?: string;
  error?: string;
}

// 取消任务
method: "task/cancel"
params: { taskId: string }
response: { success: boolean }

// ============ 模型管理 ============

// 列出可用模型
method: "model/list"
params: {}
response: {
  models: ModelInfo[];
  currentModel: string;
}

// 切换模型
method: "model/switch"
params: { modelId: string; provider: string }
response: { success: boolean; message: string }

// 测试模型连接
method: "model/test"
params: { provider: string; modelId: string }
response: { latency: number; success: boolean; error?: string }

// ============ 文件操作 ============

// 读取文件
method: "file/read"
params: { projectId: string; path: string }
response: { content: string; encoding: string }

// 搜索文件
method: "file/search"
params: { projectId: string; query: string; type: "content" | "name" }
response: { results: SearchResult[] }

// ============ 健康检查 ============

// 健康检查
method: "system/health"
params: {}
response: {
  status: "healthy" | "degraded" | "unhealthy";
  components: {
    ollama: ComponentStatus;
    database: ComponentStatus;
    storage: ComponentStatus;
  };
}
```

### 6.2 VSCode 扩展 API

```typescript
// VSCode 扩展接口
interface DevStationExtension {
  // 激活扩展
  activate(context: vscode.ExtensionContext): Promise<void>;
  
  // 停用扩展
  deactivate(): void;
  
  // 获取补全提供者
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.CompletionItem[] | Promise<vscode.CompletionList<vscode.CompletionItem>>;
  
  // 提供内联补全
  provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): vscode.InlineCompletionItem[] | Promise<vscode.InlineCompletionItem[]>;
  
  // 代码操作（快速修复、重构）
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.CodeAction[] | Promise<vscode.CodeAction[]>;
  
  // 悬停提示
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.Hover | Promise<vscode.Hover | null>;
}
```

## 7. 实现步骤

### 阶段 1：项目初始化 (第1天)

1. 初始化 Go 项目结构
2. 配置 SQLite 和文件存储
3. 实现配置文件解析（YAML）
4. 实现项目 CRUD API
5. 设置 JSON-RPC 2.0 服务

### 阶段 2：本地模型集成 (第2天)

1. 实现 Ollama 客户端
2. 实现模型配置管理
3. 实现模型切换逻辑
4. 实现远程 API 客户端（OpenAI, Anthropic）
5. 实现统一模型接口

### 阶段 3：上下文管理 (第3天)

1. 实现代码索引器（Tree-sitter）
2. 实现符号表存储和查询
3. 实现上下文窗口构建
4. 实现向量搜索（集成 Qdrant/Chroma）
5. 实现语义检索

### 阶段 4：补全引擎 (第4天)

1. 实现 LSP 客户端
2. 实现补全建议生成
3. 实现建议排序和过滤
4. 实现缓存机制
5. 实现 debounce 和节流

### 阶段 5：任务系统 (第5天)

1. 实现任务定义格式
2. 实现任务执行器
3. 实现任务状态追踪
4. 实现输出流处理
5. 实现任务历史

## 8. 测试用例

### 8.1 单元测试

```go
// 测试模型管理器
func TestModelManager_SwitchModel(t *testing.T) {
    mm := NewModelManager()
    
    // 切换到本地模型
    err := mm.SwitchModel("ollama", "codellama:7b")
    assert.NoError(t, err)
    assert.Equal(t, "codellama:7b", mm.CurrentModel())
    
    // 切换到远程模型
    err = mm.SwitchModel("openai", "gpt-4")
    assert.NoError(t, err)
    assert.Equal(t, "gpt-4", mm.CurrentModel())
}

// 测试上下文构建
func TestContextBuilder_Build(t *testing.T) {
    cb := NewContextBuilder()
    project := loadTestProject()
    
    context, err := cb.Build(project, "main.go", 100, 4096)
    
    assert.NoError(t, err)
    assert.LessOrEqual(t, context.TokenCount, 4096)
    assert.Contains(t, context.Content, "main.go")
}

// 测试补全建议
func TestCompletionEngine_Suggest(t *testing.T) {
    engine := NewCompletionEngine()
    file := loadTestFile("test.go")
    
    suggestions, err := engine.Suggest(file, 100, 10)
    
    assert.NoError(t, err)
    assert.NotEmpty(t, suggestions)
}
```

### 8.2 集成测试

```go
// 测试完整补全流程
func TestCompletionFlow_Integration(t *testing.T) {
    // Setup
    server := NewTestServer()
    defer server.Close()
    server.StartOllama("codellama:7b")
    
    // Open project
    project := server.OpenProject("/test-project")
    
    // Type code and get completion
    editor := server.OpenFile(project, "main.go")
    editor.Type("func main() {")
    
    suggestions := server.GetCompletion(project, "main.go", 14, 1)
    
    assert.NotEmpty(t, suggestions)
    assert.Contains(t, suggestions[0].Text, "fmt.Println")
}
```

## 9. 验收检查清单

### 9.1 功能验收

- [ ] 项目创建和打开正常
- [ ] 本地模型连接正常
- [ ] 远程 API 连接正常
- [ ] 模型切换流畅
- [ ] 代码索引完整
- [ ] 补全建议准确
- [ ] 任务执行正常
- [ ] 配置文件正确加载

### 9.2 性能验收

- [ ] 启动时间 < 3秒
- [ ] 内存占用 < 500MB
- [ ] 补全延迟 < 100ms
- [ ] 索引速度 > 100 文件/秒
- [ ] 搜索延迟 < 50ms

### 9.3 兼容性验收

- [ ] Windows 正常运行
- [ ] macOS 正常运行
- [ ] Linux 正常运行
- [ ] VSCode 扩展正常加载

---

**相关文档**
- [Ollama 集成](../02-ai-integration/01-model-management/OLLAMA_INTEGRATION.md)
- [上下文管理](../02-ai-integration/02-context-management/CONTEXT_MANAGEMENT.md)
- [代码补全引擎](../02-ai-integration/03-code-intelligence/COMPLETION_ENGINE.md)
- [实现步骤](IMPLEMENTATION.md)
- [测试用例](TEST_CASES.md)

**前置依赖**
- 无（首个任务）

**后续任务**
- DS-002: 本地 Ollama 集成
- DS-003: 上下文管理系统
- DS-005: VSCode 扩展开发
