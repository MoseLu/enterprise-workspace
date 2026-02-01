;
/**
 * 消息管理组合式函数
 * 提供统一的消息发送接口
 */

// messageManager 现在从全局获取，不再从本地导入

/**
 * 使用消息管理器
 * @returns 消息发送方法
 */
export function useMessage() {
  const messageManager = (window as any).messageManager;

  if (!messageManager) {
    console.warn('MessageManager not available');
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    };
  }

  return {
    /**
     * 显示成功消息
     */
    success: (message: string) => {
      messageManager.enqueue('success', message);
    },

    /**
     * 显示错误消息
     */
    error: (message: string) => {
      messageManager.enqueue('error', message);
    },

    /**
     * 显示警告消息
     */
    warning: (message: string) => {
      messageManager.enqueue('warning', message);
    },

    /**
     * 显示信息消息
     */
    info: (message: string) => {
      messageManager.enqueue('info', message);
    }
  };
}