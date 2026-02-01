// @btc/shared-core/utils 入口文件
// 从 shared-utils 迁移而来

// 核心工具模块
export * from './date';
// 显式导出日期格式化函数以避免moduleResolution: "bundler"解析问题
export { formatDateTimeFriendly, formatDate, formatDateTime, isDateTimeField, getDateRange, dateDiff } from './date';
export * from './format';
export * from './validate';
export * from './storage';
export * from './storage/cross-domain';
export { syncSettingsToCookie } from './storage/cross-domain';

// 数据处理模块
export * from './array';
export * from './object';
export * from './string';
export * from './number';

// 业务功能模块
export * from './form';
export * from './hooks';
export * from './http';

// Composables
export * from './composables/usePageTransition';
// 显式导出 usePageTransition，确保被正确导出
export { usePageTransition } from './composables/usePageTransition';
export * from './composables/useFileType';
// 显式导出 useFileType 相关函数，确保被正确导出
export { useFileType, detectFileType, detectFileTypeFromBuffer, detectFileTypeFromFileName } from './composables/useFileType';
export type { FileTypeResult } from './composables/useFileType';
// 显式导出 http 模块的类型，确保类型被正确导出
export type { MessageHandler, ConfirmHandler, RouterHandler, ApiResponse } from './http';

// 微前端相关
export * from './qiankun/load-layout-app';

// CDN 资源加载
export * from './cdn/load-shared-resources';

// Cookie 工具（从 storage/cookie 导出，保持向后兼容）
export * from './storage/cookie';
export { getCookieDomain } from './storage/cookie';

// Pinia 持久化插件（显式导出，确保正确导出）
export { persistedStatePlugin, persistedStatePluginSession, createPersistedStatePlugin } from './storage/pinia-persist';
export type { PersistedStatePluginOptions } from './storage/pinia-persist';

// 错误监控
export * from './error-monitor';

// EPS 相关
export * from './eps/load-global-eps';

// 环境信息工具
export * from './env-info';
export { getEnvInfo, getCurrentEnvironment, getCurrentAppId, getCurrentAppConfig } from './env-info';
export type { EnvInfo } from './env-info';

// 主应用登录 URL 工具
export { getMainAppLoginUrl } from './get-main-app-login-url';

// 日志模块已移除，请直接使用 console
// export * from './logger';
// export { logger, getLogger, setLogContext, getLogContext, clearLogContext, reinitializeLogger } from './logger';
// export type { LogContext, LogLevel, LoggerOptions, Logger } from './logger';
