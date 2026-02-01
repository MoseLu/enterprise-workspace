/**
 * 路由级 Loading 服务
 * 管理覆盖单个页面/路由视图区域的 loading，自动在路由切换时显示
 */

import { LOADING_Z_INDEX, LOADING_TIMEOUT } from '../loading.config';
import { appLoadingService } from './app-loading.service';

/**
 * 路由 Loading 实例信息
 */
interface RouteLoadingInstance {
  container: HTMLElement | null;
  loadingElement: HTMLElement | null;
  skeletonElement: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
  showTime: number; // 显示时间戳
}

/**
 * 路由级 Loading 服务
 * 单例模式，管理路由级别的 loading
 */
class RouteLoadingService {
  private instance: RouteLoadingInstance = {
    container: null,
    loadingElement: null,
    skeletonElement: null,
    timeoutId: null,
    isVisible: false,
    showTime: 0,
  };

  /**
   * 查找路由视图容器
   */
  private findContainer(): HTMLElement | null {
    // 1. 优先查找带有 data-router-view 属性的容器（AppLayout 使用）
    const dataRouterView = document.querySelector('[data-router-view]') as HTMLElement;
    if (dataRouterView) {
      return dataRouterView;
    }

    // 2. 在 qiankun 模式下，查找 #subapp-viewport 内的容器
    const subappViewport = document.querySelector('#subapp-viewport') as HTMLElement;
    if (subappViewport) {
      // 在 subapp-viewport 内查找 router-view
      const routerViewInSubapp = subappViewport.querySelector('router-view') as HTMLElement;
      if (routerViewInSubapp) {
        return routerViewInSubapp;
      }
      // 如果找不到 router-view，使用 subapp-viewport 本身（如果它有内容）
      if (subappViewport.children.length > 0) {
        return subappViewport;
      }
    }

    // 3. 查找 .app-layout__content（AppLayout 的内容容器）
    const appLayoutContent = document.querySelector('.app-layout__content') as HTMLElement;
    if (appLayoutContent) {
      return appLayoutContent;
    }

    // 4. 查找全局的 router-view
    const routerView = document.querySelector('router-view') as HTMLElement;
    if (routerView) {
      return routerView;
    }

    // 5. 查找 .router-view-container（备用选择器）
    const routerViewContainer = document.querySelector('.router-view-container') as HTMLElement;
    if (routerViewContainer) {
      return routerViewContainer;
    }

    // 6. 在 qiankun 模式下，如果找不到其他容器，尝试查找子应用的根容器
    if (subappViewport) {
      const subappRoot = subappViewport.querySelector('[data-qiankun]') as HTMLElement;
      if (subappRoot) {
        return subappRoot;
      }
      // 关键：避免返回 #app，因为这会覆盖整个应用导致黑屏
      // 如果找不到其他容器，返回 null，不显示 loading
    }

    // 关键：不要返回 #app，避免覆盖整个应用导致黑屏
    // 如果找不到正确的路由视图容器，返回 null
    return null;
  }

  /**
   * 创建 Loading 元素
   */
  private createLoadingElement(container: HTMLElement): HTMLElement {
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
  }

  /**
   * 查找骨架屏元素
   */
  private findSkeleton(container: HTMLElement): HTMLElement | null {
    return container.querySelector('.route-skeleton, [data-route-skeleton]') as HTMLElement;
  }

