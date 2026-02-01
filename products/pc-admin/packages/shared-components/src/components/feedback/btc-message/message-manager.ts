import { ElMessage, type MessageHandler } from 'element-plus';
/**
 * BtcMessage 消息管理器
 * 基于 Element Plus 消息能力封装的 BtcMessage，支持重复消息徽标计数功能
 */

// 消息状态接口
interface MessageState {
  content: string;
  type: 'success' | 'warning' | 'info' | 'error';
  count: number;
  maxCount: number;
  messageInstance: MessageHandler | null;
  decrementTimeout: number | null;
  lastUpdateTime: number;
  messageElement: HTMLElement | null;
  isDecrementing: boolean; // 是否正在递减中
}

// 消息管理器类
class BtcMessageManager {
  private messages = new Map<string, MessageState>();

  /**
   * 显示消息
   */
  showMessage(
    content: string,
    type: 'success' | 'warning' | 'info' | 'error',
    options: {
      duration?: number;
      showClose?: boolean;
      dangerouslyUseHTMLString?: boolean;
      maxCount?: number;
    } = {},
  ): MessageHandler {
    const key = `${type}:${content}`;
    const maxCount = options.maxCount || 99;

    const existingState = this.messages.get(key);
    if (existingState && existingState.messageInstance) {
      this.incrementMessage(key, maxCount);
      return existingState.messageInstance;
    }

    // 新消息，创建消息实例
    const handler = this.createNewMessage(key, content, type, {
      duration: options.duration || 3000,
      showClose: false, // BtcMessage 不需要关闭按钮
      dangerouslyUseHTMLString: options.dangerouslyUseHTMLString || false,
      maxCount,
    });

    return handler;
  }

  /**
   * 创建新消息
   */
  private createNewMessage(
    key: string,
    content: string,
    type: 'success' | 'warning' | 'info' | 'error',
    options: {
      duration: number;
      showClose: boolean;
      dangerouslyUseHTMLString: boolean;
      maxCount: number;
    },
  ): MessageHandler {

    // 使用 Element Plus 原生功能创建消息，完全手动控制生命周期
    // 使用类型断言解决 Element Plus 类型定义问题
    const messageInstance = ElMessage({
      message: content as any,
      type: type as any,
      duration: 0 as any, // 手动控制生命周期
      showClose: false as any, // BtcMessage 不需要关闭按钮
      dangerouslyUseHTMLString: options.dangerouslyUseHTMLString as any,
      grouping: false as any, // 手动管理，不使用自动合并
      repeatNum: 1 as any, // 初始值
      onClose: (() => {
        // 清理状态
        this.handleMessageClose(key);
      }) as any,
    });

    const messageState: MessageState = {
      content,
      type,
      count: 1,
      maxCount: options.maxCount || 99,
      messageInstance,
      decrementTimeout: null,
      lastUpdateTime: Date.now(),
      messageElement: null,
      isDecrementing: false,
    };
    this.messages.set(key, messageState);

    // 查找 DOM 元素并保存引用
    setTimeout(() => {
      const messageElements = document.querySelectorAll('.el-message');
      const lastMessage = messageElements[messageElements.length - 1] as HTMLElement;

      if (lastMessage) {
        lastMessage.setAttribute('data-message-id', key);

        // 查找 Element Plus 原生的 repeatNum 徽章元素
        const badgeElement = lastMessage.querySelector('.el-message__badge') as HTMLElement;
        if (badgeElement) {
          // 初始隐藏（count = 1 时不显示）
          badgeElement.style.display = 'none';
        }

        const currentState = this.messages.get(key);
        if (currentState) {
          currentState.messageElement = lastMessage;
        }
      }
    }, 100);

    // 2秒后开始递减（只有在 count > 1 时才安排递减）
    const currentState = this.messages.get(key);
    if (currentState && currentState.count > 1) {
      this.scheduleDecrement(key);
    } else {
      // 单条消息，3秒后自动关闭
      setTimeout(() => {
        this.closeMessage(key);
      }, 3000);
    }

    return messageInstance;
  }

  /**
   * 递增消息计数
   */
  private incrementMessage(key: string, _maxCount: number) {
    const messageState = this.messages.get(key);
    if (!messageState) return;

    // 递增计数，不限制最大值（与 el-badge 原生逻辑一致）
    messageState.count = messageState.count + 1;
    messageState.lastUpdateTime = Date.now();

    // 直接通过 DOM 操作更新 Element Plus 原生徽章，不再触发新的 BtcMessage 实例
    this.updateNativeBadge(key);

    // 重置递减定时器（只有在 count > 1 时才安排递减）
    if (messageState.count > 1) {
      this.resetDecrementTimeout(key);
    }
  }

