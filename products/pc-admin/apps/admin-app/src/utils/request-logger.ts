import { logger } from '@btc/shared-core';
;
// 注意：不在这里导入 createHttpRetry 和 RETRY_CONFIGS，改为动态导入
// 避免在生产环境构建时 Vue 的 ref 还未初始化就被访问

/**
 * 请求日志项
 */
export interface RequestLogItem {
  userId?: number;
  username?: string;
  requestUrl: string;
  params: string; // 修改为字符串类型，存储 JSON 字符串
  ip?: string;
  duration: number;
  status: 'success' | 'failed';
  createdAt: string;
}

/**
 * 请求日志队列管理器
 */
class RequestLogQueue {
  private queue: RequestLogItem[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SIZE = 100; // 批量发送大小
  private readonly BATCH_INTERVAL = 180000; // 批量发送间隔（180秒）
  private readonly MAX_QUEUE_SIZE = 1000; // 最大队列长度
  private isServiceAvailable = true; // 服务是否可用
  private isPaused = false; // 是否暂停发送
  private readonly QPS_LIMIT = 2; // 每秒最多发送2次请求
  private lastSendTime = 0; // 上次发送时间
  private _retryManager: any = null; // 重试管理器（延迟初始化，使用 any 避免类型问题）

  // 需要过滤的接口路径（不记录这些接口的日志）
  private readonly FILTERED_PATHS = [
    '/login',
    '/register',
    '/captcha',
    '/code/sms/send',
    '/code/email/send',
    '/refresh-token',
    '/refresh/access-token',
    '/logout',
    '/upload',
    '/api/system/log/sys/request/update', // 过滤请求日志更新接口，避免循环记录
    '/api/system/log/sys/operation/update' // 过滤操作日志更新接口
  ];

  constructor() {
    // 不在构造函数中初始化 retryManager，延迟到第一次使用时初始化
    // 避免在生产环境构建时 Vue 的 ref 还未初始化就被访问
  }

  /**
   * 获取重试管理器（延迟初始化，使用动态导入）
   */
  private async getRetryManager() {
    if (!this._retryManager) {
      // 使用动态导入，确保 Vue 的 ref 已经可用
      const { createHttpRetry, RETRY_CONFIGS } = await import('@/composables/useRetry');
      this._retryManager = createHttpRetry(RETRY_CONFIGS.log);
    }
    return this._retryManager;
  }

  /**
   * 添加日志到队列
   */
  add(log: RequestLogItem) {
    // 过滤敏感接口
    if (!this.shouldLog(log.requestUrl)) {
      return;
    }

    // 检查队列长度，防止内存溢出
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      console.warn(`Request log queue is full (${this.MAX_QUEUE_SIZE}), dropping oldest log`);
      this.queue.shift(); // 移除最旧的日志
    }

    // 处理 params：如果传入的是对象，转换为 JSON 字符串
    let paramsString: string;
    if (typeof log.params === 'string') {
      // 如果已经是字符串，直接使用
      paramsString = log.params;
    } else {
      try {
        // 过滤敏感参数并标准化
        const filteredParams = this.filterSensitiveParams(log.params);
        const normalizedParams = this.normalizeParams(filteredParams);
        // 转换为 JSON 字符串
        paramsString = JSON.stringify(normalizedParams);
      } catch (error) {
        console.warn('Failed to serialize params, using empty object:', error);
        paramsString = '{}';
      }
    }

    this.queue.push({
      ...log,
      params: paramsString
    });


    // 如果服务可用且未暂停，尝试发送
    if (this.isServiceAvailable && !this.isPaused) {
      this.tryFlush();
    } else if (this.queue.length === 1 && !this.timer) {
      // 如果服务不可用且没有定时器在运行，启动定时器等待服务恢复
      this.startTimer();
    }
  }

  /**
   * 尝试发送（带QPS限制）
   */
  private tryFlush() {

    // 检查QPS限制
    const now = Date.now();
    const timeSinceLastSend = now - this.lastSendTime;
    const minInterval = 1000 / this.QPS_LIMIT; // 最小间隔时间

    if (timeSinceLastSend < minInterval) {
      // 如果距离上次发送时间太短，延迟发送
      const delay = minInterval - timeSinceLastSend;
      setTimeout(() => {
        this.flush();
      }, delay);
      return;
    }

    // 检查是否达到批量大小
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (this.queue.length > 0 && !this.timer) {
      // 如果队列有数据但未达到批量大小，且没有定时器在运行，启动定时器
      this.startTimer();
    } else if (this.queue.length > 0 && this.timer) {
      // 定时器已在运行，无需操作
    }
  }

