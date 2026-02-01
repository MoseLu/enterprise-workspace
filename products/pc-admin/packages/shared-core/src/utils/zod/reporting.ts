/**
 * 验证失败上报服务（预留）
 * 用于将验证失败信息上报到运维子应用和后端API
 */
;

import type { ZodError } from 'zod';

/**
 * 验证错误类型
 */
export type ValidationErrorType = 'form' | 'api-response' | 'config';

/**
 * 验证错误上下文
 */
export interface ValidationErrorContext {
  url?: string; // API 请求 URL
  configPath?: string; // 配置文件路径
  formField?: string; // 表单字段名
  schemaName?: string; // Schema 名称
}

/**
 * 验证错误上报数据
 */
export interface ValidationErrorReport {
  type: ValidationErrorType;
  schema: string; // schema 名称或路径
  errors: ZodError['errors'];
  context: ValidationErrorContext;
  timestamp: number;
  environment: 'development' | 'production';
  userAgent?: string;
  userId?: string;
}

/**
 * 上报配置
 */
export interface ReportingConfig {
  enabled: boolean; // 是否启用上报
  debounceMs?: number; // 防抖时间（毫秒），默认 1000
  maxBatchSize?: number; // 批量上报最大数量，默认 10
  operationsAppUrl?: string; // 运维子应用 URL
  backendApiUrl?: string; // 后端 API 端点
}

/**
 * 默认配置
 */
const defaultConfig: ReportingConfig = {
  enabled: false, // 默认关闭，后续实现时启用
  debounceMs: 1000,
  maxBatchSize: 10,
};

/**
 * 当前配置
 */
let currentConfig: ReportingConfig = { ...defaultConfig };

/**
 * 待上报的错误队列
 */
const errorQueue: ValidationErrorReport[] = [];

/**
 * 防抖定时器
 */
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 配置上报服务
 * @param config 上报配置
 */
export function configureReporting(config: Partial<ReportingConfig>) {
  currentConfig = { ...defaultConfig, ...config };
}

/**
 * 上报验证错误（预留接口）
 * @param type 错误类型
 * @param schema  schema 名称或路径
 * @param error Zod 错误对象
 * @param context 上下文信息
 */
export function reportValidationError(
  type: ValidationErrorType,
  schema: string,
  error: ZodError,
  context: ValidationErrorContext = {}
): void {
  // 如果未启用上报，直接返回
  if (!currentConfig.enabled) {
    if (import.meta.env.DEV) {
      console.warn('[验证失败上报] 上报功能未启用', { type, schema, errors: error.errors });
    }
    return;
  }

  // 构建上报数据
  const report: ValidationErrorReport = {
    type,
    schema,
    errors: error.errors,
    context,
    timestamp: Date.now(),
    environment: import.meta.env.DEV ? 'development' : 'production',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    // userId 可以从全局状态或认证信息中获取，这里预留
    // userId: getCurrentUserId(),
  };

  // 添加到队列
  errorQueue.push(report);

  // 如果队列达到批量大小，立即上报
  if (errorQueue.length >= (currentConfig.maxBatchSize || 10)) {
    flushErrorQueue();
    return;
  }

  // 否则使用防抖，延迟上报
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    flushErrorQueue();
  }, currentConfig.debounceMs || 1000);
}

/**
 * 立即上报队列中的所有错误
 */
function flushErrorQueue(): void {
  if (errorQueue.length === 0) {
    return;
  }

  const reports = [...errorQueue];
  errorQueue.length = 0; // 清空队列

  // TODO: 后续实现实际上报逻辑
  // 1. 上报到运维子应用
  // if (currentConfig.operationsAppUrl) {
  //   reportToOperationsApp(reports);
  // }
  // 2. 上报到后端API
  // if (currentConfig.backendApiUrl) {
  //   reportToBackendAPI(reports);
  // }

  // 当前仅记录日志
  if (import.meta.env.DEV) {
    console.info('[验证失败上报] 待上报的错误:', reports);
  } else {
    // 生产环境静默记录
    console.warn(`[验证失败上报] ${reports.length} 个验证错误待上报`);
  }
}

/**
 * 上报到运维子应用（预留，后续实现）
 * @param reports 错误报告数组
 */
async function reportToOperationsApp(reports: ValidationErrorReport[]): Promise<void> {
  // TODO: 实现上报到运维子应用的逻辑
  // 例如：使用 fetch 或 axios 发送 POST 请求
  // await fetch(currentConfig.operationsAppUrl!, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ reports }),
  // });
}

/**
 * 上报到后端API（预留，后续实现）
 * @param reports 错误报告数组
 */
async function reportToBackendAPI(reports: ValidationErrorReport[]): Promise<void> {
  // TODO: 实现上报到后端API的逻辑
  // 例如：使用项目的 HTTP 客户端发送请求
  // await http.post(currentConfig.backendApiUrl!, { reports });
}

/**
 * 手动触发上报（用于测试或紧急情况）
 */
export function flushReports(): void {
  flushErrorQueue();
}

/**
 * 获取当前待上报的错误数量
 */
export function getPendingReportCount(): number {
  return errorQueue.length;
}

/**
 * 清空待上报队列
 */
export function clearErrorQueue(): void {
  errorQueue.length = 0;
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}
