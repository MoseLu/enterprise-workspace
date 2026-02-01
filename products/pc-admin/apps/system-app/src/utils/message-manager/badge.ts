/**
 * 消息徽章管理
 */

import type { QueuedMessage } from './types';

export class BadgeManager {
  private countdownTimers = new Map<string, number>();

  /**
   * 开始徽章递减动画
   */
  startCountdownAnimation(
    message: QueuedMessage,
    updateBadge: (messageInstance: any, badgeCount: number) => void,
    closeMessageBox: (message: QueuedMessage) => void
  ): void {
    if (!message.messageInstance || !updateBadge) {
      return;
    }

    // 使用更简单直接的方式：每个阶段都是400ms间隔
    let currentCount = message.count;
    const interval = 400; // 固定间隔400ms

    // 立即显示当前数字
    updateBadge(message.messageInstance, currentCount);

    // 第一阶段：从当前数字递减到1
    const countdownInterval = setInterval(() => {
      if (currentCount > 1) {
        currentCount--;
        updateBadge(message.messageInstance, currentCount);
      } else {
        // 显示1，然后停止递减
        updateBadge(message.messageInstance, currentCount);
        clearInterval(countdownInterval);

        // 第二阶段：徽章消失
        setTimeout(() => {
          // 直接清理徽章，而不是调用updateBadge显示0
          if (typeof (window as any).cleanupBadge === 'function') {
            (window as any).cleanupBadge(message.messageInstance);
          }

          // 第三阶段：消息框消失
          setTimeout(() => {
            closeMessageBox(message);
          }, interval); // 400ms后消息框消失
        }, interval); // 400ms后徽章消失
      }
    }, interval); // 每400ms递减一次

    // 保存定时器引用，用于清理
    this.countdownTimers.set(message.id, countdownInterval as any);
  }

  /**
   * 停止徽章递减动画
   */
  stopCountdownAnimation(messageId: string): void {
    const timer = this.countdownTimers.get(messageId);
    if (timer) {
      clearInterval(timer);
      this.countdownTimers.delete(messageId);
    }
  }

  /**
   * 清理所有定时器
   */
  cleanup(): void {
    this.countdownTimers.forEach(timer => clearInterval(timer));
    this.countdownTimers.clear();
  }
}
