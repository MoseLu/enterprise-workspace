/**
 * 监控配置管理
 * 提供监控配置选项和环境适配
 */

/**
 * 监控配置选项
 */
export interface MonitorConfig {
  /**
   * 应用名称
   */
  appName: string;
  /**
   * 是否启用 APM（应用性能监控）
   * @default true
   */
  enableAPM?: boolean;
  /**
   * 是否启用错误追踪
   * @default true
   */
  enableErrorTracking?: boolean;
  /**
   * 是否启用用户行为监控
   * @default true
   */
  enableUserBehavior?: boolean;
  /**
   * 是否启用性能监控
   * @default true
   */
  enablePerformance?: boolean;
  /**
   * 是否启用资源监控
   * @default true
   */
  enableResourceMonitoring?: boolean;
  /**
   * 是否启用业务追踪
   * @default true
   */
  enableBusinessTracking?: boolean;
  /**
   * 是否启用系统监控
   * @default false
   */
  enableSystemMonitoring?: boolean;
  /**
   * 采样率（0-1）
   * @default 1.0
   */
  sampleRate?: number;
  /**
   * 批量上报大小
   * @default 10
   */
  batchSize?: number;
  /**
   * 最大等待时间（毫秒）
   * @default 5000
   */
  maxWaitTime?: number;
  /**
   * 是否启用调试模式
   * @default false
   */
  debug?: boolean;
  /**
   * 自定义上报 URL（可选）
   */
  reportUrl?: string;
  /**
   * 会话ID（可选，如果不提供会自动生成）
   */
  sessionId?: string;
  /**
   * 用户ID（可选）
   */
  userId?: string;
}

/**
 * 默认配置
 */
const defaultConfig: Required<Omit<MonitorConfig, 'appName' | 'reportUrl' | 'sessionId' | 'userId'>> = {
  enableAPM: true,
  enableErrorTracking: true,
  enableUserBehavior: true,
  enablePerformance: true,
  enableResourceMonitoring: true,
  enableBusinessTracking: true,
  enableSystemMonitoring: false,
  sampleRate: 1.0,
  batchSize: 10,
  maxWaitTime: 5000,
  debug: false,
};

/**
 * 全局配置实例
 */
let globalConfig: MonitorConfig | null = null;

/**
 * 初始化配置
 * @param config 配置选项
 */
export function initConfig(config: MonitorConfig): MonitorConfig {
  // 合并默认配置
  const mergedConfig: MonitorConfig = {
    ...defaultConfig,
    ...config,
  };

  // 根据环境调整配置
  if (typeof window !== 'undefined') {
    const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // 开发环境：详细日志、低采样率
      mergedConfig.debug = true;
      mergedConfig.sampleRate = mergedConfig.sampleRate ?? 1.0;
    } else {
      // 生产环境：关键指标、正常采样率
      mergedConfig.debug = false;
      mergedConfig.sampleRate = mergedConfig.sampleRate ?? 1.0;
    }
  }

  globalConfig = mergedConfig;
  return mergedConfig;
}

/**
 * 获取当前配置
 */
export function getConfig(): MonitorConfig {
  if (!globalConfig) {
    throw new Error('Monitor config not initialized. Call initConfig() first.');
  }
  return globalConfig;
}

/**
 * 更新配置
 * @param updates 配置更新
 */
export function updateConfig(updates: Partial<MonitorConfig>): MonitorConfig {
  if (!globalConfig) {
    throw new Error('Monitor config not initialized. Call initConfig() first.');
  }
  globalConfig = { ...globalConfig, ...updates };
  return globalConfig;
}

/**
 * 重置配置
 */
export function resetConfig(): void {
  globalConfig = null;
}

/**
 * 生成会话ID
 */
export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * 获取或创建会话ID
 */
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  const storageKey = 'btc-monitor-session-id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem(storageKey, sessionId);
  }

  return sessionId;
}
