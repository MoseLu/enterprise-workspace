/**
 * 挂载 DevTools 组件的工具函数
 * 供所有应用使用，确保所有应用都能看到开发工具悬浮按钮
 */

import { createApp } from 'vue';
import type { App } from 'vue';

let devToolsApp: App | null = null;
let devToolsContainer: HTMLElement | null = null;

// 处理 Vite 热重载：如果模块被热更新，清理旧实例
if (import.meta.hot) {
  import.meta.hot.dispose((_data) => {
    if (devToolsApp && devToolsContainer) {
      try {
        devToolsApp.unmount();
        if (devToolsContainer.parentNode) {
          devToolsContainer.parentNode.removeChild(devToolsContainer);
        }
      } catch (err) {
        // 热重载清理失败
      }
      devToolsApp = null;
      devToolsContainer = null;
    }
    // 清除全局标志，允许重新挂载
    if (typeof window !== 'undefined') {
      (window as any).__DEVTOOLS_MOUNTED__ = false;
      (window as any).__DEVTOOLS_MOUNTING__ = false;
      // 清除全局实例引用
      (window as any).__DEVTOOLS_APP__ = null;
      (window as any).__DEVTOOLS_CONTAINER__ = null;
    }
  });

  // 热重载后自动重新挂载
  import.meta.hot.accept(() => {
    // 延迟重新挂载，确保旧实例已完全清理
    setTimeout(() => {
      if (typeof window !== 'undefined' && !(window as any).__DEVTOOLS_MOUNTED__) {
        // 从全局获取 http 实例和 EPS list
        const httpInstance = (window as any).__APP_HTTP__;
        const epsList = (window as any).__APP_EPS_LIST__ || [];
        mountDevTools({
          httpInstance,
          epsList,
        }).catch((_err) => {
          // 热重载后重新挂载失败
        });
      }
    }, 100);
  });
}

/**
 * 挂载 DevTools 组件
 * @param httpInstance - HTTP 实例（可选），用于 API 切换功能
 * @param epsList - EPS 列表（可选），用于 EPS 查看功能
 */
