/**
 * 策略执行引擎
 * 实现事件驱动的实时策略评估和执行
 */
;

import type {
  Strategy,
  StrategyOrchestration,
  StrategyNode,
  StrategyConnection,
  StrategyExecutionContext,
  StrategyExecutionResult,
  StrategyCondition,
  StrategyAction,
  StrategyRule,
  NodeType
} from '@/types/strategy';
import { StrategyEffect } from '@/types/strategy';
// 使用动态导入避免循环依赖（strategy.ts 也导入 strategy-engine.ts）
// import { strategyService } from './strategy';
import { logger } from '@btc/shared-core';

// 执行引擎配置
interface EngineConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  retryAttempts: number;
  enableCache: boolean;
  cacheExpiration: number;
}

// 执行上下文扩展
interface ExecutionState {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime: number;
  endTime?: number;
  result?: any;
  error?: string;
}

// 策略执行会话
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

// 事件类型
type EngineEvent =
  | { type: 'execution_started'; sessionId: string; strategyId: string }
  | { type: 'node_started'; sessionId: string; nodeId: string }
  | { type: 'node_completed'; sessionId: string; nodeId: string; result: any }
  | { type: 'node_failed'; sessionId: string; nodeId: string; error: string }
  | { type: 'execution_completed'; sessionId: string; result: StrategyExecutionResult }
  | { type: 'execution_failed'; sessionId: string; error: string };

// 事件监听器
type EventListener = (event: EngineEvent) => void;

/**
 * 策略执行引擎类
 */
