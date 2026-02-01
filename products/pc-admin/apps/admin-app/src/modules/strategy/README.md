# 策略中心 (Strategy Center)

## 概述

策略中心是一个完整的策略管理和执行平台，支持策略定义、可视化编排、实时执行和监控分析。系统采用事件驱动架构，提供高性能的策略评估和执行能力。

## 系统架构

### 核心模块

1. **策略定义层** (`/access/views/policies`)
   - 策略基础信息管理
   - 策略分类和标签
   - 策略模板系统
   - 版本管理和状态控制

2. **策略编排层** (`/strategy/views/designer`)
   - 可视化流程图编辑器
   - 拖拽式节点组件库
   - 策略编排保存和加载
   - 编排验证和预览

3. **策略执行层** (`/services/strategy-engine.ts`)
   - 事件驱动的策略引擎
   - 实时策略评估和执行
   - 多种执行模式支持
   - 执行上下文管理

4. **策略监控层** (`/strategy/views/monitor`)
   - 执行统计和性能分析
   - 实时监控面板
   - 告警配置和通知
   - 执行历史追踪

## 功能特性

### 策略管理
- ✅ 多种策略类型支持（权限、业务、数据、工作流）
- ✅ 策略状态管理（草稿、测试、激活、停用、归档）
- ✅ 策略版本控制和历史管理
- ✅ 策略标签和分类管理
- ✅ 策略模板系统

### 可视化编排
- ✅ 拖拽式流程图编辑器
- ✅ 丰富的节点组件库（开始、结束、条件、动作、决策、网关）
- ✅ 节点连接和条件配置
- ✅ 实时编排验证
- ✅ 策略执行预览

### 策略执行引擎
- ✅ 事件驱动架构
- ✅ 同步/异步执行模式
- ✅ 条件评估和表达式引擎
- ✅ 动作执行和结果处理
- ✅ 执行上下文和变量管理
- ✅ 错误处理和重试机制

### 监控和分析
- ✅ 实时执行统计
- ✅ 性能指标监控
- ✅ 执行历史追踪
- ✅ 告警配置和通知
- ✅ 可视化图表展示

## 技术实现

### 前端技术栈
- **Vue 3** + **TypeScript** - 主框架
- **Element Plus** - UI 组件库
- **ECharts** - 图表可视化
- **Canvas/SVG** - 流程图编辑器

### 核心服务
- **StrategyService** - 策略管理服务
- **StrategyExecutionEngine** - 策略执行引擎
- **MockStrategyService** - 模拟服务实现

### 数据模型
```typescript
// 策略定义
interface Strategy {
  id: string;
  name: string;
  type: StrategyType;
  status: StrategyStatus;
  rules: StrategyRule[];
  conditions: StrategyCondition[];
  actions: StrategyAction[];
  orchestration?: StrategyOrchestration;
}

// 策略编排
interface StrategyOrchestration {
  nodes: StrategyNode[];
  connections: StrategyConnection[];
  variables: Record<string, any>;
}

// 执行结果
interface StrategyExecutionResult {
  executionId: string;
  strategyId: string;
  effect: StrategyEffect;
  success: boolean;
  output: Record<string, any>;
  steps: ExecutionStep[];
}
```

## 使用指南

### 1. 创建策略

1. 进入策略系统页面 (`/access/policies`)
2. 点击"添加"按钮创建新策略
3. 填写策略基本信息（名称、类型、描述等）
4. 保存策略

### 2. 策略编排

1. 在策略列表中选择一个策略
2. 点击"策略编排"按钮打开编排设计器
3. 从组件库拖拽节点到画布
4. 配置节点属性和连接关系
5. 保存编排配置

### 3. 策略测试

1. 在策略列表中点击"测试"按钮
2. 输入测试上下文数据
3. 执行测试并查看结果
4. 根据测试结果调整策略配置

### 4. 策略监控

