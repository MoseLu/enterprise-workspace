/**
 * 应用级 Loading 服务
 * 管理覆盖单个应用容器的 loading，仅遮挡当前应用区域，不影响其他应用
 * 使用 Vue 组件（BtcAppLoading）挂载实现
 */

import { storage } from '../../../utils';
import { LOADING_Z_INDEX, LOADING_TIMEOUT } from '../loading.config';
import { createApp, type App } from 'vue';

/**
 * 应用 Loading 实例信息
 */
interface BtcAppLoadingInstance {
  appName: string;
  container: HTMLElement;
  loadingElement: HTMLElement | null; // 容器元素
  vueApp: App | null; // Vue 应用实例
  vueInstance: any; // Vue 组件实例
  skeletonElement: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
  showTime: number; // 显示时间戳
}

type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';

/**
 * 获取当前的 Loading 样式（同步版本）
 * 注意：由于是同步函数，无法使用动态导入，所以直接读取 localStorage
 */
function getLoadingStyle(): LoadingStyle {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 'circle';
    }

    // 直接读取 storage 中的 settings（因为这是同步函数）
    // 注意：由于 appStorage.settings 可能存储在 Cookie 中，这里需要同时检查 storage 和 Cookie
    try {
      // 尝试读取 storage 中的 settings
      const settings = storage.get<Record<string, any>>('settings');

      if (settings) {

        if (settings.loadingStyle === 'dots') {
          return 'dots';
        }
        if (settings.loadingStyle === 'circle') {
          return 'circle';
        }
        if (settings.loadingStyle === 'gradient') {
          return 'gradient';
        }
        if (settings.loadingStyle === 'progress') {
          return 'progress';
        }
        if (settings.loadingStyle === 'flower') {
          return 'flower';
        }
      }

      // 如果 localStorage 中没有，尝试从 Cookie 读取（如果可用）
      try {
        const cookieSettings = document.cookie
          .split('; ')
          .find(row => row.startsWith('btc_settings='));
        if (cookieSettings) {
          const cookieValue = decodeURIComponent(cookieSettings.split('=')[1]);
          const settings = JSON.parse(cookieValue);

          if (settings.loadingStyle === 'dots') {
            return 'dots';
          }
          if (settings.loadingStyle === 'circle') {
            return 'circle';
          }
          if (settings.loadingStyle === 'gradient') {
            return 'gradient';
          }
          if (settings.loadingStyle === 'progress') {
            return 'progress';
          }
          if (settings.loadingStyle === 'flower') {
            return 'flower';
          }
        }
      } catch (cookieError) {
        // 忽略 Cookie 读取错误
      }

    } catch (e) {
      // 忽略解析错误
    }
  } catch (e) {
    // 忽略异常
  }
  return 'circle';
}

/**
 * 应用级 Loading 服务
 * 单例模式，管理多个应用的 loading 实例
 */
class BtcAppLoadingService {
  private instances: Map<string, BtcAppLoadingInstance> = new Map();

  constructor() {
    // 监听 loading 样式变化事件
    // 组件内部已监听此事件，这里不需要额外处理
  }

  /**
   * 查找或创建应用的容器元素
   */
  private findContainer(_appName: string, container?: HTMLElement): HTMLElement | null {
    if (container) {
      return container;
    }

    // 优先查找 #subapp-viewport
    const viewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (viewport) {
      return viewport;
    }

    // 如果找不到，返回 null（由调用方处理）
    return null;
  }

