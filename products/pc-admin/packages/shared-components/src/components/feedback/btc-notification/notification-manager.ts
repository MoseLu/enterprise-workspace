/**
 * BtcNotification 通知管理器
 * 基于 Element Plus 的 ElNotification 封装，支持重复消息徽标计数功能
 */

import { ElNotification } from 'element-plus';

// 通知状态接口
interface NotificationState {
  content: string;
  type: 'success' | 'warning' | 'info' | 'error';
  count: number;
  maxCount: number;
  notificationInstance: any;
  decrementTimeout: number | null;
  lastUpdateTime: number;
  notificationElement: HTMLElement | null;
  isDecrementing: boolean; // 是否正在递减中
}

// 通知管理器类
class BtcNotificationManager {
  private notifications = new Map<string, NotificationState>();

  /**
   * 显示通知
   */
  showNotification(
    content: string,
    type: 'success' | 'warning' | 'info' | 'error',
    options: {
      title?: string;
      duration?: number;
      showClose?: boolean;
      position?: string;
      dangerouslyUseHTMLString?: boolean;
      maxCount?: number;
    } = {}
  ) {
    const key = `${type}:${content}`;
    const maxCount = options.maxCount || 99;

    if (this.notifications.has(key)) {
      // 通知已存在，递增计数
      this.incrementNotification(key, maxCount);
    } else {
      // 新通知，创建通知实例
      this.createNewNotification(key, content, type, {
        title: options.title || '',
        duration: options.duration || 4500,
        showClose: options.showClose !== false,
        position: options.position || 'top-right',
        dangerouslyUseHTMLString: options.dangerouslyUseHTMLString || false,
        maxCount,
      });
    }
  }

  /**
   * 创建新通知
   */
  private createNewNotification(
    key: string,
    content: string,
    type: 'success' | 'warning' | 'info' | 'error',
    options: {
      title: string;
      duration: number;
      showClose: boolean;
      position: string;
      dangerouslyUseHTMLString: boolean;
      maxCount: number;
    }
  ) {
    // 使用 Element Plus 原生功能创建通知，完全手动控制生命周期
    const notificationInstance = ElNotification({
      title: options.title as any,
      message: content as any,
      type: type as any,
      duration: 0 as any, // 设置为0，完全手动控制关闭时机
      showClose: options.showClose as any,
      position: options.position as any,
      dangerouslyUseHTMLString: options.dangerouslyUseHTMLString,
      onClose: () => {
        // 通知关闭时清理状态
        this.handleNotificationClose(key);
      },
    });

    // 保存通知状态
    const notificationState: NotificationState = {
      content,
      type,
      count: 1,
      maxCount: options.maxCount || 99,
      notificationInstance,
      decrementTimeout: null,
      lastUpdateTime: Date.now(),
      notificationElement: null,
      isDecrementing: false, // 初始化为false
    };

    this.notifications.set(key, notificationState);

    // 查找 DOM 元素并保存引用
    setTimeout(() => {
      const notificationElements = document.querySelectorAll('.el-notification');
      const lastNotification = notificationElements[notificationElements.length - 1] as HTMLElement;

      if (lastNotification) {
        // 查找 Element Plus 原生的徽章元素并初始隐藏
        const badgeElement = lastNotification.querySelector(
          '.el-notification__badge'
        ) as HTMLElement;
        if (badgeElement) {
          // 初始隐藏（count = 1 时不显示）
          badgeElement.style.display = 'none';
        }

        notificationState.notificationElement = lastNotification;

        // 延迟更新徽章显示，避免闪烁
        setTimeout(() => {
          // 为了支持徽章定位，需要设置 position: relative
          // 使用 CSS 变量，避免直接修改 position 属性
          lastNotification.style.setProperty('--btc-notification-position', 'relative');

          // 设置 overflow: visible 避免徽章被裁剪
          lastNotification.style.overflow = 'visible';

          // 立即更新徽章显示
          this.updateNativeBadge(key);
        }, 100); // 减少延迟到 100ms，更快设置样式
      }
    }, 100);

    // 2秒后开始递减（只有在 count > 1 时才安排递减）
    if (notificationState.count > 1) {
      this.scheduleDecrement(key);
    } else {
      // 单个通知也需要自动关闭，3秒后关闭
      setTimeout(() => {
        this.closeNotification(key);
      }, 3000);
    }
  }

