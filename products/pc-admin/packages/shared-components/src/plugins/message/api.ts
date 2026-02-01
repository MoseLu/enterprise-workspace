/**
 * 消息中心插件 API（供子应用调用）
 */
import type { MessageItem } from '../types';

/**
 * 消息中心 API 接口
 * 子应用通过 window.__PLUGIN_API__.messageCenter 访问
 */
export interface MessageCenterAPI {
  registerSource: (appName: string, messages: MessageItem[]) => void;
  unregisterSource: (appName: string) => void;
  push: (message: MessageItem) => void;
  markAsRead: (messageId: string) => void;
  getMessages: () => MessageItem[];
}

