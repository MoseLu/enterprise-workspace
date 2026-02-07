import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useMessage } from './use-message';

// 配置 NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

let delayHintTimer: number | undefined;

/**
 * 隐藏骨架屏（供loadingError使用）
 */
function hideSkeleton() {
  const skeleton = document.getElementById('app-skeleton');
  if (skeleton) {
    skeleton.style.setProperty('display', 'none', 'important');
  }
}

/**
 * 清除延迟提示
 */
function clearDelayHint() {
  if (delayHintTimer) {
    clearTimeout(delayHintTimer);
    delayHintTimer = undefined;
  }
}

/**
 * 加载完成（保留此函数，供向后兼容使用）
 * 注意：新的loading系统已在@btc/shared-core中实现，此函数仅作为向后兼容保留
 */
export function finishLoading() {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();
}

/**
 * 加载失败（保留此函数，供错误处理使用）
 * 注意：新的loading系统已在@btc/shared-core中实现，此函数仅作为向后兼容保留
 */
export function loadingError(appName: string, _error?: Error) {
  NProgress.done();
  hideSkeleton();
  clearDelayHint();

  const message = useMessage();
  message.error(`加载「${appName}」失败，请刷新重试`);
}

