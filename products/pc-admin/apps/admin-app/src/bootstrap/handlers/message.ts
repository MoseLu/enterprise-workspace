/**
 * 消息处理器模块
 * 负责管理 BtcMessage 的显示、徽章创建和生命周期管理
 */
;

import { BtcMessage } from '@btc/shared-components';
import type { MessageHandler } from 'element-plus';
import { useI18n } from '@btc/shared-core';
import { messageManager } from '../../utils/message-manager';

// 扩展消息实例类型
export type ExtendedMessageInstance = MessageHandler & {
  messageContainer?: HTMLElement | null;
  badgeApp?: any | null;
  badgeElement?: HTMLElement | null;
  badgeResizeObserver?: ResizeObserver | null;
  badgeMutationObserver?: MutationObserver | null;
  badgePositionObserver?: MutationObserver | null;
  badgePositionInterval?: number | null;
  badgeBodyMutationObserver?: MutationObserver | null;
  messageId?: string;
};

// 消息实例ID计数器
let messageInstanceCounter = 0;

// 全局消息观察器，统一管理所有消息的创建
let globalMessageObserver: MutationObserver | null = null;
const pendingMessages = new Map<string, { messageInstance: any, message: string, badgeCount?: number, messageId: string }>();

/**
 * 初始化全局消息观察器
 */
