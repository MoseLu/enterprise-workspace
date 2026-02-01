/**
 * 通知生命周期管理
 */

import type { QueuedNotification, NotificationDisplayHandler } from './types';

export class LifecycleManager {
  constructor(private displayHandler: NotificationDisplayHandler) {}

  /**
   * 设置通知生命周期
   */
  setupNotificationLifecycle(notification: QueuedNotification): void {
    if (!this.displayHandler.updateBadge) {
      return;
    }

    // 计算递减开始时间
    const incrementPeriod = (notification.count - 1) * 400; // 递增期间
    const waitingPeriod = 500; // 等待期

    const countdownStartTime = incrementPeriod + waitingPeriod;

    // 设置递减动画定时器
    setTimeout(() => {
      this.startCountdownAnimation(notification);
    }, countdownStartTime);
  }

  /**
   * 开始递减动画
   */
  private startCountdownAnimation(notification: QueuedNotification): void {
    if (!notification.notificationInstance || !this.displayHandler.updateBadge) {
      return;
    }

    // 使用更简单直接的方式：每个阶段都是400ms间隔
    let currentCount = notification.count;
    const interval = 400; // 固定间隔400ms

    // 立即显示当前数字
    this.displayHandler.updateBadge(notification.notificationInstance, currentCount);

    // 第一阶段：从当前数字递减到1
    const countdownInterval = setInterval(() => {
      if (currentCount > 1) {
        currentCount--;
        this.displayHandler.updateBadge!(notification.notificationInstance, currentCount);
      } else {
        // 显示1，然后停止递减
        this.displayHandler.updateBadge!(notification.notificationInstance, currentCount);
        clearInterval(countdownInterval);

        // 第二阶段：徽章消失
        setTimeout(() => {
          // 直接清理徽章，而不是调用updateBadge显示0
          if (typeof (window as any).cleanupNotificationBadge === 'function') {
            (window as any).cleanupNotificationBadge(notification.notificationInstance);
          }

          // 第三阶段：通知框消失
          setTimeout(() => {
            this.closeNotificationBox(notification);
          }, interval); // 400ms后通知框消失
        }, interval); // 400ms后徽章消失
      }
    }, interval); // 每400ms递减一次
  }

  /**
   * 关闭通知框
   */
  private closeNotificationBox(notification: QueuedNotification): void {
    if (notification.notificationInstance && typeof notification.notificationInstance.close === 'function') {
      notification.notificationInstance.close();
    }
  }
}
