/**
 * 策略系统服务接口
 */

import type {
  Strategy,
  StrategyTemplate,
  StrategyExecutionContext,
  StrategyExecutionResult,
  StrategyMonitorStats,
  StrategyAlert,
  StrategyOrchestration
} from '@/types/strategy';
import {
  StrategyType,
  StrategyStatus,
  StrategyEffect
} from '@/types/strategy';

// 分页查询参数
export interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
  type?: StrategyType;
  status?: StrategyStatus;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 分页响应
export interface PageResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

// 策略服务接口
export interface StrategyService {
  // 策略管理
  getStrategies(params: PageParams): Promise<PageResponse<Strategy>>;
  getStrategy(id: string): Promise<Strategy>;
  createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy>;
  updateStrategy(id: string, strategy: Partial<Strategy>): Promise<Strategy>;
  deleteStrategy(id: string): Promise<void>;
  deleteStrategies(ids: string[]): Promise<void>;

  // 策略版本管理
  getStrategyVersions(strategyId: string): Promise<Strategy[]>;
  createStrategyVersion(strategyId: string, version: string): Promise<Strategy>;
  activateStrategyVersion(strategyId: string, version: string): Promise<void>;

  // 策略状态管理
  updateStrategyStatus(id: string, status: StrategyStatus): Promise<void>;
  testStrategy(id: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;

  // 策略模板管理
  getTemplates(category?: string): Promise<StrategyTemplate[]>;
  getTemplate(id: string): Promise<StrategyTemplate>;
  createTemplate(template: Omit<StrategyTemplate, 'id' | 'createdAt'>): Promise<StrategyTemplate>;
  updateTemplate(id: string, template: Partial<StrategyTemplate>): Promise<StrategyTemplate>;
  deleteTemplate(id: string): Promise<void>;

  // 从模板创建策略
  createFromTemplate(templateId: string, variables: Record<string, any>): Promise<Strategy>;

  // 策略编排管理
  getOrchestration(strategyId: string): Promise<StrategyOrchestration>;
  updateOrchestration(strategyId: string, orchestration: StrategyOrchestration): Promise<void>;
  validateOrchestration(orchestration: StrategyOrchestration): Promise<{ valid: boolean; errors: string[] }>;

  // 策略执行
  executeStrategy(strategyId: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;
  getExecutionHistory(strategyId: string, params: PageParams): Promise<PageResponse<StrategyExecutionResult>>;

  // 策略监控
  getMonitorStats(strategyId: string, period: { start: string; end: string }): Promise<StrategyMonitorStats>;
  getSystemStats(period: { start: string; end: string }): Promise<{
    totalStrategies: number;
    activeStrategies: number;
    totalExecutions: number;
    avgResponseTime: number;
    errorRate: number;
  }>;

  // 策略告警
  getAlerts(strategyId?: string): Promise<StrategyAlert[]>;
  createAlert(alert: Omit<StrategyAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategyAlert>;
  updateAlert(id: string, alert: Partial<StrategyAlert>): Promise<StrategyAlert>;
  deleteAlert(id: string): Promise<void>;

  // 策略导入导出
  exportStrategy(id: string): Promise<Blob>;
  importStrategy(file: File): Promise<Strategy>;
  exportTemplate(id: string): Promise<Blob>;
  importTemplate(file: File): Promise<StrategyTemplate>;
}

// Mock策略服务实现
export class MockStrategyService implements StrategyService {
  private strategies: Strategy[] = [];
  private templates: StrategyTemplate[] = [];
  private orchestrations: Map<string, StrategyOrchestration> = new Map();
  private executionResults: StrategyExecutionResult[] = [];
  private alerts: StrategyAlert[] = [];

  constructor() {
    this.initMockData();
  }

  private initMockData() {
    // 初始化模拟数据
    this.strategies = [
      {
        id: '1',
        name: 'User Permission Verification Strategy',
        description: 'Verify if user has permission to access specific resource',
        type: StrategyType.PERMISSION,
        status: StrategyStatus.ACTIVE,
        version: '1.0.0',
        priority: 100,
        tags: ['Permission', 'Security'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedBy: 'admin',
        rules: [
          {
            id: 'rule1',
            expression: 'user.roles.includes("admin") || user.permissions.includes(resource.permission)',
            variables: { resource: { permission: 'read' } },
            description: 'Admin or authorized users can access'
          }
        ],
        conditions: [
          {
            id: 'cond1',
            field: 'user.role',
            operator: 'in',
            value: ['admin', 'manager']
          }
        ],
        actions: [
          {
            id: 'action1',
            type: 'ALLOW_ACCESS',
            parameters: { resource: 'user_management' }
          }
        ],
        execution: {
          engine: 'SYNC',
          timeout: 5000,
          retryCount: 3,
          cacheEnabled: true
        }
      },
      {
        id: '2',
        name: 'Order Approval Process Strategy',
        description: 'Determine approval process based on order amount and user level',
        type: StrategyType.BUSINESS,
        status: StrategyStatus.TESTING,
        version: '1.2.0',
        priority: 200,
        tags: ['Approval', 'Order'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        updatedBy: 'admin',
        rules: [
          {
            id: 'rule2',
            expression: 'order.amount > 10000 ? "manager_approval" : "auto_approve"',
            variables: { order: { amount: 0 } }
          }
        ],
        conditions: [
          {
            id: 'cond2',
            field: 'order.amount',
            operator: 'gt',
            value: 10000
          }
        ],
        actions: [
          {
            id: 'action2',
            type: 'SEND_APPROVAL',
            parameters: { approver: 'manager', level: 'L2' }
          }
        ],
        execution: {
          engine: 'ASYNC',
          timeout: 30000,
          retryCount: 5
        }
      }
    ];

    this.templates = [
      {
        id: 'tpl1',
        name: 'RBAC Permission Verification Template',
        description: 'Role-based access control template',
        category: 'Permission Control',
        type: StrategyType.PERMISSION,
        template: {
          rules: [
            {
              expression: 'user.roles.includes({{requiredRole}})',
              variables: { requiredRole: 'admin' }
            }
          ],
          conditions: [
            {
              field: 'user.role',
              operator: 'eq',
              value: '{{userRole}}'
            }
          ],
          actions: [
            {
              type: 'ALLOW_ACCESS',
              parameters: { resource: '{{resourceName}}' }
            }
          ]
        },
        variables: [
          {
            name: 'requiredRole',
            type: 'string',
            defaultValue: 'user',
            required: true,
            description: 'Required role'
          },
          {
            name: 'userRole',
            type: 'string',
            required: true,
            description: 'User role'
          },
          {
            name: 'resourceName',
            type: 'string',
            required: true,
            description: 'Resource name'
          }
        ],
        tags: ['RBAC', 'Permission', 'Template'],
        createdAt: new Date().toISOString(),
        createdBy: 'system'
      }
    ];
  }

  async getStrategies(params: PageParams): Promise<PageResponse<Strategy>> {
    let filtered = [...this.strategies];

    if (params.keyword) {
      filtered = filtered.filter(s =>
        s.name.includes(params.keyword!) ||
        s.description?.includes(params.keyword!)
      );
    }

    if (params.type) {
      filtered = filtered.filter(s => s.type === params.type);
    }

    if (params.status) {
      filtered = filtered.filter(s => s.status === params.status);
    }

    const page = params.page || 1;
    const size = params.size || 20;
    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);

    return {
      list,
      total: filtered.length,
      page,
      size
    };
  }

  // BtcCrud 接口兼容方法
  async page(params: any): Promise<any> {
    return this.getStrategies(params);
  }

  async add(data: any): Promise<Strategy> {
    return this.createStrategy({
      name: data.name,
      description: data.description,
      type: data.type,
      status: 'DRAFT' as StrategyStatus,
      version: '1.0.0',
      priority: data.priority || 100,
      tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : [],
      createdBy: 'current_user',
      updatedBy: 'current_user',
      rules: [],
      conditions: [],
      actions: [],
      execution: {
        engine: 'SYNC',
        timeout: 5000,
        retryCount: 3
      }
    });
  }

  async update(data: any): Promise<Strategy> {
    return this.updateStrategy(data.id, {
      name: data.name,
      description: data.description,
      type: data.type,
      priority: data.priority,
      tags: data.tags ? data.tags.split(',').map((tag: string) => tag.trim()) : []
    });
  }

  async getStrategy(id: string): Promise<Strategy> {
    const strategy = this.strategies.find(s => s.id === id);
    if (!strategy) {
      throw new Error(`Strategy not found: ${id}`);
    }
    return strategy;
  }

  async createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy> {
    const newStrategy: Strategy = {
      ...strategy,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.strategies.push(newStrategy);
    return newStrategy;
  }

  async updateStrategy(id: string, strategy: Partial<Strategy>): Promise<Strategy> {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Strategy not found: ${id}`);
    }

    this.strategies[index] = {
      ...this.strategies[index],
      ...strategy,
      updatedAt: new Date().toISOString()
    };

    return this.strategies[index];
  }

  async deleteStrategy(id: string): Promise<void> {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Strategy not found: ${id}`);
    }
    this.strategies.splice(index, 1);
  }

  async deleteStrategies(ids: string[]): Promise<void> {
    this.strategies = this.strategies.filter(s => !ids.includes(s.id));
  }

  async getStrategyVersions(strategyId: string): Promise<Strategy[]> {
    return this.strategies.filter(s => s.id === strategyId);
  }

  async createStrategyVersion(strategyId: string, version: string): Promise<Strategy> {
    const strategy = await this.getStrategy(strategyId);
    const newVersion = {
      ...strategy,
      version,
      status: StrategyStatus.DRAFT,
      updatedAt: new Date().toISOString()
    };
    this.strategies.push(newVersion);
    return newVersion;
  }

  async activateStrategyVersion(strategyId: string, version: string): Promise<void> {
    const strategy = this.strategies.find(s => s.id === strategyId && s.version === version);
    if (strategy) {
      strategy.status = StrategyStatus.ACTIVE;
      strategy.updatedAt = new Date().toISOString();
    }
  }

  async updateStrategyStatus(id: string, status: StrategyStatus): Promise<void> {
    const strategy = this.strategies.find(s => s.id === id);
    if (strategy) {
      strategy.status = status;
      strategy.updatedAt = new Date().toISOString();
    }
  }

  async testStrategy(id: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult> {
    // 使用策略执行引擎进行测试
    const { strategyEngine } = await import('./strategy-engine');

    try {
      const result = await strategyEngine.executeStrategy(id, context);
      this.executionResults.push(result);
      return result;
    } catch (error) {
      // 如果执行失败，返回错误结果
      const errorResult: StrategyExecutionResult = {
        executionId: Date.now().toString(),
        strategyId: id,
        effect: StrategyEffect.DENY,
        success: false,
        output: context.input,
        executionTime: 0,
        steps: [],
        error: {
          code: 'EXECUTION_ERROR',
          message: String(error),
          details: error
        },
        metadata: {
          startTime: Date.now(),
          endTime: Date.now(),
          version: '1.0.0'
        }
      };

      this.executionResults.push(errorResult);
      return errorResult;
    }
  }

  async getTemplates(category?: string): Promise<StrategyTemplate[]> {
    if (category) {
      return this.templates.filter(t => t.category === category);
    }
    return [...this.templates];
  }

  async getTemplate(id: string): Promise<StrategyTemplate> {
    const template = this.templates.find(t => t.id === id);
    if (!template) {
      throw new Error(`Template not found: ${id}`);
    }
    return template;
  }

  async createTemplate(template: Omit<StrategyTemplate, 'id' | 'createdAt'>): Promise<StrategyTemplate> {
    const newTemplate: StrategyTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, template: Partial<StrategyTemplate>): Promise<StrategyTemplate> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template not found: ${id}`);
    }

    this.templates[index] = {
      ...this.templates[index],
      ...template
    };

    return this.templates[index];
  }

  async deleteTemplate(id: string): Promise<void> {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Template not found: ${id}`);
    }
    this.templates.splice(index, 1);
  }

  async createFromTemplate(templateId: string, variables: Record<string, any>): Promise<Strategy> {
    const template = await this.getTemplate(templateId);

    // 从模板创建策略（简化实现）
    const strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `Strategy based on ${template.name}`,
      description: `Created from template ${template.name}`,
      type: template.type,
      status: StrategyStatus.DRAFT,
      version: '1.0.0',
      priority: 100,
      tags: [...template.tags],
      createdBy: 'user',
      updatedBy: 'user',
      rules: template.template.rules as any[] || [],
      conditions: template.template.conditions as any[] || [],
      actions: template.template.actions as any[] || [],
      execution: {
        engine: 'SYNC',
        timeout: 5000,
        retryCount: 3
      }
    };

    return this.createStrategy(strategy);
  }

