;
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useMessage } from './use-message';
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
 * 显示骨架屏
 */
export function showSkeleton() {
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
 */
export function startLoading(appName: string) {
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
  message.error('common.other.loading_failed', { name: appName });

  logger.error('common.other.app_load_failed', `${appName}:`, error);
}

