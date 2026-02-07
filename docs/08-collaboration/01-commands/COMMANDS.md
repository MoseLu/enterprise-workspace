# 协作命令手册

> 本文档定义了四角色协作模式下的所有命令规范。

## 1. 会话间通信命令

### 1.1 唤醒命令

| 命令 | 角色 | 功能 | 示例 |
|------|------|------|------|
| `@planner` | Planner | 唤醒 Planner 处理新需求 | `@planner 我们需要一个用户认证系统` |
| `@manager` | Manager | 唤醒 Manager 检查任务状态 | `@manager 当前任务进度如何` |
| `@reviewer` | Reviewer | 唤醒 Reviewer 进行审核 | `@reviewer 请审核最近的代码变更` |
| `@worker:[id]` | Worker | 唤醒指定 Worker 终端 | `@worker:devstation 检查任务 T-001` |

### 1.2 状态查询命令

| 命令 | 功能 | 输出 |
|------|------|------|
| `/status` | 查询所有会话状态 | 会话列表、任务状态、资源使用 |
| `/workflow` | 显示当前工作流状态 | 流程阶段、待办项、阻塞点 |

## 2. 工作流命令（Plan 模式）

### 2.1 规划命令

```markdown
/plan [需求描述]
```

**功能**：Planner 开始理解需求，输出规划方案

**输出**：
```
# 规划方案：需求标题

## 1. 需求理解
- 核心目标
- 涉及模块
- 约束条件

## 2. 技术方案
- 技术选型
- 架构设计
- 接口定义

## 3. 任务拆分
- 原子任务列表
- 依赖关系
- 优先级

## 4. 里程碑
- v1.0：核心功能
- v1.1：扩展功能
```

**示例**：
```markdown
/plan 我们需要一个支持多主题的 Design Token 系统
```

### 2.2 确认命令

```markdown
/approve-plan
```

**功能**：用户确认方案，触发 Manager 开始任务分配

**触发条件**：用户审阅 `/plan` 输出后

### 2.3 任务拆分命令

```markdown
/split
```

**功能**：Manager 将规划拆分为原子任务

**输出**：
```
# 原子任务列表

## 任务 T-001
- 描述：创建 Design Token 基础结构
- 模块：design-system
- 依赖：无
- 优先级：P0
- 预计工时：2h

## 任务 T-002
- 描述：实现主题切换函数
- 模块：design-system
- 依赖：T-001
- 优先级：P0
- 预计工时：4h
```

### 2.4 任务分配命令

```markdown
/distribute
```

**功能**：Manager 分配任务给 Workers（基于 worktree）

**输出**：
```
# 任务分配

## Worktree: devstation
- 任务：T-001, T-002
- 负责人：Worker-devstation

## Worktree: react-admin
- 任务：T-003, T-004
- 负责人：Worker-react-admin

## Worktree: agent-cli-web
- 任务：T-005
- 负责人：Worker-agent-cli-web
```

### 2.5 任务列表命令

```markdown
/tasks
```

**功能**：显示当前任务列表和状态

**输出**：
```
# 任务看板

## 进行中 (3)
| ID | 任务 | 模块 | 进度 | 负责人 |
|----|------|------|------|--------|
| T-001 | 创建基础结构 | devstation | ████░░░░░ 40% | worker-devstation |
| T-002 | 实现主题切换 | design-system | ██░░░░░░░░ 20% | worker-design-system |

## 待分配 (5)
| ID | 任务 | 模块 | 优先级 |
|----|------|------|--------|
| T-003 | UI 组件适配 | react-admin | P0 |
| T-004 | 文档更新 | docs | P1 |

## 已完成 (2)
| ID | 任务 | 模块 | 完成时间 |
|----|------|------|----------|
| T-000 | 需求分析 | master | 2026-02-07 10:30 |
```

## 3. 执行命令（Execute 模式）

### 3.1 开始执行

```markdown
/execute [任务ID]
```

**功能**：Worker 开始执行原子任务

**示例**：
```markdown
/execute T-001
```

**输出**：
```
# 执行任务 T-001
## 任务描述
[任务描述]

## 执行计划
1. [步骤1]
2. [步骤2]
3. [步骤3]

## 自我校验清单
- [ ] 命名规范检查
- [ ] 语法正确性
- [ ] 基础逻辑验证

开始执行...
```

### 3.2 自我校验

```markdown
/self-check
```

**功能**：Worker 执行自我校验（最多 2 次）

**输出**：
```
## 自我校验报告

### 第 1 次校验
- [✓] 命名规范：通过
- [✓] 语法检查：通过
- [✓] 基础逻辑：通过
- [!] 警告：建议添加单元测试

### 校验结果
状态：通过 / 有条件通过 / 失败

问题列表：
1. [问题描述] - 建议修复方案
```

