/**
 * 应用布局工具函数
 * 使用依赖注入，避免共享包直接依赖应用配置
 */

// 使用依赖注入，避免直接依赖 @configs（共享包不应该依赖应用配置）
let isMainAppFn: ((routePath?: string, locationPath?: string, isStandalone?: boolean) => boolean) | null = null;

/**
 * 设置 isMainApp 函数（由应用在运行时注入）
 */
export function setIsMainAppFn(fn: (routePath?: string, locationPath?: string, isStandalone?: boolean) => boolean) {
  isMainAppFn = fn;
}

/**
 * 获取 isMainApp 函数（内部使用）
 */
export function getIsMainAppFn() {
  return isMainAppFn;
}

