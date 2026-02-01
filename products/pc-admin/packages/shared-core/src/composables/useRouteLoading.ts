/**
 * 路由级 Loading Composable
 * 管理覆盖单个页面/路由视图区域的 loading
 */
;

import { ref, onUnmounted } from 'vue';
import { LOADING_Z_INDEX, LOADING_TIMEOUT } from '../btc/utils/loading.config';

/**
 * 路由 Loading 实例信息
 */
interface RouteLoadingInstance {
  container: HTMLElement | null;
  loadingElement: HTMLElement | null;
  skeletonElement: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
}

/**
 * 使用路由级 Loading
 * @param containerSelector 路由视图容器的选择器（可选，默认查找 router-view）
 */
export function useRouteLoading(containerSelector?: string) {
  const instanceRef = ref<RouteLoadingInstance>({
    container: null,
    loadingElement: null,
    skeletonElement: null,
    timeoutId: null,
    isVisible: false,
  });

  /**
   * 查找路由视图容器
   */
  const findContainer = (): HTMLElement | null => {
    if (containerSelector) {
      return document.querySelector(containerSelector) as HTMLElement;
    }
    
    // 默认查找 router-view
    return document.querySelector('router-view') as HTMLElement ||
           document.querySelector('[data-router-view]') as HTMLElement ||
           document.querySelector('.router-view-container') as HTMLElement;
  };

  /**
   * 创建 Loading 元素
   */
  const createLoadingElement = (_container: HTMLElement): HTMLElement => {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'route-loading';
    loadingEl.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: ${LOADING_Z_INDEX.ROUTE};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: var(--el-bg-color);
      opacity: 1;
      pointer-events: auto;
      min-height: 200px;
    `;

    loadingEl.innerHTML = `
      <div class="route-loading-spinner" style="
        width: 32px;
        height: 32px;
        border: 3px solid var(--el-border-color-lighter);
        border-top-color: var(--el-color-primary);
        border-radius: 50%;
        animation: route-loading-spin 1s linear infinite;
      "></div>
    `;

    // 添加旋转动画（如果不存在）
    if (!document.getElementById('route-loading-style')) {
      const style = document.createElement('style');
      style.id = 'route-loading-style';
      style.textContent = `
        @keyframes route-loading-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return loadingEl;
  };

  /**
   * 查找骨架屏元素
   */
  const findSkeleton = (container: HTMLElement): HTMLElement | null => {
    return container.querySelector('.route-skeleton, [data-route-skeleton]') as HTMLElement;
  };

  /**
   * 显示路由 Loading
   */
  const show = (): void => {
    const instance = instanceRef.value;

    // 如果已经显示，先隐藏
    if (instance.isVisible) {
      hide();
    }

    // 查找容器
    const container = findContainer();
    if (!container) {
      console.warn('[useRouteLoading] 无法找到路由视图容器');
      return;
    }

    instance.container = container;

    // 确保容器是相对定位
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.position === 'static') {
      container.style.position = 'relative';
    }

    // 优先使用骨架屏
    const skeleton = findSkeleton(container);
    if (skeleton) {
      instance.skeletonElement = skeleton;
      skeleton.style.setProperty('display', 'block', 'important');
      skeleton.style.setProperty('visibility', 'visible', 'important');
      skeleton.style.setProperty('opacity', '1', 'important');
      instance.isVisible = true;
    } else {
      // 如果没有骨架屏，使用 loading 元素
      instance.loadingElement = createLoadingElement(container);
      container.appendChild(instance.loadingElement);
      instance.isVisible = true;
    }

    // 清除之前的超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
    }

    // 设置超时关闭（5秒）
    instance.timeoutId = setTimeout(() => {
      console.warn('[useRouteLoading] 路由 loading 超时自动关闭（5秒）');
      hide();
    }, LOADING_TIMEOUT.ROUTE);
  };

  /**
   * 隐藏路由 Loading
   */
  const hide = (): void => {
    const instance = instanceRef.value;
    if (!instance.isVisible) {
      return;
    }

    // 清除超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = null;
    }

    // 隐藏骨架屏
    if (instance.skeletonElement) {
      instance.skeletonElement.style.setProperty('opacity', '0', 'important');
      setTimeout(() => {
        if (instance.skeletonElement) {
          instance.skeletonElement.style.setProperty('display', 'none', 'important');
          instance.skeletonElement.style.setProperty('visibility', 'hidden', 'important');
        }
      }, 300);
    }

    // 隐藏 loading 元素
    if (instance.loadingElement && instance.loadingElement.parentNode) {
      instance.loadingElement.style.setProperty('opacity', '0', 'important');
      instance.loadingElement.style.setProperty('pointer-events', 'none', 'important');
      
      // 延迟移除 DOM 元素（确保动画完成）
      setTimeout(() => {
        if (instance.loadingElement && instance.loadingElement.parentNode) {
          instance.loadingElement.parentNode.removeChild(instance.loadingElement);
        }
        instance.loadingElement = null;
      }, 300);
    }

    instance.isVisible = false;
  };

  // 组件卸载时清理
  onUnmounted(() => {
    hide();
  });

  return {
    show,
    hide,
    isVisible: () => instanceRef.value.isVisible,
  };
}

