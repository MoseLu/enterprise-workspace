# 错误监控服务使用指南

## 概述

错误监控服务是一个独立的后台服务，用于监控开发、构建等命令的错误。它不依赖于开发服务器，可以独立运行并监控多个命令。

## 功能特性

- ✅ **独立运行**：不依赖开发服务器，可以后台运行
- ✅ **多命令监控**：支持监控 `dev:all`、`build` 等命令
- ✅ **实时错误推送**：通过 SSE 实时推送错误到监控界面
- ✅ **Web 界面管理**：通过 Web 界面启动/停止命令
- ✅ **错误分类**：自动分类错误严重程度（严重、错误、警告、信息）
- ✅ **错误持久化**：错误信息保存到 SQLite 数据库
- ✅ **Dev 服务器管理**：支持在线启停所有应用的dev开发服务器
- ✅ **启动过程监控**：实时监控每个应用的启动过程和日志
- ✅ **SSE + HTTP 短连接**：使用 SSE 推送状态，HTTP 短连接发送指令

## 快速开始

### 1. 启动监控服务

```bash
# 前台运行（开发调试）
pnpm monitor

# 后台运行（推荐）
pnpm monitor:background
```

监控服务将在 `http://localhost:3001` 启动。

### 2. 访问监控界面

打开浏览器访问 `http://localhost:3001`，你将看到：

- **统计面板**：显示严重、错误、警告、信息的数量
- **命令管理**：可以启动/停止开发服务器、构建命令等
- **错误列表**：实时显示所有错误，支持过滤和搜索
- **错误详情**：点击错误查看详细信息

### 3. 启动开发服务器

有两种方式启动开发服务器：

#### 方式一：通过监控界面启动

1. 在监控界面选择 "dev:all - 启动所有开发服务器"
2. 点击 "启动命令" 按钮
3. 错误将实时显示在监控界面

#### 方式二：通过命令行启动（自动连接监控服务）

```bash
pnpm dev:all
```

开发服务器会自动连接到已运行的监控服务。

## API 接口

监控服务提供以下 REST API：

### 获取运行中的命令

```http
GET /api/commands
```

响应：
```json
{
  "commands": [
    {
      "id": "cmd_1_1234567890",
      "command": "dev:all",
      "args": [],
      "status": "running",
      "startTime": 1234567890
    }
  ]
}
```

### 启动命令

```http
POST /api/commands
Content-Type: application/json

{
  "command": "dev:all",
  "args": []
}
```

响应：
```json
{
  "success": true,
  "commandId": "cmd_1_1234567890",
  "message": "命令已启动: dev:all"
}
```

### 停止命令

```http
DELETE /api/commands/{commandId}
```

响应：
```json
{
  "success": true,
  "message": "命令已停止"
}
```

### 获取统计信息

```http
GET /api/stats
```

响应：
```json
{
  "total": 10,
  "critical": 2,
  "errors": 5,
  "warnings": 3,
  "info": 0
}
```

## Dev 服务器管理 API

### 获取所有应用的dev服务器状态

```http
GET /api/dev/status
```

响应：
```json
{
  "servers": [
    {
      "appId": "admin",
      "appName": "admin-app",
      "displayName": "管理应用",
      "packageName": "admin-app",
      "status": "running",
      "startTime": 1234567890,
      "logs": [...]
    }
  ]
}
```

### 启动所有应用的dev服务器

```http
POST /api/dev/start-all
Content-Type: application/json

{
  "exclude": ["mobile"]  // 可选：排除某些应用
}
```

响应：
```json
{
  "success": true,
  "message": "已启动 10 个应用的dev服务器",
  "successCount": 10,
  "failCount": 0
}
```

### 停止所有应用的dev服务器

```http
POST /api/dev/stop-all
```

响应：
```json
{
  "success": true,
  "message": "已停止 10 个应用的dev服务器",
  "successCount": 10,
  "failCount": 0
}
```

### 启动单个应用的dev服务器

```http
POST /api/dev/start/{appId}
```

示例：
```http
POST /api/dev/start/admin
```

响应：
```json
{
  "success": true,
  "message": "应用 admin 的dev服务器已启动"
}
```

### 停止单个应用的dev服务器

```http
POST /api/dev/stop/{appId}
```

示例：
```http
POST /api/dev/stop/admin
```

响应：
```json
{
  "success": true,
  "message": "应用 admin 的dev服务器已停止"
}
```

## Dev 服务器状态 SSE

### 连接 SSE 端点

```http
GET /sse/dev-status
```

SSE 事件类型：

- `connected` - 连接成功
- `init` - 初始状态（包含所有应用的当前状态）
- `starting` - 单个应用开始启动
- `started` - 单个应用启动成功
- `stopping` - 单个应用开始停止
- `stopped` - 单个应用已停止
- `starting-all` - 开始启动所有应用
- `started-all` - 所有应用启动完成
- `stopping-all` - 开始停止所有应用
- `stopped-all` - 所有应用停止完成
- `log` - 应用日志输出
- `error` - 错误信息

