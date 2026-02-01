/**
 * 菜单注册表（主应用主导，命名空间化）
 *
 * 关键：在微前端环境中，layout-app 和子应用是不同的构建产物，
 * 它们各自有独立的菜单注册表实例。为了确保菜单能够正确共享，
 * 需要通过全局对象（window）共享同一个注册表实例。
 *
 * 优化：添加 localStorage 持久化，类似 cool-admin 的做法
 * 刷新页面时从 localStorage 恢复菜单数据，避免菜单重新加载导致的闪烁
 */
;

import { ref, triggerRef, type Ref } from 'vue';
import { storage } from '@btc/shared-core/utils';
// import { assignIconsToMenuTree } from '@btc/shared-core'; // 未使用

// 定义类型，避免直接导入
export type MenuItem = {
  index: string;
  title: string;
  icon?: string;
  children?: MenuItem[];
  labelKey?: string; // 国际化 key，用于翻译菜单标题
};

// 全局菜单注册表的键名
const GLOBAL_REGISTRY_KEY = '__BTC_MENU_REGISTRY__';
// localStorage 存储键名前缀（类似 cool-admin 的 base.menuGroup）
// 每个应用使用独立的缓存键，提高性能：base.menuGroup.admin, base.menuGroup.logistics 等
const STORAGE_KEY_PREFIX = 'base.menuGroup.';

/**
 * 从 localStorage 恢复菜单数据（类似 cool-admin 的性能优化）
 * 使用 storage.info() 一次性获取所有缓存数据，避免多次读取
 */
function loadMenuRegistryFromStorage(): Record<string, MenuItem[]> | null {
  let allData: Record<string, any> = {};
  
  try {
    // 关键优化：使用 storage.info() 一次性获取所有数据，类似 cool-admin
    // 这样可以避免多次调用 storage.get()，提高性能
    // 兼容性检查：如果 info() 方法不存在，回退到逐个获取的方式
    if (typeof storage.info === 'function') {
      allData = storage.info();
    } else {
      // 回退方案：逐个获取每个应用的菜单缓存
      const apps = ['admin', 'system', 'logistics', 'engineering', 'quality', 'production', 'finance', 'docs', 'operations'];
      apps.forEach(app => {
        const key = `${STORAGE_KEY_PREFIX}${app}`;
        const menus = storage.get(key) as MenuItem[] | null;
        if (Array.isArray(menus) && menus.length > 0) {
          allData[key] = menus;
        }
      });
    }
    
    // 从所有数据中提取菜单缓存（键名格式：base.menuGroup.{app}）
    const registry: Record<string, MenuItem[]> = {};
    let hasData = false;

    Object.keys(allData).forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        const app = key.substring(STORAGE_KEY_PREFIX.length);
        const menus = allData[key];
        if (Array.isArray(menus)) {
          registry[app] = menus;
          hasData = true;
        }
      }
    });

    return hasData ? registry : null;
  } catch (error) {
    // 解析失败，清除无效缓存
    console.warn('[MenuRegistry] 恢复菜单缓存失败，清除无效缓存:', error);
    // 清理所有菜单缓存键（使用 storage.remove，确保正确处理 prefix）
    // 注意：storage.info() 返回的键名已经去掉了 prefix
    try {
      let dataToClean: Record<string, any> = {};
      if (allData && Object.keys(allData).length > 0) {
        dataToClean = allData;
      } else if (typeof storage.info === 'function') {
        dataToClean = storage.info();
      }
      
      Object.keys(dataToClean).forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          try {
            storage.remove(key);
          } catch {
            // 忽略清理错误
          }
        }
      });
    } catch {
      // 忽略清理错误
    }
  }

  return null;
}

/**
 * 将菜单数据保存到 localStorage（类似 cool-admin 的方式）
 * 每个应用使用独立的缓存键，提高性能
 */
function saveMenuRegistryToStorage(registry: Record<string, MenuItem[]>): void {
  try {
    // 关键优化：每个应用使用独立的缓存键，类似 cool-admin 的 base.menuGroup
    // 这样可以只更新变化的应用菜单，而不是整个注册表
    Object.keys(registry).forEach(app => {
      const menus = registry[app];
      const key = `${STORAGE_KEY_PREFIX}${app}`;
      if (Array.isArray(menus) && menus.length > 0) {
        storage.set(key, menus);
      } else {
        // 如果菜单为空，移除缓存键（节省空间）
        storage.remove(key);
      }
    });
  } catch (error) {
    // 存储失败（可能是存储空间不足），静默处理
    console.warn('[MenuRegistry] 保存菜单缓存失败:', error);
  }
}

