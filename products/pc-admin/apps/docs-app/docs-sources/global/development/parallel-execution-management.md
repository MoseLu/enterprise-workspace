# 并行执行统一管理

## 概述

当主 skill 需要并行执行子任务时，系统会自动为每个子任务打开新的 Chat 对话，并记录所有子任务的 Chat ID、状态、进程信息等，供主 skill 进行统一管理。

## 核心功能

### 1. 自动记录子任务信息

当打开新的 Chat 执行子任务时，系统会自动记录：
- **Chat ID**: 唯一的 Chat 标识符
- **子任务信息**: skill 名称、任务描述
- **进程信息**: 平台、Node.js 版本、时间戳
- **状态**: opened, started, completed, failed, cancelled, closed
- **时间戳**: 打开时间、开始时间、完成时间

### 2. 统一管理接口

主 skill 可以通过以下接口查询和管理所有子任务：

```javascript
import { getParallelExecutionInfo } from './scripts/commands/skills/parallel-executor.mjs';

// 获取所有子任务信息
const info = getParallelExecutionInfo(parentExecutionId);

// 信息结构
{
  total: 3,                    // 子任务总数
  stats: {                      // 状态统计
    opened: 1,
    started: 1,
    completed: 1,
    failed: 0,
    cancelled: 0
  },
  all: [                        // 所有子任务详情
    {
      chat_id: 'chat_xxx',
      child_skill_name: 'dev-workflow',
      task_description: '启动开发服务器',
      status: 'opened',
      process_info: { ... },
      opened_at: 1234567890,
      ...
    }
  ],
  active: [ ... ],              // 活跃的子任务（未完成）
  chatIds: [ 'chat_xxx', ... ]  // 所有 Chat ID 列表
}
```

### 3. 状态管理

```javascript
import { 
  updateParallelExecutionStatus,
  getActiveChildExecutions,
  markAllChildrenCompleted,
  cancelAllChildExecutions
} from './scripts/commands/skills/parallel-manager.mjs';

// 更新子任务状态
updateParallelExecutionStatus('chat_xxx', 'started', {
  startedAt: Date.now(),
  childExecutionId: 'exec_xxx'
});

// 获取活跃的子任务
const active = getActiveChildExecutions(parentExecutionId);

// 标记所有子任务为已完成
markAllChildrenCompleted(parentExecutionId);

// 取消所有未完成的子任务
cancelAllChildExecutions(parentExecutionId);
```

## 使用示例

### 示例1：主 skill 执行并行子任务

```javascript
import { 
  createExecution, 
  completeExecution 
} from './scripts/commands/skills/execution-tracker.mjs';
import { 
  executeSubTasksInParallel,
  getParallelExecutionInfo 
} from './scripts/commands/skills/parallel-executor.mjs';

// 1. 创建主执行记录
const parentExecutionId = createExecution('complex-task', {
  description: '复杂任务：需要并行处理多个子任务'
});

// 2. 执行并行子任务
const result = await executeSubTasksInParallel(
  'complex-task',
  parentExecutionId,
  { description: '复杂任务' },
  [
    { skillName: 'dev-workflow', description: '启动开发服务器' },
    { skillName: 'build-guide', description: '构建共享包' },
    { skillName: 'i18n-toolkit', description: '检查翻译' }
  ]
);

// 3. 获取所有子任务的 Chat ID
console.log('子任务 Chat IDs:', result.chatIds);
// 输出: ['chat_xxx', 'chat_yyy', 'chat_zzz']

// 4. 主 skill 可以继续处理其他任务
// 同时监控子任务状态
const parallelInfo = getParallelExecutionInfo(parentExecutionId);
console.log('活跃子任务:', parallelInfo.active.length);

// 5. 当主任务完成时，可以标记所有子任务为已完成
if (parallelInfo.active.length === 0) {
  completeExecution(parentExecutionId, { status: 'completed' });
}
```

### 示例2：监控子任务状态

