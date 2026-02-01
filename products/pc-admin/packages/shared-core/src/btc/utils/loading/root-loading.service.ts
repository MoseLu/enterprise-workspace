/**
 * 全局根级 Loading 服务
 * 使用 Vue 组件挂载到 #Loading 元素
 * 支持切换标题和根据偏好设置切换 loading 样式（圆圈、彩色四点、渐变圆环）
 *
 * 修复点：
 * 1. 解决 Vue 3 props 只读问题，通过组件实例方法更新状态
 * 2. 处理异步初始化竞态问题，防止重复挂载
 * 3. 提前创建 #Loading 元素，确保挂载时有可用的 DOM 节点
 * 4. 统一管理状态对象，同步 Vue 组件和降级 DOM 的状态
 * 5. 优化显示/隐藏逻辑，解决时序问题
 * 6. 统一降级方案的 DOM 结构，确保和 Vue 组件一致
 */

import type { App, ComponentPublicInstance } from 'vue';

type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';

// 增加初始化状态标记，解决异步竞态
let isInitializing = false;
let vueApp: App | null = null;
// 明确类型：BtcRootLoading 组件实例（包含暴露的更新方法）
let rootLoadingInstance: (ComponentPublicInstance & {
  updateTitle?: (text: string) => void;
  updateSubTitle?: (text: string) => void;
  updateLoadingStyle?: (style: LoadingStyle) => void;
}) | null = null;

/**
 * 全局根级 Loading 服务
 * 使用 Vue 组件挂载实现
 */
class BtcRootLoadingService {
  // 响应式管理状态（同步 Vue 组件和降级 DOM）
  private state = {
    title: '正在加载资源',
    subTitle: '部分资源可能加载时间较长，请耐心等待',
    style: 'circle' as LoadingStyle,
    isVisible: false,
  };

  constructor() {
    // 初始化时检查 #Loading 元素是否存在，提前创建（防止挂载失败）
    this.ensureLoadingElementExists();
  }

  /**
   * 确保 #Loading 元素存在（核心：防止挂载时找不到元素）
   */
  private ensureLoadingElementExists(): void {
    // 检查是否在浏览器环境中
    if (typeof document === 'undefined') {
      return;
    }

    let el = document.getElementById('Loading');
    if (!el) {
      el = document.createElement('div');
      el.id = 'Loading';
      // 默认隐藏（初始状态：不显示背景，避免黑屏）
      el.classList.add('is-hide');
      // 关键：不设置背景色，让 CSS 控制（初始透明，有内容时才显示背景）
      // 关键：初始时设置 display: none，避免显示空背景
      el.style.setProperty('display', 'none', 'important');
      document.body.appendChild(el);
    } else {
      // 如果元素已存在但还没有内容，确保初始隐藏，避免显示空背景
      if (!el.querySelector('.preload__container') && !el.innerHTML.trim()) {
        el.classList.add('is-hide');
        el.style.setProperty('display', 'none', 'important');
      }
    }
  }

