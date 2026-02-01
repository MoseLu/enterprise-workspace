/**
 * 移除 HTML 元素上的响应式布局类
 * 用于修复因布局类导致的样式问题
 */
export function removeLayoutClasses() {
  if (typeof document === 'undefined') return;
  
  const html = document.documentElement;
  html.classList.remove('col-mobile', 'col-tablet', 'col-desktop');
}