示例事件：
```json
{
  "type": "log",
  "data": {
    "appId": "admin",
    "appName": "管理应用",
    "type": "stdout",
    "content": "VITE v5.4.21  ready in 234 ms",
    "time": "2025-01-20 10:30:45"
  },
  "time": "2025-01-20 10:30:45"
}
```

## 支持的命令

### 预定义命令

- `dev:all` - 启动所有应用的开发服务器
- `build` - 构建所有应用
- `turbo run build` - Turbo 构建命令

### 自定义命令

选择 "自定义命令" 选项，可以输入任何命令，例如：
- `turbo run dev --filter=@btc/shared-core`
- `pnpm build:share`
- 等等

## 架构说明

### 组件结构

```
monitor-service.mjs (主服务)
├── DevErrorMonitorServer (HTTP 服务器 + SSE)
├── DevErrorListener (错误监听器)
├── DevErrorClassifier (错误分类器)
└── SQLite Database (错误持久化)
```

### 工作流程

1. **监控服务启动** → 初始化数据库 → 启动 HTTP 服务器
2. **启动命令** → 创建进程 → 创建错误监听器 → 监听进程输出
3. **检测错误** → 分类错误 → 保存到数据库 → 实时推送到 Web 界面
4. **停止命令** → 停止监听器 → 终止进程

### 数据流

```
命令进程 (stdout/stderr)
    ↓
DevErrorListener (处理输出)
    ↓
DevErrorClassifier (分类错误)
    ↓
SQLite Database (持久化)
    ↓
DevErrorMonitorServer (SSE 推送)
    ↓
Web 界面 (实时显示)
```

## 注意事项

1. **端口占用**：监控服务使用 3001 端口，确保该端口未被占用
2. **数据库位置**：错误数据保存在 `scripts/commands/skills/skills.db`
3. **后台运行**：使用 `pnpm monitor:background` 启动后台服务后，服务会持续运行直到手动停止
4. **命令隔离**：每个命令都有独立的错误监听器，互不干扰

## 故障排除

### 监控服务无法启动

- 检查 3001 端口是否被占用
- 检查数据库文件权限
- 查看控制台错误信息

### 命令无法启动

- 确保监控服务正在运行
- 检查命令语法是否正确
- 查看监控界面的错误信息

### 错误不显示

- 检查 SSE 连接状态（界面右上角）
- 刷新页面重新连接
- 检查浏览器控制台错误

## Dev 服务器管理使用示例

### JavaScript/TypeScript 客户端示例

```javascript
// 连接 SSE 接收实时状态
const eventSource = new EventSource('http://localhost:3001/sse/dev-status');

eventSource.onmessage = (e) => {
  const { type, data, time } = JSON.parse(e.data);
  console.log(`[${time}] ${type}:`, data);
  
  switch (type) {
    case 'log':
      console.log(`[${data.appName}] ${data.content}`);
      break;
    case 'started':
      console.log(`✅ ${data.appName} 已启动`);
      break;
    case 'stopped':
      console.log(`⏹️ ${data.appName} 已停止`);
      break;
  }
};

// 启动所有应用的dev服务器
async function startAllDevServers() {
  const response = await fetch('http://localhost:3001/api/dev/start-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exclude: ['mobile'] }) // 排除移动应用
  });
  const result = await response.json();
  console.log(result.message);
}

// 停止所有应用的dev服务器
async function stopAllDevServers() {
  const response = await fetch('http://localhost:3001/api/dev/stop-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const result = await response.json();
  console.log(result.message);
}

// 启动单个应用
async function startApp(appId) {
  const response = await fetch(`http://localhost:3001/api/dev/start/${appId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const result = await response.json();
  console.log(result.message);
}

// 停止单个应用
async function stopApp(appId) {
  const response = await fetch(`http://localhost:3001/api/dev/stop/${appId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const result = await response.json();
  console.log(result.message);
}
```

## 架构说明

### Dev 服务器管理架构

```
UI 客户端
    ↓ (HTTP POST) 发送启动/停止指令
Monitor Service (主控服务)
    ↓ (spawn) 启动子进程
Vite Dev 服务器 (每个应用独立进程)
    ↓ (stdout/stderr) 输出日志
Monitor Service (监听进程输出)
    ↓ (SSE) 推送实时状态
UI 客户端 (接收状态更新)
```

### 核心特性

1. **HTTP 短连接传指令**：UI 通过 POST 请求发送启动/停止指令
2. **SSE 长连接推状态**：服务器通过 SSE 实时推送启动过程、日志、状态变化
3. **子进程管理**：每个应用的dev服务器作为独立子进程管理
4. **可靠终止**：使用 `tree-kill` 确保彻底终止进程及其子进程
5. **并发控制**：启动所有应用时，限制并发数避免资源耗尽

## 后续计划

- [ ] 支持更多命令类型
- [ ] 添加错误自动修复建议
- [ ] 支持错误分组和聚合
- [ ] 添加错误趋势分析
- [ ] 支持邮件/通知推送
- [ ] Dev 服务器管理 UI 界面
- [ ] 支持应用分组启动
- [ ] 支持启动顺序配置
