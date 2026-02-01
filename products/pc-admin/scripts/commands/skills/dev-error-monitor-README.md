# 开发错误监听和自动上报系统

## 功能概述

该系统在运行 `pnpm dev:all` 时自动监听开发进程的输出，捕获错误并自动上报给 Cursor Agent，减少重复工作。

## 主要功能

1. **错误监听**：实时监听 turbo 进程的 stdout/stderr 输出
2. **错误分类**：自动对错误进行分级（critical/error/warning/info）和分类（TypeScript/ESLint/Build 等）
3. **错误存储**：将错误信息存储到 SQLite 数据库，支持去重和统计
4. **自动上报**：当检测到严重错误时，自动打开 Cursor Chat 并上报问题
5. **错误管理**：提供 CLI 命令查看和管理错误记录

## 使用方法

### 自动启用

运行 `pnpm dev:all` 时，错误监听会自动启用：

```bash
pnpm dev:all
```

系统会：
- 自动监听所有错误
- 将错误保存到数据库
- 当检测到严重错误（critical/error）时，自动打开 Cursor Chat 并上报

### 查看错误记录

```bash
# 查看所有错误
node scripts/commands/skills/cli.mjs dev-errors

# 查看未解决的错误
node scripts/commands/skills/cli.mjs dev-errors --unresolved

# 查看特定严重程度的错误
node scripts/commands/skills/cli.mjs dev-errors --severity error

# 查看特定包的错误
node scripts/commands/skills/cli.mjs dev-errors --package admin-app

# 限制显示数量
node scripts/commands/skills/cli.mjs dev-errors --limit 50
```

### 标记错误为已解决

```bash
# 标记错误为已解决（可选：提供解决方案）
node scripts/commands/skills/cli.mjs dev-errors:resolve <error_id> "解决方案描述"
```

## 错误分类

### 严重程度

- **critical**：严重错误，导致构建失败
- **error**：错误，如 TypeScript/ESLint 错误
- **warning**：警告，不影响运行但需要注意
- **info**：信息，一般提示信息

### 错误类型

- **typescript**：TypeScript 编译错误
- **eslint**：ESLint 检查错误
- **build**：构建错误
- **runtime**：运行时错误
- **dependency**：依赖问题
- **port**：端口占用
- **network**：网络错误
- **permission**：权限错误
- **other**：其他错误

## 配置选项

在 `dev-with-check.mjs` 中可以配置监听器选项：

```javascript
const errorListener = new DevErrorListener({
  minSeverity: 'warning',    // 最低报告级别
  autoReport: true,           // 是否自动上报
  reportThreshold: 1,         // 出现多少次后上报
  debounceMs: 3000           // 防抖时间（毫秒）
});
```

## 数据库结构

错误信息存储在 `.claude/skills-meta/database/skills.db` 的 `dev_errors` 表中：

- `error_hash`：错误哈希（用于去重）
- `severity`：严重程度
- `error_type`：错误类型
- `workspace_name`：工作空间名称
- `package_name`：包名称
- `error_message`：错误信息
- `file_path`：文件路径
- `line_number`：行号
- `occurrence_count`：出现次数
- `reported_to_cursor`：是否已上报
- `resolved`：是否已解决

## 工作流程

1. **监听**：监听 turbo 进程输出
2. **分类**：对每行输出进行分类
3. **提取**：提取错误详情（文件路径、行号等）
4. **去重**：使用错误哈希去重
5. **存储**：保存到数据库
6. **上报**：当满足条件时，自动打开 Cursor Chat 并上报

## 注意事项

1. 错误监听会增加少量性能开销，但影响很小
2. 自动上报功能需要 Cursor 窗口处于活动状态
3. 如果 Cursor Chat 打开失败，错误仍会保存到数据库，可以手动查看
4. 建议定期查看和清理已解决的错误记录

## 故障排除

### 数据库未初始化

如果遇到数据库相关错误，运行：

```bash
node scripts/commands/skills/cli.mjs init
```

### 监听器未启动

检查 `dev-with-check.mjs` 是否正确导入和初始化了 `DevErrorListener`。

### 上报失败

检查：
1. Cursor 是否正在运行
2. PowerShell 脚本权限是否正确
3. 查看日志中的错误信息
