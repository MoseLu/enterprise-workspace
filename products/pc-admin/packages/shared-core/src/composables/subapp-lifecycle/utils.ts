import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

/**
 * 确保路径以 / 开头
 */
export function ensureLeadingSlash(value: string): string {
  return value.startsWith('/') ? value : `/${value}`;
}

/**
 * 获取当前主机路径（包含 pathname、search、hash）
 */
export function getCurrentHostPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/**
 * 规范化到主机路径（添加应用前缀）
 * @param relativeFullPath 相对路径
 * @param basePath 应用基础路径（如 /finance）
 */
export function normalizeToHostPath(relativeFullPath: string, basePath: string): string {
  const normalizedRelative = relativeFullPath === '' ? '/' : ensureLeadingSlash(relativeFullPath);

  // 关键：在 layout-app 环境下（生产环境子域名模式），直接返回相对路径
  // 因为 layout-app 模式下，URL 已经是正确的（子域名模式），不需要添加应用前缀
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (isUsingLayoutApp) {
    return normalizedRelative;
  }

  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    return normalizedRelative;
  }

  // 检测是否在生产环境的子域名下（兜底检查）
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isProductionSubdomain = hostname.includes('bellis.com.cn') && hostname !== 'bellis.com.cn';

  // 在生产环境子域名下，路径应该不带应用前缀（直接使用相对路径）
  if (isProductionSubdomain) {
    return normalizedRelative;
  }

  // 开发环境（qiankun模式）：添加应用前缀
  if (normalizedRelative === '/' || normalizedRelative === basePath) {
    return basePath;
  }

  // 如果已经是完整路径（以 basePath 开头），直接返回
  if (normalizedRelative === basePath || normalizedRelative.startsWith(`${basePath}/`)) {
    return normalizedRelative;
  }

  return `${basePath}${normalizedRelative}`;
}

/**
 * 推导初始子路由（支持子域名和路径前缀）
 * @param appId 应用 ID（如 'finance'）
 * @param basePath 应用基础路径（如 '/finance'）
 */
export function deriveInitialSubRoute(appId: string, basePath: string): string {
  // 关键：在 layout-app 环境下（__USE_LAYOUT_APP__ 为 true），也需要初始化路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__;

  // 如果不是 qiankun 且不是 layout-app，返回默认路由
  if (!isQiankun && !isUsingLayoutApp) {
    return '/';
  }

  const { pathname, search, hash } = window.location;

  // 检查是否在子域名环境下（生产环境）
  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname === `${appId}.bellis.com.cn`;

  // 子域名环境下，路径直接是子应用路由（如 / 或 /xxx）
  if (isProductionSubdomain) {
    // 如果路径是 /finance/xxx，需要去掉 /finance 前缀
    if (pathname.startsWith(basePath)) {
      const suffix = pathname.slice(basePath.length) || '/';
      return `${ensureLeadingSlash(suffix)}${search}${hash}`;
    }
    // 否则直接使用当前路径
    return `${pathname}${search}${hash}`;
  }

  // 路径前缀环境下（如 /finance/xxx）
  if (!pathname.startsWith(basePath)) {
    return '/';
  }

  const suffix = pathname.slice(basePath.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
}

/**
 * 从主机路径提取子路由
 * @param appId 应用 ID（如 'finance'）
 * @param basePath 应用基础路径（如 '/finance'）
 */
export function extractHostSubRoute(appId: string, basePath: string): string {
  // 关键：在 layout-app 环境下也需要提取主机路由
  const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
  if (!qiankunWindow.__POWERED_BY_QIANKUN__ && !isUsingLayoutApp) {
    return '/';
  }

  const { pathname, search, hash } = window.location;

  // 检查是否在子域名环境下（生产环境）
  const hostname = window.location.hostname;
  const isProductionSubdomain = hostname === `${appId}.bellis.com.cn`;

  // 子域名环境下，路径直接是子应用路由（如 / 或 /xxx）
  if (isProductionSubdomain) {
    // 如果路径是 /finance/xxx，需要去掉 /finance 前缀
    if (pathname.startsWith(basePath)) {
      const suffix = pathname.slice(basePath.length) || '/';
      return `${ensureLeadingSlash(suffix)}${search}${hash}`;
    }
    // 否则直接使用当前路径（已经是子应用路由）
    return `${pathname}${search}${hash}`;
  }

  // layout-app 模式下，如果不在子域名环境，检查是否是路径前缀模式
  if (isUsingLayoutApp) {
    // 如果路径包含应用前缀，去掉前缀
    if (pathname.startsWith(basePath)) {
      const suffix = pathname.slice(basePath.length) || '/';
      return `${ensureLeadingSlash(suffix)}${search}${hash}`;
    }
    // 否则直接使用当前路径
    return `${pathname}${search}${hash}`;
  }

  // 路径前缀环境下（如 /finance/xxx）
  if (!pathname.startsWith(basePath)) {
    return '/';
  }

  const suffix = pathname.slice(basePath.length) || '/';
  return `${ensureLeadingSlash(suffix)}${search}${hash}`;
}

/**
 * 移除 Loading 元素
 */
export function removeLoadingElement(): void {
  const loadingEl = document.getElementById('Loading');
  if (loadingEl) {
    // 立即隐藏（使用内联样式确保优先级）
    loadingEl.style.setProperty('display', 'none', 'important');
    loadingEl.style.setProperty('visibility', 'hidden', 'important');
    loadingEl.style.setProperty('opacity', '0', 'important');
    loadingEl.style.setProperty('pointer-events', 'none', 'important');

    // 添加淡出类（如果 CSS 中有定义）
    loadingEl.classList.add('is-hide');

    // 延迟移除，确保动画完成（300ms 过渡时间 + 50ms 缓冲）
    setTimeout(() => {
      try {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl);
        } else if (loadingEl.isConnected) {
          // 如果 parentNode 为 null 但元素仍在 DOM 中，直接移除
          loadingEl.remove();
        }
      } catch (error) {
        // 如果移除失败，至少确保元素被隐藏
        loadingEl.style.setProperty('display', 'none', 'important');
      }
    }, 350);
  }
}

import { sessionStorage } from '../../utils/storage/session';

/**
 * 清理导航标记
 */
export function clearNavigationFlag(): void {
  try {
    sessionStorage.remove('nav_loading');
  } catch (e) {
    // 静默失败（某些浏览器可能禁用 sessionStorage）
  }
}