  /**
   * 递增通知计数
   */
  private incrementNotification(key: string, _maxCount: number) {
    const notificationState = this.notifications.get(key);
    if (!notificationState) return;

    // 递增计数，不限制最大值（与 el-badge 原生逻辑一致）
    notificationState.count = notificationState.count + 1;
    notificationState.lastUpdateTime = Date.now();

    // 直接通过 DOM 操作更新 Element Plus 原生徽章，不调用新的 ElNotification
    this.updateNativeBadge(key);

    // 重置递减定时器（只有在 count > 1 时才安排递减）
    if (notificationState.count > 1) {
      this.resetDecrementTimeout(key);
    }
  }

  /**
   * 更新原生徽章显示
   */
  private updateNativeBadge(key: string) {
    const notificationState = this.notifications.get(key);
    if (!notificationState) {
      return;
    }

    // 查找通知的 DOM 元素
    const notificationElement =
      notificationState.notificationElement ||
      (document.querySelector(`[data-notification-id="${key}"]`) as HTMLElement);

    if (notificationElement) {
      // 查找 Element Plus 原生的徽章元素
      const badgeElement = notificationElement.querySelector(
        '.el-notification__badge'
      ) as HTMLElement;

      if (badgeElement) {
        // 更新徽章文本，支持 99+ 显示
        const displayText =
          notificationState.count > 99 ? '99+' : notificationState.count.toString();
        badgeElement.textContent = displayText;
        if (notificationState.count > 1) {
          badgeElement.style.display = '';
        } else {
          // 隐藏徽章
          badgeElement.style.display = 'none';
        }
      } else {
        // 原生徽章不存在，查找或创建自定义徽章
        let badgeContainer = notificationElement.querySelector(
          '.btc-notification-badge-container'
        ) as HTMLElement;

        if (!badgeContainer) {
          badgeContainer = document.createElement('div');
          badgeContainer.className = 'btc-notification-badge-container';
          badgeContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            z-index: 999999 !important;
            pointer-events: none;
          `;

          const customBadgeElement = document.createElement('div');
          customBadgeElement.className = 'btc-notification-badge';
          customBadgeElement.style.cssText = `
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: ${this.getBadgeColor(notificationState.type)};
            color: white;
            font-size: 12px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #ffd700;
            padding: 0;
            line-height: 18px;
            text-align: center;
            min-width: 18px;
          `;

          badgeContainer.appendChild(customBadgeElement);
          notificationElement.appendChild(badgeContainer);
        }

        // 更新自定义徽章
        const customBadgeElement = badgeContainer.querySelector(
          '.btc-notification-badge'
        ) as HTMLElement;
        if (customBadgeElement) {
          if (notificationState.count > 1) {
            // 支持 99+ 显示
            const displayText =
              notificationState.count > 99 ? '99+' : notificationState.count.toString();
            customBadgeElement.textContent = displayText;
            badgeContainer.style.display = 'block';
          } else {
            badgeContainer.style.display = 'none';
          }
        }
      }
    }
  }

  /**
   * 获取徽章颜色
   */
  private getBadgeColor(type: string): string {
    const colors = {
      success: '#67c23a',
      warning: '#e6a23c',
      info: '#909399',
      error: '#f56c6c',
    };
    return colors[type as keyof typeof colors] || colors.info;
  }

  /**
   * 安排递减定时器
   */
  private scheduleDecrement(key: string) {
    const notificationState = this.notifications.get(key);
    if (!notificationState) return;

    // 清除现有定时器
    if (notificationState.decrementTimeout) {
      clearTimeout(notificationState.decrementTimeout);
    }

    // 2秒后开始递减
    notificationState.decrementTimeout = window.setTimeout(() => {
      this.startDecrement(key);
    }, 2000);
  }

  /**
   * 重置递减定时器
   */
  private resetDecrementTimeout(key: string) {
    const notificationState = this.notifications.get(key);
    if (!notificationState) return;

    // 清除现有定时器
    if (notificationState.decrementTimeout) {
      clearTimeout(notificationState.decrementTimeout);
    }

    // 使用智能检测机制：500ms后检查是否还有新的递增
    notificationState.decrementTimeout = window.setTimeout(() => {
      const currentState = this.notifications.get(key);
      if (!currentState) return;

      const timeSinceLastUpdate = Date.now() - currentState.lastUpdateTime;

      // 如果500ms内没有新的更新，说明递增阶段结束，开始递减
      if (timeSinceLastUpdate >= 500) {
        this.startDecrement(key);
      } else {
        // 如果还有新的更新，继续等待
        this.resetDecrementTimeout(key);
      }
    }, 500);
  }

  /**
   * 开始递减
   */
  private startDecrement(key: string) {
    const notificationState = this.notifications.get(key);
    if (!notificationState) return;

    // 设置递减标志，防止在递减过程中被意外关闭
    notificationState.isDecrementing = true;

    if (notificationState.count > 1) {
      notificationState.count--;
      notificationState.lastUpdateTime = Date.now();

      // 直接通过 DOM 操作更新 Element Plus 原生徽章，不重新创建通知
      this.updateNativeBadge(key);

      if (notificationState.count > 1) {
        // 继续递减
        setTimeout(() => {
          this.startDecrement(key);
        }, 500);
      } else {
        // count = 1，徽章已隐藏，等待后关闭通知
        notificationState.isDecrementing = false; // 递减结束，清除标志
        setTimeout(() => {
          this.closeNotification(key);
        }, 2000);
      }
    } else {
      // 已经是 1，直接关闭
      notificationState.isDecrementing = false; // 递减结束，清除标志
      this.closeNotification(key);
    }
  }

  /**
   * 处理通知关闭
   */
  private handleNotificationClose(key: string) {
    const notificationState = this.notifications.get(key);

    if (notificationState) {
      // 如果正在递减中，阻止关闭
      if (notificationState.isDecrementing) {
        return;
      }

      // 清除定时器
      if (notificationState.decrementTimeout) {
        clearTimeout(notificationState.decrementTimeout);
      }

      // 清理徽章（徽章会随着通知元素一起被清理）

      // 删除状态
      this.notifications.delete(key);
    }
  }

  /**
   * 关闭通知
   */
  private closeNotification(key: string) {
    const notificationState = this.notifications.get(key);

    // 如果通知状态不存在，直接返回
    if (!notificationState) {
      return;
    }

    // 如果正在递减中，阻止关闭
    if (notificationState.isDecrementing) {
      return;
    }

    if (notificationState.notificationInstance && notificationState.notificationInstance.close) {
      notificationState.notificationInstance.close();
    }

    // 清除定时器
    if (notificationState.decrementTimeout) {
      clearTimeout(notificationState.decrementTimeout);
    }

    // 从映射中移除
    this.notifications.delete(key);
  }

  /**
   * 关闭所有通知
   */
  closeAll() {
    ElNotification.closeAll();
    this.notifications.clear();
  }
}

// 创建全局实例
const notificationManager = new BtcNotificationManager();

// 导出 API
export const BtcNotification = {
  success: (message: string, options?: any) =>
    notificationManager.showNotification(message, 'success', options),
  warning: (message: string, options?: any) =>
    notificationManager.showNotification(message, 'warning', options),
  info: (message: string, options?: any) =>
    notificationManager.showNotification(message, 'info', options),
  error: (message: string, options?: any) =>
    notificationManager.showNotification(message, 'error', options),
  closeAll: () => notificationManager.closeAll(),
};