  /**
   * 创建 Vue 应用实例（延迟加载，避免循环依赖）
   */
  private async createVueAppInstance(appDisplayName: string, container: HTMLElement): Promise<{ vueApp: App; vueInstance: any; loadingElement: HTMLElement }> {
    try {
      // 动态导入 Vue 组件
      const sharedComponents = await import('@btc/shared-components');
      const BtcAppLoading = sharedComponents.BtcAppLoading;

      if (!BtcAppLoading) {
        throw new Error('BtcAppLoading component not found in @btc/shared-components');
      }

      const { createApp: createVueApp } = await import('vue');

      // 创建容器元素
      const loadingEl = document.createElement('div');
      loadingEl.className = 'app-loading-container-wrapper';
      // 关键：使用 fixed 定位覆盖整个屏幕，确保能覆盖子应用index.html中的#Loading元素
      // 关键修复：初始时背景透明，只有在内容显示时才设置背景色
      loadingEl.style.cssText = `
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: ${LOADING_Z_INDEX.APP};
        background-color: transparent;
        opacity: 1;
        pointer-events: auto;
      `;

      // 创建 Vue 应用实例
      const vueApp = createVueApp(BtcAppLoading, {
        visible: true,
        title: appDisplayName,
        tip: '正在加载资源',
        isFail: false,
        timeout: LOADING_TIMEOUT.APP,
        minShowTime: 500,
      });

      // 挂载到容器元素
      const vueInstance = vueApp.mount(loadingEl);

      return { vueApp, vueInstance, loadingElement: loadingEl };
    } catch (error) {
      throw error;
    }
  }

  /**
   * 查找或创建骨架屏元素
   */
  private findOrCreateSkeleton(container: HTMLElement): HTMLElement | null {
    // 优先查找已存在的骨架屏
    let skeleton = container.querySelector('#app-skeleton') as HTMLElement;

    if (!skeleton) {
      // 如果不存在，不自动创建（由组件提供）
      return null;
    }

    return skeleton;
  }

  /**
   * 显示应用级 Loading
   * @param appDisplayName 应用显示名称（如"财务模块"，用于显示在loading中）
   * @param container 应用容器（可选，默认查找 #subapp-viewport，即使不存在也会显示，因为使用fixed定位）
   */
  async show(appDisplayName: string, container?: HTMLElement): Promise<void> {
    // 关键：不允许显示"应用"loading（这是默认值，不应该显示）
    // 如果传入"应用"，说明应用名称还没有确定，不应该显示loading
    if (appDisplayName === '应用') {
      return;
    }

    // 关键：在显示新的loading之前，先清除所有#Loading元素（包括system-app的"拜里斯科技"）
    // 确保不会被子应用的index.html中的loading覆盖，也不会被system-app的loading覆盖
    // 使用 is-hide 类，样式已在 loading.css 中定义
    const loadingEls = document.querySelectorAll('#Loading');
    loadingEls.forEach((loadingEl) => {
      if (loadingEl instanceof HTMLElement) {
        // 特别处理system-app的#Loading（包含"拜里斯科技"），在子应用时应该隐藏
        loadingEl.classList.add('is-hide');
      }
    });


    // 关键：隐藏所有其他应用的loading实例（只显示当前应用的loading）
    // 遍历所有实例，隐藏不是当前应用的loading
    this.instances.forEach((instance, key) => {
      if (key !== appDisplayName && instance.isVisible) {
        this.hide(key);
      }
    });

    // 查找容器（如果找不到，使用document.body作为占位符，因为loading使用fixed定位）
    const appContainer = this.findContainer(appDisplayName, container) || document.body;

    // 使用显示名称作为 key（如果同一个应用有不同的显示名称，会创建多个实例，但通常不会发生）
    const instanceKey = appDisplayName;

    // 获取或创建实例
    let instance = this.instances.get(instanceKey);
    if (!instance) {
      instance = {
        appName: appDisplayName,
        container: appContainer,
        loadingElement: null,
        vueApp: null,
        vueInstance: null,
        skeletonElement: null,
        timeoutId: null,
        isVisible: false,
        showTime: 0,
      };
      this.instances.set(instanceKey, instance);
    } else {
      // 如果容器已变化，更新容器引用
      if (instance.container !== appContainer) {
        instance.container = appContainer;
      }
    }

    // 清除之前的超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = null;
    }

    // 记录显示时间戳
    const showTime = Date.now();
    instance.showTime = showTime;

