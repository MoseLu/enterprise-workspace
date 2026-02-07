# Skills自我纠正与优化系统使用文档

## 概述

Skills自我纠正与优化系统是一个完整的skills管理和优化平台，能够自动记录执行情况、收集用户反馈、基于历史数据优化skills内容，并支持将复杂skills拆分为子skills。

## 核心功能

### 0. 命令自动跟踪（新增）

当执行特定命令时，自动识别并记录相关skill的执行：

- **命令到skill映射**：自动识别命令对应的skill
- **自动执行记录**：执行命令时自动创建skill执行记录
- **执行过程跟踪**：记录命令执行步骤、耗时、结果等
- **长期运行支持**：支持dev服务器等长期运行命令的跟踪

**命令映射示例**：
- `dev:all`, `dev`, `dev:app` → dev-workflow
- `build:all`, `build:app`, `build-cdn:*` → build-guide
- `release:push`, `release:version` → release-automation
- `check:i18n`, `locale:merge` → i18n-toolkit
- `lint:all`, `type-check:all` → quality-assurance
- `deploy:*` → deploy-toolkit

**使用场景**：
- 用户执行 `pnpm dev:all` → 自动记录 dev-workflow skill 执行
- 用户执行 `pnpm build:all` → 自动记录 build-guide skill 执行
- 即使没有明确使用skill，也会自动记录

### 0.5. 对话场景分析（新增）

从日常对话中提取优化数据：

- **自动记录对话场景**：记录用户查询和AI响应
- **识别相关skills**：自动识别对话内容与哪些skills相关
- **提取优化建议**：从对话中识别用户困惑点、常见问题、改进需求
- **关联分析**：将对话场景与skills关联，用于优化分析

**使用场景**：
- 用户问"如何构建应用" → 自动关联到 build-guide skill
- 用户问"开发服务器启动不了" → 自动关联到 dev-workflow skill
- 用户说"操作太复杂" → 生成简化建议

### 1. 执行跟踪系统

自动记录skill执行的详细过程：

- **执行级别跟踪**：记录执行开始、结束、状态、耗时、迭代次数等
- **步骤级别跟踪**：记录每个步骤的开始、结束、完成度评分、错误信息等
- **综合评分计算**：基于所有步骤的加权平均计算最终评分

### 2. 智能提示系统

支持两种模式：

- **首次执行模式**：系统性地询问所有关键点，确保不遗漏细节
- **经验模式**：基于历史数据，在关键步骤自动触发智能提示

提示反馈机制：
- 正确提示（用户确认需要）→ 加分项，提高权重
- 错误提示（用户确认不需要）→ 减分项，降低权重

### 3. 反馈收集系统

- **智能推断**：从用户自然反馈中自动推断多维度评分
- **主动询问**：如果反馈不够明确，使用AskQuestion工具主动询问
- **多维度评估**：准确性、完整性、效率、易用性、实用性

### 4. 自动优化引擎

基于执行数据和对话场景自动优化skills：

- **冗余内容检测**：识别未使用的指令部分
- **失败模式识别**：分析常见错误，添加解决方案
- **指令优化**：重写模糊或容易误解的指令
- **示例更新**：根据实际使用情况更新示例
- **对话数据驱动**：从日常对话中提取优化建议，即使没有执行记录也能优化

### 5. Skills拆分系统

自动将复杂skills拆分为子skills：

- **复杂度分析**：分析步骤数、执行时间等
- **模块识别**：识别可独立的功能模块
- **子skill创建**：自动创建子skills并建立父子关系

### 6. 共享问题中心

记录跨skill的通用问题，供其他skills参考。

## 快速开始

### 初始化系统

```bash
node scripts/commands/skills/cli.mjs init
```

这将：
1. 初始化SQLite数据库
2. 创建所有必要的表
3. 初始化判定标准库

### 命令自动跟踪

**自动工作**：当执行 `pnpm dev:all`、`pnpm build:all` 等命令时，系统会自动记录相关skill的执行。

**查看命令执行记录**：
```bash
# 查看dev-workflow的执行记录（包括通过dev:all命令触发的）
node scripts/commands/skills/cli.mjs list-executions dev-workflow

# 查看build-guide的执行记录（包括通过build:all命令触发的）
node scripts/commands/skills/cli.mjs list-executions build-guide
```

### 记录对话场景

```bash
# 记录对话场景（用于优化分析）
node scripts/commands/skills/cli.mjs record-conversation "用户查询" "AI响应"

# 查看skill相关的对话场景
node scripts/commands/skills/cli.mjs conversations build-guide
```

### 查看执行记录

```bash
# 列出所有执行记录
node scripts/commands/skills/cli.mjs list-executions

# 列出特定skill的执行记录
node scripts/commands/skills/cli.mjs list-executions build-guide

# 查看执行详情
node scripts/commands/skills/cli.mjs show-execution <execution-id>
```

### 生成健康度报告

```bash
# 生成单个skill的健康度报告
node scripts/commands/skills/cli.mjs analyze build-guide

# 生成所有skills的健康度报告
node scripts/commands/skills/cli.mjs analyze-all
```

### 分析执行趋势

```bash
# 分析最近30天的趋势
node scripts/commands/skills/cli.mjs trends build-guide

# 分析最近7天的趋势
node scripts/commands/skills/cli.mjs trends build-guide 7
```

### 手动触发优化

```bash
node scripts/commands/skills/cli.mjs optimize build-guide
```

### 拆分复杂skill

```bash
node scripts/commands/skills/cli.mjs split page-creator
```

### 搜索共享问题