  /**
   * 初始化 Vue 应用（处理异步竞态，防止重复初始化）
   */
  private async initVueApp(): Promise<void> {
    // 防止重复初始化
    if (vueApp || isInitializing) {
      return;
    }
    isInitializing = true;

    try {
      // 动态导入依赖（避免循环依赖）
      const [{ createApp }, sharedComponents] = await Promise.all([
        import('vue'),
        import('@btc/shared-components'),
      ]);

      const BtcRootLoading = sharedComponents.BtcRootLoading;
      if (!BtcRootLoading) {
        throw new Error('BtcRootLoading component not found in @btc/shared-components');
      }

      const el = document.getElementById('Loading');
      if (!el) {
        // 如果还是找不到，再次尝试创建
        this.ensureLoadingElementExists();
        const el2 = document.getElementById('Loading');
        if (!el2) {
          throw new Error('#Loading element not found and could not be created');
        }
        el2.innerHTML = '';
        // 关键：不设置背景色，让 CSS 控制（有内容时才显示背景）
        el2.style.removeProperty('background-color');
        el2.classList.remove('is-hide'); // 初始化时先显示

        vueApp = createApp(BtcRootLoading, {
          title: this.state.title,
          subTitle: this.state.subTitle,
          initialLoadingStyle: this.state.style,
        });

        rootLoadingInstance = vueApp.mount(el2) as typeof rootLoadingInstance;
      } else {
        // 关键：在清空容器前，检查是否有 fallback DOM 内容
        // 如果有，说明用户已经看到了 fallback 内容，我们需要确保 Vue 组件立即显示
        const hasFallbackContent = el.querySelector('.preload__container');

        // 清空容器（确保无残留 DOM）
        el.innerHTML = '';
        // 关键：不设置背景色，让 CSS 控制（有内容时才显示背景）
        el.style.removeProperty('background-color');
        el.classList.remove('is-hide'); // 初始化时先显示

        // 创建 Vue 应用：传入初始状态
        vueApp = createApp(BtcRootLoading, {
          title: this.state.title,
          subTitle: this.state.subTitle,
          initialLoadingStyle: this.state.style,
        });

        // 挂载组件并保存实例
        rootLoadingInstance = vueApp.mount(el) as typeof rootLoadingInstance;

        // 关键：如果有 fallback 内容，立即触发 Vue 组件显示
        // 通过 nextTick 确保 DOM 已更新，然后手动触发显示
        if (hasFallbackContent && rootLoadingInstance) {
          // 使用 Vue 的 nextTick 确保组件已渲染
          const { nextTick } = await import('vue');
          await nextTick();
          // 通过访问组件内部状态来触发显示（如果组件暴露了相关方法）
          // 由于组件使用 requestAnimationFrame 延迟显示，我们通过添加 ready 类来立即显示
          const container = el.querySelector('.preload__container');
          if (container) {
            container.classList.add('preload__container--ready');
          }
        }

        // 关键：确保背景色在有内容时显示
        requestAnimationFrame(() => {
          if (el.querySelector('.preload__container')) {
            el.style.setProperty('background-color', '#0a0a0a', 'important');
          }
        });
      }
    } catch (error) {
      this.fallbackToDOM();
    } finally {
      // 重置初始化状态
      isInitializing = false;
    }
  }

  /**
   * 降级方案：纯 DOM 操作（Vue 组件加载失败时）
   */
  private fallbackToDOM(): void {
    const el = document.getElementById('Loading');
    if (!el) {
      this.ensureLoadingElementExists();
      const el2 = document.getElementById('Loading');
      if (!el2) {
        return;
      }
      // 为 progress 样式生成特殊的 HTML 结构
      const loadingHTML2 = this.state.style === 'progress'
        ? `<div class="preload__loading loading-style-${this.state.style}">
            <div class="progress-bar-container">
              <div class="progress-bar-track">
                <div class="progress-bar-fill" style="width: 0%">
                  <div class="progress-bar-shine"></div>
                </div>
              </div>
              <div class="progress-percentage">0%</div>
            </div>
          </div>`
        : `<div class="preload__loading loading-style-${this.state.style}"></div>`;

      el2.innerHTML = `
        <div class="preload__container">
          <div class="preload__name">拜里斯科技</div>
          ${loadingHTML2}
          <div class="preload__title">${this.state.title}</div>
          <div class="preload__sub-title">${this.state.subTitle}</div>
        </div>
      `;
      // 关键：移除内联背景色设置，让 CSS 控制（只在有内容时显示背景）
      el2.style.removeProperty('background-color');
      // 关键：通过添加类来触发背景色显示（CSS 会检测到 .preload__container 存在）
      if (this.state.isVisible) {
        el2.classList.remove('is-hide');
        // 确保背景色在有内容时显示
        requestAnimationFrame(() => {
          if (el2.querySelector('.preload__container')) {
            el2.style.setProperty('background-color', '#0a0a0a', 'important');
          }
        });
      } else {
        el2.classList.add('is-hide');
      }
      return;
    }

    // 统一 DOM 结构（和 BtcRootLoading 组件一致）
    // 为 progress 样式生成特殊的 HTML 结构
    const loadingHTML = this.state.style === 'progress'
      ? `<div class="preload__loading loading-style-${this.state.style}">
          <div class="progress-bar-container">
            <div class="progress-bar-track">
              <div class="progress-bar-fill" style="width: 0%">
                <div class="progress-bar-shine"></div>
              </div>
            </div>
            <div class="progress-percentage">0%</div>
          </div>
        </div>`
      : `<div class="preload__loading loading-style-${this.state.style}"></div>`;

    el.innerHTML = `
      <div class="preload__container">
        <div class="preload__name">拜里斯科技</div>
        ${loadingHTML}
        <div class="preload__title">${this.state.title}</div>
        <div class="preload__sub-title">${this.state.subTitle}</div>
      </div>
    `;
    // 关键：移除内联背景色设置，让 CSS 控制（只在有内容时显示背景）
    el.style.removeProperty('background-color');
    // 同步显示状态
    if (this.state.isVisible) {
      el.classList.remove('is-hide');
      // 关键：确保背景色在有内容时显示
      requestAnimationFrame(() => {
        if (el.querySelector('.preload__container')) {
          el.style.setProperty('background-color', '#0a0a0a', 'important');
        }
      });
    } else {
      el.classList.add('is-hide');
    }
  }

