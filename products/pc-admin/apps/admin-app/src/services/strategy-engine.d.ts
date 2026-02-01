/**
 * 策略执行引擎
 * 实现事件驱动的实时策略评估和执行
 */
import type { StrategyOrchestration, StrategyExecutionContext, StrategyExecutionResult } from '@/types/strategy';
interface EngineConfig {
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    retryAttempts: number;
    enableCache: boolean;
    cacheExpiration: number;
}
interface ExecutionState {
    nodeId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime: number;
    endTime?: number;
    result?: any;
    error?: string;
}
interface ExecutionSession {
    id: string;
    strategyId: string;
    context: StrategyExecutionContext;
    orchestration: StrategyOrchestration;
    states: Map<string, ExecutionState>;
    variables: Map<string, any>;
    startTime: number;
    endTime?: number;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
}
type EngineEvent = {
    type: 'execution_started';
    sessionId: string;
    strategyId: string;
} | {
    type: 'node_started';
    sessionId: string;
    nodeId: string;
} | {
    type: 'node_completed';
    sessionId: string;
    nodeId: string;
    result: any;
} | {
    type: 'node_failed';
    sessionId: string;
    nodeId: string;
    error: string;
} | {
    type: 'execution_completed';
    sessionId: string;
    result: StrategyExecutionResult;
} | {
    type: 'execution_failed';
    sessionId: string;
    error: string;
};
type EventListener = (event: EngineEvent) => void;
/**
 * 策略执行引擎类
 */
export declare class StrategyExecutionEngine {
    private config;
    private sessions;
    private listeners;
    private cache;
    constructor(config?: Partial<EngineConfig>);
    /**
     * 执行策略
     */
    executeStrategy(strategyId: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;
    /**
     * 执行编排
     */
    private executeOrchestration;
    /**
     * 执行单个节点
     */
    private executeNode;
    /**
     * 执行开始节点
     */
    private executeStartNode;
    /**
     * 执行结束节点
     */
    private executeEndNode;
    /**
     * 执行条件节点
     */
    private executeConditionNode;
    /**
     * 执行动作节点
     */
    private executeActionNode;
    /**
     * 执行决策节点
     */
    private executeDecisionNode;
    /**
     * 执行网关节点
     */
    private executeGatewayNode;
    /**
     * 执行后续节点
     */
    private executeNextNodes;
    /**
     * 评估条件组
     */
    private evaluateConditions;
    /**
     * 评估单个条件
     */
    private evaluateCondition;
    /**
     * 执行动作
     */
    private executeAction;
    /**
     * 模拟API调用
     */
    private simulateApiCall;
    /**
     * 评估表达式
     */
    private evaluateExpression;
    /**
     * 获取字段值
     */
    private getFieldValue;
    /**
     * 解析值
     */
    private parseValue;
    /**
     * 生成会话ID
     */
    private generateSessionId;
    /**
     * 发送事件
     */
    private emitEvent;
    /**
     * 添加事件监听器
     */
    addEventListener(listener: EventListener): void;
    /**
     * 移除事件监听器
     */
    removeEventListener(listener: EventListener): void;
    /**
     * 获取活动会话
     */
    getActiveSessions(): ExecutionSession[];
    /**
     * 取消执行会话
     */
    cancelSession(sessionId: string): boolean;
    /**
     * 清理过期缓存
     */
    private cleanupCache;
    /**
     * 销毁引擎
     */
    destroy(): void;
}
export declare const strategyEngine: StrategyExecutionEngine;
export declare function createStrategyEngine(config?: Partial<EngineConfig>): StrategyExecutionEngine;
export {};
