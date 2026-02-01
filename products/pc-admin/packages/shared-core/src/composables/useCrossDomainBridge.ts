/**
 * 跨子域通信桥 Composable
 * 用于实现跨子域标签页之间的消息通信（如登出状态同步）
 *
 * 核心机制：
 * 1. 通过主域的隐藏 iframe (bridge.html) 作为通信枢纽
 * 2. 使用 Broadcast Channel 实现同源标签页通信
 * 3. 通过 postMessage 实现跨域通信
 */
;

import { ref, onUnmounted, type Ref } from 'vue';
import { logger } from '../utils/logger/index';

/**
 * 通信桥消息类型
 */
export interface BridgeMessage {
  type: string; // 'logout' | 'custom-event' | ...
  payload?: any;
  origin?: string; // 消息来源
  timestamp?: number;
}

/**
 * 通信桥配置选项
 */
export interface UseCrossDomainBridgeOptions {
  /**
   * 通信桥 URL，默认从环境配置获取
   * 生产环境：https://bellis.com.cn/bridge.html
   * 开发环境：http://localhost:端口/bridge.html
   */
  bridgeUrl?: string;

  /**
   * 消息回调函数
   */
  onMessage?: (message: BridgeMessage) => void;

  /**
   * 是否自动创建 iframe（默认 true）
   * 如果为 false，需要手动创建 iframe 并传入 iframeId
   */
  autoCreateIframe?: boolean;

  /**
   * 手动创建的 iframe ID（当 autoCreateIframe 为 false 时使用）
   */
  iframeId?: string;

  /**
   * 是否启用（默认根据环境判断：生产环境启用）
   */
  enabled?: boolean;
}

/**
 * 通信桥返回接口
 */
export interface UseCrossDomainBridgeReturn {
  /**
   * 发送消息到通信桥
   */
  sendMessage: (type: string, payload?: any) => void;

  /**
   * 订阅指定类型的消息
   * @returns 取消订阅的函数
   */
  subscribe: (type: string, handler: (payload?: any, origin?: string) => void) => () => void;

  /**
   * 通信桥是否就绪
   */
  isReady: Ref<boolean>;

  /**
   * 销毁通信桥（清理资源）
   */
  destroy: () => void;
}

// 消息队列最大大小，防止内存溢出
const MAX_MESSAGE_QUEUE_SIZE = 100;

// 全局单例：避免多个实例创建多个 iframe
let globalBridgeInstance: {
  iframe: HTMLIFrameElement | null;
  isReady: Ref<boolean>;
  messageQueue: Array<{ type: string; payload?: any }>;
  subscribers: Map<string, Set<(payload?: any, origin?: string) => void>>;
  messageHandler: ((e: MessageEvent) => void) | null;
  broadcastChannel: BroadcastChannel | null; // 直接 Broadcast Channel 监听（用于同源环境）
  retryCount: number; // 重试次数
  maxRetries: number; // 最大重试次数
} | null = null;

/**
 * 获取 bridge.html 的 URL
 * 关键：所有子域名都使用主域的 bridge.html（统一管理，避免重复）
 */
function getBridgeUrl(): string {
  // 生产环境
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 关键：所有子域名都使用主域的 bridge.html
    // bridge.html 是跨域通信的桥梁，应该统一在主域管理
    if (hostname.includes('bellis.com.cn')) {
      // 无论是主域还是子域，都使用主域的 bridge.html
      const protocol = window.location.protocol;
      return `${protocol}//bellis.com.cn`;
    }

    // 开发环境：使用当前 origin
    return window.location.origin;
  }

  // 默认值
  return 'https://bellis.com.cn';
}

/**
 * 检查是否应该启用通信桥
 */
function shouldEnableBridge(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname;

  // 生产环境：子域名或主域都启用
  if (hostname.includes('bellis.com.cn')) {
    return true;
  }

  // 开发环境：默认启用（可选，可根据需要调整）
  return true;
}

/**
 * 跨子域通信桥 Composable
 */
