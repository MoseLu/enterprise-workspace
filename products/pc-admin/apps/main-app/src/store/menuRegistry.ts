/**
 * 菜单注册表（主应用主导，命名空间化）
 */

import { ref, type Ref } from 'vue';

// 定义类型
export type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  // 外链跳转：指向子应用的子域名完整地址（如 https://admin.bellis.com.cn）
  // 如果设置了 externalUrl，点击菜单项时会跳转到该地址，同时保留主应用的布局
  externalUrl?: string;
  // 国际化翻译键（用于查找图标和翻译）
  labelKey?: string;
};

// 使用响应式对象存储菜单（初始值，实际使用全局注册表）
const registry: Ref<Record<string, MenuItem[]>> = ref({
  // 所有应用的菜单在进入时通过 manifest 注册
  main: [], // 主应用菜单（概览页面）
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
  const reg = getMenuRegistry();
  reg.value[app] = menus;
}

/**
 * 清理子应用的菜单
 */
export function clearMenus(app: string) {
  const reg = getMenuRegistry();
  if (reg.value[app]) {
    reg.value[app] = [];
  }
}

/**
 * 清理除指定应用外的所有菜单
 */
export function clearMenusExcept(app: string) {
  const reg = getMenuRegistry();
  Object.keys(reg.value).forEach(key => {
    if (key !== app) {
      reg.value[key] = [];
    }
  });
}

/**
 * 获取指定应用的菜单（响应式）
 */
export function getMenusForApp(app: string): MenuItem[] {
  const reg = getMenuRegistry();
  return reg.value[app] || [];
}

/**
 * 获取菜单注册表的响应式引用（用于在组件中监听变化）
 */
export function getMenuRegistry(): Ref<Record<string, MenuItem[]>> {
  // 如果全局对象中已存在注册表，使用全局的（与 shared-components 共享）
  if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
    return (window as any).__BTC_MENU_REGISTRY__;
  }
  
  // 否则使用本地的注册表，并挂载到全局对象
  if (typeof window !== 'undefined') {
    (window as any).__BTC_MENU_REGISTRY__ = registry;
  }
  
  return registry;
}