### 3.3 自我纠正

```markdown
/correct [问题描述]
```

**功能**：Worker 纠正已发现的问题

**示例**：
```markdown
/correct 函数命名不符合规范，已重命名为 calculateTotalPrice
```

### 3.4 报告完成

```markdown
/report-done
```

**功能**：Worker 报告任务完成，上报产物

**输出**：
```
## 任务完成报告

### 任务信息
- ID: T-001
- 标题: [任务标题]
- 负责人: worker-[module]
- 开始时间: YYYY-MM-DD HH:mm
- 结束时间: YYYY-MM-DD HH:mm
- 耗时: Xh Ym

### 变更文件
- [M] products/module/file1.ts - 文件变更描述
- [A] products/module/file2.ts - 新增文件描述

### 产物清单
1. [产物1] - 描述
2. [产物2] - 描述

### 自检报告
- 命名规范：✓ 通过
- 语法检查：✓ 通过
- 单元测试：✓ 通过

### 备注
[附加信息]
```

### 3.5 报告阻塞

```markdown
/report-block [阻塞描述]
```

**功能**：Worker 报告阻塞，请求 Manager 协助

**示例**：
```markdown
/report-block 依赖的 T-002 还未完成，无法进行集成测试
```

**输出**：
```
## 阻塞报告

### 任务信息
- ID: T-003
- 标题: [任务标题]
- 阻塞原因: [阻塞描述]

### 当前状态
- 已完成步骤: 1/3
- 阻塞步骤: 第 2 步

### 需要的协助
[协助描述]
```

## 4. 审核命令（Review 模式）

### 4.1 开始审核

```markdown
/review [产物标识]
```

**功能**：Reviewer 开始全局校验

**示例**：
```markdown
/review T-001-完成
/review PR-042
/review branch-feature-auth
```

**输出**：
```
# 全局校验报告

## 产物信息
- 来源: T-001 完成报告
- 提交: abc1234
- 变更文件: 5 个

## 校验项
### 1. 跨模块兼容性
- [✓] 无跨模块负面影响
- [✓] API 变更向后兼容

### 2. 样式冲突检测
- [✓] 无样式冲突
- [✓] Design Token 使用正确

### 3. 性能影响
- [✓] 无性能退化
- [✓] 优化建议已采纳

### 4. 安全审查
- [✓] 无安全漏洞
- [✓] 敏感信息未泄露

### 5. 架构一致性
- [✓] 符合项目架构
- [✓] 遵循编码规范

## 校验结果
总体状态：通过 / 有条件通过 / 失败

详细报告：
[完整的校验报告]
```

### 4.2 专项检查命令

```markdown
/check-style      # 检查样式冲突
/check-compat    # 检查跨模块兼容性
/check-perf      # 检查性能影响
/check-security  # 检查安全漏洞
```

### 4.3 审核决定命令

```markdown
/approve
```

**功能**：产物通过审核

**输出**：
```
## 审核通过

### 产物信息
- 来源: [产物标识]
- 审核人: reviewer-[xxx]
- 审核时间: YYYY-MM-DD HH:mm

### 审核结论
- 质量等级: A / B / C
- 可合并: 是
- 建议: [优化建议（可选）]

### 下一步
- 产物已归档
- 规则已沉淀
- 可进行合并操作
```

```markdown
/request-changes [修改建议]
```

**功能**：要求修改后重新审核

**输出**：
```
## 需修改

### 问题列表
1. [问题1] - 严重程度: 高/中/低
   - 描述: [问题描述]
   - 建议: [修改建议]
   - 位置: [文件路径:行号]

2. [问题2] - 严重程度: ...
   ...

### 修改要求
- 修改后重新提交审核
- 修改期限: [可选]

### 后续步骤
1. 执行者修改代码
2. 执行自检 (/self-check)
3. 重新提交 (/report-done)
```

```markdown
/reject [驳回理由]
```

**功能**：驳回产物，要求重做

**输出**：
```
## 驳回

### 驳回原因
[详细说明驳回理由]

### 问题总结
[核心问题描述]

### 后续步骤
1. 返回 Planner 重新规划
2. 或重新设计技术方案
3. 重新执行任务
```

### 4.4 规则沉淀命令

```markdown
/rules
```

**功能**：Reviewer 更新全局规则库

**输出**：
```
## 规则沉淀报告

### 新增规则
1. [规则标题]
   - 编号: RULE-XXX
   - 类别: [architecture/coding/testing/docs]
   - 描述: [规则描述]
   - 示例: [正确/错误示例]

2. [规则标题]
   ...

### 更新的规则
1. [规则标题] - 更新内容

### 规则库更新
- 更新的文件: CLAUDE.md, RULE.md
- 更新的知识库条目: KB-XXX, KB-YYY
```