export const initGlobalMessageObserver = () => {
  if (globalMessageObserver) {
    return; // 已经初始化
  }

  globalMessageObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;

            // 检查是否是消息容器或其子元素
            if (element.classList.contains('el-message') || element.querySelector('.el-message')) {
              const messageElement = element.classList.contains('el-message') ? element : element.querySelector('.el-message') as HTMLElement;

              if (messageElement && !messageElement.getAttribute('data-message-id')) {
                // 查找匹配的待处理消息
                const messageContent = messageElement.querySelector('.el-message__content');
                if (messageContent) {
                  const messageText = messageContent.textContent?.trim();

                  // 遍历待处理消息，找到匹配的（优先匹配最新的消息）
                  const pendingEntries = Array.from(pendingMessages.entries()).reverse(); // 从最新的开始匹配

                  for (const [key, pending] of pendingEntries) {
                    if (pending.message === messageText) {
                      // 标记容器
                      messageElement.setAttribute('data-message-id', pending.messageId);
                      (pending.messageInstance as ExtendedMessageInstance).messageContainer = messageElement;

                      // 创建徽章（只有当badgeCount大于1时才创建，单条消息不显示徽章）
                      // 注意：这里不创建徽章，因为单条消息不需要徽章
                      // 徽章会在后续的 updateBadge 调用中创建

                      // 从待处理列表中移除
                      pendingMessages.delete(key);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  // 开始观察
  globalMessageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
};

/**
 * 为消息创建徽章
 */
export const createBadgeForMessage = (messageInstance: any, badgeCount: number, messageElement: HTMLElement) => {
  console.info('[createBadgeForMessage] Called with:', { messageInstance, badgeCount, messageElement });
  const extendedInstance = messageInstance as ExtendedMessageInstance;

  if (extendedInstance.badgeElement) {
    // 如果徽章已经存在，直接更新数字
    console.info('[createBadgeForMessage] Badge already exists, updating count');
    extendedInstance.badgeElement.textContent = badgeCount.toString();
    return;
  }

  // 创建徽章容器
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'btc-message-badge-container';
  badgeContainer.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    z-index: 2000;
    pointer-events: none;
  `;

  // 创建徽章元素
  const badgeElement = document.createElement('div');
  badgeElement.className = 'btc-message-badge';
  badgeElement.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 6px;
    background: #f56c6c;
    color: white;
    border-radius: 9px;
    font-size: 12px;
    font-weight: bold;
    line-height: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
  `;

  badgeElement.textContent = badgeCount.toString();
  badgeContainer.appendChild(badgeElement);

  // 将徽章添加到消息容器
  messageElement.style.position = 'relative';
  messageElement.appendChild(badgeContainer);

  console.info('[createBadgeForMessage] Badge created and added to message element:', {
    badgeContainer,
    badgeElement,
    messageElement
  });

  // 保存引用
  extendedInstance.badgeElement = badgeElement;
  extendedInstance.badgeApp = { _instance: { props: { count: badgeCount } } };

  // 设置徽章位置观察器
  setupBadgePositionObserver(extendedInstance, messageElement);
};

/**
 * 设置徽章位置观察器
 */
export const setupBadgePositionObserver = (extendedInstance: ExtendedMessageInstance, messageElement: HTMLElement) => {
  if (!extendedInstance.badgeElement) return;

  // 监听消息元素的位置变化
  const positionObserver = new ResizeObserver(() => {
    updateBadgePosition(extendedInstance, messageElement);
  });

  positionObserver.observe(messageElement);
  extendedInstance.badgeResizeObserver = positionObserver;

  // 监听DOM结构变化
  const mutationObserver = new MutationObserver(() => {
    updateBadgePosition(extendedInstance, messageElement);
  });

  mutationObserver.observe(messageElement, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  extendedInstance.badgeMutationObserver = mutationObserver;

  // 初始位置更新
  updateBadgePosition(extendedInstance, messageElement);
};

/**
 * 更新徽章位置
 */
export const updateBadgePosition = (extendedInstance: ExtendedMessageInstance, _messageElement: HTMLElement) => {
  if (!extendedInstance.badgeElement) return;

  const badgeContainer = extendedInstance.badgeElement.parentElement;

  if (badgeContainer) {
    badgeContainer.style.top = '-8px';
    badgeContainer.style.right = '-8px';
  }
};

/**
 * 处理消息显示
 */
export const handleMessage = (type: 'success' | 'error' | 'warning' | 'info', message: string, _duration?: number, badgeCount?: number) => {
  // 生成消息ID
  const messageId = `message-${Date.now()}-${++messageInstanceCounter}`;

  // 使用 BtcMessage 弹出消息，设置合理的显示时间
  const messageInstance = BtcMessage[type](message, {
    duration: 0, // 设置为0，完全禁用自动关闭
    showClose: false, // 不显示关闭按钮
    dangerouslyUseHTMLString: false // 确保不会因为HTML内容导致问题
  });
  (messageInstance as ExtendedMessageInstance).messageId = messageId;

  // 尝试阻止消息自动关闭
  try {
    // 如果消息实例有close方法，我们重写它以防止意外关闭
    if (messageInstance && typeof messageInstance.close === 'function') {
      const originalClose = messageInstance.close;
      messageInstance.close = function() {
        // 只有在生命周期管理器允许时才真正关闭
        return originalClose.call(this);
      };
    }
  } catch (error) {
    const { t } = useI18n();
    console.warn(t('common.error.override_message_close_failed'), error);
  }

  // 将消息添加到待处理列表
  const pendingKey = `${type}-${messageId}`;
  pendingMessages.set(pendingKey, {
    messageInstance,
    message,
    badgeCount,
    messageId
  });

  return messageInstance;
};

/**
 * 更新徽章数字
 */
export const updateBadge = (messageInstance: any, badgeCount: number) => {
  const extendedInstance = messageInstance as ExtendedMessageInstance;

  // 如果徽章不存在，先创建徽章
  if (!extendedInstance.badgeElement && extendedInstance.messageContainer && badgeCount > 1) {
    createBadgeForMessage(messageInstance, badgeCount, extendedInstance.messageContainer);
    return;
  }

  // 如果徽章存在，直接更新数字
  if (extendedInstance.badgeElement) {
    extendedInstance.badgeElement.textContent = badgeCount.toString();
  }

  // 如果存在Vue组件实例，也更新它
  if (extendedInstance.badgeApp) {
    try {
      const componentInstance = extendedInstance.badgeApp._instance;
      if (componentInstance && componentInstance.props) {
        componentInstance.props.count = badgeCount;
      }
    } catch (_error) {
      // 如果Vue组件更新失败，忽略错误，因为我们已经有DOM更新了
    }
  }
};

/**
 * 清理徽章
 */
export const cleanupBadge = (messageInstance: any) => {
  const extendedInstance = messageInstance as ExtendedMessageInstance;

  // 清理观察器
  if (extendedInstance.badgeResizeObserver) {
    extendedInstance.badgeResizeObserver.disconnect();
    extendedInstance.badgeResizeObserver = null;
  }

  if (extendedInstance.badgeMutationObserver) {
    extendedInstance.badgeMutationObserver.disconnect();
    extendedInstance.badgeMutationObserver = null;
  }

  if (extendedInstance.badgePositionObserver) {
    extendedInstance.badgePositionObserver.disconnect();
    extendedInstance.badgePositionObserver = null;
  }

  if (extendedInstance.badgePositionInterval) {
    clearInterval(extendedInstance.badgePositionInterval);
    extendedInstance.badgePositionInterval = null;
  }

  if (extendedInstance.badgeBodyMutationObserver) {
    extendedInstance.badgeBodyMutationObserver.disconnect();
    extendedInstance.badgeBodyMutationObserver = null;
  }

  // 移除徽章DOM元素
  if (extendedInstance.badgeElement) {
    const badgeContainer = extendedInstance.badgeElement.parentElement;
    if (badgeContainer) {
      badgeContainer.remove();
    }
    extendedInstance.badgeElement = null;
  }

  // 清理引用
  extendedInstance.badgeApp = null;
  extendedInstance.messageContainer = null;
};

/**
 * 创建消息处理器
 */
export const createMessageHandler = () => {
  // 初始化全局消息观察器
  initGlobalMessageObserver();

  // 创建消息处理器
  const messageHandler = {
    success: (message: string, _duration?: number, badgeCount?: number) => {
      return handleMessage('success', message, _duration, badgeCount);
    },
    error: (message: string, _duration?: number, badgeCount?: number) => {
      return handleMessage('error', message, _duration, badgeCount);
    },
    warning: (message: string, _duration?: number, badgeCount?: number) => {
      return handleMessage('warning', message, _duration, badgeCount);
    },
    info: (message: string, _duration?: number, badgeCount?: number) => {
      return handleMessage('info', message, _duration, badgeCount);
    },
    updateBadge,
    cleanupBadge
  };

  return messageHandler;
};

/**
 * 初始化消息管理器
 */
export const initMessageManager = (messageHandler: any) => {
  messageManager.setDisplayHandler({
    ...messageHandler,
    // 更新徽章数字的方法
    updateBadge: (messageInstance: any, badgeCount: number) => {
      updateBadge(messageInstance, badgeCount);
    }
  });

  // 生命周期管理器会在 setDisplayHandler 中自动创建
  // 不需要额外设置
};
