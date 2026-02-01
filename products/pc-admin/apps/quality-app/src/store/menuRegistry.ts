/**
 * 菜单注册表（主应用主导，命名空间化）
 */

import { ref, type Ref } from 'vue';

// 定义类型，避免直接导入
export type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
};

// 使用响应式对象存储菜单
const registry: Ref<Record<string, MenuItem[]>> = ref({
  // 所有应用的菜单在进入时通过 manifest 注册
  admin: [],
  system: [],
  logistics: [],
  engineering: [],
  quality: [],
  production: [],
  finance: [],
  docs: [],
});

/**
 * 注册子应用的菜单
 */
export function registerMenus(app: string, menus: MenuItem[]) {
  registry.value[app] = menus;
}

/**
 * 清理子应用的菜单
 */
export function clearMenus(app: string) {
  if (registry.value[app]) {
    registry.value[app] = [];
  }
}

/**
 * 清理除指定应用外的所有菜单
 */
export function clearMenusExcept(app: string) {
  Object.keys(registry.value).forEach(key => {
    if (key !== app) {
      registry.value[key] = [];
    }
  });
}

/**
 * 获取指定应用的菜单（响应式）
 */
export function getMenusForApp(app: string): MenuItem[] {
  return registry.value[app] || [];
}

/**
 * 获取菜单注册表的响应式引用（用于在组件中监听变化）
 */
export function getMenuRegistry(): Ref<Record<string, MenuItem[]>> {
  return registry;
}