  /**
   * 检查是否有应用级别loading正在显示
   */
  private isAppLoadingVisible(): boolean {
    try {
      // 优先使用appLoadingService的isAnyVisible方法（更可靠）
      if (appLoadingService && typeof appLoadingService.isAnyVisible === 'function') {
        return appLoadingService.isAnyVisible();
      }
    } catch (e) {
      // 如果调用失败，回退到DOM查询
    }
    
    // 回退方案：通过DOM查询检查
    try {
      // 检查body中是否有.app-loading元素（因为应用级别loading使用fixed定位，添加到body）
      const appLoadingEl = document.querySelector('.app-loading') as HTMLElement;
      if (!appLoadingEl) {
        return false;
      }
      
      const style = window.getComputedStyle(appLoadingEl);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             parseFloat(style.opacity) > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * 显示路由 Loading
   */
  show(): void {
    // 如果已经显示，先隐藏
    if (this.instance.isVisible) {
      this.hide();
    }

    // 检查是否有应用级别loading正在显示，如果有则不显示路由loading（互斥原则）
    if (this.isAppLoadingVisible()) {
      return;
    }

    // 关键：在独立运行模式下（非 qiankun 且非 layout-app），不显示路由 loading
    // 因为独立运行模式下，应用级 loading 已经处理了，不需要路由级 loading
    const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
    const isQiankun = typeof window !== 'undefined' && (window as any).__POWERED_BY_QIANKUN__;
    const isStandalone = !isQiankun && !isUsingLayoutApp;
    
    if (isStandalone) {
      // 独立运行模式，不显示路由 loading
      return;
    }

    // 查找容器
    let container = this.findContainer();
    
    // 关键：如果找到的容器是 #app，说明找不到正确的路由视图容器，不应该显示 loading
    // 避免整个应用被 loading 覆盖导致黑屏
    if (container && container.id === 'app') {
      // 在独立运行模式下，不应该显示路由 loading
      if (isStandalone) {
        return;
      }
      // 在 qiankun 或 layout-app 模式下，如果找到 #app，尝试查找更具体的容器
      const routerView = container.querySelector('router-view');
      if (routerView) {
        container = routerView as HTMLElement;
      } else {
        // 如果找不到 router-view，不显示 loading，避免覆盖整个应用
        return;
      }
    }
    
    // 如果找不到容器，尝试延迟查找一次（DOM 可能还在渲染中）
    if (!container) {
      // 使用 setTimeout 延迟查找，给 DOM 一些时间渲染
      setTimeout(() => {
        container = this.findContainer();
        if (!container) {
          // 使用保存的原始方法，如果不存在则使用当前 console.warn（可能是被其他代码替换过的）
          const originalWarn = (console as any).__originalWarn;
          const warnFn = originalWarn || (console as any).__originalWarn || console.warn;
          if (typeof warnFn === 'function') {
            warnFn.apply(console, ['[RouteLoadingService] 无法找到路由视图容器']);
          }
          return;
        }
        
        // 关键：如果找到的容器是 #app，不显示 loading
        if (container.id === 'app') {
          return;
        }
        
        // 找到容器后，继续显示 loading
        this.showLoadingInContainer(container);
      }, 100);
      return;
    }

    this.showLoadingInContainer(container);
  }

  /**
   * 在指定容器中显示 Loading
   */
  private showLoadingInContainer(container: HTMLElement): void {
    if (!container) {
      return;
    }

    this.instance.container = container;

    // 确保容器是相对定位
    const computedStyle = window.getComputedStyle(container);
    if (computedStyle.position === 'static') {
      container.style.position = 'relative';
    }

    // 记录显示时间戳
    this.instance.showTime = Date.now();

    // 优先使用骨架屏
    const skeleton = this.findSkeleton(container);
    if (skeleton) {
      this.instance.skeletonElement = skeleton;
      skeleton.style.setProperty('display', 'block', 'important');
      skeleton.style.setProperty('visibility', 'visible', 'important');
      skeleton.style.setProperty('opacity', '1', 'important');
      this.instance.isVisible = true;
    } else {
      // 如果没有骨架屏，使用 loading 元素
      if (!this.instance.loadingElement) {
        this.instance.loadingElement = this.createLoadingElement(container);
        container.appendChild(this.instance.loadingElement);
      } else {
        // 如果loading元素已存在但不在容器中，重新添加到容器
        if (!container.contains(this.instance.loadingElement)) {
          container.appendChild(this.instance.loadingElement);
        }
      }
      
      this.instance.loadingElement.style.setProperty('display', 'flex', 'important');
      this.instance.loadingElement.style.setProperty('visibility', 'visible', 'important');
      this.instance.loadingElement.style.setProperty('opacity', '1', 'important');
      this.instance.isVisible = true;
    }

    // 清除之前的超时定时器
    if (this.instance.timeoutId) {
      clearTimeout(this.instance.timeoutId);
      this.instance.timeoutId = null;
    }

    // 设置超时关闭（10秒）
    this.instance.timeoutId = setTimeout(() => {
      this.hide();
    }, LOADING_TIMEOUT.ROUTE);
  }

  /**
   * 隐藏路由 Loading
   */
  hide(): void {
    if (!this.instance.isVisible) {
      return;
    }

    // 计算持续时间
    const hideTime = Date.now();
    const duration = this.instance.showTime > 0 ? hideTime - this.instance.showTime : 0;

    // 清除超时定时器
    if (this.instance.timeoutId) {
      clearTimeout(this.instance.timeoutId);
      this.instance.timeoutId = null;
    }

    // 隐藏骨架屏（强制关闭）
    if (this.instance.skeletonElement) {
      this.instance.skeletonElement.style.setProperty('display', 'none', 'important');
      this.instance.skeletonElement.style.setProperty('visibility', 'hidden', 'important');
      this.instance.skeletonElement.style.setProperty('opacity', '0', 'important');
    }

    // 隐藏 loading 元素（强制关闭，立即移除）
    if (this.instance.loadingElement) {
      this.instance.loadingElement.style.setProperty('display', 'none', 'important');
      this.instance.loadingElement.style.setProperty('visibility', 'hidden', 'important');
      this.instance.loadingElement.style.setProperty('opacity', '0', 'important');
      this.instance.loadingElement.style.setProperty('pointer-events', 'none', 'important');
      
      // 立即移除 DOM 元素（不等待动画，确保强制关闭）
      try {
        if (this.instance.loadingElement.parentNode) {
          this.instance.loadingElement.parentNode.removeChild(this.instance.loadingElement);
        }
      } catch (e) {
        // 如果移除失败，尝试延迟移除
        setTimeout(() => {
          if (this.instance.loadingElement && this.instance.loadingElement.parentNode) {
            try {
              this.instance.loadingElement.parentNode.removeChild(this.instance.loadingElement);
            } catch (err) {
              // 忽略移除错误
            }
          }
        }, 100);
      }
      this.instance.loadingElement = null;
    }

    this.instance.isVisible = false;
    this.instance.showTime = 0;
  }

  /**
   * 检查是否正在显示
   */
  isVisible(): boolean {
    return this.instance.isVisible;
  }
}

// 导出单例实例
export const routeLoadingService = new RouteLoadingService();

