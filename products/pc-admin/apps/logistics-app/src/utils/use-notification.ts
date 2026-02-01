;
/**
 * 通知管理器辅助函数
 * 提供统一的通知发送接口
 */

export function useNotification() {
  const notificationManager = (window as any).notificationManager;

  if (!notificationManager) {
    console.warn('NotificationManager not available');
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    };
  }

  return {
    /**
     * 显示成功通知
     */
    success: (message: string, title?: string) => {
      notificationManager.enqueue('success', message, title);
    },

    /**
     * 显示错误通知
     */
    error: (message: string, title?: string) => {
      notificationManager.enqueue('error', message, title);
    },

    /**
     * 显示警告通知
     */
    warning: (message: string, title?: string) => {
      notificationManager.enqueue('warning', message, title);
    },

    /**
     * 显示信息通知
     */
    info: (message: string, title?: string) => {
      notificationManager.enqueue('info', message, title);
    }
  };
}