export function useCrossDomainBridge(
  options: UseCrossDomainBridgeOptions = {}
): UseCrossDomainBridgeReturn {
  const {
    bridgeUrl,
    onMessage,
    autoCreateIframe = true,
    iframeId = 'btc-auth-bridge',
    enabled = shouldEnableBridge()
  } = options;

  // 如果未启用，返回空实现
  if (!enabled) {
    return {
      sendMessage: () => {},
      subscribe: () => () => {},
      isReady: ref(false),
      destroy: () => {}
    };
  }

  // 使用全局单例或创建新实例
  if (!globalBridgeInstance) {
    globalBridgeInstance = {
      iframe: null,
      isReady: ref(false),
      messageQueue: [],
      subscribers: new Map(),
      messageHandler: null,
      broadcastChannel: null,
      retryCount: 0,
      maxRetries: 3 // 最多重试 3 次
    };

    // 关键：在开发环境或同源环境中，直接使用 Broadcast Channel（不依赖 iframe）
    // 这样可以确保消息能够立即传递，不等待 iframe 加载
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const directChannel = new BroadcastChannel('bellis-auth-channel');
        globalBridgeInstance.broadcastChannel = directChannel;

        // 直接监听 Broadcast Channel 消息（支持 logout 和 login）
        directChannel.onmessage = (e) => {
          if (e.data && (e.data.type === 'logout' || e.data.type === 'login')) {
            const message: BridgeMessage = {
              type: e.data.type,
              payload: e.data.payload,
              origin: e.data.origin,
              timestamp: e.data.timestamp
            };

            // 调用全局回调
            if (onMessage) {
              onMessage(message);
            }

            // 通知订阅者
            const handlers = globalBridgeInstance!.subscribers.get(message.type);
            if (handlers) {
              handlers.forEach(handler => {
                try {
                  handler(message.payload, message.origin);
                } catch (error) {
                  logger.error(`[useCrossDomainBridge] Error in subscriber for ${message.type}:`, error);
                }
              });
            }
          }
        };
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[useCrossDomainBridge] Failed to create direct BroadcastChannel:', error);
        }
      }
    }
  }

  const instance = globalBridgeInstance;
  const isReady = instance.isReady;
  const subscribers = instance.subscribers;

  // 构建通信桥 URL
  // 关键修复：每个子域名都有自己的 bridge.html，应该使用当前域名的 URL
  const finalBridgeUrl = bridgeUrl || `${getBridgeUrl()}/bridge.html`;

  // 关键：立即创建 iframe，确保尽早加载
  // 这样在发送消息时，iframe 可能已经就绪
  if (autoCreateIframe) {
    // 使用 setTimeout 确保在 DOM 准备好后再创建 iframe
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          getOrCreateIframe();
        });
      } else {
        getOrCreateIframe();
      }
    }
  }

  /**
   * 创建或获取 iframe
   */
  function getOrCreateIframe(): HTMLIFrameElement | null {
    if (instance.iframe) {
      return instance.iframe;
    }

    // 优先尝试获取已存在的 iframe（可能是在 index.html 中手动创建的）
    const existingIframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (existingIframe) {
      instance.iframe = existingIframe;
      // 关键：更新已存在 iframe 的 src 为正确的 URL（开发环境使用当前 origin）
      // 注意：必须确保 src 指向主域的 bridge.html（生产环境）或当前域的 bridge.html（开发环境）
      const currentSrc = existingIframe.src === 'about:blank' ? '' : existingIframe.src;

      // 关键修复：检查 src 是否包含子域名（如 admin.bellis.com.cn）
      // 如果包含子域名，说明是旧的配置，需要重新设置为主域 URL
      // 或者，如果 src 不是主域的 bridge.html，也要强制设置
      const isSubdomainUrl = currentSrc.includes('.bellis.com.cn') &&
                              !currentSrc.includes('//bellis.com.cn') &&
                              currentSrc !== 'about:blank' &&
                              currentSrc !== '';

      // 关键：强制检查，确保 src 必须是主域的 bridge.html（生产环境）
      const mustBeMainDomain = typeof window !== 'undefined' &&
                                window.location.hostname.includes('bellis.com.cn') &&
                                window.location.hostname !== 'bellis.com.cn';

      const needsReset = currentSrc !== finalBridgeUrl ||
                         isSubdomainUrl ||
                         (mustBeMainDomain && !currentSrc.includes('bellis.com.cn/bridge.html'));

      // 如果 src 不正确，或者指向了错误的域（比如子域），重新设置
      if (needsReset) {
        // 强制设置为正确的 URL，确保使用主域的 bridge.html
        // 关键：直接设置为主域 URL，不使用相对路径或子域 URL
        existingIframe.src = finalBridgeUrl;
        // 重置就绪状态，等待新的加载完成
        isReady.value = false;
        // 重置重试计数
        instance.retryCount = 0;
      }
      setupIframeListeners();

      // 如果 iframe 已经加载完成，验证 src 是否正确
      if (existingIframe.contentWindow && existingIframe.contentDocument?.readyState === 'complete') {
        // 关键：验证 iframe 的 src 是否指向正确的 URL
        // 如果 src 不正确，重新设置并等待加载
        const currentSrc = existingIframe.src;

        // 关键修复：检查 src 是否包含子域名（如 admin.bellis.com.cn）
        // 如果包含子域名，说明是旧的配置，需要重新设置为主域 URL
        const isSubdomainUrl = currentSrc.includes('.bellis.com.cn') &&
                                !currentSrc.includes('//bellis.com.cn') &&
                                currentSrc !== 'about:blank' &&
                                currentSrc !== '';

        if ((currentSrc !== finalBridgeUrl && currentSrc !== 'about:blank') || isSubdomainUrl) {
          // src 不正确或者是子域 URL，重新设置为主域 URL
          if (import.meta.env.DEV) {
            console.warn('[useCrossDomainBridge] Iframe src mismatch, resetting:', {
              current: currentSrc,
              expected: finalBridgeUrl,
              isSubdomainUrl
            });
          }
          existingIframe.src = finalBridgeUrl;
          // 重置就绪状态，等待 onload 事件重新加载
          isReady.value = false;
          return existingIframe;
        }

        // src 正确，尝试发送注册消息（但可能仍然失败，如果页面加载错误）
        // 关键修复：使用 '*' 作为 targetOrigin，让浏览器自动匹配接收方的 origin
        // bridge.html 会验证消息来源，所以安全性不受影响
        try {
          // 尝试发送 postMessage，使用 '*' 作为 targetOrigin 避免 origin 不匹配错误
          existingIframe.contentWindow.postMessage(
            { type: 'register', timestamp: Date.now() },
            '*' // 使用 '*' 让浏览器自动匹配接收方的 origin
          );
          // 如果 postMessage 成功，标记为就绪
          isReady.value = true;
        } catch (error: any) {
          // postMessage 失败（使用 '*' 作为 targetOrigin 时通常不会失败，除非 iframe 未加载）
          const errorMsg = error?.message || String(error);

          if (import.meta.env.DEV) {
            console.warn('[useCrossDomainBridge] Failed to register with existing bridge:', {
              iframeSrc: existingIframe.src,
              error: errorMsg
            });
          }

          // 不标记为就绪，等待 onload 事件重新尝试
          isReady.value = false;
        }
      }

      return existingIframe;
    }

    if (!autoCreateIframe) {
      return null;
    }

    // 创建隐藏的 iframe
    const iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.src = finalBridgeUrl;
    iframe.style.display = 'none';
    iframe.style.border = 'none';
    iframe.setAttribute('title', 'Auth Bridge');
    iframe.setAttribute('aria-hidden', 'true');

    // 添加到 body
    document.body.appendChild(iframe);
    instance.iframe = iframe;

    setupIframeListeners();
    return iframe;
  }

  /**
   * 设置消息监听器（全局，不依赖于 iframe）
   */
  function setupMessageListener(): void {
    // 监听来自通信桥的消息（只设置一次）
    if (!instance.messageHandler) {
      instance.messageHandler = (e: MessageEvent) => {
        // 安全校验：仅接收来自通信桥的消息
        // 提取 bridge 的 origin
        let bridgeOrigin: string;
        try {
          const bridgeUrlObj = new URL(finalBridgeUrl);
          bridgeOrigin = `${bridgeUrlObj.protocol}//${bridgeUrlObj.host}`;
        } catch {
          // 如果 URL 解析失败，使用字符串替换作为回退
          bridgeOrigin = finalBridgeUrl.replace('/bridge.html', '').replace(/\/$/, '');
        }

        // 关键修复：使用 finalBridgeUrl 的实际 origin，每个子域名都有自己的 bridge.html

        // 检查 origin 是否匹配
        let originMatched = false;

        // 精确匹配
        if (e.origin === bridgeOrigin) {
          originMatched = true;
        }
        // 开发环境：允许 localhost 和 127.0.0.1
        else if (e.origin.startsWith('http://localhost') || e.origin.startsWith('http://127.0.0.1')) {
          originMatched = true;
        }
        // 开发环境：允许私有 IP 地址（10.x.x.x, 172.16-31.x.x, 192.168.x.x）
        else if (/^http:\/\/(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)(:\d+)?$/.test(e.origin)) {
          originMatched = true;
        }
        // 生产环境：允许主域和子域（bridge 在主域，但消息可能来自子域）
        else if (bridgeOrigin.includes('bellis.com.cn') && e.origin.includes('bellis.com.cn')) {
          originMatched = true;
        }

        if (!originMatched) {
          if (import.meta.env.DEV) {
            console.warn('[useCrossDomainBridge] Rejected message from origin:', e.origin, 'expected:', bridgeOrigin);
          }
          return;
        }

        // 处理 bridge-ready 消息
        if (e.data && e.data.type === 'bridge-ready') {
          isReady.value = true;
          return;
        }

        // 处理其他消息
        if (e.data && e.data.type) {
          const message: BridgeMessage = {
            type: e.data.type,
            payload: e.data.payload,
            origin: e.data.origin,
            timestamp: e.data.timestamp
          };

          // 调用全局回调
          if (onMessage) {
            onMessage(message);
          }

          // 通知订阅者
          const handlers = subscribers.get(message.type);
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(message.payload, message.origin);
              } catch (error) {
                logger.error(`[useCrossDomainBridge] Error in subscriber for ${message.type}:`, error);
              }
            });
          }
        }
      };

      window.addEventListener('message', instance.messageHandler);
    }
  }

  /**
   * 设置 iframe 监听器
   */
  function setupIframeListeners(): void {
    if (!instance.iframe) {
      return;
    }

    // 监听 iframe 加载完成
    instance.iframe.onload = () => {
      // 关键：在尝试 postMessage 之前，先验证 iframe 的 src 是否正确
      // 如果 src 包含子域名，强制重新设置为主域 URL
      if (instance.iframe) {
        const currentSrc = instance.iframe.src;

        // 跳过检查，如果 src 已经是正确的 URL（使用标准化比较）
        // 移除末尾斜杠和查询参数进行比较
        const normalizeUrl = (url: string) => {
          try {
            const urlObj = new URL(url);
            return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`.replace(/\/$/, '');
          } catch {
            return url.replace(/\/$/, '').split('?')[0];
          }
        };

        const normalizedCurrent = normalizeUrl(currentSrc);
        const normalizedExpected = normalizeUrl(finalBridgeUrl);

        if (normalizedCurrent === normalizedExpected || currentSrc === 'about:blank') {
          // src 正确，继续处理
        } else {
          // 检查是否是子域 URL（仅在生产环境）
          const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('bellis.com.cn');
          const isSubdomainUrl = isProduction &&
                                  currentSrc.includes('.bellis.com.cn') &&
                                  !currentSrc.includes('//bellis.com.cn') &&
                                  currentSrc !== 'about:blank' &&
                                  currentSrc !== '';

          if (isSubdomainUrl) {
            // src 包含子域名，强制重新设置为主域 URL
            if (import.meta.env.DEV) {
              console.warn('[useCrossDomainBridge] Iframe src contains subdomain, resetting to main domain:', {
                current: currentSrc,
                expected: finalBridgeUrl
              });
            }
            instance.iframe.src = finalBridgeUrl;
            isReady.value = false;
            return;
          }
          // 开发环境：如果 URL 不匹配但不是子域 URL，可能是其他原因（如查询参数），不重置
          // 避免无限循环
        }
      }

      // 验证 iframe 是否加载成功（检查 contentWindow 的 origin）
      try {
        if (instance.iframe?.contentWindow) {
          // 提取 bridge 的 origin（用于 postMessage 的 targetOrigin）
          let bridgeOrigin: string;
          try {
            const bridgeUrlObj = new URL(finalBridgeUrl);
            bridgeOrigin = `${bridgeUrlObj.protocol}//${bridgeUrlObj.host}`;
          } catch {
            // 如果 URL 解析失败，使用字符串替换作为回退
            bridgeOrigin = finalBridgeUrl.replace('/bridge.html', '').replace(/\/$/, '');
          }

          try {
            // 关键：先尝试使用 '*' 作为 targetOrigin，避免 origin 不匹配错误
            // bridge.html 会验证消息来源，所以安全性不受影响
            instance.iframe.contentWindow.postMessage(
              { type: 'register', timestamp: Date.now() },
              '*' // 使用 '*' 让浏览器自动匹配接收方的 origin
            );
            // 如果 postMessage 成功，标记为就绪
            isReady.value = true;
          } catch (error: any) {
            // postMessage 失败，说明 origin 不匹配
            // 这可能是因为 iframe 加载失败（404），导致加载了错误页面（如 index.html 的 fallback）
            const errorMsg = error?.message || String(error);

            // 检查是否是 origin 不匹配的错误
            const isOriginMismatch = errorMsg.includes('target origin') || errorMsg.includes('origin');

            if (import.meta.env.DEV || isOriginMismatch) {
              console.warn('[useCrossDomainBridge] Failed to postMessage to bridge (origin mismatch):', error);
              console.warn('[useCrossDomainBridge] Expected origin:', bridgeOrigin);
              console.warn('[useCrossDomainBridge] Iframe src:', instance.iframe.src);
              console.warn('[useCrossDomainBridge] Error message:', errorMsg);
            }

            // 关键：如果是 origin 不匹配，说明 iframe 加载了错误的页面（可能是 404 fallback 到 index.html）
            // 即使 src 看起来正确，也要强制重新加载，因为实际加载的页面可能不对
            if (isOriginMismatch) {
              // 检查重试次数，避免无限重试
              if (instance.retryCount >= instance.maxRetries) {
                if (import.meta.env.DEV) {
                  logger.error('[useCrossDomainBridge] Max retries reached, giving up on iframe bridge. Will use BroadcastChannel only.');
                }
                // 标记为就绪（即使失败），避免阻塞应用
                isReady.value = true;
                return;
              }

              instance.retryCount++;

              // 强制重新设置 iframe src，确保加载正确的 bridge.html
              // 使用时间戳参数避免浏览器缓存
              // 关键：确保使用主域的 URL，而不是子域的 URL
              // 关键：直接使用主域 URL，不依赖任何相对路径或子域 URL
              const reloadUrl = `${finalBridgeUrl}${finalBridgeUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
              if (import.meta.env.DEV) {
                console.info('[useCrossDomainBridge] Origin mismatch detected, forcing iframe reload (attempt ' + instance.retryCount + '/' + instance.maxRetries + '):', reloadUrl);
              }
              // 关键：先移除 iframe，然后重新创建，确保清除所有缓存和状态
              if (instance.iframe.parentNode) {
                instance.iframe.parentNode.removeChild(instance.iframe);
              }
              // 重新创建 iframe，确保 src 直接指向主域 URL
              const newIframe = document.createElement('iframe');
              newIframe.id = iframeId;
              // 关键：直接设置为主域 URL，确保 origin 正确
              newIframe.src = reloadUrl;
              newIframe.style.display = 'none';
              newIframe.style.width = '0';
              newIframe.style.height = '0';
              newIframe.style.border = 'none';
              newIframe.setAttribute('title', 'Auth Bridge');
              newIframe.setAttribute('aria-hidden', 'true');
              document.body.appendChild(newIframe);
              instance.iframe = newIframe;
              setupIframeListeners();
              // 重置就绪状态，等待重新加载
              isReady.value = false;
              return;
            }

            // 如果 iframe src 不正确，重新设置（可能是之前设置错误）
            if (instance.iframe.src !== finalBridgeUrl && !instance.iframe.src.includes(finalBridgeUrl)) {
              if (import.meta.env.DEV) {
                console.info('[useCrossDomainBridge] Resetting iframe src to correct URL');
              }
              instance.iframe.src = finalBridgeUrl;
              // 不标记为就绪，等待重新加载
              isReady.value = false;
              return;
            }

            // src 正确但 postMessage 失败，可能是网络问题或 bridge.html 不存在
            // 不标记为就绪，但可以使用 BroadcastChannel（如果可用）
            // 在生产环境中，如果 bridge.html 不存在，这是正常的（需要部署）
            if (import.meta.env.DEV) {
              console.warn('[useCrossDomainBridge] Iframe loaded but postMessage failed. Bridge.html may not exist or network error.');
            }
            isReady.value = false;
            return;
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[useCrossDomainBridge] Failed to register with bridge:', error);
        }
        // 不标记为就绪
        return;
      }

      // 发送队列中的消息
      while (instance.messageQueue.length > 0) {
        const queued = instance.messageQueue.shift();
        if (queued) {
          sendMessageInternal(queued.type, queued.payload);
        }
      }
    };

    // 监听 iframe 加载错误
    instance.iframe.onerror = () => {
      const errorMsg = `[useCrossDomainBridge] Iframe failed to load: ${finalBridgeUrl}`;
      if (import.meta.env.DEV) {
        logger.error(errorMsg);
        logger.error('[useCrossDomainBridge] This usually means bridge.html does not exist or is not accessible.');
        logger.error('[useCrossDomainBridge] Please check:');
        logger.error('  1. Is bridge.html deployed to the server?');
        logger.error('  2. Is Nginx configured correctly?');
        logger.error('  3. Are file permissions correct?');
        logger.error('  4. Try accessing the URL directly in browser:', finalBridgeUrl);
      } else {
        // 生产环境也记录错误，但使用 console.warn 避免过于显眼
        console.warn(errorMsg);
      }
      // iframe 加载失败时，仍然可以使用 BroadcastChannel（如果可用）
      // 不标记为就绪，但也不阻止 BroadcastChannel 的使用
    };
  }

  /**
   * 内部发送消息实现
   */
  function sendMessageInternal(type: string, payload?: any): void {
    // 关键：如果直接 Broadcast Channel 可用，优先使用它（更快，不依赖 iframe）
    if (instance.broadcastChannel && (type === 'logout' || type === 'login')) {
      try {
        const message = {
          type,
          payload,
          origin: window.location.origin,
          timestamp: Date.now()
        };
        instance.broadcastChannel.postMessage(message);
        // 直接 Broadcast Channel 发送成功，也通过 iframe 发送（确保兼容性）
      } catch (error) {
        logger.error(`[useCrossDomainBridge] Failed to send ${type} message via BroadcastChannel:`, error);
      }
    }

    // 关键：跨子域通信必须通过 iframe + postMessage
    // BroadcastChannel 只能在同源下工作，不同子域之间无法通过 BroadcastChannel 通信
    // 所以即使 BroadcastChannel 发送成功，也要通过 iframe 发送，确保跨子域通信
    if (!instance.iframe || !instance.iframe.contentWindow) {
      // iframe 不存在，尝试创建
      if (autoCreateIframe) {
        getOrCreateIframe();
      }
      // iframe 不存在或未创建，加入队列
      if (!instance.broadcastChannel || (type !== 'logout' && type !== 'login')) {
        // 检查队列大小，防止内存溢出
        if (instance.messageQueue.length >= MAX_MESSAGE_QUEUE_SIZE) {
          instance.messageQueue.shift(); // 移除最旧的消息
        }
        instance.messageQueue.push({ type, payload });
      }
      return;
    }

    // 关键：即使 isReady 为 false，也尝试发送消息
    // 因为 iframe 可能已经加载完成，只是还没有收到注册成功的确认
    // 如果 postMessage 失败，消息会被加入队列，等待 iframe 就绪后重试
    if (!isReady.value) {
      // iframe 未就绪，加入队列（如果 BroadcastChannel 不可用）
      if (!instance.broadcastChannel || (type !== 'logout' && type !== 'login')) {
        // 检查队列大小，防止内存溢出
        if (instance.messageQueue.length >= MAX_MESSAGE_QUEUE_SIZE) {
          instance.messageQueue.shift(); // 移除最旧的消息
        }
        instance.messageQueue.push({ type, payload });
      }
      // 关键：即使未就绪，也尝试发送（可能 iframe 已经加载完成，只是还没注册）
      // 如果失败，消息已经在队列中，等待就绪后重试
    }

    try {
      // 关键：验证 iframe 是否加载成功
      // 如果 iframe 加载失败（404），contentWindow 可能指向错误页面，导致 origin 不匹配
      // 在这种情况下，postMessage 会抛出错误，我们捕获它并静默处理
      // 关键修复：使用 '*' 作为 targetOrigin，让浏览器自动匹配接收方的 origin
      // bridge.html 会验证消息来源，所以安全性不受影响
      instance.iframe.contentWindow.postMessage(
        { type, payload, timestamp: Date.now() },
        '*' // 使用 '*' 让浏览器自动匹配接收方的 origin
      );
    } catch (error: any) {
      // postMessage 失败，可能是 origin 不匹配（iframe 加载失败）
      const errorMsg = error?.message || String(error);
      const isOriginMismatch = errorMsg.includes('target origin') || errorMsg.includes('origin');

      if (import.meta.env.DEV || isOriginMismatch) {
        // 重新计算 bridgeOrigin（用于错误日志）
        // 关键修复：使用 finalBridgeUrl 的实际 origin，每个子域名都有自己的 bridge.html
        let bridgeOriginForLog: string;
        try {
          const bridgeUrlObj = new URL(finalBridgeUrl);
          bridgeOriginForLog = `${bridgeUrlObj.protocol}//${bridgeUrlObj.host}`;
        } catch {
          bridgeOriginForLog = finalBridgeUrl.replace('/bridge.html', '').replace(/\/$/, '');
        }

        if (isOriginMismatch) {
          console.warn('[useCrossDomainBridge] Iframe origin mismatch (bridge.html may not be loaded):', {
            expected: bridgeOriginForLog,
            iframeSrc: instance.iframe?.src,
            error: errorMsg
          });

          // 关键：如果是 origin 不匹配，说明 iframe 加载了错误的页面
          // 检查重试次数，避免无限重试
          if (instance.retryCount >= instance.maxRetries) {
            if (import.meta.env.DEV) {
              logger.error('[useCrossDomainBridge] Max retries reached in sendMessage, giving up on iframe bridge.');
            }
            // 标记为就绪（即使失败），避免阻塞应用
            isReady.value = true;
            return;
          }

          instance.retryCount++;

          // 强制重新加载 iframe，并重置就绪状态
          if (instance.iframe) {
            // 关键：先检查 iframe src 是否包含子域名
            const currentSrc = instance.iframe.src;
            const isSubdomainUrl = currentSrc.includes('.bellis.com.cn') &&
                                    !currentSrc.includes('//bellis.com.cn') &&
                                    currentSrc !== 'about:blank' &&
                                    currentSrc !== '';

            // 如果 src 包含子域名，强制设置为主域 URL
            if (isSubdomainUrl) {
              if (import.meta.env.DEV) {
                console.info('[useCrossDomainBridge] Iframe src contains subdomain, resetting to main domain:', {
                  current: currentSrc,
                  expected: finalBridgeUrl
                });
              }
              instance.iframe.src = finalBridgeUrl;
            } else {
              const reloadUrl = `${finalBridgeUrl}${finalBridgeUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
              if (import.meta.env.DEV) {
                console.info('[useCrossDomainBridge] Origin mismatch in sendMessage, forcing iframe reload (attempt ' + instance.retryCount + '/' + instance.maxRetries + '):', reloadUrl);
              }
              instance.iframe.src = reloadUrl;
            }
            isReady.value = false;
          }
        } else {
          if (import.meta.env.DEV) {
            console.warn('[useCrossDomainBridge] Failed to send message via iframe:', error);
          }
        }
      }

      // 如果 BroadcastChannel 不可用，将消息加入队列等待重试
      if (!instance.broadcastChannel || (type !== 'logout' && type !== 'login')) {
        // 检查队列大小，防止内存溢出
        if (instance.messageQueue.length >= MAX_MESSAGE_QUEUE_SIZE) {
          instance.messageQueue.shift(); // 移除最旧的消息
        }
        instance.messageQueue.push({ type, payload });
      }
    }
  }

  /**
   * 发送消息到通信桥
   */
  function sendMessage(type: string, payload?: any): void {
    // 确保 iframe 已创建
    if (!instance.iframe) {
      getOrCreateIframe();
    }

    if (isReady.value) {
      sendMessageInternal(type, payload);
    } else {
      // 未就绪，加入队列
      // 检查队列大小，防止内存溢出
      if (instance.messageQueue.length >= MAX_MESSAGE_QUEUE_SIZE) {
        instance.messageQueue.shift(); // 移除最旧的消息
      }
      instance.messageQueue.push({ type, payload });
    }
  }

  /**
   * 订阅指定类型的消息
   */
  function subscribe(
    type: string,
    handler: (payload?: any, origin?: string) => void
  ): () => void {
    if (!subscribers.has(type)) {
      subscribers.set(type, new Set());
    }
    subscribers.get(type)!.add(handler);

    // 返回取消订阅函数
    return () => {
      const handlers = subscribers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          subscribers.delete(type);
        }
      }
    };
  }

  /**
   * 销毁通信桥
   */
  function destroy(): void {
    // 清理消息监听器
    if (instance.messageHandler) {
      window.removeEventListener('message', instance.messageHandler);
      instance.messageHandler = null;
    }

    // 清理直接 Broadcast Channel
    if (instance.broadcastChannel) {
      try {
        instance.broadcastChannel.close();
      } catch (error) {
        // 忽略错误
      }
      instance.broadcastChannel = null;
    }

    // 清理订阅者
    subscribers.clear();

    // 清理 iframe（仅当自动创建时）
    if (autoCreateIframe && instance.iframe && instance.iframe.parentNode) {
      instance.iframe.parentNode.removeChild(instance.iframe);
    }

    // 重置全局实例（如果当前是唯一使用者）
    if (subscribers.size === 0) {
      instance.iframe = null;
      instance.isReady.value = false;
      instance.messageQueue = [];
      instance.broadcastChannel = null;
      globalBridgeInstance = null;
    }
  }

  // 组件卸载时清理
  onUnmounted(() => {
    // 注意：不在这里调用 destroy，因为可能有其他组件在使用
    // 只在真正需要时手动调用 destroy
  });

  // 关键：先设置消息监听器（不依赖于 iframe 是否加载）
  setupMessageListener();

  // 初始化：创建 iframe
  if (autoCreateIframe) {
    getOrCreateIframe();
  }

  // 暴露全局函数，供非组件上下文使用（如 createLogoutFunction）
  if (typeof window !== 'undefined') {
    (window as any).__APP_BRIDGE_SEND_MESSAGE__ = (type: string, payload?: any) => {
      sendMessage(type, payload);
    };
  }

  return {
    sendMessage,
    subscribe,
    isReady,
    destroy
  };
}

/**
 * 独立工具函数：发送登录消息（不依赖 Vue composable）
 * 用于在非组件上下文中发送登录消息（如 HTTP 拦截器）
 */
export function broadcastLoginMessage(): void {
  try {
    // 方法1: 使用 BroadcastChannel（同源标签页通信）
    // 关键修复：统一使用 'bellis-auth-channel'，与 useCrossDomainBridge 保持一致
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('bellis-auth-channel');
        channel.postMessage({
          type: 'login',
          payload: { timestamp: Date.now() },
          origin: window.location.origin
        });
        channel.close();
      } catch (error) {
        // BroadcastChannel 可能不可用，继续尝试其他方法
      }
    }    // 方法2: 使用 localStorage 事件（同源标签页通信）
    try {
      const event = new StorageEvent('storage', {
        key: 'btc-login-event',
        newValue: JSON.stringify({ type: 'login', timestamp: Date.now() }),
        url: window.location.href,
        storageArea: localStorage
      });
      window.dispatchEvent(event);
    } catch (error) {
      // localStorage 事件可能不可用
    }    // 方法3: 尝试通过已存在的 iframe（如果存在）
    try {
      const iframe = document.getElementById('btc-auth-bridge') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: 'login', payload: { timestamp: Date.now() }, timestamp: Date.now() },
          '*'
        );
      }
    } catch (error) {
      // iframe 可能不存在或未加载完成
    }
  } catch (error) {
    // 静默失败，不影响登录流程
    if (import.meta.env.DEV) {
      console.warn('[broadcastLoginMessage] Failed to broadcast login message:', error);
    }
  }
}