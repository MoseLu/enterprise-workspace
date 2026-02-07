# 四角色协作模式 - 快速启动指南

> 本指南帮助您快速上手多终端并行开发会话管理系统。

## 1. 快速启动

### 1.1 初始化会话

```bash
# 在 Master 终端，初始化计划者会话
./scripts/worktree/claude-worktree.sh session init planner

# 在 Audit 终端，初始化审查者会话
./scripts/worktree/claude-worktree.sh session init reviewer

# 在 Worktree 终端，初始化执行者会话
./scripts/worktree/claude-worktree.sh session init worker
```

### 1.2 查看当前状态

```bash
# 查看会话状态
./scripts/worktree/claude-worktree.sh session status

# 查看 Worktree 状态
./scripts/worktree/claude-worktree.sh status
```

## 2. 完整工作流

### 2.1 启动新需求

```markdown
# 在 Master 终端（Planner 角色）

/plan [需求描述]
# 例如: /plan 我们需要一个支持多主题的 Design Token 系统
```

### 2.2 确认并分配任务

```markdown
# 用户确认方案后
/approve-plan

# Planner 确认，触发 Manager
/split
/distribute
```

### 2.3 执行任务

```markdown
# 在 Worktree 终端（Worker 角色）

/execute [任务ID]
# 例如: /execute T-001

# 自我校验
/self-check

# 完成报告
/report-done
```

### 2.4 审核产物

```markdown
# 在 Audit 终端（Reviewer 角色）

/review [产物标识]
# 例如: /review T-001-完成

# 全局校验
/check-style
/check-compat
/check-perf
/check-security

# 审核决定
/approve
```

### 2.5 完成归档

```markdown
# 在 Master 终端（Manager 角色）

/complete
```

## 3. 命令速查表

### 3.1 会话管理

```bash
# 初始化会话
./scripts/worktree/claude-worktree.sh session init planner
./scripts/worktree/claude-worktree.sh session init manager
./scripts/worktree/claude-worktree.sh session init worker
./scripts/worktree/claude-worktree.sh session init reviewer

# 查看状态
./scripts/worktree/claude-worktree.sh session status

# 列出所有
./scripts/worktree/claude-worktree.sh session list
```

### 3.2 Worktree 管理

```bash
# 自动检测并创建
./scripts/worktree/claude-worktree.sh auto

# 为指定文件创建
./scripts/worktree/claude-worktree.sh files path/to/file1 path/to/file2

# 查看状态
./scripts/worktree/claude-worktree.sh status

# 清理所有
./scripts/worktree/claude-worktree.sh cleanup
```

### 3.3 归档管理

```bash
# 自动检测可归档会话
./scripts/worktree/session-archive.sh auto

# 手动归档
./scripts/worktree/session-archive.sh archive <会话ID> [项目] [里程碑]

# 列出归档
./scripts/worktree/session-archive.sh list

# 查看摘要
./scripts/worktree/session-archive.sh summary <任务ID>
```

## 4. 三终端设置示例

### 4.1 Master 终端（需求与协调）

```
终端 1: Claude Code - enterprise-workspace/
角色: Planner + Manager
命令:
  /plan [新需求]
  /approve-plan
  /split
  /distribute
  /tasks
  /complete
```

### 4.2 Audit 终端（质量审核）

```
终端 2: Claude Code - enterprise-workspace/
角色: Reviewer
命令:
  /review [产物]
  /check-style
  /approve
  /rules
```

### 4.3 Worktree 终端（任务执行）

```
终端 3-N: Claude Code - ../worktrees/[module]-[branch]/
角色: Worker
命令:
  /execute [任务ID]
  /self-check
  /report-done
  /report-block
```

## 5. 最佳实践

### 5.1 会话命名

在 Claude 对话中使用 `/rename` 命令重命名会话：

```markdown
/rename planner-DesignToken-2026-02-07
/rename manager-TASK-042-v1.0
/rename worker-devstation-TASK-001
/rename reviewer-CodeChange-v1.0
```

### 5.2 归档策略

建议在以下情况触发归档：

- 任务完成并通过审核后
- 会话消息超过 50 条时
- 长时间（7天）未使用的会话

### 5.3 Worktree 使用

```bash
# 根据变更自动创建 Worktree
./scripts/worktree/claude-worktree.sh auto

# 清理不需要的 Worktree
./scripts/worktree/claude-worktree.sh cleanup
```

## 6. 常见问题

### Q1: 如何切换角色？

```bash
# 查看当前角色
./scripts/worktree/claude-worktree.sh session status

# 重新初始化角色
./scripts/worktree/claude-worktree.sh session init [role]
```

### Q2: 会话 ID 是什么？

会话 ID 是 Claude Code 自动生成的唯一标识符，可在状态输出中查看。

### Q3: 如何恢复归档？

```bash
# 查看归档摘要
./scripts/worktree/session-archive.sh summary <任务ID>

# 注意：归档只能查看，不能直接恢复会话
```

### Q4: Worktree 和主仓库如何同步？

Worktree 是主仓库的独立副本，但共享 Git 历史。使用完成后记得提交并同步变更。

## 7. 相关文档

- [完整命令手册](../../docs/08-collaboration/01-commands/COMMANDS.md)
- [CLAUDE.md](../../CLAUDE.md)
- [AGENTS.md](../../AGENTS.md)

## 8. 下一步

1. 阅读完整命令手册
2. 设置三个常驻终端
3. 实践完整工作流
4. 根据反馈优化流程

---

**版本**: 1.0.0
**最后更新**: 2026-02-07