export async function mountDevTools(options?: {
  httpInstance?: any;
  epsList?: any[];
}) {

  // 关键：使用全局标志防止重复挂载（跨模块实例）
  if (typeof window !== 'undefined') {
    // 首先检查是否正在挂载中（防止并发）
    if ((window as any).__DEVTOOLS_MOUNTING__) {
      // 等待挂载完成（最多等待 3 秒）
      let waitCount = 0;
      while ((window as any).__DEVTOOLS_MOUNTING__ && waitCount < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      // 如果挂载完成，检查是否成功
      if ((window as any).__DEVTOOLS_MOUNTED__) {
        return;
      }
    }

    // 检查全局标志
    if ((window as any).__DEVTOOLS_MOUNTED__) {
      // 检查 DOM 元素是否还存在
      const existingContainers = document.querySelectorAll('[data-dev-tools-container]');
      if (existingContainers.length > 0) {
        return;
      } else {
        // DOM 元素不存在但标志存在，清除标志并重新挂载
        (window as any).__DEVTOOLS_MOUNTED__ = false;
      }
    }

    // 额外检查：如果 DOM 中已经存在容器，直接返回
    const existingContainers = document.querySelectorAll('[data-dev-tools-container]');
    if (existingContainers.length > 0) {
      (window as any).__DEVTOOLS_MOUNTED__ = true;
      return;
    }
  }

  // 如果已经挂载，不重复挂载
  // 关键：同时检查本地实例和全局实例
  const globalApp = typeof window !== 'undefined' ? (window as any).__DEVTOOLS_APP__ : null;
  const globalContainer = typeof window !== 'undefined' ? (window as any).__DEVTOOLS_CONTAINER__ : null;

  if ((devToolsApp && devToolsContainer) || (globalApp && globalContainer)) {
    // 同步本地变量
    if (globalApp && !devToolsApp) {
      devToolsApp = globalApp;
    }
    if (globalContainer && !devToolsContainer) {
      devToolsContainer = globalContainer;
    }
    return;
  }

  try {
    // 动态导入 DevTools 组件
    const { BtcDevTools } = await import('../index');

    // 暴露 http 实例到全局，供 DevTools 使用
    if (options?.httpInstance && typeof (window as any).__APP_HTTP__ === 'undefined') {
      (window as any).__APP_HTTP__ = options.httpInstance;
    }

    // 暴露 EPS list 到全局，供 DevTools 使用
    if (options?.epsList && typeof (window as any).__APP_EPS_LIST__ === 'undefined') {
      (window as any).__APP_EPS_LIST__ = options.epsList;
    }

    // 关键：在创建前再次检查，防止并发挂载
    if (typeof window !== 'undefined') {
      const existingContainers = document.querySelectorAll('[data-dev-tools-container]');
      if (existingContainers.length > 0) {
        (window as any).__DEVTOOLS_MOUNTED__ = true;
        return;
      }
      // 设置挂载中标志，防止并发
      if ((window as any).__DEVTOOLS_MOUNTING__) {
        return;
      }
      (window as any).__DEVTOOLS_MOUNTING__ = true;
    }

    // 创建 DevTools 应用实例
    // 检查是否已经存在容器（包括热重载导致的重复）
    if (import.meta.env.DEV) {
      const existingContainers = document.querySelectorAll('[data-dev-tools-container]');
      if (existingContainers.length > 0) {
        // 清理所有已存在的容器（包括热重载导致的）
        existingContainers.forEach((container) => {
          try {
            // 尝试卸载 Vue 应用
            const vueApp = (container as any).__vue_app__;
            if (vueApp) {
              vueApp.unmount();
            }
            // 移除 DOM 元素
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          } catch (err) {
            // 即使出错也尝试移除
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          }
        });
      }
    }

    // 如果本地实例已存在，先卸载
    if (devToolsApp && devToolsContainer) {
      try {
        devToolsApp.unmount();
        if (devToolsContainer.parentNode) {
          devToolsContainer.parentNode.removeChild(devToolsContainer);
        }
      } catch (err) {
        // 卸载旧实例时出错
      }
      devToolsApp = null;
      devToolsContainer = null;
    }

    // 最终检查：确保没有其他容器（防止并发创建）
    // 注意：这个检查在创建新容器之前，会清理所有已存在的容器
    // 但如果这是并发调用，可能会清理掉另一个调用刚创建的容器
    // 所以我们需要更谨慎：只在确实有多个容器时才清理
    const finalCheck = document.querySelectorAll('[data-dev-tools-container]');
    if (finalCheck.length > 0) {
      // 如果本地容器已存在且在 DOM 中，说明这是重复调用，直接返回
      if (devToolsContainer && document.body.contains(devToolsContainer)) {
        (window as any).__DEVTOOLS_MOUNTED__ = true;
        (window as any).__DEVTOOLS_MOUNTING__ = false;
        return;
      }

      // 清理所有已存在的容器（这些可能是热重载或并发调用导致的）
      finalCheck.forEach((container) => {
        try {
          const vueApp = (container as any).__vue_app__;
          if (vueApp) {
            vueApp.unmount();
          }
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        } catch (err) {
          if (container.parentNode) {
            container.parentNode.removeChild(container);
          }
        }
      });
    }

    devToolsApp = createApp(BtcDevTools);
    devToolsContainer = document.createElement('div');
    // 关键：添加标识属性，方便查找和防止重复挂载
    devToolsContainer.setAttribute('data-dev-tools-container', 'true');
    document.body.appendChild(devToolsContainer);
    devToolsApp.mount(devToolsContainer);
    // 将 Vue 应用实例保存到容器上，方便后续清理
    (devToolsContainer as any).__vue_app__ = devToolsApp;

    // 关键：保存到全局变量，确保跨模块实例共享
    if (typeof window !== 'undefined') {
      (window as any).__DEVTOOLS_APP__ = devToolsApp;
      (window as any).__DEVTOOLS_CONTAINER__ = devToolsContainer;
    }

    // 关键：设置全局标志，防止重复挂载
    if (typeof window !== 'undefined') {
      (window as any).__DEVTOOLS_MOUNTED__ = true;
      (window as any).__DEVTOOLS_MOUNTING__ = false;
    }
  } catch (err) {
    // 挂载失败时清除标志
    if (typeof window !== 'undefined') {
      (window as any).__DEVTOOLS_MOUNTED__ = false;
      (window as any).__DEVTOOLS_MOUNTING__ = false;
    }
    // 清理已创建的实例
    devToolsApp = null;
    devToolsContainer = null;
  }
}

/**
 * 卸载 DevTools 组件
 */
export function unmountDevTools() {
  if (devToolsApp && devToolsContainer) {
    try {
      devToolsApp.unmount();
      if (devToolsContainer.parentNode) {
        devToolsContainer.parentNode.removeChild(devToolsContainer);
      }
      devToolsApp = null;
      devToolsContainer = null;
      // 清除全局标志
      if (typeof window !== 'undefined') {
        (window as any).__DEVTOOLS_MOUNTED__ = false;
      }
    } catch (err) {
      // 卸载失败
    }
  }
}

