/**
 * 响应拦截器初始化
 * 用于设置路由实例，支持重定向功能
 */

import { responseInterceptor, type MessageHandler, type ConfirmHandler, type RouterHandler } from '@btc/shared-utils';
import { BtcConfirm, BtcMessage } from '@btc/shared-components';
import type { Router } from 'vue-router';

/**
 * 初始化响应拦截器
 * @param router Vue Router 实例
 */
export function initResponseInterceptor(router: Router) {
  // 设置消息处理器 - 只使用 BtcMessage 系统
  const messageHandler: MessageHandler = {
    success: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.success) {
        messageManager.success(message);
      } else {
        BtcMessage.success(message);
      }
    },
    error: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.error) {
        messageManager.error(message);
      } else {
        BtcMessage.error(message);
      }
    },
    warning: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.warning) {
        messageManager.warning(message);
      } else {
        BtcMessage.warning(message);
      }
    },
    info: (message: string) => {
      const messageManager = (window as any).BtcMessage;
      if (messageManager && messageManager.info) {
        messageManager.info(message);
      } else {
        BtcMessage.info(message);
      }
    }
  };

  // 设置确认对话框处理器
  const confirmHandler: ConfirmHandler = {
    confirm: (message: string, title = 'common.confirm.confirm') => {
      return BtcConfirm(message, title, {
        confirmButtonText: 'common.confirm.ok',
        cancelButtonText: 'common.confirm.cancel',
        type: 'warning'
      }).then(() => true).catch(() => false);
    }
  };

  // 设置路由处理器
  const routerHandler: RouterHandler = {
    push: (path: string) => router.push(path)
  };

  // 配置响应拦截器
  responseInterceptor.setMessageHandler(messageHandler);
  responseInterceptor.setConfirmHandler(confirmHandler);
  responseInterceptor.setRouterHandler(routerHandler);

  // 将响应拦截器暴露到全局，供 EPS 服务的响应拦截器使用
  if (typeof window !== 'undefined') {
    (window as any).__BTC_RESPONSE_INTERCEPTOR__ = responseInterceptor;
  }
}

/**
 * 响应拦截器工具函数
 */
export { responseInterceptor } from '@btc/shared-utils';
