/**
 * @btc/shared-plugins
 * 
 * 插件系统核心库
 * 统一管理国际化、主题、偏好设置、消息中心、通知中心、GitHub集成等插件
 */

// 导出类型
export type * from './types';

// 导出国际化插件
export * from './i18n';

// 导出主题插件
export * from './theme';

// 导出偏好设置插件
export * from './preference';

// 导出消息中心插件
export * from './message';

// 导出通知中心插件
export * from './notification';

// 导出GitHub集成插件
export * from './github';

