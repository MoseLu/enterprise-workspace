/**
 * DOM 操作工具函数
 * 完全对齐 cool-admin 的实现
 */

/**
 * 添加 CSS 类名
 * @param el DOM 元素
 * @param className 类名
 */
export function addClass(el: Element, className: string): void {
  if (!el || !className) return;

  if (el.classList) {
    el.classList.add(className);
  } else {
    const currentClass = el.className;
    if (!currentClass.includes(className)) {
      el.className = currentClass ? `${currentClass} ${className}` : className;
    }
  }
}

/**
 * 移除 CSS 类名
 * @param el DOM 元素
 * @param className 类名
 */
export function removeClass(el: Element, className: string): void {
  if (!el || !className) return;

  if (el.classList) {
    el.classList.remove(className);
  } else {
    const currentClass = el.className;
    if (currentClass.includes(className)) {
      el.className = currentClass
        .split(' ')
        .filter(cls => cls !== className)
        .join(' ');
    }
  }
}

/**
 * 检查是否包含指定类名
 * @param el DOM 元素
 * @param className 类名
 */
export function hasClass(el: Element, className: string): boolean {
  if (!el || !className) return false;

  if (el.classList) {
    return el.classList.contains(className);
  } else {
    return el.className.includes(className);
  }
}
