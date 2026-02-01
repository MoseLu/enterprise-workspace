/**
 * Qiankun 工具函数 Composable
 * 提供清除 Loading 元素等工具函数
 */

/**
 * 清除所有 #Loading 元素（可能来自子应用的 index.html）
 * 这个元素会导致页面一直显示 loading 状态
 */
export function clearLoadingElement(): void {
  // 查找所有可能的#Loading元素（可能有多个，来自不同子应用）
  const loadingEls = document.querySelectorAll('#Loading');
  loadingEls.forEach((loadingEl) => {
    if (loadingEl instanceof HTMLElement) {
      // 立即隐藏，使用important确保优先级
      loadingEl.style.setProperty('display', 'none', 'important');
      loadingEl.style.setProperty('visibility', 'hidden', 'important');
      loadingEl.style.setProperty('opacity', '0', 'important');
      loadingEl.style.setProperty('pointer-events', 'none', 'important');
      loadingEl.style.setProperty('z-index', '-1', 'important');
      loadingEl.classList.add('is-hide');
      // 延迟移除，确保动画完成
      setTimeout(() => {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        }
      }, 100);
    }
  });
}