export class StrategyExecutionEngine {
  private config: EngineConfig;
  private sessions: Map<string, ExecutionSession> = new Map();
  private listeners: EventListener[] = [];
  private cache: Map<string, any> = new Map();

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = {
      maxConcurrentExecutions: 10,
      defaultTimeout: 30000,
      retryAttempts: 3,
      enableCache: true,
      cacheExpiration: 300000, // 5分钟
      ...config
    };
  }

  /**
   * 执行策略
   */
  async executeStrategy(
    strategyId: string,
    context: StrategyExecutionContext
  ): Promise<StrategyExecutionResult> {
    // 检查并发限制
    if (this.sessions.size >= this.config.maxConcurrentExecutions) {
      throw new Error('Exceeded maximum concurrent execution limit');
    }

    const sessionId = this.generateSessionId();

    try {
      // 动态导入 strategyService 避免循环依赖
      const { strategyService } = await import('./strategy');
      
      // 获取策略和编排信息
      const strategy = await strategyService.getStrategy(strategyId);
      const orchestration = await strategyService.getOrchestration(strategyId);

      // 创建执行会话
      const session: ExecutionSession = {
        id: sessionId,
        strategyId,
        context,
        orchestration,
        states: new Map(),
        variables: new Map(Object.entries(context.variables || {})),
        startTime: Date.now(),
        status: 'running'
      };

      this.sessions.set(sessionId, session);
      this.emitEvent({ type: 'execution_started', sessionId, strategyId });

      // 执行编排
      const result = await this.executeOrchestration(session);

      // 更新会话状态
      session.status = 'completed';
      session.endTime = Date.now();

      this.emitEvent({ type: 'execution_completed', sessionId, result });

      return result;

    } catch (error) {
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'failed';
        session.endTime = Date.now();
      }

      this.emitEvent({
        type: 'execution_failed',
        sessionId,
        error: String(error)
      });

      throw error;
    } finally {
      // 清理会话（可选择保留一段时间用于调试）
      setTimeout(() => {
        this.sessions.delete(sessionId);
      }, 60000); // 1分钟后清理
    }
  }

  /**
   * 执行编排
   */
  private async executeOrchestration(session: ExecutionSession): Promise<StrategyExecutionResult> {
    const { orchestration, context } = session;
    const executionSteps: any[] = [];

    // 查找开始节点
    const startNodes = orchestration.nodes.filter(node => node.type === 'START');
    if (startNodes.length === 0) {
      throw new Error('Start node not found in orchestration');
    }

    // 初始化所有节点状态
    orchestration.nodes.forEach(node => {
      session.states.set(node.id, {
        nodeId: node.id,
        status: 'pending',
        startTime: 0
      });
    });

    let finalResult: any = context.input;
    let finalEffect: StrategyEffect = StrategyEffect.ALLOW;

    // 从每个开始节点开始执行
    for (const startNode of startNodes) {
      const nodeResult = await this.executeNode(session, startNode, finalResult);
      finalResult = nodeResult.output;

      // 根据节点结果更新最终效果
      if (nodeResult.effect) {
        finalEffect = nodeResult.effect;
      }
    }

    // 收集执行步骤
    session.states.forEach(state => {
      executionSteps.push({
        nodeId: state.nodeId,
        nodeName: orchestration.nodes.find(n => n.id === state.nodeId)?.name || '',
        executed: state.status === 'completed',
        result: state.result,
        error: state.error,
        duration: state.endTime ? state.endTime - state.startTime : 0
      });
    });

    return {
      executionId: session.id,
      strategyId: session.strategyId,
      effect: finalEffect,
      success: session.status === 'completed',
      output: finalResult,
      executionTime: session.endTime ? session.endTime - session.startTime : 0,
      steps: executionSteps,
      metadata: {
        startTime: session.startTime,
        endTime: session.endTime || Date.now(),
        version: orchestration.metadata.version
      }
    };
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any; effect?: StrategyEffect }> {
    const state = session.states.get(node.id)!;

    // 更新节点状态
    state.status = 'running';
    state.startTime = Date.now();

    this.emitEvent({ type: 'node_started', sessionId: session.id, nodeId: node.id });

    try {
      let result: { output: any; effect?: StrategyEffect };

      // 根据节点类型执行不同逻辑
      switch (node.type) {
        case 'START':
          result = await this.executeStartNode(session, node, input);
          break;
        case 'END':
          result = await this.executeEndNode(session, node, input);
          break;
        case 'CONDITION':
          result = await this.executeConditionNode(session, node, input);
          break;
        case 'ACTION':
          result = await this.executeActionNode(session, node, input);
          break;
        case 'DECISION':
          result = await this.executeDecisionNode(session, node, input);
          break;
        case 'GATEWAY':
          result = await this.executeGatewayNode(session, node, input);
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }

      // 更新状态
      state.status = 'completed';
      state.endTime = Date.now();
      state.result = result.output;

      this.emitEvent({
        type: 'node_completed',
        sessionId: session.id,
        nodeId: node.id,
        result: result.output
      });

      // 执行后续节点
      await this.executeNextNodes(session, node, result.output);

      return result;

    } catch (error) {
      state.status = 'failed';
      state.endTime = Date.now();
      state.error = String(error);

      this.emitEvent({
        type: 'node_failed',
        sessionId: session.id,
        nodeId: node.id,
        error: String(error)
      });

      throw error;
    }
  }

  /**
   * 执行开始节点
   */
  private async executeStartNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any }> {
    // 开始节点只是传递输入数据
    return { output: input };
  }

  /**
   * 执行结束节点
   */
  private async executeEndNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any }> {
    // 结束节点标记执行完成
    return { output: input };
  }

  /**
   * 执行条件节点
   */
  private async executeConditionNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any; effect?: StrategyEffect }> {
    const conditions = node.data.conditions || [];

    if (conditions.length === 0) {
      return { output: input, effect: StrategyEffect.ALLOW };
    }

    const result = this.evaluateConditions(conditions, input, session.variables);

    return {
      output: { ...input, conditionResult: result },
      effect: result ? StrategyEffect.ALLOW : StrategyEffect.DENY
    };
  }

  /**
   * 执行动作节点
   */
  private async executeActionNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any; effect?: StrategyEffect }> {
    const actions = node.data.actions || [];
    let output = { ...input };
    let effect: StrategyEffect = StrategyEffect.ALLOW;

    for (const action of actions) {
      const actionResult = await this.executeAction(action, output, session.variables);
      output = { ...output, ...actionResult.output };

      if (actionResult.effect) {
        effect = actionResult.effect;
      }
    }

    return { output, effect };
  }

  /**
   * 执行决策节点
   */
  private async executeDecisionNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any }> {
    const rules = node.data.rules || [];

    if (rules.length === 0) {
      return { output: input };
    }

    let decisionResult = null;

    for (const rule of rules) {
      try {
        decisionResult = this.evaluateExpression(rule.expression, input, {
          ...session.variables,
          ...rule.variables
        });
        break; // 使用第一个成功评估的规则
      } catch (error) {
        console.warn(`Rule evaluation failed: ${rule.expression}`, error);
      }
    }

    return {
      output: { ...input, decision: decisionResult }
    };
  }

  /**
   * 执行网关节点
   */
  private async executeGatewayNode(
    session: ExecutionSession,
    node: StrategyNode,
    input: any
  ): Promise<{ output: any }> {
    const config = node.data.config || {};

    // 简单的网关实现，实际项目中可能需要更复杂的逻辑
    return { output: input };
  }

  /**
   * 执行后续节点
   */
  private async executeNextNodes(
    session: ExecutionSession,
    currentNode: StrategyNode,
    output: any
  ): Promise<void> {
    const nextConnections = session.orchestration.connections.filter(
      conn => conn.sourceNodeId === currentNode.id
    );

    for (const connection of nextConnections) {
      // 检查连接条件
      if (connection.condition) {
        if (typeof connection.condition === 'string') {
          // 简单的字符串条件
          if (connection.condition === 'false') {
            continue;
          }
        } else if (!this.evaluateCondition(connection.condition, output, session.variables)) {
          continue;
        }
      }

      const nextNode = session.orchestration.nodes.find(n => n.id === connection.targetNodeId);
      if (nextNode) {
        const nextState = session.states.get(nextNode.id)!;
        if (nextState.status === 'pending') {
          await this.executeNode(session, nextNode, output);
        }
      }
    }
  }

  /**
   * 评估条件组
   */
  private evaluateConditions(
    conditions: StrategyCondition[],
    context: any,
    variables: Map<string, any>
  ): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], context, variables);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, context, variables);

      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        result = result && conditionResult;
      }
    }

    return result;
  }

  /**
   * 评估单个条件
   */
  private evaluateCondition(
    condition: StrategyCondition,
    context: any,
    variables: Map<string, any>
  ): boolean {
    const fieldValue = this.getFieldValue(context, condition.field, variables);
    const compareValue = this.parseValue(condition.value);

    switch (condition.operator) {
      case 'eq': return fieldValue === compareValue;
      case 'ne': return fieldValue !== compareValue;
      case 'gt': return Number(fieldValue) > Number(compareValue);
      case 'gte': return Number(fieldValue) >= Number(compareValue);
      case 'lt': return Number(fieldValue) < Number(compareValue);
      case 'lte': return Number(fieldValue) <= Number(compareValue);
      case 'in': return Array.isArray(compareValue) && compareValue.includes(fieldValue);
      case 'nin': return Array.isArray(compareValue) && !compareValue.includes(fieldValue);
      case 'contains': return String(fieldValue).includes(String(compareValue));
      case 'startsWith': return String(fieldValue).startsWith(String(compareValue));
      case 'endsWith': return String(fieldValue).endsWith(String(compareValue));
      case 'regex': return new RegExp(String(compareValue)).test(String(fieldValue));
      case 'exists': return fieldValue !== undefined && fieldValue !== null;
      case 'notExists': return fieldValue === undefined || fieldValue === null;
      default: return false;
    }
  }

  /**
   * 执行动作
   */
  private async executeAction(
    action: StrategyAction,
    context: any,
    variables: Map<string, any>
  ): Promise<{ output: any; effect?: StrategyEffect }> {
    const parameters = action.parameters || {};

    switch (action.type) {
      case 'ALLOW_ACCESS':
        return { output: { ...context, access: 'allowed' }, effect: StrategyEffect.ALLOW };

      case 'DENY_ACCESS':
        return { output: { ...context, access: 'denied' }, effect: StrategyEffect.DENY };

      case 'LOG_EVENT':
        console.info('Strategy log:', parameters.message || 'Action execution', context);
        return { output: context };

      case 'SEND_NOTIFICATION':
        // 模拟发送通知
        console.info('Send notification:', parameters);
        return { output: { ...context, notificationSent: true } };

      case 'UPDATE_DATA':
        return { output: { ...context, ...parameters.data } };

      case 'SET_VARIABLE':
        if (parameters.name && parameters.value !== undefined) {
          variables.set(parameters.name, parameters.value);
        }
        return { output: context };

      case 'CALL_API': {
        // 模拟API调用
        const apiResult = await this.simulateApiCall(parameters);
        return { output: { ...context, apiResult } };
      }

      case 'EXECUTE_SCRIPT':
        // 简单的脚本执行（实际项目中需要安全沙箱）
        try {
          const scriptResult = this.evaluateExpression(parameters.script || 'true', context, variables);
          return { output: { ...context, scriptResult } };
        } catch (error) {
          throw new Error(`Script execution failed: ${error}`);
        }

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return { output: context };
    }
  }

  /**
   * 模拟API调用
   */
  private async simulateApiCall(parameters: any): Promise<any> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));

    return {
      success: Math.random() > 0.1, // 90% 成功率
      data: parameters.mockData || { result: 'api_success' },
      timestamp: Date.now()
    };
  }

  /**
   * 评估表达式
   */
  private evaluateExpression(expression: string, context: any, variables: Map<string, any>): any {
    // 简单的表达式评估器（实际项目中建议使用更安全的表达式引擎）
    try {
      // 创建安全的执行环境
      const safeContext = {
        ...context,
        ...Object.fromEntries(variables),
        // 添加一些安全的工具函数
        Math,
        Date,
        JSON,
        String,
        Number,
        Boolean,
        Array
      };

      // 使用Function构造器创建安全的执行环境
      const func = new Function(...Object.keys(safeContext), `return (${expression})`);
      return func(...Object.values(safeContext));
    } catch (error) {
      throw new Error(`Expression evaluation failed: ${expression} - ${error}`);
    }
  }

  /**
   * 获取字段值
   */
  private getFieldValue(context: any, field: string, variables: Map<string, any>): any {
    // 首先检查变量
    if (variables.has(field)) {
      return variables.get(field);
    }

    // 然后检查上下文
    const keys = field.split('.');
    let value = context;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }

    return value;
  }

  /**
   * 解析值
   */
  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 发送事件
   */
  private emitEvent(event: EngineEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Event listener execution failed:', error);
      }
    });
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: EventListener): void {
    this.listeners.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: EventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 获取活动会话
   */
  getActiveSessions(): ExecutionSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 取消执行会话
   */
  cancelSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session && session.status === 'running') {
      session.status = 'cancelled';
      session.endTime = Date.now();
      return true;
    }
    return false;
  }

  /**
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiration && now > entry.expiration) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    // 取消所有活动会话
    this.sessions.forEach(session => {
      if (session.status === 'running') {
        session.status = 'cancelled';
        session.endTime = Date.now();
      }
    });

    // 清理资源
    this.sessions.clear();
    this.listeners.length = 0;
    this.cache.clear();
  }
}

// 导出默认引擎实例
export const strategyEngine = new StrategyExecutionEngine();

// 导出工厂函数
export function createStrategyEngine(config?: Partial<EngineConfig>): StrategyExecutionEngine {
  return new StrategyExecutionEngine(config);
}
