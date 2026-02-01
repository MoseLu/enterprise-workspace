import { logger } from '@btc/shared-core';
;
/**
 * 指数退避重试机制
 */
export interface RetryConfig {
  maxRetries?: number; // 最大重试次数
  baseDelay?: number; // 基础延迟时间（毫秒）
  maxDelay?: number; // 最大延迟时间（毫秒）
  backoffFactor?: number; // 退避因子
  jitter?: boolean; // 是否添加随机抖动
}

export interface RetryState {
  retryCount: number;
  isRetrying: boolean;
  lastError: Error | null;
  nextRetryDelay: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true
};

/**
 * 计算退避延迟时间
 */
function calculateDelay(
  retryCount: number,
  baseDelay: number,
  maxDelay: number,
  backoffFactor: number,
  jitter: boolean
): number {
  // 指数退避：baseDelay * (backoffFactor ^ retryCount)
  let delay = baseDelay * Math.pow(backoffFactor, retryCount);

  // 限制最大延迟
  delay = Math.min(delay, maxDelay);

  // 添加随机抖动，避免多个请求同时重试
  if (jitter) {
    const jitterAmount = delay * 0.1; // 10%的抖动
    delay += (Math.random() - 0.5) * 2 * jitterAmount;
  }

  return Math.max(0, Math.floor(delay));
}

/**
 * 判断是否应该重试
 */
function shouldRetry(error: any, retryCount: number, maxRetries: number): boolean {
  // 超过最大重试次数
  if (retryCount >= maxRetries) {
    return false;
  }

  // 网络错误或超时错误
  if (error?.code === 'NETWORK_ERROR' ||
      error?.code === 'TIMEOUT' ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('Network Error')) {
    return true;
  }

  // HTTP状态码错误
  const status = error?.response?.status;
  if (status) {
    // 5xx服务器错误
    if (status >= 500 && status < 600) {
      return true;
    }
    // 429 Too Many Requests
    if (status === 429) {
      return true;
    }
    // 408 Request Timeout
    if (status === 408) {
      return true;
    }
  }

  return false;
}

/**
 * 指数退避重试Hook
 */
export function useRetry(config: RetryConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const state = ref<RetryState>({
    retryCount: 0,
    isRetrying: false,
    lastError: null,
    nextRetryDelay: 0
  });

  /**
   * 执行带重试的异步操作
   */
  async function executeWithRetry<T>(
    operation: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const operationConfig = { ...finalConfig, ...customConfig };
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= operationConfig.maxRetries; attempt++) {
      try {
        // 更新状态
        state.value.retryCount = attempt;
        state.value.isRetrying = attempt > 0;
        state.value.lastError = null;

        // 如果不是第一次尝试，等待退避延迟
        if (attempt > 0) {
          const delay = calculateDelay(
            attempt - 1,
            operationConfig.baseDelay,
            operationConfig.maxDelay,
            operationConfig.backoffFactor,
            operationConfig.jitter
          );

          state.value.nextRetryDelay = delay;
          console.info(`请求重试 ${attempt}/${operationConfig.maxRetries}，延迟 ${delay}ms`);

          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // 执行操作
        const result = await operation();

        // 成功，重置状态
        state.value.retryCount = 0;
        state.value.isRetrying = false;
        state.value.lastError = null;
        state.value.nextRetryDelay = 0;

        return result;

      } catch (error: any) {
        lastError = error;
        state.value.lastError = error;

        // 检查是否应该重试
        if (!shouldRetry(error, attempt, operationConfig.maxRetries)) {
          logger.error(`请求失败，不进行重试:`, error);
          break;
        }

        console.warn(`请求失败，准备重试 ${attempt + 1}/${operationConfig.maxRetries}:`, error);
      }
    }

    // 所有重试都失败了
    state.value.isRetrying = false;
    throw lastError || new Error('请求失败');
  }

  /**
   * 重置重试状态
   */
  function reset() {
    state.value = {
      retryCount: 0,
      isRetrying: false,
      lastError: null,
      nextRetryDelay: 0
    };
  }

  /**
   * 获取当前重试状态
   */
  function getStatus() {
    return {
      ...state.value,
      config: finalConfig
    };
  }

  return {
    state: readonly(state),
    executeWithRetry,
    reset,
    getStatus
  };
}

/**
 * 创建HTTP请求重试器
 */
export function createHttpRetry(config: RetryConfig = {}) {
  const { executeWithRetry, state, reset, getStatus } = useRetry(config);

  /**
   * 包装HTTP请求
   */
  async function retryRequest<T>(
    requestFn: () => Promise<T>,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    return executeWithRetry(requestFn, customConfig);
  }

  return {
    retryRequest,
    state: readonly(state),
    reset,
    getStatus
  };
}

/**
 * 全局重试配置
 */
export const RETRY_CONFIGS = {
  // 快速重试（用于用户操作）
  fast: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 2000,
    backoffFactor: 2,
    jitter: true
  },

  // 标准重试（用于一般请求）
  standard: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    jitter: true
  },

  // 慢速重试（用于后台任务）
  slow: {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffFactor: 2,
    jitter: true
  },

  // 日志重试（用于日志发送）
  log: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffFactor: 1.5,
    jitter: true
  }
} as const;