// 获取或创建全局菜单注册表
function getGlobalRegistry(): Ref<Record<string, MenuItem[]>> {
  if (typeof window !== 'undefined') {
    // 如果全局对象中已存在注册表，直接使用
    if ((window as any)[GLOBAL_REGISTRY_KEY]) {
      const existingRegistry = (window as any)[GLOBAL_REGISTRY_KEY];
      return existingRegistry;
    }

    // 尝试从 localStorage 恢复菜单数据
    const cachedData = loadMenuRegistryFromStorage();

    // 创建新的注册表并挂载到全局对象
    const registry: Ref<Record<string, MenuItem[]>> = ref(
      cachedData || {
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
        operations: [],
      }
    );

    // 关键优化：不在初始化时保存空缓存，只在菜单注册时保存
    // 这样可以避免不必要的存储操作，提高性能（类似 cool-admin）

    (window as any)[GLOBAL_REGISTRY_KEY] = registry;
    return registry;
  }

  // SSR 环境或非浏览器环境，创建本地注册表
  return ref({
    main: [], // 主应用菜单（概览页面）
    admin: [],
    system: [],
    logistics: [],
    engineering: [],
    quality: [],
    production: [],
    finance: [],
    docs: [],
    operations: [],
  });
}

// 使用全局共享的菜单注册表
// 关键：每次都从全局对象获取，确保所有模块使用同一个注册表实例
function getRegistry(): Ref<Record<string, MenuItem[]>> {
  // 关键：每次都从全局对象获取，而不是使用模块级缓存
  // 这样可以确保 layout-app 和子应用使用同一个注册表实例
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_REGISTRY_KEY]) {
    return (window as any)[GLOBAL_REGISTRY_KEY];
  }
  // 如果全局不存在，创建新的并挂载到全局
  return getGlobalRegistry();
}

/**
 * 深度比较两个菜单数组是否相同
 */
function menusEqual(menus1: MenuItem[], menus2: MenuItem[]): boolean {
  if (menus1.length !== menus2.length) {
    return false;
  }

  for (let i = 0; i < menus1.length; i++) {
    const item1 = menus1[i];
    const item2 = menus2[i];

    // 如果任一项目为 undefined，不相等
    if (!item1 || !item2) {
      return false;
    }

    // 比较所有字段
    if (item1.index !== item2.index ||
        item1.title !== item2.title ||
        item1.icon !== item2.icon ||
        (item1 as any).externalUrl !== (item2 as any).externalUrl) {
      return false;
    }

    // 递归比较子菜单
    if (item1.children && item2.children) {
      if (!menusEqual(item1.children, item2.children)) {
        return false;
      }
    } else if (item1.children || item2.children) {
      return false;
    }
  }

  return true;
}

/**
 * 注册子应用的菜单
 * @param app 应用ID
 * @param menus 菜单项数组
 * @param forceUpdate 是否强制更新（即使菜单相同也更新），用于确保 manifest 更新后菜单能正确显示
 */
export function registerMenus(app: string, menus: MenuItem[], forceUpdate: boolean = false) {
  // 关键：优先使用全局注册表（layout-app 创建的），确保所有模块使用同一个实例
  let reg: Ref<Record<string, MenuItem[]>>;
  if (typeof window !== 'undefined' && (window as any)[GLOBAL_REGISTRY_KEY]) {
    // 使用已存在的全局注册表
    reg = (window as any)[GLOBAL_REGISTRY_KEY];
  } else {
    // 如果全局不存在，获取或创建新的注册表
    reg = getRegistry();
    // 确保挂载到全局
    if (typeof window !== 'undefined') {
      (window as any)[GLOBAL_REGISTRY_KEY] = reg;
    }
  }

  const existingMenus = reg.value[app] || [];

  // 如果菜单内容相同且不强制更新，跳过更新，避免触发不必要的响应式更新和存储操作
  // 关键优化：菜单相同时不保存，提高性能（类似 cool-admin）
  // 但是，从 manifest 注册菜单时，使用 forceUpdate=true 确保新菜单项能正确显示
  if (!forceUpdate && existingMenus.length > 0 && menusEqual(existingMenus, menus)) {
    return;
  }

  // 如果菜单内容不同、现有菜单为空、或强制更新，需要更新
  reg.value[app] = menus;
  // 关键：手动触发响应式更新，确保 Vue 能够检测到全局对象的变化
  triggerRef(reg);

  // 关键优化：将菜单数据保存到 localStorage，类似 cool-admin 的做法
  // 刷新页面时可以从缓存恢复，避免菜单重新加载导致的闪烁
  saveMenuRegistryToStorage(reg.value);
}

/**
 * 清理子应用的菜单
 */
export function clearMenus(app: string) {
  const reg = getRegistry();
  if (reg.value[app]) {
    reg.value[app] = [];
    triggerRef(reg);
    // 更新缓存
    saveMenuRegistryToStorage(reg.value);
  }
}

/**
 * 清理除指定应用外的所有菜单
 */
export function clearMenusExcept(app: string) {
  const reg = getRegistry();
  Object.keys(reg.value).forEach(key => {
    if (key !== app) {
      reg.value[key] = [];
    }
  });
  triggerRef(reg);
  // 更新缓存
  saveMenuRegistryToStorage(reg.value);
}

/**
 * 获取指定应用的菜单（响应式）
 */
export function getMenusForApp(app: string): MenuItem[] {
  const reg = getRegistry();
  return reg.value[app] || [];
}

/**
 * 获取菜单注册表的响应式引用（用于在组件中监听变化）
 */
export function getMenuRegistry(): Ref<Record<string, MenuItem[]>> {
  return getRegistry();
}

