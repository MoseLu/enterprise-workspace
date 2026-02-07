/**
 * 初始化 layout-app 工具
 * 用于在独立运行时加载 layout-app
 */
import { logger } from '@btc/shared-core';

/**
 * 加载 layout-app
 */
export async function initLayoutApp(): Promise<void> {
  const hostname = window.location.hostname;
  const isProductionDomain = /\.bellis\.com\.cn$/i.test(hostname);

  // 只在生产环境域名下加载 layout-app
  if (!isProductionDomain) {
    logger.info('[engineering-app] Non-production domain, skipping layout-app initialization');
    return;
  }

  // 设置标记，通知 layout-app 已加载
  (window as any).__USE_LAYOUT_APP__ = true;

  logger.info('[engineering-app] Layout-app initialized');
}
