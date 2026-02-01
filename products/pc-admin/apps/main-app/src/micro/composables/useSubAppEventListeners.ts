/**
 * 子应用事件监听 Composable
 * 用于监听子应用的就绪和路由变化事件
 */

import { getMainAppId } from '@btc/shared-core';

/**
 * 监听子应用就绪事件
 */
export function listenSubAppReady(): void {
  window.addEventListener('subapp:ready', async (event: any) => {
    const appName = event.detail?.name;

    // 关键：清除 loading 属性，确保 Layout 组件能正确更新状态
    const container = document.querySelector('#subapp-viewport') as HTMLElement;
    if (container && container.hasAttribute('data-qiankun-loading')) {
      container.removeAttribute('data-qiankun-loading');
    }

    // 触发 after-mount 事件，确保 Layout 组件更新状态
    window.dispatchEvent(new CustomEvent('qiankun:after-mount', {
      detail: { appName }
    }));
  });
}

/**
 * 监听子应用路由变化事件
 */
export function listenSubAppRouteChange(): void {
  window.addEventListener('subapp:route-change', (event: Event) => {
    const customEvent = event as CustomEvent;
    const { path, fullPath, name, meta } = customEvent.detail;

    // 动态导入避免循环依赖
    (async () => {
      const { getCurrentAppFromPath } = await import('../../store/process');
      const { addTab, updateBreadcrumb } = await import('../../utils/globalTabBreadcrumb');
      const app = getCurrentAppFromPath(path);

      // 如果是子应用首页，不添加到 Tabbar
      if (meta?.isHome === true) {
        return;
      }

      // 排除主应用（从配置动态获取）
      if (app === getMainAppId()) {
        return;
      }

      // 排除文档域（docs）
      if (app === 'docs') {
        return;
      }

      // 构建 Tab 元数据（格式和主应用完全一致）
      const tabItem = {
        key: fullPath || path,
        path: fullPath || path,
        i18nKey: meta?.i18nKey || meta?.labelKey || meta?.titleKey || `${name || 'page'}.title`,
        label: meta?.label || meta?.title || name,
        closable: true, // 微应用 Tab 可关闭
        appName: app, // 微应用标识
      };

      // 构建面包屑数据
      const breadcrumbList = meta?.breadcrumb || meta?.breadcrumbs || [];

      // 通过 qiankun 全局状态推送元数据
      await addTab(tabItem);
      if (breadcrumbList.length > 0) {
        await updateBreadcrumb(breadcrumbList);
      }

      // 兼容性：同时更新 processStore（过渡期）
      try {
        const { useProcessStore } = await import('../../store/process');
        const process = useProcessStore();
        process.add({
          path,
          fullPath,
          name,
          meta,
        });
      } catch (error) {
        // 忽略错误
      }
    })();
  });
}

