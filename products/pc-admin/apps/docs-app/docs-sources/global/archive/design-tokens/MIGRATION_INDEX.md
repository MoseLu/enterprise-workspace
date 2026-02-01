# 迁移文档索引

本文档是设计令牌迁移相关文档的索引，帮助快速找到所需文档。

## 文档列表

### 1. [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md)

**用途**：原子化迁移步骤文档

**内容**：
- 将迁移计划分解为最小可执行的原子步骤
- 每个步骤都有明确的输入、输出、验证标准
- 包含详细的执行指令和验证方法

**适用场景**：
- 执行具体的迁移步骤
- 需要了解每个步骤的详细要求
- 验证步骤执行结果

**使用方式**：
1. 按照阶段顺序查找步骤
2. 执行步骤操作
3. 验证步骤输出
4. 标记步骤完成

---

### 2. [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md)

**用途**：迁移里程碑文档

**内容**：
- 定义8个关键里程碑（M1-M8）
- 每个里程碑的完成标准
- 里程碑之间的依赖关系
- 里程碑进度跟踪表

**适用场景**：
- 了解整体迁移进度
- 检查里程碑完成状态
- 规划迁移时间

**使用方式**：
1. 查看里程碑列表
2. 确认当前里程碑
3. 完成里程碑后更新状态
4. 验证里程碑完成标准

---

### 3. [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md)

**用途**：迁移执行指南

**内容**：
- 快速开始指南
- 详细的执行流程
- 问题处理方案
- 回滚操作说明
- 进度跟踪方法

**适用场景**：
- 开始执行迁移
- 了解整体执行流程
- 处理执行中的问题
- 跟踪迁移进度

**使用方式**：
1. 阅读快速开始部分
2. 按照执行流程进行
3. 遇到问题查阅问题处理部分
4. 使用进度跟踪方法

---

### 4. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

**用途**：迁移指南（概述）

**内容**：
- 迁移策略概述
- 基本迁移步骤
- 变量映射表
- 注意事项

**适用场景**：
- 了解迁移整体策略
- 快速了解迁移流程
- 查看变量映射关系

---

### 5. [TOKENS_STRUCTURE.md](./TOKENS_STRUCTURE.md)

**用途**：设计令牌结构说明

**内容**：
- 令牌文件组织
- 令牌分类说明
- 令牌引用规则
- 编译输出格式

**适用场景**：
- 了解设计令牌结构
- 新增设计令牌
- 理解令牌引用关系

---

## 文档使用流程

### 首次执行迁移

1. **阅读执行指南**
   - 打开 [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md)
   - 阅读"快速开始"部分
   - 了解执行原则

2. **查看里程碑**
   - 打开 [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md)
   - 了解所有里程碑
   - 确认当前目标里程碑

3. **执行原子步骤**
   - 打开 [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md)
   - 按照阶段顺序执行步骤
   - 每完成一步，验证并标记

4. **验证里程碑**
   - 完成相关步骤后
   - 验证里程碑完成标准
   - 更新里程碑状态

### 继续执行迁移

1. **查看当前进度**
   - 查看 [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) 中的进度跟踪表
   - 确认当前里程碑

2. **执行下一步骤**
   - 在 [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) 中找到下一步
   - 执行步骤
   - 验证结果

3. **更新进度**
   - 标记步骤完成
   - 更新里程碑状态

### 遇到问题

1. **查阅执行指南**
   - 打开 [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md)
   - 查看"问题处理"部分

2. **检查步骤要求**
   - 在 [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) 中查看步骤的验证标准
   - 确认是否满足所有要求

3. **查看令牌结构**
   - 如有令牌相关问题，查看 [TOKENS_STRUCTURE.md](./TOKENS_STRUCTURE.md)

## 文档关系图

```
MIGRATION_INDEX.md (本文档)
  ├── MIGRATION_EXECUTION_GUIDE.md (执行指南)
  │   └── 引用 → MIGRATION_ATOMIC_STEPS.md
  │   └── 引用 → MIGRATION_MILESTONES.md
  │
  ├── MIGRATION_ATOMIC_STEPS.md (原子步骤)
  │   └── 每个步骤独立可执行
  │
  ├── MIGRATION_MILESTONES.md (里程碑)
  │   └── 里程碑包含多个步骤
  │
  ├── MIGRATION_GUIDE.md (迁移指南)
  │   └── 概述性文档
  │
  └── TOKENS_STRUCTURE.md (令牌结构)
      └── 设计令牌技术文档
```

## 快速查找

### 按任务查找

- **开始迁移** → [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md) "快速开始"
- **执行步骤** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md)
- **查看进度** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑进度跟踪"
- **处理问题** → [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md) "问题处理"
- **回滚操作** → [MIGRATION_EXECUTION_GUIDE.md](./MIGRATION_EXECUTION_GUIDE.md) "回滚操作"

### 按阶段查找

- **阶段1：设计令牌包构建** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段1"
- **阶段2：集成到 shared-components** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段2"
- **阶段3：批次1迁移** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段3"
- **阶段4：批次2迁移** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段4"
- **阶段5：批次3迁移** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段5"
- **阶段6：批次4迁移** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段6"
- **阶段7：全面测试** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段7"
- **阶段8：文档更新** → [MIGRATION_ATOMIC_STEPS.md](./MIGRATION_ATOMIC_STEPS.md) "阶段8"

### 按里程碑查找

- **M1：设计令牌包就绪** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M1"
- **M2：设计令牌包集成完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M2"
- **M3：核心样式文件迁移完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M3"
- **M4：CRUD相关样式迁移完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M4"
- **M5：组件样式文件迁移完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M5"
- **M6：所有变量迁移完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M6"
- **M7：全面测试完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M7"
- **M8：文档更新和清理完成** → [MIGRATION_MILESTONES.md](./MIGRATION_MILESTONES.md) "里程碑 M8"

## 文档维护

### 更新文档

如果迁移过程中发现文档需要更新：

1. **更新原子步骤文档**
   - 添加新步骤
   - 修改步骤说明
   - 更新验证标准

2. **更新里程碑文档**
   - 更新里程碑状态
   - 添加备注
   - 记录完成时间

3. **更新执行指南**
   - 添加新的问题处理方案
   - 更新执行流程
   - 更新时间估算

### 文档版本

建议在文档开头记录版本信息：

```markdown
# 文档版本

- 版本：1.0.0
- 创建日期：2026-01-13
- 最后更新：2026-01-13
```

## 总结

这些文档共同构成了完整的迁移指导体系：

- **MIGRATION_ATOMIC_STEPS.md**：提供详细的执行步骤
- **MIGRATION_MILESTONES.md**：提供进度跟踪和检查点
- **MIGRATION_EXECUTION_GUIDE.md**：提供执行流程和问题处理
- **MIGRATION_INDEX.md**（本文档）：提供文档导航

使用这些文档，可以确保迁移过程的每一步都是独立的、可验证的、可回滚的。
