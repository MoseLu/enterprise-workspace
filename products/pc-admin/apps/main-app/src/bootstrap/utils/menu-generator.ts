/**
 * 从路由配置自动生成菜单树（主应用）
 * 参考 logistics-app 的实现，但针对主应用的路由结构进行优化
 */

import type { RouteRecordRaw } from 'vue-router';
import type { MenuItem } from '@btc/shared-components';
import { assignIconsToMenuTree } from '@btc/shared-core';

const MAIN_APP_ID = 'main';

/**
 * 规范化菜单路径（主应用不需要添加前缀，因为路径已经是 /workbench/xxx）
 */
function normalizeMenuPath(path: string): string {
  if (!path) return path;
  return path.startsWith('/') ? path : `/${path}`;
}

/**
 * 从路由配置自动生成菜单树（基于 labelKey 层级）
 */
export function generateMenusFromRoutes(routes: RouteRecordRaw[]): MenuItem[] {
  // 1. 收集所有有 labelKey 的路由（排除 redirect 和 process: false 的路由）
  const menuRoutes: Array<{
    path: string;
    labelKey: string;
    icon?: string;
    depth: number;
  }> = [];

  const collectRoutes = (routeList: RouteRecordRaw[], basePath = '') => {
    for (const route of routeList) {
      // 跳过 redirect 路由和 process: false 的路由
      if (route.redirect || route.meta?.process === false) {
        continue;
      }

      const fullPath = basePath + route.path;
      // 支持 titleKey 和 labelKey
      const labelKey = (route.meta?.titleKey || route.meta?.labelKey) as string | undefined;

      if (labelKey && labelKey.startsWith('menu.')) {
        const depth = labelKey.split('.').length - 1; // menu.xxx = 1, menu.xxx.yyy = 2
        // 从 breadcrumbs 获取图标，如果没有则从 meta.icon 获取
        const icon = (route.meta?.breadcrumbs as Array<{ icon?: string }> | undefined)?.[0]?.icon || route.meta?.icon;

        menuRoutes.push({
          path: fullPath,
          labelKey,
          icon,
          depth,
        });
      }

      // 递归处理子路由
      if (route.children && route.children.length > 0) {
        collectRoutes(route.children, fullPath);
      }
    }
  };

  collectRoutes(routes);

  // 2. 按 labelKey 层级构建菜单树
  interface MenuNode {
    labelKey: string;
    path?: string;
    icon?: string;
    children: Map<string, MenuNode>;
  }

  const menuTree = new Map<string, MenuNode>();

  // 先按深度排序，确保父节点先创建
  menuRoutes.sort((a, b) => a.depth - b.depth);

  // 创建一个映射，用于快速查找 labelKey 对应的路由信息
  const labelKeyToRoute = new Map<string, { path: string; icon?: string }>();
  for (const route of menuRoutes) {
    labelKeyToRoute.set(route.labelKey, { path: route.path, icon: route.icon });
  }

  for (const route of menuRoutes) {
    const parts = route.labelKey.split('.').slice(1); // 移除 'menu' 前缀
    let current = menuTree;

    // 构建路径到目标节点
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const currentLabelKey = `menu.${parts.slice(0, i + 1).join('.')}`;
      const isLeaf = i === parts.length - 1;

      if (!current.has(part)) {
        // 检查当前节点是否也是一个路由（即使不是叶子节点）
        const routeInfo = labelKeyToRoute.get(currentLabelKey);
        current.set(part, {
          labelKey: currentLabelKey,
          path: routeInfo?.path,
          icon: routeInfo?.icon,
          children: new Map(),
        });
      }

      const node = current.get(part)!;

      // 如果当前节点对应的路由信息存在，更新路径和图标
      const routeInfo = labelKeyToRoute.get(currentLabelKey);
      if (routeInfo) {
        // 始终使用路由的实际路径，覆盖之前可能设置的路径
        node.path = routeInfo.path;
        if (routeInfo.icon && !node.icon) {
          node.icon = routeInfo.icon;
        }
      }

      current = node.children;
    }
  }

  // 3. 将 Map 结构转换为 MenuItem 数组
  const convertToMenuItems = (tree: Map<string, MenuNode>): MenuItem[] => {
    const items: MenuItem[] = [];

    for (const [key, node] of tree.entries()) {
      const children = node.children.size > 0 ? convertToMenuItems(node.children) : undefined;
      let normalizedPath: string;

      if (node.path) {
        normalizedPath = normalizeMenuPath(node.path);
      } else if (children && children.length > 0 && children[0].index) {
        // 使用第一个子节点的路径作为父节点的路径
        normalizedPath = children[0].index;
      } else {
        // 如果没有路径也没有子节点，使用 labelKey 生成一个默认路径
        normalizedPath = normalizeMenuPath(`/${key}`);
      }

      items.push({
        index: normalizedPath,
        title: node.labelKey, // title 作为显示文本，会在菜单组件中通过 labelKey 翻译
        labelKey: node.labelKey, // 明确设置 labelKey 用于翻译
        icon: node.icon,
        children,
      });
    }

    return items;
  };

  const menuItems = convertToMenuItems(menuTree);

  // 4. 使用智能图标分配工具分配图标
  const itemsWithLabelKey = menuItems.map(item => ({
    ...item,
    labelKey: item.title,
  }));

  const iconSet = new Set<string>();
  const itemsWithIcons = assignIconsToMenuTree(itemsWithLabelKey, iconSet);

  // 5. 转换回 MenuItem 格式（保留 labelKey 用于翻译）
  const finalMenuItems: MenuItem[] = itemsWithIcons.map(item => {
    const labelKey = item.labelKey || item.title;
    return {
      index: item.index,
      title: labelKey, // title 使用 labelKey，菜单组件会通过 labelKey 翻译
      labelKey, // 明确设置 labelKey 用于翻译
      icon: item.icon,
      children: item.children ? (item.children as any[]).map((child: any) => {
        const childLabelKey = child.labelKey || child.title;
        return {
          index: child.index,
          title: childLabelKey,
          labelKey: childLabelKey,
          icon: child.icon,
          children: child.children,
        };
      }) : undefined,
    };
  });

  return finalMenuItems;
}