  /**
   * 更新原生徽章显示
   */
  private updateNativeBadge(key: string) {
    const messageState = this.messages.get(key);
    if (!messageState) return;

    // 查找消息的 DOM 元素
    const messageElement =
      messageState.messageElement ||
      (document.querySelector(`[data-message-id="${key}"]`) as HTMLElement);

    if (messageElement) {
      // 查找 Element Plus 原生的徽章元素
      const badgeElement = messageElement.querySelector('.el-message__badge') as HTMLElement;

      if (badgeElement) {
        if (messageState.count > 1) {
          // 显示徽章并更新数字，支持 99+ 显示
          const displayText = messageState.count > 99 ? '99+' : messageState.count.toString();
          badgeElement.textContent = displayText;
          badgeElement.style.display = '';
        } else {
          // 隐藏徽章
          badgeElement.style.display = 'none';
        }
      } else {
        // 原生徽章不存在，查找或创建自定义徽章
        let badgeContainer = messageElement.querySelector(
          '.btc-message-badge-container'
        ) as HTMLElement;

        if (!badgeContainer) {
          badgeContainer = document.createElement('div');
          badgeContainer.className = 'btc-message-badge-container';
          badgeContainer.style.cssText = `
            position: absolute;
            top: -8px;
            right: -8px;
            z-index: 9999;
            pointer-events: none;
          `;

          const customBadgeElement = document.createElement('div');
          customBadgeElement.className = 'btc-message-badge';
          customBadgeElement.style.cssText = `
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: ${this.getBadgeColor(messageState.type)};
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
          messageElement.appendChild(badgeContainer);
        }

        // 更新自定义徽章
        const customBadgeElement = badgeContainer.querySelector(
          '.btc-message-badge'
        ) as HTMLElement;
        if (customBadgeElement) {
          if (messageState.count > 1) {
            // 支持 99+ 显示
            const displayText = messageState.count > 99 ? '99+' : messageState.count.toString();
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
    const messageState = this.messages.get(key);
    if (!messageState) return;

    // 清除现有定时器
    if (messageState.decrementTimeout) {
      clearTimeout(messageState.decrementTimeout);
    }

    // 2秒后开始递减
    messageState.decrementTimeout = window.setTimeout(() => {
      this.startDecrement(key);
    }, 2000);
  }

  /**
   * 重置递减定时器（智能检测机制）
   */
  private resetDecrementTimeout(key: string) {
    const messageState = this.messages.get(key);
    if (!messageState) return;

    // 清除现有定时器
    if (messageState.decrementTimeout) {
      clearTimeout(messageState.decrementTimeout);
    }

    // 使用智能检测机制：500ms后检查是否还有新的递增
    messageState.decrementTimeout = window.setTimeout(() => {
      const currentState = this.messages.get(key);
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
    const messageState = this.messages.get(key);
    if (!messageState) return;

    // 设置递减标志，防止在递减过程中被意外关闭
    messageState.isDecrementing = true;

    if (messageState.count > 1) {
      messageState.count--;
      messageState.lastUpdateTime = Date.now();

      // 直接通过 DOM 操作更新 Element Plus 原生徽章，不重新创建消息
      this.updateNativeBadge(key);

      if (messageState.count > 1) {
        // 继续递减
        setTimeout(() => {
          this.startDecrement(key);
        }, 500);
      } else {
        // count = 1，徽章已隐藏，等待后关闭消息
        messageState.isDecrementing = false; // 递减结束，清除标志
        setTimeout(() => {
          this.closeMessage(key);
        }, 2000);
      }
    } else {
      // 已经是 1，直接关闭
      messageState.isDecrementing = false; // 递减结束，清除标志
      this.closeMessage(key);
    }
  }

  /**
   * 处理消息关闭
   */
  private handleMessageClose(key: string) {
    const messageState = this.messages.get(key);

    if (messageState) {
      // 如果正在递减中，阻止关闭
      if (messageState.isDecrementing) {
        return;
      }

      // 清除定时器
      if (messageState.decrementTimeout) {
        clearTimeout(messageState.decrementTimeout);
      }

      // 清理徽章（徽章会随着消息元素一起被清理）

      // 删除状态
      this.messages.delete(key);
    }
  }

  /**
   * 关闭消息
   */
  private closeMessage(key: string) {
    const messageState = this.messages.get(key);

    // 如果消息状态不存在，直接返回
    if (!messageState) {
      return;
    }

    // 如果正在递减中，阻止关闭
    if (messageState.isDecrementing) {
      return;
    }

    if (messageState.messageInstance && messageState.messageInstance.close) {
      messageState.messageInstance.close();
    }

    // 清除定时器
    if (messageState.decrementTimeout) {
      clearTimeout(messageState.decrementTimeout);
    }

    // 从映射中移除
    this.messages.delete(key);
  }

  /**
   * 关闭所有消息
   */
  closeAll() {
    ElMessage.closeAll();
    this.messages.clear();
  }
}

// 创建全局实例
const messageManager = new BtcMessageManager();

// 导出 API
export const BtcMessage = {
  success: (message: string, options?: any) =>
    messageManager.showMessage(message, 'success', options),
  warning: (message: string, options?: any) =>
    messageManager.showMessage(message, 'warning', options),
  info: (message: string, options?: any) => messageManager.showMessage(message, 'info', options),
  error: (message: string, options?: any) => {
    return messageManager.showMessage(message, 'error', options);
  },
  closeAll: () => messageManager.closeAll(),
};