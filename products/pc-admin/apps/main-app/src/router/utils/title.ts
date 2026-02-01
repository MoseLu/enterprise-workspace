;
import type { RouteLocationNormalized } from 'vue-router';
import { tSync } from '../../i18n/getters';
import { getAppIdFromPath, setPageTitle } from '@btc/shared-core';

// 保存当前路由，用于语言切换时更新标题
let currentRoute: RouteLocationNormalized | null = null;

/**
 * 判断是否为首页
 */
function isHomePage(to: RouteLocationNormalized): boolean {
  // 检查 meta.isHome
  if (to.meta?.isHome === true) {
    return true;
  }
  
  // 检查路径是否为根路径
  if (to.path === '/' || to.path === '') {
    return true;
  }
  
  return false;
}

/**
 * 获取页面标题
 * 优先使用 meta.titleKey（如果提供了翻译函数），否则使用 meta.title
 */
function getPageTitle(to: RouteLocationNormalized): string | null {
  const meta = to.meta || {};
  
  // 1. 如果有 titleKey，尝试翻译
  if (meta.titleKey && typeof meta.titleKey === 'string') {
    const translated = tSync(meta.titleKey);
    // 如果翻译成功（返回值不等于 key），使用翻译结果
    if (translated !== meta.titleKey) {
      return translated;
    }
  }
  
  // 2. 如果有 title，直接使用
  if (meta.title && typeof meta.title === 'string') {
    return meta.title;
  }
  
  // 3. 如果 titleKey 存在但没有翻译函数，返回 null（让 buildTitle 使用兜底逻辑）
  if (meta.titleKey && typeof meta.titleKey === 'string') {
    return null;
  }
  
  return null;
}

/**
 * 更新浏览器标题（用于语言切换时）
 * 使用新的标题工具函数
 */
async function updateDocumentTitle(to: RouteLocationNormalized) {
  currentRoute = to;

  try {
    // 获取应用 ID
    const appId = getAppIdFromPath(to.path);
    
    // 判断是否为首页
    const isHome = isHomePage(to);
    
    // 获取页面标题
    const pageTitle = getPageTitle(to);
    
    // 设置标题（传递翻译函数以支持应用名称国际化）
    await setPageTitle(appId, pageTitle, { isHome, sync: false, translate: tSync });
  } catch (error) {
    // 标题设置失败不影响功能
    console.warn('[title] 更新标题失败:', error);
  }
}

/**
 * 监听语言切换，更新浏览器标题（同步方式）
 */
export function setupI18nTitleWatcher() {
  // 监听 localStorage 中的语言变化（跨标签页）
  window.addEventListener('storage', (e) => {
    if (e.key === 'locale' && currentRoute) {
      // 语言切换时，同步更新当前页面的标题
      updateDocumentTitle(currentRoute);
    }
  });

  // 监听自定义事件（同一标签页的语言切换）
  window.addEventListener('language-change', () => {
    if (currentRoute) {
      // 延迟一点时间，确保 i18n 已经更新
      setTimeout(() => {
        updateDocumentTitle(currentRoute!);
      }, 50);
    }
  });
}

