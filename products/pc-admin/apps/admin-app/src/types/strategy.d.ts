/**
 * 策略系统核心类型定义
 */
export declare enum StrategyType {
    PERMISSION = "PERMISSION",// 权限策略
    BUSINESS = "BUSINESS",// 业务策略
    DATA = "DATA",// 数据策略
    WORKFLOW = "WORKFLOW"
}
export declare enum StrategyStatus {
    DRAFT = "DRAFT",// 草稿
    TESTING = "TESTING",// 测试中
    ACTIVE = "ACTIVE",// 激活
    INACTIVE = "INACTIVE",// 停用
    ARCHIVED = "ARCHIVED"
}
export declare enum StrategyEffect {
    ALLOW = "ALLOW",// 允许
    DENY = "DENY",// 拒绝
    CONDITIONAL = "CONDITIONAL"
}
export declare enum NodeType {
    START = "START",// 开始节点
    END = "END",// 结束节点
    CONDITION = "CONDITION",// 条件节点
    ACTION = "ACTION",// 动作节点
    DECISION = "DECISION",// 决策节点
    GATEWAY = "GATEWAY"
}
export declare enum ConnectorType {
    SEQUENCE = "SEQUENCE",// 顺序连接
    CONDITIONAL = "CONDITIONAL"
}
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
export interface StrategyRule {
    id: string;
    expression: string;
    variables: Record<string, any>;
    description?: string;
}
export interface StrategyCondition {
    id: string;
    field: string;
    operator: string;
    value: any;
    logicalOperator?: 'AND' | 'OR';
}
export interface StrategyAction {
    id: string;
    type: string;
    parameters: Record<string, any>;
    description?: string;
}
export interface StrategyNode {
    id: string;
    type: NodeType;
    name: string;
    description?: string;
    text?: string;
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
export interface StrategyConnection {
    id: string;
    type: ConnectorType;
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
    condition?: StrategyCondition | 'true' | 'false';
    lastSourceX?: number;
    lastSourceY?: number;
    lastTargetX?: number;
    lastTargetY?: number;
    lastPath?: string;
    style?: {
        strokeColor?: string;
        strokeWidth?: number;
        strokeDasharray?: string;
    };
}
export interface StrategyOrchestration {
    id: string;
    strategyId: string;
    nodes: StrategyNode[];
    connections: StrategyConnection[];
    variables: Record<string, any>;
    metadata: {
        version: string;
        createdAt: string;
        updatedAt: string;
        name?: string;
    };
}
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
        throughput: number;
        errorRate: number;
        p95Duration: number;
        p99Duration: number;
    };
}
export interface StrategyAlert {
    id: string;
    strategyId: string;
    name: string;
    type: 'PERFORMANCE' | 'ERROR_RATE' | 'EXECUTION_COUNT';
    condition: {
        metric: string;
        operator: string;
        threshold: number;
        duration: number;
    };
    actions: {
        type: 'EMAIL' | 'WEBHOOK' | 'SMS';
        config: Record<string, any>;
    }[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}
