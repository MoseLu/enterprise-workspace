/**
 * 插件系统统一类型定义
 */

/**
 * qiankun 全局状态类型
 */
export interface QiankunGlobalState {
  locale?: string;
  theme?: string | { isDark?: boolean; color?: string; colorScheme?: string; [key: string]: any };
  preferences?: Record<string, any>;
  messages?: MessageItem[];
  notifications?: NotificationItem[];
  githubAuth?: boolean;
  [key: string]: any;
}

/**
 * qiankun Actions 类型
 */
export interface QiankunActions {
  onGlobalStateChange: (
    callback: (state: QiankunGlobalState, prev: QiankunGlobalState) => void,
    fireImmediately?: boolean
  ) => void;
  setGlobalState: (state: Partial<QiankunGlobalState>) => boolean;
  offGlobalStateChange: () => void;
}

/**
 * 消息项类型
 */
export interface MessageItem {
  id: string;
  title: string;
  content: string;
  read: boolean;
  source?: string;
  time?: number;
  [key: string]: any;
}

/**
 * 通知项类型
 */
export interface NotificationItem {
  id: string;
  title: string;
  content: string;
  source?: string;
  time?: number;
  type?: 'success' | 'warning' | 'info' | 'error';
  [key: string]: any;
}

/**
 * 插件API接口
 */
export interface PluginAPI {
  i18n: {
    changeLocale: (locale: string) => void;
    getCurrentLocale: () => string;
  };
  theme: {
    changeTheme: (theme: string) => void;
    getCurrentTheme: () => string;
  };
  preference: {
    update: (key: string, value: any) => void;
    get: (key: string) => any;
    getAll: () => Record<string, any>;
  };
  messageCenter: {
    registerSource: (appName: string, messages: MessageItem[]) => void;
    unregisterSource: (appName: string) => void;
    push: (message: MessageItem) => void;
    markAsRead: (messageId: string) => void;
    getMessages: () => MessageItem[];
  };
  notificationCenter: {
    registerSource: (appName: string) => void;
    unregisterSource: (appName: string) => void;
    push: (notification: NotificationItem) => void;
    getNotifications: () => NotificationItem[];
  };
  github: {
    checkAuth: () => Promise<boolean>;
    login: (token: string) => Promise<void>;
    logout: () => void;
    getRepos: () => Promise<any[]>;
    getCommits: (repo: string) => Promise<any[]>;
    createIssue: (repo: string, issue: any) => Promise<any>;
  };
}

/**
 * 插件初始化选项
 */
export interface PluginInitOptions {
  globalState?: QiankunActions;
  [key: string]: any;
}

