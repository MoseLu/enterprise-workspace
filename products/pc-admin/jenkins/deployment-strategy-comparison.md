# Jenkins 部署策略对比：单个 Job vs 多个 Job

## 问题

在 Jenkins 中部署多个应用时，有两种策略：
1. **单个 Job + Matrix Strategy**（当前方案）
2. **多个独立 Job**

哪种方案更快？

## 性能对比

### 方案一：单个 Job + Matrix Strategy（当前方案）

#### 执行流程

```
单个 Job 执行流程：
├─ Checkout（1次，共享）
├─ Setup Environment（1次，共享）
├─ Install Dependencies（1次，共享）
├─ Build Shared Dependencies（1次，共享）
└─ Matrix Strategy（并行执行）
   ├─ system-app（Executor 1）
   ├─ admin-app（Executor 2）
   ├─ logistics-app（Executor 3）
   ├─ quality-app（Executor 4）
   └─ ...（其他应用）
```

#### 优点 ✅

1. **资源利用高效**
   - 代码检出：**1次**（共享）
   - 依赖安装：**1次**（共享）
   - 共享依赖构建：**1次**（共享）
   - 节省磁盘空间和网络带宽

2. **配置简单**
   - 只需维护一个 `Jenkinsfile`
   - 统一的构建历史
   - 统一的参数配置

3. **时间优势**
   - 前期阶段（检出、安装依赖）只执行一次
   - 并行构建阶段受限于 Executor 数量
   - **总体时间 ≈ 共享阶段时间 + 最长应用的构建时间**

4. **统一的构建上下文**
   - 所有应用使用相同的代码版本
   - 确保依赖版本一致性

#### 缺点 ❌

1. **受限于 Executor 数量**
   - 如果只有 2 个 Executor，10 个应用需要分 5 轮执行
   - 并行度 = min(应用数量, Executor 数量)

2. **失败影响**
   - 单个应用失败，整个 Job 标记为失败
   - 但其他应用的构建仍然完成（可以在日志中查看）

3. **灵活性较低**
   - 不能单独触发某个应用的构建（除非修改代码）

### 方案二：多个独立 Job

#### 执行流程

```
多个 Job 并行执行：
Job 1 (system-app):
├─ Checkout（独立）
├─ Setup Environment（独立）
├─ Install Dependencies（独立）
└─ Build & Deploy（独立）

Job 2 (admin-app):
├─ Checkout（独立）
├─ Setup Environment（独立）
├─ Install Dependencies（独立）
└─ Build & Deploy（独立）

...（其他 Job）
```

#### 优点 ✅

1. **完全独立**
   - 每个应用有独立的构建历史
   - 失败互不影响
   - 可以单独触发某个应用的构建

2. **更好的隔离性**
   - 每个 Job 有独立的工作空间
   - 不会因为某个应用的构建问题影响其他应用

3. **灵活性高**
   - 可以为不同应用配置不同的参数
   - 可以为不同应用设置不同的触发条件

#### 缺点 ❌

1. **资源浪费**
   - 代码检出：**N次**（每个 Job 都要检出）
   - 依赖安装：**N次**（每个 Job 都要安装）
   - 共享依赖构建：**N次**（每个 Job 都要构建）
   - 占用更多磁盘空间和网络带宽

2. **配置复杂**
   - 需要维护 **N 个 Job**（10 个应用 = 10 个 Job）
   - 每个 Job 需要单独配置
   - 配置更新需要在所有 Job 中同步

3. **仍然受限于 Executor 数量**
   - 如果只有 2 个 Executor，10 个 Job 仍然需要分 5 轮执行
   - 并行度 = min(Job 数量, Executor 数量)

4. **总体时间更长**
   - **总体时间 ≈ 共享阶段时间 × N + 最长应用的构建时间**
   - 因为每个 Job 都要执行前期阶段

## 性能对比示例

假设：
- 10 个应用需要部署
- 代码检出时间：30 秒
- 依赖安装时间：2 分钟
- 共享依赖构建：1 分钟
- 单个应用构建时间：3 分钟
- Jenkins Executor 数量：4 个

### 方案一：单个 Job + Matrix Strategy

