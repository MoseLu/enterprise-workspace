/**
 * 错误上报模块
 * 专门用于将 dev 服务器运行过程中的错误上报到监控服务（3001 端口）
 * 然后通过 SSE 推送到可视化页面展示
 */

/**
 * 获取监控服务地址
 * 在开发环境中，使用相对路径通过开发服务器代理访问，避免私有网络请求警告
 * 在生产环境中，不使用错误上报功能
 */
function getMonitorServiceUrl(): string {
  try {
    // 只在开发环境上报
    const isDev =
      typeof import.meta !== 'undefined' &&
      import.meta.env?.DEV === true;

    if (!isDev) {
      return ''; // 生产环境不上报
    }

    // 使用相对路径，通过开发服务器的代理访问监控服务
    // 代理配置：/__monitor__ -> http://localhost:3001
    return '/__monitor__';
  } catch (error) {
    // 如果获取失败（可能在某些环境中 import.meta 不可用），返回空字符串
    return '';
  }
}

// 错误上报队列
class ErrorReporterQueue {
  private queue: any[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_SIZE = 10; // 批量发送大小
  private readonly BATCH_INTERVAL = 2000; // 批量发送间隔（2秒，减少频率）
  private readonly MAX_QUEUE_SIZE = 50; // 最大队列长度（减少到 50，防止内存泄漏）
  private readonly FETCH_TIMEOUT = 5000; // fetch 超时时间（5秒）
  private readonly MAX_CONCURRENT_REQUESTS = 1; // 最大并发请求数（限制为 1，防止内存泄漏）
  private pendingRequests = new Set<Promise<any>>(); // 跟踪 pending 的请求
  private isServiceAvailable = true;
  private isPaused = false;
  private isDestroyed = false; // 标记是否已销毁

  /**
   * 添加错误到队列
   */
  add(errorData: any) {
    // 如果已销毁，直接返回，不再接收新错误
    if (this.isDestroyed) {
      return;
    }

    // 检查队列长度，防止内存溢出（更激进的清理策略）
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      // 移除最旧的错误（FIFO）
      this.queue.shift();
    }

    // 关键：错误去重，避免重复上报相同错误导致内存泄漏
    const errorKey = this.getErrorKey(errorData);
    const isDuplicate = this.queue.some(item => this.getErrorKey(item) === errorKey);
    if (isDuplicate) {
      // 如果是重复错误，直接返回，不添加到队列
      return;
    }

    this.queue.push(errorData);

    // 如果服务可用且未暂停，且没有太多 pending 请求，尝试发送
    if (this.isServiceAvailable && !this.isPaused && this.pendingRequests.size < this.MAX_CONCURRENT_REQUESTS) {
      this.tryFlush();
    } else if (this.queue.length === 1 && !this.timer && !this.isDestroyed) {
      // 如果服务不可用且没有定时器在运行，启动定时器等待服务恢复
      this.startTimer();
    }
  }

  /**
   * 获取错误的唯一标识（用于去重）
   */
  private getErrorKey(errorData: any): string {
    try {
      const errorMessage = errorData?.errorMessage || errorData?.msg || errorData?.message || '';
      const errorName = errorData?.error?.name || errorData?.err?.name || '';
      const stack = errorData?.error?.stack || errorData?.err?.stack || '';
      // 使用错误消息和堆栈的前 200 个字符作为唯一标识
      const stackSnippet = stack.substring(0, 200);
      return `${errorName}:${errorMessage}:${stackSnippet}`;
    } catch (e) {
      // 如果获取失败，使用时间戳作为后备
      return `${Date.now()}`;
    }
  }

  /**
   * 尝试发送（带批量处理）
   */
  private tryFlush() {
    // 检查是否达到批量大小
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (this.queue.length > 0 && !this.timer) {
      // 如果队列有数据但未达到批量大小，且没有定时器在运行，启动定时器
      this.startTimer();
    }
  }

