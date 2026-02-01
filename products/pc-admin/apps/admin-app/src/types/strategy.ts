/**
 * 策略系统核心类型定义
 */

// 策略类型枚举
export enum StrategyType {
  PERMISSION = 'PERMISSION', // 权限策略
  BUSINESS = 'BUSINESS',     // 业务策略
  DATA = 'DATA',             // 数据策略
  WORKFLOW = 'WORKFLOW'      // 工作流策略
}

// 策略状态枚举
export enum StrategyStatus {
  DRAFT = 'DRAFT',           // 草稿
  TESTING = 'TESTING',       // 测试中
  ACTIVE = 'ACTIVE',         // 激活
  INACTIVE = 'INACTIVE',     // 停用
  ARCHIVED = 'ARCHIVED'      // 已归档
}

// 策略效果枚举
export enum StrategyEffect {
  ALLOW = 'ALLOW',           // 允许
  DENY = 'DENY',             // 拒绝
  CONDITIONAL = 'CONDITIONAL' // 条件性
}

// 节点类型枚举
export enum NodeType {
  START = 'START',           // 开始节点
  END = 'END',               // 结束节点
  CONDITION = 'CONDITION',   // 条件节点
  ACTION = 'ACTION',         // 动作节点
  DECISION = 'DECISION',     // 决策节点
  GATEWAY = 'GATEWAY'        // 网关节点
}

// 连接器类型枚举
export enum ConnectorType {
  SEQUENCE = 'SEQUENCE',     // 顺序连接
  CONDITIONAL = 'CONDITIONAL' // 条件连接
}

// 策略基础信息
export interface StrategyBase {
  id: string;
  name: string;
  description?: string;
  type: StrategyType;
  status: StrategyStatus;
  version: string;
  priority: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// 策略规则表达式
export interface StrategyRule {
  id: string;
  expression: string;        // 规则表达式
  variables: Record<string, any>; // 变量定义
  description?: string;
}

// 策略条件
export interface StrategyCondition {
  id: string;
  field: string;             // 字段名
  operator: string;          // 操作符 (eq, ne, gt, lt, in, contains等)
  value: any;                // 比较值
  logicalOperator?: 'AND' | 'OR'; // 逻辑操作符
}

// 策略动作
export interface StrategyAction {
  id: string;
  type: string;              // 动作类型
  parameters: Record<string, any>; // 动作参数
  description?: string;
}

// 策略节点
export interface StrategyNode {
  id: string;
  type: NodeType;
  name: string;
  description?: string;
  text?: string; // 自定义节点文本
  position: {
    x: number;
    y: number;
  };
  data: {
    conditions?: StrategyCondition[];
    actions?: StrategyAction[];
    rules?: StrategyRule[];
    config?: Record<string, any>;
  };
  style?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
  };
  textConfig?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
  };
}

// 策略连接
export interface StrategyConnection {
  id: string;
  type: ConnectorType;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;     // 源句柄
  targetHandle?: string;     // 目标句柄
  label?: string;            // 连接标签
  condition?: StrategyCondition | 'true' | 'false'; // 连接条件
  lastSourceX?: number;      // 最后已知的源节点连接点X坐标（用于悬空连线渲染）
  lastSourceY?: number;      // 最后已知的源节点连接点Y坐标（用于悬空连线渲染）
  lastTargetX?: number;      // 最后已知的目标节点连接点X坐标（用于悬空连线渲染）
  lastTargetY?: number;      // 最后已知的目标节点连接点Y坐标（用于悬空连线渲染）
  lastPath?: string;         // 最后有效的连线路径（用于悬空连线渲染）
  style?: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
}

// 策略编排图
export interface StrategyOrchestration {
  id: string;
  strategyId: string;
  nodes: StrategyNode[];
  connections: StrategyConnection[];
  variables: Record<string, any>; // 全局变量
  metadata: {
    version: string;
    createdAt: string;
    updatedAt: string;
    name?: string;
  };
}

// 完整策略定义
export interface Strategy extends StrategyBase {
  rules: StrategyRule[];
  conditions: StrategyCondition[];
  actions: StrategyAction[];
  orchestration?: StrategyOrchestration;
  template?: {
    id: string;
    name: string;
    category: string;
  };
  execution: {
    engine: 'SYNC' | 'ASYNC' | 'EVENT_DRIVEN';
    timeout?: number;
    retryCount?: number;
    cacheEnabled?: boolean;
  };
}

// 策略模板
export interface StrategyTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: StrategyType;
  template: {
    rules: Partial<StrategyRule>[];
    conditions: Partial<StrategyCondition>[];
    actions: Partial<StrategyAction>[];
    orchestration?: Partial<StrategyOrchestration>;
  };
  variables: {
    name: string;
    type: string;
    defaultValue?: any;
    required: boolean;
    description?: string;
  }[];
  tags: string[];
  createdAt: string;
  createdBy: string;
}

// 策略执行上下文
export interface StrategyExecutionContext {
  strategyId: string;
  executionId: string;
  input: Record<string, any>;
  variables: Record<string, any>;
  user?: {
    id: string;
    name: string;
    roles: string[];
    permissions: string[];
  };
  environment: {
    timestamp: number;
    source: string;
    traceId?: string;
  };
}

// 策略执行结果
export interface StrategyExecutionResult {
  executionId: string;
  strategyId: string;
  effect: StrategyEffect;
  success: boolean;
  output: Record<string, any>;
  executionTime: number;
  steps: {
    nodeId: string;
    nodeName: string;
    executed: boolean;
    result?: any;
    error?: string;
    duration: number;
  }[];
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    startTime: number;
    endTime: number;
    version: string;
  };
}

// 策略监控统计
export interface StrategyMonitorStats {
  strategyId: string;
  period: {
    start: string;
    end: string;
  };
  execution: {
    total: number;
    success: number;
    failed: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
  };
  effects: {
    allow: number;
    deny: number;
    conditional: number;
  };
  performance: {
    throughput: number;      // 每秒执行次数
    errorRate: number;       // 错误率
    p95Duration: number;     // 95分位执行时间
    p99Duration: number;     // 99分位执行时间
  };
}

// 策略告警配置
export interface StrategyAlert {
  id: string;
  strategyId: string;
  name: string;
  type: 'PERFORMANCE' | 'ERROR_RATE' | 'EXECUTION_COUNT';
  condition: {
    metric: string;
    operator: string;
    threshold: number;
    duration: number;        // 持续时间（秒）
  };
  actions: {
    type: 'EMAIL' | 'WEBHOOK' | 'SMS';
    config: Record<string, any>;
  }[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
