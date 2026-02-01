/**
 * 策略系统服务接口
 */
import type { Strategy, StrategyTemplate, StrategyExecutionContext, StrategyExecutionResult, StrategyMonitorStats, StrategyAlert, StrategyOrchestration } from '@/types/strategy';
import { StrategyType, StrategyStatus } from '@/types/strategy';
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
export interface PageResponse<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
}
export interface StrategyService {
    getStrategies(params: PageParams): Promise<PageResponse<Strategy>>;
    getStrategy(id: string): Promise<Strategy>;
    createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy>;
    updateStrategy(id: string, strategy: Partial<Strategy>): Promise<Strategy>;
    deleteStrategy(id: string): Promise<void>;
    deleteStrategies(ids: string[]): Promise<void>;
    getStrategyVersions(strategyId: string): Promise<Strategy[]>;
    createStrategyVersion(strategyId: string, version: string): Promise<Strategy>;
    activateStrategyVersion(strategyId: string, version: string): Promise<void>;
    updateStrategyStatus(id: string, status: StrategyStatus): Promise<void>;
    testStrategy(id: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;
    getTemplates(category?: string): Promise<StrategyTemplate[]>;
    getTemplate(id: string): Promise<StrategyTemplate>;
    createTemplate(template: Omit<StrategyTemplate, 'id' | 'createdAt'>): Promise<StrategyTemplate>;
    updateTemplate(id: string, template: Partial<StrategyTemplate>): Promise<StrategyTemplate>;
    deleteTemplate(id: string): Promise<void>;
    createFromTemplate(templateId: string, variables: Record<string, any>): Promise<Strategy>;
    getOrchestration(strategyId: string): Promise<StrategyOrchestration>;
    updateOrchestration(strategyId: string, orchestration: StrategyOrchestration): Promise<void>;
    validateOrchestration(orchestration: StrategyOrchestration): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    executeStrategy(strategyId: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;
    getExecutionHistory(strategyId: string, params: PageParams): Promise<PageResponse<StrategyExecutionResult>>;
    getMonitorStats(strategyId: string, period: {
        start: string;
        end: string;
    }): Promise<StrategyMonitorStats>;
    getSystemStats(period: {
        start: string;
        end: string;
    }): Promise<{
        totalStrategies: number;
        activeStrategies: number;
        totalExecutions: number;
        avgResponseTime: number;
        errorRate: number;
    }>;
    getAlerts(strategyId?: string): Promise<StrategyAlert[]>;
    createAlert(alert: Omit<StrategyAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategyAlert>;
    updateAlert(id: string, alert: Partial<StrategyAlert>): Promise<StrategyAlert>;
    deleteAlert(id: string): Promise<void>;
    exportStrategy(id: string): Promise<Blob>;
    importStrategy(file: File): Promise<Strategy>;
    exportTemplate(id: string): Promise<Blob>;
    importTemplate(file: File): Promise<StrategyTemplate>;
}
export declare class MockStrategyService implements StrategyService {
    private strategies;
    private templates;
    private orchestrations;
    private executionResults;
    private alerts;
    constructor();
    private initMockData;
    getStrategies(params: PageParams): Promise<PageResponse<Strategy>>;
    page(params: any): Promise<any>;
    add(data: any): Promise<Strategy>;
    update(data: any): Promise<Strategy>;
    getStrategy(id: string): Promise<Strategy>;
    createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Strategy>;
    updateStrategy(id: string, strategy: Partial<Strategy>): Promise<Strategy>;
    deleteStrategy(id: string): Promise<void>;
    deleteStrategies(ids: string[]): Promise<void>;
    getStrategyVersions(strategyId: string): Promise<Strategy[]>;
    createStrategyVersion(strategyId: string, version: string): Promise<Strategy>;
    activateStrategyVersion(strategyId: string, version: string): Promise<void>;
    updateStrategyStatus(id: string, status: StrategyStatus): Promise<void>;
    testStrategy(id: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;
    getTemplates(category?: string): Promise<StrategyTemplate[]>;
    getTemplate(id: string): Promise<StrategyTemplate>;
    createTemplate(template: Omit<StrategyTemplate, 'id' | 'createdAt'>): Promise<StrategyTemplate>;
    updateTemplate(id: string, template: Partial<StrategyTemplate>): Promise<StrategyTemplate>;
    deleteTemplate(id: string): Promise<void>;
    createFromTemplate(templateId: string, variables: Record<string, any>): Promise<Strategy>;
    getOrchestration(strategyId: string): Promise<StrategyOrchestration>;
    updateOrchestration(strategyId: string, orchestration: StrategyOrchestration): Promise<void>;
    validateOrchestration(orchestration: StrategyOrchestration): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    executeStrategy(strategyId: string, context: StrategyExecutionContext): Promise<StrategyExecutionResult>;
    getExecutionHistory(strategyId: string, params: PageParams): Promise<PageResponse<StrategyExecutionResult>>;
    getMonitorStats(strategyId: string, period: {
        start: string;
        end: string;
    }): Promise<StrategyMonitorStats>;
    getSystemStats(period: {
        start: string;
        end: string;
    }): Promise<{
        totalStrategies: number;
        activeStrategies: number;
        totalExecutions: number;
        avgResponseTime: number;
        errorRate: number;
    }>;
    getAlerts(strategyId?: string): Promise<StrategyAlert[]>;
    createAlert(alert: Omit<StrategyAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<StrategyAlert>;
    updateAlert(id: string, alert: Partial<StrategyAlert>): Promise<StrategyAlert>;
    deleteAlert(id: string): Promise<void>;
    exportStrategy(id: string): Promise<Blob>;
    importStrategy(file: File): Promise<Strategy>;
    exportTemplate(id: string): Promise<Blob>;
    importTemplate(file: File): Promise<StrategyTemplate>;
}
export declare const strategyService: MockStrategyService;