```javascript
import { getParallelExecutionInfo } from './scripts/commands/skills/parallel-executor.mjs';

// 定期检查子任务状态
function monitorChildTasks(parentExecutionId) {
  const info = getParallelExecutionInfo(parentExecutionId);
  
  console.log(`总子任务: ${info.total}`);
  console.log(`已完成: ${info.stats.completed}`);
  console.log(`进行中: ${info.stats.started}`);
  console.log(`失败: ${info.stats.failed}`);
  
  // 检查是否有失败的子任务
  const failed = info.all.filter(child => child.status === 'failed');
  if (failed.length > 0) {
    console.log('失败的子任务:');
    failed.forEach(child => {
      console.log(`  - ${child.child_skill_name} (Chat ID: ${child.chat_id})`);
    });
  }
  
  // 返回是否所有子任务都已完成
  return info.stats.completed === info.total;
}
```

### 示例3：根据 Chat ID 查询子任务

```javascript
import { getParallelExecutionByChatId } from './scripts/commands/skills/parallel-manager.mjs';

// 根据 Chat ID 查询子任务信息
const childTask = getParallelExecutionByChatId('chat_xxx');

if (childTask) {
  console.log('子任务信息:');
  console.log(`  Skill: ${childTask.child_skill_name}`);
  console.log(`  任务: ${childTask.task_description}`);
  console.log(`  状态: ${childTask.status}`);
  console.log(`  进程信息:`, childTask.processInfo);
}
```

## CLI 命令

### 查看并行执行信息

```bash
# 查看父级执行的所有子任务
node scripts/commands/skills/cli.mjs parallel <parent_execution_id>

# 查看执行详情（包括子任务）
node scripts/commands/skills/cli.mjs show-execution <execution_id>
```

### 输出示例

```
并行执行信息:
════════════════════════════════════════════════════════════════════════════════
父级执行 ID: exec_xxx
子任务总数: 3

状态统计:
  已打开: 1
  进行中: 1
  已完成: 1
  失败: 0
  已取消: 0

所有子任务:
────────────────────────────────────────────────────────────────────────────────
📝 dev-workflow         | Chat ID: chat_xxx
  任务: 启动开发服务器并检查端口
  进程信息: {"platform":"win32","nodeVersion":"v22.18.0","timestamp":...}
  状态: opened | 打开时间: 2026/1/14 16:39:49

🔄 build-guide          | Chat ID: chat_yyy
  任务: 构建共享包和依赖
  状态: started | 打开时间: 2026/1/14 16:39:52

✅ i18n-toolkit         | Chat ID: chat_zzz
  任务: 检查并更新国际化翻译
  状态: completed | 完成时间: 2026/1/14 16:40:15

活跃子任务 (2):
  - dev-workflow (Chat ID: chat_xxx)
  - build-guide (Chat ID: chat_yyy)

所有 Chat ID: chat_xxx, chat_yyy, chat_zzz
```

## 数据库结构

### parallel_executions 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| parent_execution_id | TEXT | 父级执行 ID |
| child_execution_id | TEXT | 子级执行 ID（如果已创建） |
| child_skill_name | TEXT | 子级 skill 名称 |
| chat_id | TEXT | Chat ID（唯一标识） |
| chat_url | TEXT | Chat URL（如果可获取） |
| process_info | TEXT | 进程信息（JSON） |
| task_description | TEXT | 任务描述 |
| status | TEXT | 状态（opened, started, completed, failed, cancelled, closed） |
| opened_at | INTEGER | 打开时间 |
| started_at | INTEGER | 开始时间 |
| completed_at | INTEGER | 完成时间 |
| metadata | TEXT | 额外元数据（JSON） |

## 最佳实践

1. **及时更新状态**: 当子任务开始执行时，更新状态为 `started`
2. **记录子执行 ID**: 如果子任务创建了执行记录，更新 `child_execution_id`
3. **统一完成**: 主任务完成时，检查所有子任务状态，必要时标记为已完成
4. **错误处理**: 监控失败的子任务，记录错误信息
5. **资源清理**: 取消不再需要的子任务，释放资源

## 任务完成确认和完成阶段操作

### 核心功能

