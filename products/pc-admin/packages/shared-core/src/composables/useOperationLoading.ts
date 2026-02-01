/**
 * 操作级 Loading Composable
 * 管理针对单个业务操作（按钮点击、表单提交、接口请求）的 loading
 */
;

import { ref, onUnmounted } from 'vue';
import { LOADING_Z_INDEX, LOADING_TIMEOUT } from '../btc/utils/loading.config';

/**
 * 操作 Loading 选项
 */
export interface OperationLoadingOptions {
  /** 目标元素（可选，不指定则显示全屏loading） */
  target?: HTMLElement | string;
  /** 提示文字 */
  text?: string;
  /** 是否锁定屏幕（全屏loading时） */
  lock?: boolean;
}

/**
 * 操作 Loading 实例信息
 */
interface OperationLoadingInstance {
  target: HTMLElement | null;
  loadingElement: HTMLElement | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  isVisible: boolean;
}

/**
 * 使用操作级 Loading
 */
export function useOperationLoading() {
  const instanceRef = ref<OperationLoadingInstance>({
    target: null,
    loadingElement: null,
    timeoutId: null,
    isVisible: false,
  });

  /**
   * 查找目标元素
   */
  const findTarget = (target?: HTMLElement | string): HTMLElement | null => {
    if (!target) {
      return null;
    }

    if (typeof target === 'string') {
      return document.querySelector(target) as HTMLElement;
    }

    return target;
  };

  /**
   * 创建 Loading 元素
   */
  const createLoadingElement = (target: HTMLElement, text?: string): HTMLElement => {
    const loadingEl = document.createElement('div');
    loadingEl.className = 'operation-loading';
    
    // 确保目标元素是相对定位
    const computedStyle = window.getComputedStyle(target);
    if (computedStyle.position === 'static') {
      target.style.position = 'relative';
    }

    loadingEl.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: ${LOADING_Z_INDEX.OPERATION};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.9);
      opacity: 1;
      pointer-events: auto;
      min-height: 40px;
    `;

    const textContent = text ? `
      <div class="operation-loading-text" style="
        margin-top: 8px;
        color: var(--el-text-color-regular);
        font-size: 12px;
      ">${text}</div>
    ` : '';

    loadingEl.innerHTML = `
      <div class="operation-loading-spinner" style="
        width: 24px;
        height: 24px;
        border: 2px solid var(--el-border-color-lighter);
        border-top-color: var(--el-color-primary);
        border-radius: 50%;
        animation: operation-loading-spin 1s linear infinite;
      "></div>
      ${textContent}
    `;

    // 添加旋转动画（如果不存在）
    if (!document.getElementById('operation-loading-style')) {
      const style = document.createElement('style');
      style.id = 'operation-loading-style';
      style.textContent = `
        @keyframes operation-loading-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // 暗色模式适配
    if (document.documentElement.classList.contains('dark')) {
      loadingEl.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    }

    return loadingEl;
  };

  /**
   * 显示操作 Loading
   * @param options 配置选项
   */
  const show = (options: OperationLoadingOptions = {}): void => {
    const instance = instanceRef.value;

    // 如果已经显示，先隐藏
    if (instance.isVisible) {
      hide();
    }

    const { target, text, lock = false } = options;
    
    // 查找目标元素
    const targetEl = findTarget(target);
    
    // 如果没有目标元素且不锁定屏幕，使用 Element Plus 的 loading（通过指令实现）
    // 这里我们提供一个简单的实现，实际使用时可以结合 Element Plus 的 v-loading 指令
    if (!targetEl && !lock) {
      console.warn('[useOperationLoading] 未指定目标元素且未锁定屏幕，请使用 v-loading 指令');
      return;
    }

    // 如果没有目标元素但锁定屏幕，创建全屏loading（不推荐，应该使用全局根级loading）
    if (!targetEl && lock) {
      console.warn('[useOperationLoading] 全屏loading建议使用 RootLoadingService');
      return;
    }

    if (!targetEl) {
      return;
    }

    instance.target = targetEl;
    instance.loadingElement = createLoadingElement(targetEl, text);
    targetEl.appendChild(instance.loadingElement);
    instance.isVisible = true;

    // 清除之前的超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
    }

    // 设置超时关闭（5秒）
    instance.timeoutId = setTimeout(() => {
      console.warn('[useOperationLoading] 操作 loading 超时自动关闭（5秒）');
      hide();
    }, LOADING_TIMEOUT.OPERATION);
  };

  /**
   * 隐藏操作 Loading
   */
  const hide = (): void => {
    const instance = instanceRef.value;
    if (!instance.isVisible || !instance.loadingElement) {
      return;
    }

    // 清除超时定时器
    if (instance.timeoutId) {
      clearTimeout(instance.timeoutId);
      instance.timeoutId = null;
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
        instance.target = null;
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