## 5. 完成命令

### 5.1 任务完成

```markdown
/complete
```

**功能**：任务全部完成，触发归档流程

**触发条件**：
- 所有原子任务完成
- Audit 审核通过
- 用户确认

**输出**：
```
## 任务完成

### 任务信息
- 任务 ID: TASK-XXX
- 标题: [任务标题]
- 里程碑: v1.0
- 开始时间: YYYY-MM-DD HH:mm
- 完成时间: YYYY-MM-DD HH:mm
- 总耗时: Xh Ym

### 完成统计
- 原子任务数: 10
  - 已完成: 10
  - 进行中: 0
  - 待分配: 0
- 代码变更: +500 / -100
- 文档更新: 3 篇
- 规则新增: 2 条

### 归档信息
- 归档路径: ~/.claude/archives/YYYY-MM/TASK-XXX/
- 摘要文件: summary.json
- 会话记录: session.jsonl
- 任务列表: tasks.json
- 产物链接: artifacts/

### 后续步骤
1. 归档已保存
2. 可通过 /archive 查看归档历史
3. 可通过 /restore 恢复归档上下文
```

### 5.2 手动归档

```markdown
/archive [会话ID]
```

**功能**：手动触发归档流程

**示例**：
```markdown
/archive ses_3cf59368fffeuM53N0OPBo5aH0
```

### 5.3 自动归档控制

```markdown
/archive-auto
/archive-auto enable
/archive-auto disable
```

**功能**：启用/禁用自动归档

## 6. 复合命令

### 6.1 完整工作流

```markdown
# 启动新需求
/plan [需求描述]

# 确认方案
/approve-plan

# 拆分和分配
/split
/distribute

# 各 Worker 执行
/execute T-001
/self-check
/report-done

# 审核
/review T-001-完成
/approve

# 完成归档
/complete
```

### 6.2 快速修复流程

```markdown
# 报告阻塞
/report-block [问题描述]

# Manager 重新分配
/distribute

# 重新执行
/execute T-XXX
/self-check
/report-done

# 重新审核
/review T-XXX-重新提交
/approve
```

## 7. 命令别名

| 命令 | 别名 | 说明 |
|------|------|------|
| `/plan` | `/p` | 快速规划 |
| `/tasks` | `/t` | 任务看板 |
| `/status` | `/s` | 状态查询 |
| `/workflow` | `/wf` | 工作流状态 |
| `/self-check` | `/sc` | 自我校验 |
| `/report-done` | `/done` | 报告完成 |
| `/approve` | `/ok` | 审核通过 |
| `/complete` | `/c` | 完成归档 |

## 8. 命令速查表

| 场景 | 命令 | 角色 |
|------|------|------|
| 开始新需求 | `/plan [需求]` | Planner |
| 确认方案 | `/approve-plan` | User |
| 查看任务 | `/tasks` | All |
| 执行任务 | `/execute [ID]` | Worker |
| 自我校验 | `/self-check` | Worker |
| 报告完成 | `/report-done` | Worker |
| 报告阻塞 | `/report-block [原因]` | Worker |
| 开始审核 | `/review [产物]` | Reviewer |
| 通过审核 | `/approve` | Reviewer |
| 要求修改 | `/request-changes [建议]` | Reviewer |
| 沉淀规则 | `/rules` | Reviewer |
| 完成归档 | `/complete` | Manager |

## 9. 使用示例

### 示例 1：完整工作流

```markdown
用户: @planner 我们需要实现用户认证功能

Planner: [生成规划方案]
/plan 实现用户登录注册功能，包括 JWT Token、权限验证、密码加密

用户: /approve-plan

Manager: [拆分任务]
/split
/distribute

Worker-devstation: [执行任务]
/execute T-001
[执行代码变更]
/self-check
[自我校验通过]
/report-done

Worker-react-admin: [并行执行]
/execute T-002
[执行 UI 开发]
/self-check
/report-done

Reviewer: [审核]
/review T-001-完成
/check-style
/check-compat
/approve

/complete
```

### 示例 2：处理阻塞

```markdown
Worker-react-admin: /report-block T-003 等待后端 API 完成

Manager: /tasks
[确认阻塞]
/distribute
[重新分配依赖任务]

Worker-backend: /execute T-000
/report-done

Worker-react-admin: /execute T-003
/report-done
```

---

**版本**: 1.0.0
**最后更新**: 2026-02-07
**维护者**: 企业架构组