  async getOrchestration(strategyId: string): Promise<StrategyOrchestration> {
    const orchestration = this.orchestrations.get(strategyId);
    if (!orchestration) {
      // 返回默认编排
      return {
        id: Date.now().toString(),
        strategyId,
        nodes: [],
        connections: [],
        variables: {},
        metadata: {
          version: '1.0.0',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
    return orchestration;
  }

  async updateOrchestration(strategyId: string, orchestration: StrategyOrchestration): Promise<void> {
    this.orchestrations.set(strategyId, {
      ...orchestration,
      metadata: {
        ...orchestration.metadata,
        updatedAt: new Date().toISOString()
      }
    });
  }

  async validateOrchestration(orchestration: StrategyOrchestration): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // 简单验证逻辑
    if (orchestration.nodes.length === 0) {
      errors.push('Orchestration must contain at least one node');
    }

    const startNodes = orchestration.nodes.filter(n => n.type === 'START');
    if (startNodes.length === 0) {
      errors.push('Orchestration must contain a start node');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async executeStrategy(strategyId: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult> {
    // 使用策略执行引擎进行实际执行
    const { strategyEngine } = await import('./strategy-engine');
    return await strategyEngine.executeStrategy(strategyId, context);
  }

  async getExecutionHistory(strategyId: string, params: PageParams): Promise<PageResponse<StrategyExecutionResult>> {
    const filtered = this.executionResults.filter(r => r.strategyId === strategyId);
    const page = params.page || 1;
    const size = params.size || 20;
    const start = (page - 1) * size;
    const list = filtered.slice(start, start + size);

    return {
      list,
      total: filtered.length,
      page,
      size
    };
  }

  async getMonitorStats(strategyId: string, period: { start: string; end: string }): Promise<StrategyMonitorStats> {
    const executions = this.executionResults.filter(r => r.strategyId === strategyId);

    return {
      strategyId,
      period,
      execution: {
        total: executions.length,
        success: executions.filter(e => e.success).length,
        failed: executions.filter(e => !e.success).length,
        avgDuration: executions.reduce((sum, e) => sum + e.executionTime, 0) / executions.length || 0,
        maxDuration: Math.max(...executions.map(e => e.executionTime), 0),
        minDuration: Math.min(...executions.map(e => e.executionTime), 0)
      },
      effects: {
        allow: executions.filter(e => e.effect === 'ALLOW').length,
        deny: executions.filter(e => e.effect === 'DENY').length,
        conditional: executions.filter(e => e.effect === 'CONDITIONAL').length
      },
      performance: {
        throughput: executions.length / 3600, // 假设1小时内的执行次数
        errorRate: executions.filter(e => !e.success).length / executions.length || 0,
        p95Duration: 0, // 简化实现
        p99Duration: 0  // 简化实现
      }
    };
  }

  async getSystemStats(period: { start: string; end: string }) {
    return {
      totalStrategies: this.strategies.length,
      activeStrategies: this.strategies.filter(s => s.status === StrategyStatus.ACTIVE).length,
      totalExecutions: this.executionResults.length,
      avgResponseTime: this.executionResults.reduce((sum, e) => sum + e.executionTime, 0) / this.executionResults.length || 0,
      errorRate: this.executionResults.filter(e => !e.success).length / this.executionResults.length || 0
    };
  }

  async getAlerts(strategyId?: string): Promise<StrategyAlert[]> {
    if (strategyId) {
      return this.alerts.filter(a => a.strategyId === strategyId);
    }
    return [...this.alerts];
  }

  async createAlert(alert: Omit<StrategyAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategyAlert> {
    const newAlert: StrategyAlert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  async updateAlert(id: string, alert: Partial<StrategyAlert>): Promise<StrategyAlert> {
    const index = this.alerts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Alert not found: ${id}`);
    }

    this.alerts[index] = {
      ...this.alerts[index],
      ...alert,
      updatedAt: new Date().toISOString()
    };

    return this.alerts[index];
  }

  async deleteAlert(id: string): Promise<void> {
    const index = this.alerts.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Alert not found: ${id}`);
    }
    this.alerts.splice(index, 1);
  }

  async exportStrategy(id: string): Promise<Blob> {
    const strategy = await this.getStrategy(id);
    const data = JSON.stringify(strategy, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  async importStrategy(file: File): Promise<Strategy> {
    const text = await file.text();
    const strategy = JSON.parse(text);
    return this.createStrategy(strategy);
  }

  async exportTemplate(id: string): Promise<Blob> {
    const template = await this.getTemplate(id);
    const data = JSON.stringify(template, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  async importTemplate(file: File): Promise<StrategyTemplate> {
    const text = await file.text();
    const template = JSON.parse(text);
    return this.createTemplate(template);
  }
}

// 导出策略服务实例
export const strategyService = new MockStrategyService();
