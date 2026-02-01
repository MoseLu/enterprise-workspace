import { logger } from '@btc/shared-core';
;
/**
 * Loading 管理器
 * 用于管理应用级别的 Loading 状态
 */

/**
 * 开始显示 Loading
 * @param appName 应用名称
 */
export function startLoading(appName: string): void {
  // 使用 appLoadingService 显示 loading
  // 这里使用动态导入避免循环依赖
  import('@btc/shared-core').then((module) => {
    if (module.appLoadingService) {
      module.appLoadingService.show(appName);
    }
  }).catch((error) => {
    console.warn('[loadingManager] Failed to load appLoadingService', error);
  });
}

/**
 * 完成 Loading
 * @param appName 应用名称
 */
export function finishLoading(appName: string): void {
  // 使用 appLoadingService 隐藏 loading
  import('@btc/shared-core').then((module) => {
    if (module.appLoadingService) {
      module.appLoadingService.hide(appName);
    }
  }).catch((error) => {
    console.warn('[loadingManager] Failed to load appLoadingService', error);
    // 兜底方案：直接通过 DOM 关闭所有 .app-loading 元素
    const loadingEls = document.querySelectorAll('.app-loading');
    loadingEls.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        setTimeout(() => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, 100);
      }
    });
  });
}

/**
 * Loading 错误处理
 * @param appName 应用名称
 * @param error 错误对象
 */
export function loadingError(appName: string, error?: Error): void {
  // 隐藏 loading
  finishLoading(appName);

  // 记录错误
  logger.error(`[loadingManager] Loading error for ${appName}:`, error);

  // 可以在这里添加错误通知逻辑
  // 例如：显示错误提示、上报错误等
}

