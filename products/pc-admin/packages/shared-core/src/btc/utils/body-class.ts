;
const MAX_RETRY = 120;

let pendingClassName: string | null = null;
let retryCount = 0;
let rafId: number | null = null;

const raf =
  typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
    ? window.requestAnimationFrame.bind(window)
    : null;

const caf =
  typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function'
    ? window.cancelAnimationFrame.bind(window)
    : null;

function applyBodyClass(className: string): boolean {
  if (typeof document === 'undefined') {
    return true;
  }

  const body = document.body;
  if (body) {
    body.className = className;
    pendingClassName = null;
    retryCount = 0;
    if (caf && rafId !== null) {
      caf(rafId);
      rafId = null;
    }
    return true;
  }

  const html = document.documentElement;
  if (html) {
    html.setAttribute('data-btc-body-class', className);
  }

  return false;
}

function scheduleRetry() {
  if (typeof window === 'undefined') {
    return;
  }

  if (rafId !== null) {
    return;
  }

  const runner = () => {
    rafId = null;
    if (!pendingClassName) {
      return;
    }

    if (applyBodyClass(pendingClassName)) {
      return;
    }

    retryCount += 1;
    if (retryCount >= MAX_RETRY) {
      console.warn('[Theme] document.body 不可用，已跳过 className 设置');
      return;
    }

    scheduleRetry();
  };

  if (raf) {
    rafId = raf(runner);
  } else {
    rafId = window.setTimeout(runner, 16) as unknown as number;
  }
}

/**
 * 安全地更新 body.className，避免 document.body 为 null 时抛出异常
 */
export function setBodyClassName(className: string) {
  pendingClassName = className;

  if (applyBodyClass(className)) {
    return;
  }

  scheduleRetry();
}

// 当 DOMContentLoaded 触发时再尝试一次，确保在极端情况下也能应用主题类名
if (typeof document !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (pendingClassName) {
      applyBodyClass(pendingClassName);
    }
  } else {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        if (pendingClassName) {
          applyBodyClass(pendingClassName);
        }
      },
      { once: true },
    );
  }
}


