import { logger } from '../../utils/logger/index';
;
/**
 * SSE 事件管理器
 * 提供 Server-Sent Events 客户端管理功能
 */

/**
 * SSE 连接状态
 */
export type SSEStatus = 'disconnected' | 'connecting' | 'connected';

/**
 * SSE 连接选项
 */
export interface SSEOptions {
  /**
   * 是否自动重连
   */
  reconnect?: boolean;
  /**
   * 重连间隔（毫秒）
   */
  reconnectInterval?: number;
  /**
   * 最大重连次数，-1 表示无限重连
   */
  maxReconnectAttempts?: number;
}

/**
 * 事件处理器类型
 */
type EventHandler = (data: any) => void;

/**
 * SSE 管理器状态
 */
interface SSEManagerState {
  eventSource: EventSource | null;
  status: SSEStatus;
  reconnectAttempts: number;
  reconnectTimer: number | null;
  eventHandlers: Map<string, EventHandler[]>;
  options: SSEOptions;
}

/**
 * 全局 SSE 管理器状态
 */
let sseState: SSEManagerState = {
  eventSource: null,
  status: 'disconnected',
  reconnectAttempts: 0,
  reconnectTimer: null,
  eventHandlers: new Map(),
  options: {
    reconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: -1,
  },
};

/**
 * 连接 SSE 服务
 * @param sseUrl SSE 服务 URL
 * @param options 连接选项
 */
export function connectSSE(sseUrl: string, options?: SSEOptions): void {
  // 如果已经连接，先断开
  if (sseState.eventSource) {
    disconnectSSE();
  }

  // 更新选项
  sseState.options = {
    reconnect: true,
    reconnectInterval: 3000,
    maxReconnectAttempts: -1,
    ...options,
  };

  // 重置重连计数
  sseState.reconnectAttempts = 0;

  // 开始连接
  doConnect(sseUrl);
}

/**
 * 执行连接
 */
function doConnect(sseUrl: string): void {
  sseState.status = 'connecting';

  try {
    const eventSource = new EventSource(sseUrl);
    sseState.eventSource = eventSource;

    // 连接成功
    eventSource.onopen = () => {
      sseState.status = 'connected';
      sseState.reconnectAttempts = 0;
      console.info('[sse-manager] SSE 连接成功');
    };

    // 接收消息
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventType = data.type || 'message';
        
        // 触发对应事件类型的处理器
        const handlers = sseState.eventHandlers.get(eventType) || [];
        handlers.forEach((handler) => {
          try {
            handler(data);
          } catch (err) {
            logger.error(`[sse-manager] 事件处理器执行失败 (${eventType}):`, err);
          }
        });

        // 如果没有指定类型，也触发 'message' 事件
        if (eventType !== 'message') {
          const messageHandlers = sseState.eventHandlers.get('message') || [];
          messageHandlers.forEach((handler) => {
            try {
              handler(data);
            } catch (err) {
              logger.error('[sse-manager] message 事件处理器执行失败:', err);
            }
          });
        }
      } catch (err) {
        logger.error('[sse-manager] 解析 SSE 消息失败:', err);
      }
    };

    // 连接错误
    eventSource.onerror = (err) => {
      logger.error('[sse-manager] SSE 连接错误:', err);
      sseState.status = 'disconnected';
      
      // 关闭连接
      if (eventSource) {
        eventSource.close();
        sseState.eventSource = null;
      }

      // 如果启用了自动重连，尝试重连
      if (sseState.options.reconnect) {
        const maxAttempts = sseState.options.maxReconnectAttempts ?? -1;
        const shouldReconnect = maxAttempts === -1 || sseState.reconnectAttempts < maxAttempts;

        if (shouldReconnect) {
          sseState.reconnectAttempts++;
          const interval = sseState.options.reconnectInterval || 3000;
          
          console.info(`[sse-manager] ${interval}ms 后尝试重连 (${sseState.reconnectAttempts}/${maxAttempts === -1 ? '∞' : maxAttempts})`);
          
          sseState.reconnectTimer = window.setTimeout(() => {
            doConnect(sseUrl);
          }, interval);
        } else {
          console.warn('[sse-manager] 已达到最大重连次数，停止重连');
        }
      }
    };
  } catch (err) {
    logger.error('[sse-manager] 创建 SSE 连接失败:', err);
    sseState.status = 'disconnected';
  }
}

/**
 * 断开 SSE 连接
 */
export function disconnectSSE(): void {
  if (sseState.reconnectTimer) {
    clearTimeout(sseState.reconnectTimer);
    sseState.reconnectTimer = null;
  }

  if (sseState.eventSource) {
    sseState.eventSource.close();
    sseState.eventSource = null;
  }

  sseState.status = 'disconnected';
  sseState.reconnectAttempts = 0;
}

/**
 * 订阅事件
 * @param eventType 事件类型，例如 'dict-update', 'eps-update'
 * @param callback 回调函数
 */
export function on(eventType: string, callback: EventHandler): void {
  if (!sseState.eventHandlers.has(eventType)) {
    sseState.eventHandlers.set(eventType, []);
  }
  const handlers = sseState.eventHandlers.get(eventType)!;
  if (!handlers.includes(callback)) {
    handlers.push(callback);
  }
}

/**
 * 取消订阅事件
 * @param eventType 事件类型
 * @param callback 回调函数
 */
export function off(eventType: string, callback: EventHandler): void {
  const handlers = sseState.eventHandlers.get(eventType);
  if (handlers) {
    const index = handlers.indexOf(callback);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}

/**
 * 获取 SSE 连接状态
 */
export function getSSEStatus(): SSEStatus {
  return sseState.status;
}

/**
 * 页面卸载时自动断开连接
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    disconnectSSE();
  });
}