    // 优先使用骨架屏
    const skeleton = this.findOrCreateSkeleton(instance.container);
    if (skeleton) {
      instance.skeletonElement = skeleton;
      skeleton.style.setProperty('display', 'flex', 'important');
      skeleton.style.setProperty('visibility', 'visible', 'important');
      skeleton.style.setProperty('opacity', '1', 'important');
      instance.isVisible = true;
    } else {
      // 如果没有骨架屏，使用 Vue 组件
      try {
        if (!instance.loadingElement || !instance.vueApp) {
          // 创建 Vue 应用实例
          const { vueApp, vueInstance, loadingElement } = await this.createVueAppInstance(appDisplayName, instance.container);
          instance.loadingElement = loadingElement;
          instance.vueApp = vueApp;
          instance.vueInstance = vueInstance;
          // 关键：由于使用fixed定位，应该添加到body而不是container，确保覆盖整个屏幕
          document.body.appendChild(loadingElement);

          // 关键修复：确保背景色在有内容时显示（和根级别一样使用深色背景）
          requestAnimationFrame(() => {
            const mask = loadingElement.querySelector('.btc-app-loading-mask');
            const container = loadingElement.querySelector('.btc-app-loading-container');
            if (mask instanceof HTMLElement) {
              // 和根级别一样使用深色背景
              mask.style.setProperty('background-color', '#0a0a0a', 'important');
            }
            // 添加 ready 类，使容器显示
            if (container instanceof HTMLElement) {
              container.classList.add('btc-app-loading-container--ready');
            }
          });
        } else {
          // 如果 Vue 应用已存在，更新 props（如果需要）
          // 注意：Vue 3 中 props 是只读的，如果需要更新，需要重新挂载
          // 这里暂时不更新，因为 BtcAppLoading 组件内部已经通过响应式状态管理

          // 确保loading元素在body中（如果不在，移动到body）
          if (instance.loadingElement.parentNode !== document.body) {
            document.body.appendChild(instance.loadingElement);
          }

          // 关键修复：确保背景色在有内容时显示（和根级别一样使用深色背景）
          requestAnimationFrame(() => {
            const mask = instance.loadingElement?.querySelector('.btc-app-loading-mask');
            const container = instance.loadingElement?.querySelector('.btc-app-loading-container');
            if (mask instanceof HTMLElement) {
              // 和根级别一样使用深色背景
              mask.style.setProperty('background-color', '#0a0a0a', 'important');
            }
            // 添加 ready 类，使容器显示
            if (container instanceof HTMLElement) {
              container.classList.add('btc-app-loading-container--ready');
            }
          });
        }

        instance.isVisible = true;
      } catch (error) {
        // 如果 Vue 组件加载失败，降级方案：创建一个简单的 loading 元素
        if (!instance.loadingElement) {
          const loadingEl = document.createElement('div');
          loadingEl.className = 'app-loading-fallback';
          // 关键：使用深色背景，确保页面内容在 loading 期间被遮挡
          loadingEl.style.cssText = `
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: ${LOADING_Z_INDEX.APP};
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0a0a0a;
          `;
          loadingEl.innerHTML = `<div style="text-align: center; color: var(--el-text-color-primary);">${appDisplayName}<br/>正在加载...</div>`;
          instance.loadingElement = loadingEl;
          document.body.appendChild(loadingEl);
        }
        instance.isVisible = true;
      }
    }

