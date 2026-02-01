/**
 * 通知处理器模块
 * 负责管理 BtcNotification 的显示、徽章创建和生命周期管理
 */

import { BtcNotification } from '@btc/shared-components';
import { ElNotification } from 'element-plus';
import { notificationManager } from '../../utils/notification-manager';

// 扩展通知实例类型
export interface ExtendedNotificationInstance {
  notificationContainer?: HTMLElement | null;
  badgeApp?: any | null;
  badgeElement?: HTMLElement | null;
  badgeResizeObserver?: ResizeObserver | null;
  badgeMutationObserver?: MutationObserver | null;
  badgePositionObserver?: MutationObserver | null;
  badgePositionInterval?: number | null;
  badgeBodyMutationObserver?: MutationObserver | null;
  notificationId?: string;
}

// 通知实例ID计数器
let notificationInstanceCounter = 0;

// 全局通知观察器，统一管理所有通知的创建
let globalNotificationObserver: MutationObserver | null = null;
const pendingNotifications = new Map<string, { notificationInstance: any, title: string, message: string, badgeCount?: number, notificationId: string }>();

/**
 * 初始化全局通知观察器
 */
export const initGlobalNotificationObserver = () => {
  if (globalNotificationObserver) {
    return; // 已经初始化
  }

  globalNotificationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            const element = node as HTMLElement;

            // 检查是否是通知容器或其子元素
            if (element.classList.contains('el-notification') || element.querySelector('.el-notification')) {
              const notificationElement = element.classList.contains('el-notification') ? element : element.querySelector('.el-notification') as HTMLElement;

              if (notificationElement && !notificationElement.getAttribute('data-notification-id')) {
                // 查找匹配的待处理通知
                const notificationContent = notificationElement.querySelector('.el-notification__content');
                const notificationTitle = notificationElement.querySelector('.el-notification__title');

                if (notificationContent && notificationTitle) {
                  const notificationText = notificationContent.textContent?.trim();
                  const titleText = notificationTitle.textContent?.trim();

                  // 遍历待处理通知，找到匹配的（优先匹配最新的通知）
                  const pendingEntries = Array.from(pendingNotifications.entries()).reverse(); // 从最新的开始匹配

                  for (const [key, pending] of pendingEntries) {
                    if (pending.message === notificationText && pending.title === titleText) {
                      // 标记容器
                      notificationElement.setAttribute('data-notification-id', pending.notificationId);
                      (pending.notificationInstance as ExtendedNotificationInstance).notificationContainer = notificationElement;

                      // 创建徽章（只有当badgeCount大于1时才创建，单条通知不显示徽章）
                      if (pending.badgeCount && pending.badgeCount > 1) {
                        createBadgeForNotification(pending.notificationInstance, pending.badgeCount, notificationElement);
                      }

                      // 从待处理列表中移除
                      pendingNotifications.delete(key);
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
  globalNotificationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
};

/**
 * 为通知创建徽章
 */
export const createBadgeForNotification = (notificationInstance: any, badgeCount: number, notificationElement: HTMLElement) => {
  const extendedInstance = notificationInstance as ExtendedNotificationInstance;

  if (extendedInstance.badgeApp) {
    return; // 徽章已经存在
  }

  // 创建徽章容器
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'btc-notification-badge-container';
  badgeContainer.style.cssText = `
    position: absolute;
    top: -8px;
    right: -8px;
    z-index: 2000;
    pointer-events: none;
  `;

  // 创建徽章元素
  const badgeElement = document.createElement('div');
  badgeElement.className = 'btc-notification-badge';
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

  // 将徽章添加到通知容器
  notificationElement.style.position = 'relative';
  notificationElement.appendChild(badgeContainer);

  // 保存引用
  extendedInstance.badgeElement = badgeElement;
  extendedInstance.badgeApp = { _instance: { props: { count: badgeCount } } };

  // 设置徽章位置观察器
  setupNotificationBadgePositionObserver(extendedInstance, notificationElement);
};

/**
 * 设置通知徽章位置观察器
 */
export const setupNotificationBadgePositionObserver = (extendedInstance: ExtendedNotificationInstance, notificationElement: HTMLElement) => {
  if (!extendedInstance.badgeElement) return;

  // 监听通知元素的位置变化
  const positionObserver = new ResizeObserver(() => {
    updateNotificationBadgePosition(extendedInstance, notificationElement);
  });

  positionObserver.observe(notificationElement);
  extendedInstance.badgeResizeObserver = positionObserver;

  // 监听DOM结构变化
  const mutationObserver = new MutationObserver(() => {
    updateNotificationBadgePosition(extendedInstance, notificationElement);
  });

  mutationObserver.observe(notificationElement, {
    attributes: true,
    attributeFilter: ['style', 'class']
  });

  extendedInstance.badgeMutationObserver = mutationObserver;

  // 初始位置更新
  updateNotificationBadgePosition(extendedInstance, notificationElement);
};

/**
 * 更新通知徽章位置
 */
export const updateNotificationBadgePosition = (extendedInstance: ExtendedNotificationInstance, _notificationElement: HTMLElement) => {
  if (!extendedInstance.badgeElement) return;

  const badgeContainer = extendedInstance.badgeElement.parentElement;

  if (badgeContainer) {
    badgeContainer.style.top = '-8px';
    badgeContainer.style.right = '-8px';
  }
};

/**
 * 处理通知显示
 */
export const handleNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  title: string,
  message: string,
  _duration?: number,
  badgeCount?: number
) => {
  // 生成通知ID
  const notificationId = `notification-${Date.now()}-${++notificationInstanceCounter}`;

  // 使用 BtcNotification 弹出通知（基于 ElNotification，DOM 结构相同）
  const notificationInstance = BtcNotification[type](message, {
    title: title,
    duration: 4500, // 4.5秒，由生命周期管理器控制
    showClose: true, // 显示关闭按钮
    dangerouslyUseHTMLString: false // 确保不会因为HTML内容导致问题
  });
  (notificationInstance as ExtendedNotificationInstance).notificationId = notificationId;

  // 将通知添加到待处理列表
  const pendingKey = `${type}-${notificationId}`;
  pendingNotifications.set(pendingKey, {
    notificationInstance,
    title,
    message,
    ...(badgeCount !== undefined && { badgeCount }),
    notificationId
  });

  return notificationInstance;
};

/**
 * 更新通知徽章数字
 */
export const updateNotificationBadge = (notificationInstance: any, badgeCount: number) => {
  const extendedInstance = notificationInstance as ExtendedNotificationInstance;

  if (extendedInstance.badgeApp) {
    // 尝试直接更新Vue组件的props
    try {
      const componentInstance = extendedInstance.badgeApp._instance;
      if (componentInstance && componentInstance.props) {
        componentInstance.props.count = badgeCount;
      }
    } catch (_error) {
      // 如果Vue组件更新失败，直接更新DOM
      if (extendedInstance.badgeElement) {
        extendedInstance.badgeElement.textContent = badgeCount.toString();
      }
    }
  } else if (extendedInstance.badgeElement) {
    // 直接更新DOM元素
    extendedInstance.badgeElement.textContent = badgeCount.toString();
  }
};

/**
 * 清理通知徽章
 */
export const cleanupNotificationBadge = (notificationInstance: any) => {
  const extendedInstance = notificationInstance as ExtendedNotificationInstance;

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
    if (badgeContainer && typeof badgeContainer.remove === 'function') {
      badgeContainer.remove();
    }
    extendedInstance.badgeElement = null;
  }

  // 清理引用
  extendedInstance.badgeApp = null;
  extendedInstance.notificationContainer = null;
};

/**
 * 创建通知处理器
 */
export const createNotificationHandler = () => {
  // 初始化全局通知观察器
  initGlobalNotificationObserver();

  // 创建通知处理器
  const notificationHandler = {
    success: (title: string, message: string, _duration?: number, badgeCount?: number) => {
      return handleNotification('success', title, message, _duration, badgeCount);
    },
    error: (title: string, message: string, _duration?: number, badgeCount?: number) => {
      return handleNotification('error', title, message, _duration, badgeCount);
    },
    warning: (title: string, message: string, _duration?: number, badgeCount?: number) => {
      return handleNotification('warning', title, message, _duration, badgeCount);
    },
    info: (title: string, message: string, _duration?: number, badgeCount?: number) => {
      return handleNotification('info', title, message, _duration, badgeCount);
    },
    updateBadge: updateNotificationBadge,
    cleanupBadge: cleanupNotificationBadge
  };

  return notificationHandler;
};

/**
 * 初始化通知管理器
 */
export const initNotificationManager = (notificationHandler: any) => {
  notificationManager.setDisplayHandler({
    ...notificationHandler,
    // 更新徽章数字的方法
    updateBadge: (notificationInstance: any, badgeCount: number) => {
      updateNotificationBadge(notificationInstance, badgeCount);
    }
  });

  // 设置生命周期管理器（如果需要的话）
  // notificationManager.setLifecycleManager();
};