```bash
# 搜索所有问题
node scripts/commands/skills/cli.mjs issues

# 搜索特定关键词
node scripts/commands/skills/cli.mjs issues 构建错误
```

## AI集成使用

### 对话场景记录（日常对话中）

**重要**：除了直接使用skills，日常对话中的需求也应该记录。

当用户提出需求或问题时，AI应该：

```javascript
import { recordConversationScenario } from './scripts/commands/skills/conversation-analyzer.mjs';

// 记录对话场景
const conversationId = recordConversationScenario(
  userQuery,  // 用户查询
  aiResponse  // AI响应（可选）
);

// 系统会自动：
// 1. 识别相关skills
// 2. 提取意图和关键词
// 3. 识别潜在问题
// 4. 生成优化建议
// 5. 关联到相关skills
```

**示例场景**：
- 用户："如何构建应用？" → 关联到 build-guide，生成"可发现性"优化建议
- 用户："构建总是失败" → 关联到 build-guide，生成"问题解决方案"优化建议
- 用户："操作太复杂了" → 关联到相关skill，生成"复杂度降低"优化建议

### 基本流程（执行skill时）

当AI执行skill时，应该按照以下流程：

1. **检查首次执行**
   ```javascript
   import { isFirstExecution } from './scripts/commands/skills/hint-system.mjs';
   const isFirst = isFirstExecution('build-guide');
   ```

2. **创建执行记录**
   ```javascript
   import { createExecution } from './scripts/commands/skills/execution-tracker.mjs';
   const executionId = createExecution('build-guide', { context });
   ```

3. **分步骤执行**
   ```javascript
   import { createStep, completeStep } from './scripts/commands/skills/execution-tracker.mjs';
   const stepId = createStep(executionId, '步骤名称', 1, 'step_type');
   // ... 执行步骤 ...
   completeStep(stepId, { completion_score: 1.0 });
   ```

4. **智能提示**
   ```javascript
   import { generateFirstExecutionQuestions, getHintSuggestions } from './scripts/commands/skills/hint-system.mjs';
   
   if (isFirst) {
     const questions = generateFirstExecutionQuestions('build-guide');
     // 使用AskQuestion展示问题
   } else {
     const hints = getHintSuggestions('build-guide', stepPattern, context);
     // 使用AskQuestion展示提示
   }
   ```

5. **完成执行**
   ```javascript
   import { completeExecution, calculateStepScores } from './scripts/commands/skills/execution-tracker.mjs';
   const stepScores = calculateStepScores(executionId);
   completeExecution(executionId, {
     status: 'completed',
     step_scores: stepScores,
     multi_dimension_scores: { ... }
   });
   ```

6. **收集反馈**
   ```javascript
   import { collectFeedback } from './scripts/commands/skills/feedback-collector.mjs';
   collectFeedback(executionId, {
     rawText: '用户反馈文本',
     explicitRating: 4.5
   });
   ```

## 配置说明

配置文件：`.claude/skills-meta/config.json`

### 优化阈值

```json
{
  "optimization_thresholds": {
    "min_success_rate": 0.8,
    "min_avg_rating": 3.5,
    "max_avg_iterations": 3
  }
}
```

### 提示系统配置

```json
{
  "hint_system": {
    "enable_hints": true,
    "first_execution_mode": true,
    "hint_accuracy_threshold": 0.5,
    "hint_success_threshold": 0.8
  }
}
```

### Skills拆分配置

```json
{
  "skill_splitting": {
    "enable_splitting": true,
    "max_steps_before_split": 10,
    "max_duration_before_split": 1800
  }
}
```

## 数据库结构

数据库位置：`.claude/skills-meta/database/skills.db`

主要表：
- `executions`: 执行记录
- `execution_steps`: 执行步骤
- `hint_suggestions`: 提示库
- `hint_feedback`: 提示反馈
- `optimizations`: 优化历史
- `shared_issues`: 共享问题
- `skill_metrics`: Skills指标
- `skill_hierarchy`: Skills层级关系
- `judgment_criteria`: 判定标准库
- `conversation_scenarios`: 对话场景（新增）
- `conversation_skill_mapping`: 对话与skill的映射关系（新增）

## 最佳实践

1. **记录所有相关对话**：不仅记录skill执行，也记录日常对话中的相关需求
2. **首次执行时详细询问**：确保不遗漏关键点
3. **及时记录反馈**：帮助系统学习用户偏好
4. **定期查看健康度报告**：了解skills的执行情况
5. **及时应用优化**：保持skills内容的最新和准确
6. **合理拆分复杂skills**：提高执行效率和可维护性
7. **关注对话中的优化信号**：用户困惑、常见问题、改进需求都是优化机会

## 故障排查

### 数据库初始化失败

检查：
1. `.claude/skills-meta/database/` 目录是否存在
2. 是否有写入权限
3. better-sqlite3是否正确安装

### 执行记录无法创建

检查：
1. 数据库是否已初始化
2. skill名称是否正确
3. 查看日志了解具体错误

### 优化未触发

检查：
1. 执行次数是否达到阈值（默认5次），或是否有对话场景数据
2. 指标是否达到优化阈值
3. `auto_optimize_enabled` 配置是否为true
4. 对话场景中是否有足够的优化建议（至少1条）

### 对话场景未关联到skill

检查：
1. 对话内容是否包含skill相关的关键词
2. skill关键词映射是否正确（conversation-analyzer.mjs）
3. 查看对话记录，确认关联关系

## 参考

- 系统架构：见计划文档
- API文档：查看各模块的JSDoc注释
- 配置选项：`.claude/skills-meta/config.json`
