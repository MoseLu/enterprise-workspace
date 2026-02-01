;
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useMessage } from './use-message';
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';
import { logger } from '@btc/shared-core';

// 配置 NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

let delayHintTimer: number | undefined;
let skeletonVisible = false;

/**
 * 检查是否应该显示内容级 loading
 * 关键：在独立运行时（非 qiankun 模式），不应该显示内容级 loading
 * 因为应用级 loading（HTML #Loading）已经显示了
 */
function shouldShowContentLoading(): boolean {
  // 在独立运行时，不显示内容级 loading
  const isStandalone = !qiankunWindow.__POWERED_BY_QIANKUN__;
  if (isStandalone) {
    return false;
  }
  
  // 在 qiankun 模式下，检查 HTML Loading 是否正在显示
  try {
    const loadingEl = document.getElementById('Loading');
    if (loadingEl) {
      // 检查内联样式（优先级最高）
      const inlineDisplay = loadingEl.style.display;
      const inlineVisibility = loadingEl.style.visibility;
      const inlineOpacity = loadingEl.style.opacity;
      
      // 如果内联样式明确设置为显示，则不显示内容级 loading
      if (inlineDisplay === 'flex' || inlineDisplay === 'block') {
        return false;
      }
      if (inlineVisibility === 'visible') {
        return false;
      }
      if (inlineOpacity === '1') {
        return false;
      }
      
      // 检查 computed style
      const style = window.getComputedStyle(loadingEl);
      const isVisible = style.display !== 'none' && 
                       style.visibility !== 'hidden' && 
                       style.opacity !== '0' &&
                       !loadingEl.classList.contains('is-hide');
      
      if (isVisible) {
        return false;
      }
    }
  } catch (e) {
    // 静默失败，允许显示内容级 loading
  }
  
  return true;
}

/**
 * 显示骨架屏
 * 关键：如果 HTML Loading 正在显示，不显示内容区域的 loading，避免双重 loading
 */
export function showSkeleton() {
  // 如果不应该显示内容级 loading，直接返回
  if (!shouldShowContentLoading()) {
    return;
  }
  
  skeletonVisible = true;
  const skeleton = document.getElementById('app-skeleton');
  if (skeleton) {
    skeleton.style.display = 'flex';
  }
}

/**
 * 隐藏骨架屏
 */
export function hideSkeleton() {
  skeletonVisible = false;
  const skeleton = document.getElementById('app-skeleton');
  if (skeleton) {
    skeleton.style.display = 'none';
  }
}

/**
 * 延迟显示加载提示
 * @param ms 延迟时间（毫秒）
 * @param appName 应用名称
 */
export function delayHint(ms: number, _appName: string) {
  clearDelayHint();
  delayHintTimer = window.setTimeout(() => {
    if (skeletonVisible) {
      // 保留骨架屏但不再额外弹出“正在加载”提示
    }
  }, ms);
}

/**
 * 清除延迟提示
 */
export function clearDelayHint() {
  if (delayHintTimer) {
    clearTimeout(delayHintTimer);
    delayHintTimer = undefined;
  }
}

/**
 * 开始加载应用
 * 关键：如果 HTML Loading 正在显示，不显示内容区域的 loading，避免双重 loading
 */
export function startLoading(appName: string) {
  // 如果不应该显示内容级 loading，直接返回
  if (!shouldShowContentLoading()) {
    return;
  }
  
  NProgress.start();
  showSkeleton();
  // 如果超过 1200ms 还未加载完成，显示提示
  delayHint(1200, appName);
}

/**
 * 加载完成
 */
export function finishLoading() {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();
}

/**
 * 加载失败
 */
export function loadingError(appName: string, error?: Error) {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();

  const message = useMessage();
  message.error(`Failed to load "${appName}", please refresh and retry`);

  logger.error(`[Application load failed] ${appName}:`, error);
}