```
时间线：
0:00 - 0:30   Checkout（1次）
0:30 - 2:30   Install Dependencies（1次）
2:30 - 3:30   Build Shared Dependencies（1次）
3:30 - 6:30   Matrix 第一轮（4个应用并行，3分钟）
6:30 - 9:30   Matrix 第二轮（4个应用并行，3分钟）
9:30 - 12:30  Matrix 第三轮（2个应用并行，3分钟）

总时间：约 12.5 分钟
```

### 方案二：多个独立 Job（假设有 4 个 Executor）

```
时间线：
Job 1-4 同时开始：
  0:00 - 0:30   Checkout（4个 Job 并行）
  0:30 - 2:30   Install Dependencies（4个 Job 并行）
  2:30 - 3:30   Build Shared Dependencies（4个 Job 并行）
  3:30 - 6:30   Build & Deploy（4个 Job 并行，3分钟）

Job 5-8 在 Job 1-4 完成后开始：
  6:30 - 7:00   Checkout（4个 Job 并行）
  7:00 - 9:00   Install Dependencies（4个 Job 并行）
  9:00 - 10:00  Build Shared Dependencies（4个 Job 并行）
  10:00 - 13:00 Build & Deploy（4个 Job 并行，3分钟）

Job 9-10 在 Job 5-8 完成后开始：
  13:00 - 13:30 Checkout（2个 Job 并行）
  13:30 - 15:30 Install Dependencies（2个 Job 并行）
  15:30 - 16:30 Build Shared Dependencies（2个 Job 并行）
  16:30 - 19:30 Build & Deploy（2个 Job 并行，3分钟）

总时间：约 19.5 分钟
```

## 结论

### 🏆 **单个 Job + Matrix Strategy 更快**

**原因：**

1. **共享前期阶段**
   - 代码检出、依赖安装、共享依赖构建只执行一次
   - 节省约 **30 秒 + 2 分钟 + 1 分钟 = 3.5 分钟 × 9 = 31.5 分钟**

2. **并行构建阶段相同**
   - 两种方案在并行构建阶段的执行时间相同
   - 都受限于 Executor 数量

3. **总体时间更短**
   - 方案一：约 **12.5 分钟**
   - 方案二：约 **19.5 分钟**
   - **方案一快约 7 分钟（35% 更快）**

### 选择建议

#### ✅ 推荐：单个 Job + Matrix Strategy

**适合场景：**
- 需要同时部署多个应用
- Jenkins Executor 数量充足（≥ 应用数量）
- 希望统一管理构建流程
- 希望节省资源和时间

**当前项目优势：**
- 已经使用 Matrix Strategy
- 配置完善，支持并行构建
- 共享依赖构建，提高效率

#### ⚠️ 考虑：多个独立 Job

**适合场景：**
- 需要单独触发某个应用的构建
- 不同应用有不同的部署频率
- 需要完全隔离的构建环境
- Jenkins Executor 数量非常充足（>> 应用数量）

## 优化建议

### 1. 增加 Jenkins Executor 数量

如果 Executor 数量少于应用数量，会影响并行度：

```groovy
// 当前：如果有 4 个 Executor，10 个应用需要 3 轮
// 优化：增加到 10+ 个 Executor，可以实现完全并行
```

**方法：**
- 在 Jenkins 管理界面增加 Executor 数量
- 或配置多个 Jenkins Agent（分布式构建）

### 2. 优化共享依赖构建

当前已经优化：
- 共享依赖构建在 Matrix 之前执行
- 避免重复构建相同的依赖包

### 3. 使用构建缓存

当前已经优化：
- pnpm 的 store 机制提供缓存
- `--prefer-offline` 参数优先使用缓存

### 4. 跳过不必要的阶段

当前已经支持：
- `SKIP_TESTS` 参数可以跳过测试
- `CLEAN_BUILD` 参数控制是否清理缓存

## 总结

**答案：单个 Job + Matrix Strategy 更快**

1. **时间更短**：共享前期阶段，节省 30-50% 的时间
2. **资源更省**：避免重复的代码检出和依赖安装
3. **配置更简**：只需维护一个 Jenkinsfile
4. **管理更便**：统一的构建历史和参数配置

**当前方案已经是最优选择！** 🎉

