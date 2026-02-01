/**
 * 面包屑相关工具函数
 * 主要逻辑已在 shared-components 的 breadcrumb 组件中实现
 * 这里提供一些辅助函数
 */

import { getMenusForApp } from '@btc/shared-components';

/**
 * 从菜单注册表中查找菜单项的图标
 * @param i18nKey i18n 键
 * @param app 应用 ID
 */
export function findMenuIconByI18nKey(i18nKey: string, app: string): string | undefined {
  const menus = getMenusForApp(app);

  // 递归查找菜单项
  function findInMenuItems(items: any[]): string | undefined {
    for (const item of items) {
      // 优先通过 labelKey 匹配（菜单注册时保存的原始 i18n key）
      // 如果 labelKey 不存在，则通过 title 匹配（兼容旧数据）
      const matches = (item.labelKey === i18nKey) || (item.title === i18nKey);
      if (matches && item.icon) {
        return item.icon;
      }
      // 递归查找子菜单
      if (item.children && item.children.length > 0) {
        const found = findInMenuItems(item.children);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  }

  return findInMenuItems(menus);
}