  /**
   * 批量发送错误（带超时和并发控制）
   */
  private async flush() {
    if (this.queue.length === 0 || this.isDestroyed) {
      return;
    }

    // 如果服务不可用或已达到最大并发数，暂停发送
    if (!this.isServiceAvailable || this.pendingRequests.size >= this.MAX_CONCURRENT_REQUESTS) {
      this.isPaused = true;
      if (!this.isDestroyed) {
        this.startTimer(); // 继续等待服务恢复
      }
      return;
    }

    const errorsToSend = [...this.queue];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    try {
      // 获取监控服务地址
      const monitorServiceUrl = getMonitorServiceUrl();

      // 如果监控服务 URL 为空（生产环境），清空队列
      if (!monitorServiceUrl) {
        this.queue = [];
        return;
      }

      // 关键：创建带超时的 fetch 请求，防止 pending 请求累积
      // 使用 AbortController 实现超时控制，更可靠
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, this.FETCH_TIMEOUT);

      const fetchPromise = fetch(`${monitorServiceUrl}/api/errors/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: errorsToSend,
          timestamp: Date.now(),
        }),
        signal: abortController.signal, // 添加 abort signal，支持取消请求
      }).finally(() => {
        // 清除超时定时器
        clearTimeout(timeoutId);
      });

      // 跟踪 pending 请求
      this.pendingRequests.add(fetchPromise);

      try {
        const response = await fetchPromise;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // 发送成功，重置状态
        this.isServiceAvailable = true;
        this.isPaused = false;

        // 清空队列（只清空已发送的部分）
        this.queue = this.queue.slice(errorsToSend.length);

        // 如果还有剩余错误，且没有达到并发限制，继续尝试发送
        if (this.queue.length > 0 && this.pendingRequests.size < this.MAX_CONCURRENT_REQUESTS && !this.isDestroyed) {
          this.tryFlush();
        }
      } finally {
        // 关键：无论成功或失败，都要从 pending 集合中移除
        this.pendingRequests.delete(fetchPromise);
      }
    } catch (error: any) {
      // 发送失败，暂停发送
      this.isPaused = true;
      this.isServiceAvailable = false;

      // 关键：清空队列中已尝试发送的错误，防止内存泄漏
      // 如果服务不可用，继续保留这些错误会导致内存泄漏
      // 只保留队列中的一部分（最新的错误），丢弃旧的
      if (this.queue.length > this.MAX_QUEUE_SIZE / 2) {
        this.queue = this.queue.slice(-Math.floor(this.MAX_QUEUE_SIZE / 2));
      }

      // 10秒后重新尝试（增加重试间隔，减少请求频率）
      if (!this.isDestroyed) {
        setTimeout(() => {
          if (!this.isDestroyed) {
            this.isServiceAvailable = true;
            this.isPaused = false;
            if (this.queue.length > 0 && this.pendingRequests.size < this.MAX_CONCURRENT_REQUESTS) {
              this.tryFlush();
            }
          }
        }, 10000); // 增加到 10 秒
      }
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
      // 定时器触发时，直接发送队列中的错误，不管是否达到批量大小
      if (this.isServiceAvailable && !this.isPaused && this.queue.length > 0) {
        this.flush();
      } else if (this.queue.length > 0) {
        // 如果服务不可用，继续等待
        this.startTimer();
      }
    }, this.BATCH_INTERVAL);
  }

  /**
   * 销毁实例（页面卸载时调用）
   */
  destroy() {
    this.isDestroyed = true;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // 关键：清空队列，防止内存泄漏
    // 不再发送剩余错误，因为页面正在卸载，发送请求可能导致问题
    this.queue = [];

    // 清理所有 pending 请求（无法取消 fetch，但至少清空跟踪）
    this.pendingRequests.clear();
  }

  /**
   * 清空队列（紧急情况下调用）
   */
  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// 创建单例
const errorReporterQueue = new ErrorReporterQueue();

// 页面卸载时清理队列
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    errorReporterQueue.destroy();
  });

  // 页面隐藏时也清理队列（防止内存泄漏）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // 页面隐藏时，清理部分队列，减少内存占用
      // 但不完全清空，因为页面可能只是切换标签页
      if (errorReporterQueue && typeof (errorReporterQueue as any).clear === 'function') {
        // 保留最新的 10 条错误，清空旧的
        const queue = (errorReporterQueue as any).queue;
        if (queue && queue.length > 10) {
          (errorReporterQueue as any).queue = queue.slice(-10);
        }
      }
    }
  });
}

// 导出队列实例（用于清理）
export { errorReporterQueue };

// 错误上报频率限制（防止内存泄漏）
let lastReportTime = 0;
const MIN_REPORT_INTERVAL = 100; // 最小上报间隔（100ms，限制上报频率）
let reportCount = 0;
const MAX_REPORTS_PER_SECOND = 10; // 每秒最多上报 10 次
let reportWindowStart = Date.now();

/**
 * 上报错误到监控服务（带频率限制）
 * @param errorData - 错误数据（Winston 日志对象格式）
 */
export function reportError(errorData: any) {
  try {
    // 只在开发环境上报
    const isDev =
      typeof import.meta !== 'undefined' &&
      import.meta.env?.DEV === true;

    if (!isDev) {
      return;
    }

    // 关键：频率限制，防止大量错误导致内存泄漏
    const now = Date.now();

    // 检查时间窗口（每秒）
    if (now - reportWindowStart >= 1000) {
      reportCount = 0;
      reportWindowStart = now;
    }

    // 如果已达到每秒最大上报次数，丢弃错误
    if (reportCount >= MAX_REPORTS_PER_SECOND) {
      // 静默丢弃，避免内存泄漏
      return;
    }

    // 检查最小上报间隔
    if (now - lastReportTime < MIN_REPORT_INTERVAL) {
      // 间隔太短，丢弃错误
      return;
    }

    // 更新计数和时间
    reportCount++;
    lastReportTime = now;

    // 添加到队列
    errorReporterQueue.add(errorData);
  } catch (error) {
    // 上报失败不影响主流程，静默处理
    // 在开发环境可以输出错误
    try {
      if (import.meta?.env?.DEV) {
        console.error('[ErrorReporter] 上报错误失败:', error);
      }
    } catch (e) {
      // import.meta.env 可能不存在，忽略
    }
  }
}

