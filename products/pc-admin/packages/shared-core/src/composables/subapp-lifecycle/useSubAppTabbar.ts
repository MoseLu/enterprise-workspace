/**
 * Tabbar 相关工具函数
 * 主要逻辑已在 shared-components 的 process store 中实现
 * 这里提供一些辅助函数
 */

import { getCurrentAppFromPath } from '@btc/shared-components';
import type { ProcessItem } from '@btc/shared-components';

/**
 * 监听子应用路由变化事件并添加 tab（在 layout-app 中使用）
 * @param appId 应用 ID
 */
export function listenSubAppRouteChange(_appId: string): void {
  window.addEventListener('subapp:route-change', async (event: Event) => {
    const customEvent = event as CustomEvent;
    const { path, fullPath, name, meta } = customEvent.detail;

    // 动态导入避免循环依赖
    const sharedComponents = await import('@btc/shared-components') as typeof import('@btc/shared-components');
    const { useProcessStore } = sharedComponents;
    const processStore = useProcessStore();
    const app = getCurrentAppFromPath(path);

    // 如果是子应用首页，将该应用的所有标签设为未激活
    if (meta?.isHome === true) {
      processStore.list.forEach((tab: ProcessItem) => {
        if (tab.app === app) {
          tab.active = false;
        }
      });
      return;
    }

    // 排除无效应用（main）
    // 所有其他应用（system, admin, logistics, engineering, quality, production, finance, monitor 等）都应该处理
    if (app === 'main') {
      return;
    }

    // 排除文档域（docs）
    if (app === 'docs') {
      return;
    }

    processStore.add({
      path,
      fullPath,
      name,
      meta,
    });
  });
}