1. 进入策略监控页面 (`/strategy/monitor`)
2. 查看系统概览和执行统计
3. 配置告警规则
4. 查看执行历史和详细分析

## 组件说明

### 策略编排组件

#### StrategyDesigner
主要的策略编排设计器组件，提供完整的可视化编排功能。

**Props:**
- `strategyId?: string` - 策略ID（可选）

**Features:**
- 工具栏（选择、拖拽、缩放等）
- 组件库面板
- 画布区域
- 属性配置面板
- 预览功能

#### StrategyNode
策略节点组件，支持不同类型的节点渲染和交互。

**Props:**
- `node: StrategyNode` - 节点数据
- `selected: boolean` - 是否选中
- `zoom: number` - 缩放比例

**Features:**
- 节点拖拽和调整大小
- 连接点管理
- 状态指示器
- 双击编辑

#### StrategyNodeProperties
节点属性配置组件，根据节点类型提供不同的配置界面。

**Props:**
- `node: StrategyNode` - 节点数据

**Features:**
- 基础属性配置
- 样式属性配置
- 节点特定配置（条件、动作、规则等）

### 监控组件

#### StrategyMonitor
策略监控主页面，提供完整的监控和分析功能。

**Features:**
- 系统概览统计
- 实时图表展示
- 策略列表和详情
- 告警配置

#### StrategyDetailPanel
策略详情面板，显示策略的详细信息和统计数据。

**Props:**
- `strategy: Strategy` - 策略数据
- `stats: StrategyMonitorStats` - 统计数据

#### StrategyExecutionHistory
策略执行历史组件，显示策略的执行记录和详情。

**Props:**
- `strategyId: string` - 策略ID

## 扩展开发

### 添加新的节点类型

1. 在 `types/strategy.ts` 中添加新的 `NodeType`
2. 在 `StrategyNode.vue` 中添加节点图标和样式
3. 在 `StrategyNodeProperties.vue` 中添加配置组件
4. 在 `strategy-engine.ts` 中添加执行逻辑

### 添加新的动作类型

1. 在 `types/strategy.ts` 中扩展 `StrategyAction` 类型
2. 在 `ActionNodeConfig.vue` 中添加动作选项
3. 在 `strategy-engine.ts` 的 `executeAction` 方法中添加处理逻辑

### 自定义监控指标

1. 在 `types/strategy.ts` 中扩展 `StrategyMonitorStats`
2. 在 `StrategyService` 中实现数据收集逻辑
3. 在监控组件中添加图表展示

## 性能优化

### 前端优化
- 使用 `requestAnimationFrame` 优化画布渲染
- 实现节点虚拟化减少DOM操作
- 使用 `debounce` 优化频繁操作
- 组件懒加载和代码分割

### 执行引擎优化
- 并发执行限制和队列管理
- 执行结果缓存机制
- 表达式编译和优化
- 内存使用监控和清理

## 安全考虑

### 表达式安全
- 使用安全的表达式执行环境
- 限制可访问的全局对象
- 表达式复杂度和执行时间限制

### 权限控制
- 策略操作权限验证
- 敏感数据访问控制
- 审计日志记录

## 故障排除

### 常见问题

1. **策略执行失败**
   - 检查策略编排是否有效
   - 验证输入数据格式
   - 查看执行日志和错误信息

2. **编排设计器无法加载**
   - 检查策略ID是否有效
   - 确认编排数据完整性
   - 清除浏览器缓存

3. **监控数据不准确**
   - 检查时间范围设置
   - 验证数据源连接
   - 刷新监控数据

### 调试模式

开发环境下可以启用调试模式：

```typescript
// 在 strategy-engine.ts 中
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('策略执行调试信息:', context);
}
```

## 更新日志

### v1.0.0 (2024-10-27)
- ✅ 完成策略定义层重构
- ✅ 实现可视化策略编排工作台
- ✅ 构建事件驱动的策略执行引擎
- ✅ 添加策略监控和告警系统
- ✅ 完善系统集成和国际化支持

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