  /**
   * 批量发送日志
   */
  private async flush() {
    if (this.queue.length === 0) {
      return;
    }

    // 如果服务不可用，暂停发送
    if (!this.isServiceAvailable) {
      this.isPaused = true;
      this.startTimer(); // 继续等待服务恢复
      return;
    }

    const logsToSend = [...this.queue];
    // 注意：这里不要立即清空 queue，等待发送成功后由业务决定是否清空

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      // 使用重试机制发送日志（动态获取 retryManager）
      const retryManager = await this.getRetryManager();
      await retryManager.retryRequest(async () => {
        // 从全局获取 service（在 main.ts 中已设置），完全避免动态导入
        const service = typeof window !== 'undefined' ? (window as any).__BTC_SERVICE__ : null;
        
        if (!service) {
          throw new Error('Service not initialized, cannot send request logs');
        }

        // 检查服务是否可用
        if (!service?.admin?.log?.sys?.request?.update) {
          throw new Error('Request log service unavailable');
        }

        // 批量发送：将所有日志作为数组一次性发送
        return await service.admin.log.sys.request.update(logsToSend);
      });

      // 发送成功，重置状态
      this.isServiceAvailable = true;
      this.isPaused = false;
      this.lastSendTime = Date.now();

      // 清空队列（只清空已发送的部分）
      this.queue = this.queue.slice(logsToSend.length);


      // 如果还有剩余日志，继续尝试发送
      if (this.queue.length > 0) {
        this.tryFlush();
      }
    } catch (error) {
        logger.error('Failed to send request logs in batch (retried):', error);

      // 重试机制已经处理了重试，这里只需要暂停发送
      this.isPaused = true;
      this.isServiceAvailable = false;

      // 5分钟后重新尝试
      setTimeout(() => {
        this.isServiceAvailable = true;
        this.isPaused = false;
        console.info('Request log service re-enabled, continuing to send queued data');
        if (this.queue.length > 0) {
          this.tryFlush();
        }
      }, 5 * 60 * 1000); // 5分钟
    }
  }

  /**
   * 启动定时器
   */
  private startTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }


    this.timer = setTimeout(() => {
      // 定时器触发时，直接发送队列中的日志，不管是否达到批量大小
      if (this.isServiceAvailable && !this.isPaused && this.queue.length > 0) {
        this.flush();
      } else if (this.queue.length > 0) {
        // 如果服务不可用，继续等待
        this.startTimer();
      }
    }, this.BATCH_INTERVAL);
  }

    /**
   * 判断是否需要记录日志
   */
  private shouldLog(url: string): boolean {
    // 过滤空URL
    if (!url) {
      return false;
    }

    // 过滤内部资源（如静态文件）
    if (url.includes('.html') || url.includes('.js') || url.includes('.css') ||
        url.includes('.json') || url.includes('.png') || url.includes('.jpg') ||
        url.includes('.svg') || url.includes('.ico')) {
      return false;
    }

    // 只记录业务接口（以 /api/ 开头的请求）
    if (!url.startsWith('/api/')) {
      return false;
    }

    // 过滤敏感接口
    return !this.FILTERED_PATHS.some(path => url.includes(path));
  }

  /**
   * 标准化参数格式，确保Java后端能正确反序列化
   */
  private normalizeParams(params: any): any {
    return this.sanitizeForJava(params);
  }

  /**
   * 清理数据结构，使其适合Java反序列化
   */
  private sanitizeForJava(obj: any, depth = 0, maxDepth = 5): any {
    // 防止无限递归
    if (depth > maxDepth) {
        return '[Depth exceeded]';
    }

    // null 或 undefined
    if (obj === null || obj === undefined) {
      return {};
    }

    // 基本类型
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      // 字符串长度限制
      if (typeof obj === 'string' && obj.length > 1000) {
        return obj.substring(0, 1000) + '...';
      }
      return obj;
    }

    // 日期对象转为字符串
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    // 函数转为字符串描述
    if (typeof obj === 'function') {
      return '[Function]';
    }

    // 数组处理 - 特别处理嵌套的日志数组
    if (Array.isArray(obj)) {
      // 检查是否是请求日志数组（包含复杂的日志对象）
      if (this.isRequestLogArray(obj)) {
        return this.simplifyLogArray(obj);
      }

      // 普通数组处理
      const maxArrayLength = 20; // 减少数组长度限制
      const limitedArray = obj.slice(0, maxArrayLength);

      return limitedArray.map((item, index) => {
        if (typeof item === 'object' && item !== null) {
          // 对于对象元素，进一步简化
          return this.sanitizeForJava(item, depth + 1, maxDepth);
        }
        return this.sanitizeForJava(item, depth + 1, maxDepth);
      });
    }

    // 对象处理
    if (typeof obj === 'object') {
      // 检查是否是请求日志对象
      if (this.isRequestLogObject(obj)) {
        return this.simplifyLogObject(obj);
      }

      const sanitized: any = {};
      let propertyCount = 0;
      const maxProperties = 10; // 减少属性数量限制

      for (const key in obj) {
        if (propertyCount >= maxProperties) {
          sanitized['more_properties'] = `${Object.keys(obj).length - maxProperties}_more_truncated`;
          break;
        }

        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // 清理属性名，确保Java兼容
          const cleanKey = this.sanitizePropertyName(key);
          const value = obj[key];

          // 递归处理属性值
          sanitized[cleanKey] = this.sanitizeForJava(value, depth + 1, maxDepth);
          propertyCount++;
        }
      }

      return sanitized;
    }

    // 其他未知类型
    return String(obj);
  }

  /**
   * 检查是否是请求日志数组
   */
  private isRequestLogArray(arr: any[]): boolean {
    if (arr.length === 0) return false;

    // 检查第一个元素是否包含日志对象的特征字段
    const firstItem = arr[0];
    return firstItem &&
           typeof firstItem === 'object' &&
           ('userId' in firstItem || 'requestUrl' in firstItem || 'duration' in firstItem);
  }

  /**
   * 检查是否是请求日志对象
   */
  private isRequestLogObject(obj: any): boolean {
    return obj &&
           typeof obj === 'object' &&
           ('userId' in obj || 'requestUrl' in obj || 'duration' in obj);
  }

  /**
   * 简化日志数组，避免复杂嵌套
   */
  private simplifyLogArray(logArray: any[]): any {
    return {
      log_count: logArray.length,
      log_summary: logArray.slice(0, 3).map((log, index) => ({
        index: index,
        url: log.requestUrl || 'unknown',
        method: this.extractMethod(log.requestUrl),
        status: log.status || 'unknown',
        duration: log.duration || 0
      })),
      truncated: logArray.length > 3
    };
  }

  /**
   * 简化日志对象
   */
  private simplifyLogObject(logObj: any): any {
    return {
      user_id: logObj.userId || 0,
      username: logObj.username || 'unknown',
      request_url: logObj.requestUrl || 'unknown',
      method: this.extractMethod(logObj.requestUrl),
      status: logObj.status || 'unknown',
      duration: logObj.duration || 0,
      created_at: logObj.createdAt || new Date().toISOString(),
      params_summary: this.summarizeParams(logObj.params)
    };
  }

  /**
   * 从URL中提取HTTP方法
   */
  private extractMethod(url: string): string {
    if (!url) return 'unknown';
    if (url.includes('/page')) return 'GET';
    if (url.includes('/update') || url.includes('/add')) return 'POST';
    if (url.includes('/delete')) return 'DELETE';
    return 'unknown';
  }

  /**
   * 总结参数信息
   */
  private summarizeParams(params: any): any {
    if (!params || typeof params !== 'object') {
      return { type: typeof params, value: String(params).substring(0, 100) };
    }

    if (Array.isArray(params)) {
      return {
        type: 'array',
        length: params.length,
        sample: params.slice(0, 2)
      };
    }

    const keys = Object.keys(params);
    return {
      type: 'object',
      property_count: keys.length,
      properties: keys.slice(0, 5),
      has_more: keys.length > 5
    };
  }

  /**
   * 清理属性名，确保Java兼容
   */
  private sanitizePropertyName(key: string): string {
    // 移除特殊字符，只保留字母、数字、下划线
    let cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_');

    // 确保不以数字开头
    if (/^[0-9]/.test(cleanKey)) {
      cleanKey = '_' + cleanKey;
    }

    // 限制长度
    if (cleanKey.length > 50) {
      cleanKey = cleanKey.substring(0, 50);
    }

    // 如果清理后为空，使用默认名称
    if (!cleanKey) {
      cleanKey = 'property';
    }

    return cleanKey;
  }

  /**
   * 过滤敏感参数
   */
  private filterSensitiveParams(params: any): any {
    if (!params || typeof params !== 'object') {
      return params;
    }

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];

    if (Array.isArray(params)) {
      return params.map(item => this.filterSensitiveParams(item));
    }

    const filtered: any = {};
    for (const key in params) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(s => lowerKey.includes(s))) {
        filtered[key] = '***';
      } else {
        filtered[key] = this.filterSensitiveParams(params[key]);
      }
    }

    return filtered;
  }


  /**
   * 获取队列状态（用于调试）
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      isServiceAvailable: this.isServiceAvailable,
      isPaused: this.isPaused,
      lastSendTime: this.lastSendTime,
      retryManagerStatus: this._retryManager ? this._retryManager.getStatus() : null
    };
  }

  /**
   * 销毁实例（页面卸载时调用）
   */
  destroy() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    // 发送剩余的日志
    if (this.queue.length > 0) {
      this.flush();
    }
  }
}

// 创建单例
export const requestLogger = new RequestLogQueue();

// 在开发环境中暴露到全局，方便调试
if (import.meta.env.DEV) {
  (window as any).__REQUEST_LOGGER__ = requestLogger;
}
