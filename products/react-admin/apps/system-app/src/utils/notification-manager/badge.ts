/**
 * 通知徽章管理
 */

import type { QueuedNotification } from './types';

export class BadgeManager {
  private countdownTimers = new Map<string, number>();

  /**
   * 开始徽章递减动画
   */
  startCountdownAnimation(
    notification: QueuedNotification,
    updateBadge: (notificationInstance: any, badgeCount: number) => void,
    closeNotificationBox: (notification: QueuedNotification) => void
  ): void {
    if (!notification.notificationInstance || !updateBadge) {
      return;
    }

    // 使用更简单直接的方式：每个阶段都是400ms间隔
    let currentCount = notification.count;
    const interval = 400; // 固定间隔400ms

    // 立即显示当前数字
    updateBadge(notification.notificationInstance, currentCount);

    // 第一阶段：从当前数字递减到1
    const countdownInterval = setInterval(() => {
      if (currentCount > 1) {
        currentCount--;
        updateBadge(notification.notificationInstance, currentCount);
      } else {
        // 显示1，然后停止递减
        updateBadge(notification.notificationInstance, currentCount);
        clearInterval(countdownInterval);

        // 第二阶段：徽章消失
        setTimeout(() => {
          // 直接清理徽章，而不是调用updateBadge显示0
          if (typeof (window as any).cleanupNotificationBadge === 'function') {
            (window as any).cleanupNotificationBadge(notification.notificationInstance);
          }

          // 第三阶段：通知框消失
          setTimeout(() => {
            closeNotificationBox(notification);
          }, interval); // 400ms后通知框消失
        }, interval); // 400ms后徽章消失
      }
    }, interval); // 每400ms递减一次

    // 保存定时器引用，用于清理
    this.countdownTimers.set(notification.id, countdownInterval as any);
  }

  /**
   * 停止徽章递减动画
   */
  stopCountdownAnimation(notificationId: string): void {
    const timer = this.countdownTimers.get(notificationId);
    if (timer) {
      clearInterval(timer);
      this.countdownTimers.delete(notificationId);
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