当主任务完成时，系统会通过 `AskQuestion` 工具询问用户**是否确认任务完成**。如果用户确认完成，系统将自动执行一系列完成阶段操作：

1. **生成执行总结** - 生成详细的执行摘要
2. **写入参考文件** - 将总结写入 `.claude/skills-meta/executions/summaries/` 目录
3. **对skill进行评级** - 生成健康度报告，评估skill表现
4. **关闭子Chat** - 关闭所有并行执行的子任务 Chat
5. **完成主任务执行记录** - 更新执行状态为已完成

### 使用方式

```javascript
import { 
  confirmTaskCompletion,
  completeTaskWithAllPhases 
} from './scripts/commands/skills/task-completion-handler.mjs';

// 方式1: 确认任务完成并执行所有完成阶段操作（推荐）
const result = await confirmTaskCompletion(parentExecutionId, {
  askQuestion: askQuestion, // AskQuestion 工具函数
  skipConfirm: false, // 是否跳过确认（默认需要确认）
  completionMessage: '任务执行情况总结...', // 自定义完成消息
  skipSummary: false, // 是否跳过总结（默认生成）
  skipRating: false // 是否跳过评级（默认评级）
});

// 方式2: 一步完成（包含执行数据更新）
const result = await completeTaskWithAllPhases(parentExecutionId, {
  status: 'completed',
  completionMessage: '任务已完成！',
  // 其他执行数据...
}, {
  askQuestion: askQuestion,
  skipConfirm: false,
  skipSummary: false,
  skipRating: false
});
```

### 使用 AskQuestion 确认任务完成

系统会通过 `AskQuestion` 工具询问用户是否确认任务完成：

```
任务执行情况：

**Skill**: dev-workflow
**执行ID**: exec_xxx
**步骤数**: 5 (已完成: 5)
**并行子任务**: 3个 (活跃: 0)
**状态**: running
**迭代次数**: 1

请确认任务是否已完成？

如果确认完成，系统将执行以下操作：
1. 📝 生成执行总结并写入参考文件
2. ⭐ 对skill进行评级（生成健康度报告）
3. 🔒 关闭所有并行子任务的Chat
4. ✅ 完成主任务执行记录

选项：
- 是，确认完成
- 否，继续执行
- 稍后确认
```

### 完成阶段操作详情

**1. 生成执行总结**
- 位置：`.claude/skills-meta/executions/summaries/{executionId}.md`
- 内容：执行详情、步骤信息、并行子任务、用户反馈、多维度评分等

**2. 对skill进行评级**
- 使用 `generateHealthReport()` 生成健康度报告
- 评估skill的成功率、平均评分、迭代次数等指标
- 确定健康状态：excellent, good, fair, poor

**3. 关闭子Chat**
- 自动关闭所有活跃的并行子任务 Chat
- 更新状态为 `closed`
- 记录关闭时间和原因

**4. 完成主任务执行记录**
- 更新执行状态为 `completed`
- 记录完成时间和摘要信息

### CLI 命令

```bash
# 关闭所有子任务 Chat
node scripts/commands/skills/cli.mjs close-chats <parent_execution_id>

# 强制关闭（不检查状态）
node scripts/commands/skills/cli.mjs close-chats <parent_execution_id> --force
```

## 注意事项

- Chat ID 是系统自动生成的唯一标识符
- 进程信息记录的是打开 Chat 时的环境信息
- 状态更新需要手动调用 `updateParallelExecutionStatus()`
- 子任务的执行记录（`child_execution_id`）需要在新 Chat 中创建执行记录后更新
- **任务完成时**：建议使用 `confirmTaskCompletion()` 或 `completeTaskWithAllPhases()` 来统一处理完成逻辑
- **完成确认**：系统会询问用户是否确认任务完成，而不是询问是否关闭 Chat
- **完成阶段操作**：确认完成后会自动执行总结、评级、关闭Chat、完成记录等操作
- **总结文件**：执行总结会写入 `.claude/skills-meta/executions/summaries/{executionId}.md`
- **关闭状态**：子 Chat 关闭后会标记为 `closed` 状态，不会自动删除记录，便于后续查询和分析