  /**
   * 显示全局根级 Loading
   * @param text 提示文字（可选）
   * @param style loading 样式（可选）
   */
  async show(text?: string, style?: LoadingStyle): Promise<void> {
    const el = document.getElementById('Loading');
    if (!el) {
      this.ensureLoadingElementExists();
      const el2 = document.getElementById('Loading');
      if (!el2) {
        return;
      }
      this.fallbackToDOM();
      return;
    }

    this.state.isVisible = true;

    // 更新标题（优先使用传入的 text）
    if (text) {
      this.state.title = text;
    }
    // 更新样式
    if (style) {
      this.state.style = style;
    }

    // 关键修复：如果 Vue 组件还没初始化，先使用 fallback DOM 显示内容
    // 这样可以确保在 Vue 组件初始化期间，用户也能看到 loading
    if (!vueApp && !isInitializing) {
      // 先显示 fallback DOM 内容，确保立即显示
      this.fallbackToDOM();
      // 关键：确保 display 属性正确设置，移除可能的 display: none
      el.style.removeProperty('display');
      el.classList.remove('is-hide');
      // 然后异步初始化 Vue 组件
      this.initVueApp().then(() => {
        // Vue 组件初始化完成后，切换到 Vue 组件
        if (rootLoadingInstance && rootLoadingInstance.updateTitle && rootLoadingInstance.updateLoadingStyle) {
          rootLoadingInstance.updateTitle(this.state.title);
          if (this.state.subTitle && rootLoadingInstance.updateSubTitle) {
            rootLoadingInstance.updateSubTitle(this.state.subTitle);
          }
          rootLoadingInstance.updateLoadingStyle(this.state.style);
        }
      }).catch(() => {
        // Vue 组件初始化失败，继续使用 fallback DOM
      });
      return;
    } else if (isInitializing) {
      // 如果正在初始化，先显示 fallback DOM 内容
      this.fallbackToDOM();
      // 关键：确保 display 属性正确设置
      el.style.removeProperty('display');
      el.classList.remove('is-hide');
      // 等待初始化完成
      let waitCount = 0;
      while (isInitializing && waitCount < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
    }

    // 分情况更新状态：Vue 组件 / 降级 DOM
    if (rootLoadingInstance && rootLoadingInstance.updateTitle && rootLoadingInstance.updateLoadingStyle) {
      // Vue 组件：调用实例暴露的方法更新
      rootLoadingInstance.updateTitle(this.state.title);
      if (this.state.subTitle && rootLoadingInstance.updateSubTitle) {
        rootLoadingInstance.updateSubTitle(this.state.subTitle);
      }
      rootLoadingInstance.updateLoadingStyle(this.state.style);
      // 关键：确保 display 属性正确设置
      el.style.removeProperty('display');
      el.classList.remove('is-hide');
    } else {
      // 降级 DOM：直接更新元素内容
      this.fallbackToDOM();
      // 关键：确保 display 属性正确设置
      el.style.removeProperty('display');
      el.classList.remove('is-hide');
    }
  }

  /**
   * 隐藏全局根级 Loading
   * 优化：添加过渡完成后的清理逻辑，确保平滑过渡到页面内容
   */
  hide(): void {
    const el = document.getElementById('Loading');
    if (!el) return;

    this.state.isVisible = false;

    // 关键修复：立即移除背景色，让页面内容透过显示
    // 这样页面内容可以在 loading 淡出时同时显示，避免黑屏
    el.style.removeProperty('background-color');

    // 先添加隐藏类（触发 opacity 和 visibility 过渡）
    el.classList.add('is-hide');

    // 关键修复：等待过渡完成后再设置 display: none，确保平滑过渡
    // 这样可以避免黑屏闪烁，让页面内容在 loading 淡出时同时显示
    setTimeout(() => {
      if (!this.state.isVisible && el.classList.contains('is-hide')) {
        // 过渡完成后才设置 display: none，完全隐藏元素
        el.style.setProperty('display', 'none', 'important');
        // 重置标题（可选，根据需求）
        this.state.title = '正在加载资源'; // 重置标题
        this.state.subTitle = '部分资源可能加载时间较长，请耐心等待'; // 重置副标题
      }
    }, 300); // 匹配 CSS transition 时长
  }

  /**
   * 更新提示文字（支持实时更新）
   * @param text 新的提示文字
   */
  updateText(text: string): void {
    this.state.title = text;
    const el = document.getElementById('Loading');
    if (!el) return;

    // Vue 组件已挂载：调用实例方法
    if (rootLoadingInstance && rootLoadingInstance.updateTitle) {
      rootLoadingInstance.updateTitle(text);
    } else {
      // 降级 DOM：更新文本元素
      const titleEl = el.querySelector('.preload__title') as HTMLElement;
      if (titleEl) {
        titleEl.textContent = text;
      } else {
        // 未初始化时提前更新 DOM
        this.fallbackToDOM();
      }
    }
  }

  /**
   * 切换 loading 样式
   * @param style 新的样式类型
   */
  updateStyle(style: LoadingStyle): void {
    this.state.style = style;
    const el = document.getElementById('Loading');
    if (!el) return;

    if (rootLoadingInstance && rootLoadingInstance.updateLoadingStyle) {
      rootLoadingInstance.updateLoadingStyle(style);
    } else {
      // 降级 DOM：更新样式类
      const loadingEl = el.querySelector('.preload__loading') as HTMLElement;
      if (loadingEl) {
        // 移除所有样式类
        loadingEl.className = 'preload__loading';
        loadingEl.classList.add(`loading-style-${style}`);
      } else {
        this.fallbackToDOM();
      }
    }
  }

  /**
   * 更新副标题
   * @param subTitle 新的副标题
   */
  updateSubTitle(subTitle: string): void {
    this.state.subTitle = subTitle;
    const el = document.getElementById('Loading');
    if (!el) return;

    if (rootLoadingInstance && rootLoadingInstance.updateSubTitle) {
      rootLoadingInstance.updateSubTitle(subTitle);
    } else {
      // 降级 DOM：更新文本元素
      const subTitleEl = el.querySelector('.preload__sub-title') as HTMLElement;
      if (subTitleEl) {
        subTitleEl.textContent = subTitle;
      } else {
        this.fallbackToDOM();
      }
    }
  }

  /**
   * 销毁 Vue 实例（可选：页面卸载时调用）
   */
  destroy(): void {
    if (vueApp) {
      vueApp.unmount();
      vueApp = null;
      rootLoadingInstance = null;
    }
    const el = document.getElementById('Loading');
    if (el) {
      el.innerHTML = '';
      el.classList.add('is-hide');
    }
  }
}

// 导出单例实例
export const rootLoadingService = new BtcRootLoadingService();
