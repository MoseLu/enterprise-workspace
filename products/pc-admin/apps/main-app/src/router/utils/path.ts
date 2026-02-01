import { getAppIdFromPath } from '@btc/shared-core';
import { getTabsForNamespace } from '../../store/tabRegistry';
import { SUB_APP_PREFIXES, SUB_APPS } from '../constants';

/**
 * 根据路径获取当前应用名称
 */
export function getCurrentAppFromPath(path: string): string {
  // 使用统一的工具函数获取应用标识
  return getAppIdFromPath(path);
}

/**
 * 规范化路径：如果路径缺少应用前缀，尝试从 tabRegistry 中查找并添加前缀
 * 例如：/test/api-test-center -> /admin/test/api-test-center
 */
export function normalizeRoutePath(path: string): string | null {
  // 如果路径已经有应用前缀，不需要规范化
  if (SUB_APP_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return null;
  }

  // 如果是系统域路径，不需要规范化
  if (path === '/' || path.startsWith('/data') || path.startsWith('/login') || path.startsWith('/forget-password') || path.startsWith('/register')) {
    return null;
  }

  // 遍历所有应用的 tabRegistry，查找匹配的路径
  for (const appName of SUB_APPS) {
    try {
      const tabs = getTabsForNamespace(appName);
      for (const tab of tabs) {
        // 移除应用前缀后比较
        const appPrefix = `/${appName}`;
        const pathWithoutPrefix = tab.path.startsWith(appPrefix)
          ? tab.path.substring(appPrefix.length) || '/'
          : tab.path;

        // 如果路径匹配（去掉应用前缀后），返回完整路径
        if (pathWithoutPrefix === path || pathWithoutPrefix === `${path}/`) {
          return tab.path;
        }
      }
    } catch (error) {
      // 如果某个应用的 tabRegistry 未加载，继续查找下一个
      continue;
    }
  }

  return null;
}

