/**
 * 消息中心插件 - 主应用基座（Host）
 */
import { ref } from 'vue';
import type { QiankunActions, MessageItem } from '../types';
import { setGlobalState } from '@btc/shared-core';

export interface MessagePluginHostOptions {
  globalState?: QiankunActions;
}

const messageList = ref<MessageItem[]>([]);
const messageSources = new Map<string, MessageItem[]>();

let messageInstance: any = null;

/**
 * 创建消息中心插件（主应用）
 */
export function createMessagePluginHost(options: MessagePluginHostOptions = {}) {
  if (messageInstance) {
    return messageInstance;
  }

  const { globalState } = options;

  const registerSource = (appName: string, messages: MessageItem[]) => {
    // 给消息打上应用标识
    const appMessages = messages.map((msg) => ({
      ...msg,
      source: appName,
    }));

    messageSources.set(appName, appMessages);
    updateMessageList();

    // 同步到全局状态（通过统一中间层）
    setGlobalState({ messages: messageList.value }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const unregisterSource = (appName: string) => {
    messageSources.delete(appName);
    updateMessageList();

    // 同步到全局状态（通过统一中间层）
    setGlobalState({ messages: messageList.value }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const push = (message: MessageItem) => {
    messageList.value.push({
      ...message,
      time: message.time || Date.now(),
    });

    // 同步到全局状态（通过统一中间层）
    setGlobalState({ messages: messageList.value }, false).catch(() => {
      // 忽略错误（可能在初始化中）
    });
  };

  const markAsRead = (messageId: string) => {
    const message = messageList.value.find((msg) => msg.id === messageId);
    if (message) {
      message.read = true;

      // 同步到全局状态
      if (globalState && typeof globalState.setGlobalState === 'function') {
        globalState.setGlobalState({ messages: messageList.value });
      }
    }
  };

  const getMessages = () => {
    return messageList.value;
  };

  const updateMessageList = () => {
    const allMessages: MessageItem[] = [];
    messageSources.forEach((messages) => {
      allMessages.push(...messages);
    });
    messageList.value = allMessages;
  };

  messageInstance = {
    registerSource,
    unregisterSource,
    push,
    markAsRead,
    getMessages,
    messageList,
  };

  return messageInstance;
}

