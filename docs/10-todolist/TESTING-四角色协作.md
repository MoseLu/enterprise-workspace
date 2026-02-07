# 测试用例：四角色协作方案验证

> 测试时间：2026-02-07
> 测试任务：TASK-2026-002 (pc-admin 多端适配)
> 测试目标：验证多 Agent 协作流程

---

## 一、测试任务概述

### 1.1 任务信息

| 字段 | 值 |
|------|-----|
| 任务ID | TASK-2026-002 |
| 标题 | pc-admin 多端适配与测试验证 |
| 优先级 | P1（高优先级） |
| 状态 | 待开始 |
| 负责人 | AI Assistant |
| 创建时间 | 2026-02-07 |
| 关联任务 | TASK-2026-001 |

### 1.2 任务内容

1. **小程序构建验证**：14 个子应用支持小程序输出
2. **测试覆盖**：单元测试 ≥ 80%，E2E 测试覆盖核心流程
3. **项目归档**：旧版 Vue 代码归档
4. **代码同步**：GitHub PR 提交

---

## 二、四角色模板

### 2.1 Planner（计划者）

**使用场景**：接收用户需求，输出规划方案

**会话模板**：
```markdown
---
role: planner
project: pc-admin-multi-end
milestone: v1.0
---
分析 pc-admin 多端适配任务（TASK-2026-002），输出规划方案：

1. 技术选型：Taro 小程序适配方案
2. 原子功能拆分：32 个子任务
3. 全局规则：多端兼容规范
4. 里程碑节点：5 个阶段
```

**预期输出**：
- 技术选型决策报告
- 32 个原子任务列表
- 多端兼容设计规范

---

### 2.2 Manager（管理者）

**使用场景**：拆分任务，分配给 Workers

**会话模板**：
```markdown
---
role: manager
project: pc-admin-multi-end
milestone: v1.0
---
拆分 TASK-2026-002 的规划方案为原子任务：

1. 小程序构建验证（任务 1-14）
2. 单元测试覆盖（任务 15-20）
3. E2E 测试覆盖（任务 21-26）
4. 项目归档（任务 27-30）
5. GitHub PR（任务 31-32）

为每个 Worker 分配具体任务。
```

**预期输出**：
- 32 个原子任务列表
- 任务分配方案
- 依赖关系图

---

### 2.3 Worker（执行者）

**使用场景**：在 Worktree 中执行具体任务

**Worker 1（小程序构建）**：
```markdown
---
role: worker
project: pc-admin-multi-end
milestone: v1.0
task_id: TASK-2026-002-W01
---
执行任务 1：构建 H5 子应用入口文件

要求：
1. 验证 H5 构建入口配置
2. 确保 14 个子应用支持 H5 输出
3. 输出产物验证报告
```

**Worker 2（单元测试）**：
```markdown
---
role: worker
project: pc-admin-multi-end
milestone: v1.0
task_id: TASK-2026-002-W15
---
执行任务 15-20：单元测试覆盖提升至 80%

要求：
1. 统计现有测试覆盖率
2. 识别覆盖率 < 80% 的模块
3. 补充单元测试
4. 输出测试报告
```

---

### 2.4 Reviewer（审查者）

**使用场景**：全局校验产物

**会话模板**：
```markdown
---
role: reviewer
project: pc-admin-multi-end
milestone: v1.0
---
审核 TASK-2026-002 所有 Worker 产物：

全局校验项：
1. 小程序构建产物完整性
2. 单元测试覆盖率报告
3. E2E 测试报告
4. 归档文件清单
5. GitHub PR 合规性

生成审核报告，决定是否通过。
```

---

## 三、协作流程图

```
用户需求
    ↓
┌─────────────────────────────────────────────┐
│ Master 终端会话 #1 (Planner)                 │
│ role: planner, project: pc-admin-multi-end  │
│ → 分析需求，输出规划方案                     │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Master 终端会话 #2 (Manager)                 │
│ role: manager, project: pc-admin-multi-end  │
│ → 拆分 32 个原子任务                        │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────┬───────────────────────────┐
│ Worktree #1     │ Worktree #2              │
│ role: worker    │ role: worker             │
│ task_id: W01    │ task_id: W15            │
│ → H5 构建       │ → 单元测试               │
└─────────────────┴───────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ Audit 终端会话 (Reviewer)                    │
│ role: reviewer, project: pc-admin-multi-end │
│ → 全局校验，通过后归档                     │
└─────────────────────────────────────────────┘
```

---

## 四、测试验证清单

### 4.1 角色识别验证

```bash
# 运行角色识别脚本
bash "E:/enterprise-workspace/scripts/worktree/session-roles.sh"

# 预期结果
🟢 [PLANNER] 3xxxxxxx
🔵 [MANAGER] 3xxxxxxx
🟡 [WORKER]  3xxxxxxx (W01)
🟡 [WORKER]  3xxxxxxx (W15)
🔴 [REVIEWER] 3xxxxxxx
```

### 4.2 协作流程验证

| 步骤 | 操作 | 预期结果 |
|------|------|----------|
| 1 | Planner 输出规划 | 32 个原子任务 |
| 2 | Manager 拆分任务 | 任务分配表 |
| 3 | Workers 执行任务 | 产物报告 |
| 4 | Reviewer 审核 | 通过/反馈 |
| 5 | 归档 | summary.json |

### 4.3 归档验证

```bash
# 查看归档列表
bash "E:/enterprise-workspace/scripts/worktree/session-archive.sh" list

# 预期结果
2026-02/
├── TASK-20260207-pc-admin-planner-v1.0/
│   ├── summary.json (包含 role: planner)
│   └── session.jsonl
├── TASK-20260207-pc-admin-manager-v1.0/
│   ├── summary.json (包含 role: manager)
│   └── session.jsonl
└── ...
```

---

## 五、常见问题

### Q1：Desktop 中看不到角色标识？
A：在 Desktop 中点击会话，查看第一条消息内容即可识别角色。

### Q2：如何批量创建 Worker？
A：使用 Worktree 脚本创建多个分支：
```bash
bash scripts/worktree/claude-worktree.sh create pc-admin-multi-end worker W01
bash scripts/worktree/claude-worktree.sh create pc-admin-multi-end worker W02
```

### Q3：归档后如何恢复？
A：归档仅是复制，原会话仍在 Desktop 中。如需彻底清理，请手动关闭会话。

---

## 六、测试总结

### 成功标准
1. ✅ 角色识别脚本能正确识别 4 种角色
2. ✅ 四角色协作流程顺畅执行
3. ✅ 归档机制正常工作
4. ✅ 任务状态正确更新

### 测试日期：2026-02-07
### 测试人员：AI Assistant