    // 设置超时关闭（10秒）
    instance.timeoutId = setTimeout(() => {
      this.hide(appDisplayName);
    }, LOADING_TIMEOUT.APP);
  }

  /**
   * 隐藏指定应用的 Loading
   * @param appDisplayName 应用显示名称（如"财务模块"）
   */
  hide(appDisplayName: string): void {
    const hideTime = Date.now();

    const instance = this.instances.get(appDisplayName);

    // 如果实例不存在，尝试通过 DOM 直接查找并关闭所有 .app-loading 元素（兜底方案）
    if (!instance) {
      // 查找所有 .app-loading 元素并强制关闭
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
      return;
    }

    // 如果实例存在但不可见，直接返回（不重复隐藏）
    if (!instance.isVisible) {
      return;
    }

    // 计算持续时间
    const duration = instance.showTime > 0 ? hideTime - instance.showTime : 0;

    // 清除超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = null;
    }

    // 隐藏骨架屏
    if (instance.skeletonElement) {
      instance.skeletonElement.style.setProperty('display', 'none', 'important');
      instance.skeletonElement.style.setProperty('visibility', 'hidden', 'important');
      instance.skeletonElement.style.setProperty('opacity', '0', 'important');
    }

    // 隐藏 loading 元素（卸载 Vue 应用实例）
    if (instance.vueApp && instance.loadingElement) {
      // 关键修复：立即移除背景色，让页面内容透过显示
      const mask = instance.loadingElement.querySelector('.btc-app-loading-mask');
      if (mask instanceof HTMLElement) {
        mask.style.removeProperty('background');
        // 关键修复：移除 show 类，触发平滑过渡
        mask.classList.remove('btc-app-loading-mask--show');
        // 确保过渡生效
        mask.style.setProperty('visibility', 'hidden', 'important');
        mask.style.setProperty('opacity', '0', 'important');
      }

      // 等待过渡完成后再卸载和移除
      setTimeout(() => {
        try {
          // 卸载 Vue 应用实例
          instance.vueApp?.unmount();
          // 移除 DOM 元素
          if (instance.loadingElement?.parentNode) {
            instance.loadingElement.parentNode.removeChild(instance.loadingElement);
          }
        } catch (e) {
          // 如果卸载失败，强制移除 DOM 元素
          try {
            if (instance.loadingElement?.parentNode) {
              instance.loadingElement.parentNode.removeChild(instance.loadingElement);
            }
          } catch (err) {
            // 忽略移除错误
          }
        }
        instance.vueApp = null;
        instance.vueInstance = null;
        instance.loadingElement = null;
      }, 300); // 匹配 CSS transition 时长
    } else if (instance.loadingElement) {
      // 如果没有 Vue 应用实例（降级方案），使用平滑过渡
      // 关键修复：立即移除背景色
      instance.loadingElement.style.removeProperty('background-color');
      instance.loadingElement.style.setProperty('visibility', 'hidden', 'important');
      instance.loadingElement.style.setProperty('opacity', '0', 'important');
      instance.loadingElement.style.setProperty('pointer-events', 'none', 'important');

      // 等待过渡完成后再移除
      setTimeout(() => {
        try {
          if (instance.loadingElement?.parentNode) {
            instance.loadingElement.parentNode.removeChild(instance.loadingElement);
          }
        } catch (e) {
          // 如果移除失败，尝试延迟移除
          setTimeout(() => {
            if (instance.loadingElement?.parentNode) {
              try {
                instance.loadingElement.parentNode.removeChild(instance.loadingElement);
              } catch (err) {
                // 忽略移除错误
              }
            }
          }, 100);
        }
        instance.loadingElement = null;
      }, 300); // 匹配 CSS transition 时长
    }

    instance.isVisible = false;
    instance.showTime = 0;
  }

  /**
   * 隐藏所有应用的 Loading
   */
  hideAll(): void {
    for (const appName of this.instances.keys()) {
      this.hide(appName);
    }
  }

  /**
   * 销毁指定应用的实例
   */
  destroy(appName: string): void {
    this.hide(appName);
    this.instances.delete(appName);
  }

  /**
   * 销毁所有实例
   */
  destroyAll(): void {
    this.hideAll();
    this.instances.clear();
  }

  /**
   * 清理所有实例（用于应用卸载时，彻底清理资源）
   */
  cleanupAll(): void {
    // 清理所有实例的 Vue 应用和 DOM 元素
    this.instances.forEach((instance, appName) => {
      try {
        // 清理定时器
        if (instance.timeoutId) {
          clearTimeout(instance.timeoutId);
          instance.timeoutId = null;
        }

        // 卸载 Vue 应用
        if (instance.vueApp) {
          try {
            instance.vueApp.unmount();
          } catch (error) {
            // 忽略卸载错误
          }
          instance.vueApp = null;
        }

        // 移除 DOM 元素
        if (instance.loadingElement && instance.loadingElement.parentNode) {
          instance.loadingElement.parentNode.removeChild(instance.loadingElement);
        }
        instance.loadingElement = null;
        instance.vueInstance = null;
        instance.skeletonElement = null;
        instance.isVisible = false;
      } catch (error) {
        // 忽略清理错误
      }
    });

    // 清空 Map
    this.instances.clear();
  }

  /**
   * 检查是否有任何应用级别loading正在显示
   * 供其他服务（如RouteLoadingService）检查，确保互斥
   */
  isAnyVisible(): boolean {
    for (const instance of this.instances.values()) {
      if (instance.isVisible) {
        return true;
      }
    }
    return false;
  }
}

// 导出单例实例
export const appLoadingService = new BtcAppLoadingService();

