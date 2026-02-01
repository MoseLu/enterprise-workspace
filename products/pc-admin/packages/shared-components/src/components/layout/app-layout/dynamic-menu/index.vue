<template>
  <el-menu
    :key="menuRenderKey"
    ref="menuRef"
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="isCollapse"
    :collapse-transition="false"
    :unique-opened="uniqueOpened"
    :class="[menuThemeClass, 'sidebar__menu']"
    :text-color="menuThemeConfig?.textColor"
    :active-text-color="menuThemeConfig?.textActiveColor"
    @select="handleMenuSelect"
  >
    <!-- 使用配置文件动态渲染菜单 -->
    <MenuRenderer
      :menu-items="currentMenuItems"
      v-bind="{
        ...(searchKeyword !== undefined ? { 'search-keyword': searchKeyword } : {}),
        ...(isCollapse !== undefined ? { 'is-collapse': isCollapse } : {})
      }"
    />
  </el-menu>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutDynamicMenu',
});

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n, useThemePlugin, logger } from '@btc/shared-core';
import { getCurrentEnvironment, getCurrentSubApp } from '@btc/shared-core/configs/unified-env-config';
import { useSettingsState, useSettingsConfig } from '../../../others/btc-user-setting/composables';
import { MenuThemeEnum } from '../../../others/btc-user-setting/config/enums';
import { useCurrentApp } from '../../../../composables/useCurrentApp';
import { getMenuRegistry } from '../../../../store/menuRegistry';
import { getIsMainAppFn } from '../utils';
import MenuRenderer from '../menu-renderer/index.vue';

interface Props {
  isCollapse?: boolean;
  searchKeyword?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  searchKeyword: '',
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();
const { uniqueOpened, menuThemeType } = useSettingsState();
const { menuStyleList } = useSettingsConfig();
// 关键：从 useThemePlugin 获取 isDark，直接响应主题切换按钮的变化
// 这样可以避免通过 systemThemeType 间接判断导致的时序问题
const theme = useThemePlugin();
const isDark = theme.isDark;

// 关键：Element Plus 的 default-active 在部分情况下不会响应后续变更
// 刷新/直达时，优先用 location.pathname 作为初始值，并通过 key 包含 activeMenu 强制重建
const getInitialActiveMenu = () => {
  try {
    const isLayoutApp = typeof window !== 'undefined' && !!(window as any).__IS_LAYOUT_APP__;
    if (isLayoutApp && typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
  } catch {
    // 静默失败
  }
  return route.path || '/';
};

const normalizeActivePath = (value: string) => {
  const raw = (value || '/').trim();
  const noHash = raw.split('#')[0] ?? raw;
  const noQuery = noHash.split('?')[0] ?? noHash;
  const ensured = noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
  return ensured === '' ? '/' : ensured;
};

const activeMenu = ref(normalizeActivePath(getInitialActiveMenu()));

// 菜单 ref
const menuRef = ref();
const menuKey = ref(0); // 用于强制重新渲染菜单
const isInitialMount = ref(true); // 标记是否是首次挂载

// 关键：只在菜单数据变化时更新 key，不在路由变化时更新 key，避免菜单重绘闪烁
// Element Plus 的 default-active 是响应式的，会随着 activeMenu 的变化自动更新激活状态
// 参考 cool-admin：直接使用 default-active={route.path}，无需通过 key 强制重新渲染
const menuRenderKey = computed(() => {
  // 只包含 menuKey，避免 activeMenu 变化时导致菜单重新渲染（Element Plus 会自动处理激活状态）
  return String(menuKey.value);
});

// 关键：强制同步菜单展开状态（Element Plus 的 default-openeds 在部分场景下不会随响应式变化自动展开）
const syncMenuOpenState = () => {
  try {
    const inst: any = menuRef.value;
    const openeds = defaultOpeneds.value || [];
    if (inst && typeof inst.open === 'function') {
      openeds.forEach((idx: string) => {
        try {
          inst.open(idx);
        } catch {
          // 静默失败
        }
      });
    }
    // 特殊处理：主应用默认展开工作台菜单
    if (currentApp.value === 'main' && openeds.includes('/workbench')) {
      // 确保工作台菜单展开（即使 defaultOpeneds 已经包含，也再次尝试）
      try {
        if (inst && typeof inst.open === 'function') {
          inst.open('/workbench');
        }
      } catch {
        // 静默失败
      }
    }
  } catch {
    // 静默失败
  }
};

// 获取菜单注册表的响应式引用
// 关键：每次都从全局对象获取，确保使用最新的注册表实例
const getMenuRegistryRef = () => {
  if (typeof window !== 'undefined' && (window as any).__BTC_MENU_REGISTRY__) {
    return (window as any).__BTC_MENU_REGISTRY__;
  }
  return getMenuRegistry();
};

// 获取当前应用的菜单项（从注册表读取，响应式）
const currentMenuItems = computed(() => {
  const app = currentApp.value;
  // 关键：每次都从全局对象获取最新的注册表，确保使用正确的实例
  const menuRegistry = getMenuRegistryRef();

  // 确保注册表存在
  if (!menuRegistry) {
    if (import.meta.env.DEV || !(window as any).__MENU_REGISTRY_MISSING_LOGGED__) {
      console.warn('[DynamicMenu] 菜单注册表不存在', { app });
      (window as any).__MENU_REGISTRY_MISSING_LOGGED__ = true;
    }
    return [];
  }

  // 直接访问 menuRegistry.value[app] 以确保响应式追踪
  // 这样当 menuRegistry.value[app] 变化时，computed 会自动重新计算
  const menus = menuRegistry.value[app] || [];

  // 允许菜单为空，这是正常的（某些应用可能没有菜单）


  // 如果菜单为空，尝试通过全局函数注册菜单（作为后备机制）
  if (menus.length === 0) {
    const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
    if (typeof registerMenusFn === 'function') {
      try {
        registerMenusFn(app);
        // 重新获取菜单（注册后可能已更新）
        const retryMenus = menuRegistry.value[app] || [];
        if (retryMenus.length > 0) {
          // 菜单注册成功
          return retryMenus;
        }
      } catch (error) {
        if (import.meta.env.DEV || !(window as any)[`__MENU_REGISTER_ERROR_${app}__`]) {
          logger.error(`[DynamicMenu] 菜单注册失败: ${app}`, error);
          (window as any)[`__MENU_REGISTER_ERROR_${app}__`] = true;
        }
      }
    } else {
      // 如果菜单注册函数不存在，输出警告
      if (import.meta.env.DEV || !(window as any)[`__MENU_REGISTER_FN_MISSING_${app}__`]) {
        console.warn(`[DynamicMenu] 菜单注册函数不存在: ${app}`, {
          __REGISTER_MENUS_FOR_APP__: typeof registerMenusFn,
          registry: menuRegistry.value,
          allApps: Object.keys(menuRegistry.value || {})
        });
        (window as any)[`__MENU_REGISTER_FN_MISSING_${app}__`] = true;
      }
    }
  }

  return menus;
});

// 菜单由 manifest 决定，是固定的，不需要监听变化重新渲染
// 只在应用切换时更新菜单（通过 currentMenuItems computed 自动响应）

// 监听 currentApp 的变化，确保应用切换时菜单也更新
// 关键：应用切换时，菜单数据会通过 currentMenuItems computed 自动更新
// 只有当菜单数据真正变化时才更新 menuKey，避免不必要的重绘
watch(
  () => currentApp.value,
  (newApp, oldApp) => {
    if (newApp !== oldApp && oldApp !== undefined) {
      // 应用切换时，尝试注册新应用的菜单
      const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
      if (typeof registerMenusFn === 'function') {
        try {
          registerMenusFn(newApp);
        } catch (error) {
          // 静默失败
        }
      }
      // 关键：不在这里强制更新 menuKey，让菜单数据变化的 watch 来处理
      // 这样可以避免应用切换但菜单数据未变化时的重复渲染
    }
  }
);

// 只监听当前应用的菜单变化，避免深度监听整个注册表导致的不必要重新渲染
// 关键：只在菜单数组引用真正变化时才更新 menuKey，避免路由变化时触发重绘
watch(
  () => {
    const app = currentApp.value;
    const menuRegistry = getMenuRegistryRef();
    const menus = menuRegistry?.value?.[app] || [];

    return menus;
  },
  (newMenus, oldMenus) => {
    // 如果数组引用相同，说明是同一个数组，不需要重新渲染
    if (newMenus === oldMenus) {
      return;
    }

    // 只有当菜单数组引用发生变化时才更新（菜单内容变化由 registerManifestMenusForApp 中的 menusEqual 检查）
    // 如果数组长度或内容相同但引用不同，说明是重复注册，不需要重新渲染
    if (newMenus.length !== (oldMenus?.length || 0)) {
      // 菜单数量变化，需要重新渲染
      menuKey.value++;
      return;
    }

    // 菜单数量相同，检查是否真的是内容变化（通过比较第一个和最后一个菜单项的引用）
    // 如果引用相同，说明是同一个数组，不需要重新渲染
    if (newMenus.length > 0 && oldMenus && oldMenus.length > 0) {
      const newFirst = newMenus[0];
      const oldFirst = oldMenus[0];
      const newLast = newMenus[newMenus.length - 1];
      const oldLast = oldMenus[oldMenus.length - 1];
      // 如果首尾项引用不同，说明是新的菜单数组，需要重新渲染
      if (newFirst !== oldFirst || newLast !== oldLast) {
        menuKey.value++;
      }
    } else if (newMenus.length === 0 && oldMenus && oldMenus.length > 0) {
      // 从有菜单变为无菜单，需要重新渲染
      menuKey.value++;
    } else if (newMenus.length > 0 && (!oldMenus || oldMenus.length === 0)) {
      // 从无菜单变为有菜单，需要重新渲染
      menuKey.value++;
    }
  }
);

// 组件挂载时检查菜单是否已注册
onMounted(() => {
  let retrying = false;
  const checkAndRetryMenu = () => {
    const app = currentApp.value;
    const menuRegistry = getMenuRegistryRef();
    const menus = menuRegistry?.value?.[app] || [];

    if (menus.length === 0) {
      // 尝试通过全局函数注册菜单（如果存在）
      // 注意：菜单注册应该由应用启动时完成，这里只是作为后备
      const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
      if (typeof registerMenusFn === 'function') {
        try {
          registerMenusFn(app);
          // 注册后立即检查一次
          const retryMenus = menuRegistry?.value?.[app] || [];
          if (retryMenus.length > 0) {
            menuKey.value++; // 强制重新渲染
            retrying = false;
            return true;
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn('[DynamicMenu] 菜单注册失败:', error);
          }
        }
      } else {
        // 如果注册函数不存在，尝试从 @btc/subapp-manifests 直接获取菜单并注册
        if (typeof window !== 'undefined') {
          import('@btc/subapp-manifests').then((module) => {
            try {
              const manifestMenus = module.getManifestMenus(app);
              if (manifestMenus && manifestMenus.length > 0) {
                // 动态导入注册函数
                import('@btc/shared-core/configs/layout-bridge').then((bridgeModule) => {
                  try {
                    bridgeModule.registerManifestMenusForApp(app);
                    const retryMenus = menuRegistry?.value?.[app] || [];
                    if (retryMenus.length > 0) {
                      menuKey.value++; // 强制重新渲染
                      retrying = false;
                    }
                  } catch (error) {
                    if (import.meta.env.DEV) {
                      console.warn('[DynamicMenu] 从 manifest 注册菜单失败:', error);
                    }
                  }
                }).catch(() => {
                  // 静默失败
                });
              }
            } catch (error) {
              if (import.meta.env.DEV) {
                console.warn('[DynamicMenu] 获取 manifest 菜单失败:', error);
              }
            }
          }).catch(() => {
          // 静默失败
          });
        }
      }

      // 延迟检查：只启动一次重试循环，避免初始化时反复抖动（多次 setTimeout + 多个 interval）
      if (!retrying) {
        retrying = true;
        
        // 关键：检查应用是否有菜单配置
        // 菜单配置可能在 manifest 中，也可能在模块级配置文件的 locale 中（以 menu. 开头的 key）
        const checkHasMenuConfig = async (): Promise<boolean> => {
          // 方法1：检查 manifest 中是否有菜单配置
          try {
            const { getManifestMenus } = await import('@btc/subapp-manifests');
            const manifestMenus = getManifestMenus(app);
            if (manifestMenus && manifestMenus.length > 0) {
              return true;
            }
          } catch (error) {
            // 静默失败，继续检查其他方法
          }
          
          // 方法2：从国际化消息中检查是否有 menu. 开头的 key
          // 菜单配置在模块级配置文件的 locale 中，以 menu. 开头的 key 形式存在
          try {
            const subAppI18nGetters = (window as any).__SUBAPP_I18N_GETTERS__;
            if (subAppI18nGetters && subAppI18nGetters instanceof Map && subAppI18nGetters.has(app)) {
              const getLocaleMessages = subAppI18nGetters.get(app);
              if (typeof getLocaleMessages === 'function') {
                const messages = getLocaleMessages();
                // 检查中文和英文消息中是否有 menu. 开头的 key
                const zhCNMessages = messages['zh-CN'] || {};
                const enUSMessages = messages['en-US'] || {};
                
                // 检查扁平化的 key（如果消息是扁平化结构）
                const hasMenuKey = (msgs: any): boolean => {
                  if (typeof msgs === 'object' && msgs !== null) {
                    // 扁平化结构：直接检查 key
                    if (Array.isArray(msgs) === false) {
                      const keys = Object.keys(msgs);
                      if (keys.some(key => key.startsWith('menu.'))) {
                        return true;
                      }
                    }
                    // 嵌套结构：递归检查
                    for (const key in msgs) {
                      if (key === 'menu') {
                        // 如果存在 menu 键，检查其内容是否为空
                        const menuValue = msgs[key];
                        if (menuValue && typeof menuValue === 'object' && Object.keys(menuValue).length > 0) {
                          return true;
                        }
                      }
                      if (typeof msgs[key] === 'object' && msgs[key] !== null && !Array.isArray(msgs[key])) {
                        if (hasMenuKey(msgs[key])) {
                          return true;
                        }
                      }
                    }
                  }
                  return false;
                };
                
                if (hasMenuKey(zhCNMessages) || hasMenuKey(enUSMessages)) {
                  return true;
                }
              }
            }
          } catch (error) {
            // 静默失败
          }
          
          return false;
        };
        
        // 异步检查是否有菜单配置
        checkHasMenuConfig().then((hasMenuConfig) => {
          if (!hasMenuConfig) {
            // 如果没有菜单配置，说明该应用本来就没有菜单，直接跳过等待
            retrying = false;
            return;
          }
          
          // 只有在有菜单配置时才等待注册
          let retryCount = 0;
          const maxRetries = 30;
          const checkInterval = setInterval(() => {
            retryCount++;
            const retryMenus = menuRegistry?.value?.[app] || [];
            if (retryMenus.length > 0) {
              clearInterval(checkInterval);
              menuKey.value++; // 强制重新渲染
              retrying = false;
            } else if (retryCount >= maxRetries) {
              clearInterval(checkInterval);
              retrying = false;
              // 再次检查是否有菜单配置
              // 如果确实有菜单配置但注册超时，才输出警告
              checkHasMenuConfig().then((stillHasMenuConfig) => {
                if (stillHasMenuConfig) {
                  if (import.meta.env.DEV) {
                    console.warn(`[DynamicMenu] 菜单注册超时，应用: ${app}`);
                  }
                }
                // 如果没有菜单配置，静默跳过，不输出警告
              }).catch(() => {
                // 如果检查失败，不输出警告
              });
            }
          }, 100);
        }).catch(() => {
          // 如果检查失败，使用原来的逻辑（向后兼容）
          let retryCount = 0;
          const maxRetries = 30;
          const checkInterval = setInterval(() => {
            retryCount++;
            const retryMenus = menuRegistry?.value?.[app] || [];
            if (retryMenus.length > 0) {
              clearInterval(checkInterval);
              menuKey.value++; // 强制重新渲染
              retrying = false;
            } else if (retryCount >= maxRetries) {
              clearInterval(checkInterval);
              retrying = false;
              if (import.meta.env.DEV) {
                console.warn(`[DynamicMenu] 菜单注册超时，应用: ${app}`);
              }
            }
          }, 100);
        });
      }
      return false;
    } else {
      // 菜单已存在：不再强制多次 menuKey++，避免初始化抖动
      retrying = false;
      return true;
    }
  };

  // 立即检查一次
  const ok = checkAndRetryMenu();

  // 关键：在首次挂载完成后，将 isInitialMount 设置为 false
  // 这样之后的路由变化就不会通过 key 强制重建菜单，而是通过 watch activeMenu 来更新激活状态
  import('vue').then(({ nextTick }) => {
    nextTick(() => {
      // 延迟一点时间，确保首次挂载时的 key 包含 activeMenu 已经生效
      setTimeout(() => {
        isInitialMount.value = false;
      }, 100);
    });
  });

  // 仅当首次检查菜单为空时，才做延迟检查兜底
  if (!ok) {
    setTimeout(checkAndRetryMenu, 200);
    setTimeout(checkAndRetryMenu, 800);
  }
});

// 递归获取所有菜单项的 index（用于搜索匹配）
const getAllMenuIndexes = (items: any[]): string[] => {
  const indexes: string[] = [];

  items.forEach(item => {
    if (item.index) {
      indexes.push(item.index);
    }
    if (item.children && item.children.length > 0) {
      indexes.push(...getAllMenuIndexes(item.children));
    }
  });

  return indexes;
};

// 获取主应用的菜单激活路径
// 如果菜单项的 index 包含 /main 前缀，返回包含前缀的路径；否则返回不包含前缀的路径
function getActiveMenuPathForMainApp(path: string): string {
  const normalizedPath = normalizeActivePath(path);
  
  // 查找匹配的菜单项
  const findMenuItemByPath = (items: typeof currentMenuItems.value, targetPath: string): typeof items[0] | null => {
    for (const item of items) {
      // 检查是否匹配（支持带/和不带/的格式，以及带/main前缀和不带前缀的格式）
      const itemIndex = item.index || '';
      const itemIndexWithoutPrefix = itemIndex.startsWith('/main') ? itemIndex.slice('/main'.length) : itemIndex;
      const normalizedItemIndex = normalizeActivePath(itemIndexWithoutPrefix);
      
      if (normalizedItemIndex === normalizedPath || itemIndex === normalizedPath || itemIndex === `/${normalizedPath}`) {
        return item;
      }
      // 递归检查子菜单
      if (item.children && item.children.length > 0) {
        const found = findMenuItemByPath(item.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };
  
  const matchedItem = findMenuItemByPath(currentMenuItems.value, normalizedPath);
  
  // 如果找到匹配的菜单项，且菜单项的 index 包含 /main 前缀，使用包含前缀的路径
  if (matchedItem && matchedItem.index && matchedItem.index.startsWith('/main')) {
    return normalizeActivePath(matchedItem.index);
  }
  
  // 否则使用不包含前缀的路径
  return normalizedPath;
}

const defaultOpeneds = computed(() => {
  if (props.isCollapse) return [];

  // 关键：无搜索时，默认展开当前激活菜单的父级（解决刷新后菜单立刻收起/激活丢失的问题）
  const resolveOpenedsByActive = (items: any[], activePath: string): string[] => {
    const normalizedActive = normalizeActivePath(activePath || '/');
    if (!normalizedActive) return [];
    const parents: string[] = [];

    const dfs = (nodes: any[], parentIndexes: string[]): boolean => {
      for (const node of nodes) {
        const nodeIndex: string | undefined = node?.index;
        const nextParents = nodeIndex ? [...parentIndexes, nodeIndex] : [...parentIndexes];

        // 命中：index 等于激活路径，或激活路径以该 index 为前缀（例如父级 /inventory 命中 /inventory/result）
        const isHit =
          typeof nodeIndex === 'string' &&
          (nodeIndex === normalizedActive ||
            normalizedActive === `/${nodeIndex.replace(/^\//, '')}` ||
            normalizedActive.startsWith(nodeIndex.endsWith('/') ? nodeIndex : `${nodeIndex}/`));

        if (isHit) {
          parents.push(...parentIndexes);
          return true;
        }

        if (Array.isArray(node?.children) && node.children.length > 0) {
          const childHit = dfs(node.children, nextParents);
          if (childHit) {
            // 命中子节点：展开当前节点
            if (nodeIndex) {
              parents.push(nodeIndex);
            }
            parents.push(...parentIndexes);
            return true;
          }
        }
      }
      return false;
    };

    dfs(items, []);
    return [...new Set(parents)].filter(Boolean);
  };

  // 如果有搜索关键词，根据匹配结果精确展开菜单
  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase().trim();
    if (!keyword) {
      // 空搜索，恢复默认展开
      return currentApp.value === 'main'
        ? ['platform', 'org', 'access', 'navigation', 'ops', 'test-features']
        : [];
    }

    // 递归查找匹配的菜单项并展开其父级
    const findMatchingParents = (items: any[], parents: string[] = []): string[] => {
      const openeds: string[] = [];

      items.forEach(item => {
        const currentParents = [...parents, item.index];

        // 检查当前菜单项是否匹配
        const currentMatch = t(item.title).toLowerCase().includes(keyword);

        if (currentMatch) {
          // 如果当前项匹配，展开所有父级
          openeds.push(...parents);
        }

        // 递归检查子菜单
        if (item.children && item.children.length > 0) {
          const childMatch = findMatchingParents(item.children, currentParents);
          if (childMatch.length > 0) {
            // 如果子菜单有匹配项，展开当前项
            openeds.push(item.index);
            openeds.push(...childMatch);
          }
        }
      });

      return openeds;
    };

    return [...new Set(findMatchingParents(currentMenuItems.value))];
  }

  // 无搜索：主应用默认展开"工作台"菜单；子应用按激活菜单自动展开父级
  if (currentApp.value === 'main') {
    // 主应用默认展开工作台菜单（/workbench）
    return ['/workbench'];
  }
  return resolveOpenedsByActive(currentMenuItems.value, activeMenu.value);
});

// 关键：刷新时经常出现"先算 activeMenu/route，再异步注册菜单"的顺序
// 这会导致首次展开失败，所以这里监听菜单数据到达后再强制展开一次
// 优化：只监听菜单数据变化，不监听 activeMenu（路由变化时 Element Plus 会自动处理激活状态）
watch(
  () => currentMenuItems.value,
  () => {
    // 只有当菜单已加载时才尝试展开
    if (!Array.isArray(currentMenuItems.value) || currentMenuItems.value.length === 0) {
      return;
    }
    // 使用 nextTick 确保 DOM 更新完成后再同步展开状态
    nextTick(() => {
      syncMenuOpenState();
      // 如果是主应用且当前路径是首页，确保工作台菜单展开
      if (currentApp.value === 'main') {
        const currentPath = normalizeActivePath(route.path || window.location.pathname || '/');
        if (currentPath === '/workbench/overview' || currentPath === '/' || currentPath === '/overview') {
          // 延迟一点确保菜单已渲染
          setTimeout(() => {
            syncMenuOpenState();
          }, 100);
        }
      }
    });
  },
  { immediate: true },
);

// 关键：Element Plus 的 el-menu 的 default-active 是响应式的
// 参考 cool-admin：直接使用 default-active={route.path}，Element Plus 会自动响应式更新激活状态
// 不需要 watch activeMenu 来手动更新，让 Element Plus 自己处理即可

// 菜单主题类 - 实现类似 art-design-pro 的展示层逻辑
// 深色主题下强制显示深色菜单风格，但不修改 menuThemeType 的值
const menuThemeClass = computed(() => {
  // 深色主题下强制显示深色菜单风格（展示层逻辑）
  if (isDark?.value === true) {
    return 'el-menu-dark';
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的类名
  const theme = menuThemeType?.value;
  if (!theme) {
    return 'el-menu-design';
  }

  // 直接比较枚举值，确保只返回一个类名
  switch (theme) {
    case MenuThemeEnum.DARK:
      return 'el-menu-dark';
    case MenuThemeEnum.LIGHT:
      return 'el-menu-light';
    case MenuThemeEnum.DESIGN:
    default:
      return 'el-menu-design';
  }
});

// 菜单主题配置 - 类似 art-design-pro 的 getMenuTheme
const menuThemeConfig = computed(() => {
  // 深色系统主题下，菜单背景必须和内容区域一致（都使用 var(--el-bg-color)）
  // 关键：同时检查 isDark 和 menuThemeType，确保在主题切换时能正确响应
  const isSystemDark = isDark?.value === true;
  const isMenuDark = menuThemeType?.value === MenuThemeEnum.DARK;

  if (isSystemDark || isMenuDark) {
    // 深色系统主题下，菜单使用与内容区域一致的深色背景
    return {
      background: 'var(--el-bg-color)',
      textColor: '#FFFFFF',
      textActiveColor: '#FFFFFF',
    };
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
  const menuTheme = menuThemeType?.value || MenuThemeEnum.DESIGN;
  const themeConfig = menuStyleList.value.find(item => item.theme === menuTheme);

  if (themeConfig) {
    return {
      background: themeConfig.background,
      textColor: themeConfig.textColor,
      textActiveColor: themeConfig.textActiveColor,
    };
  }

  // 默认配置
  return {
    background: '#FFFFFF',
    textColor: '#29343D',
    textActiveColor: '#3F8CFF',
  };
});

// 关键：主题变化时不需要重新渲染整个菜单，只需要更新 CSS 变量
// Element Plus 的菜单组件会自动响应 CSS 变量的变化
// 移除这里的 menuKey 更新，避免主题切换时的菜单重绘闪烁
// 主题变化由 updateMenuCSSVariables 函数处理

// 菜单主题配置类型
type MenuThemeConfig = {
  background: string;
  textColor: string;
  textActiveColor: string;
};

// 强制更新菜单 CSS 变量的辅助函数
const updateMenuCSSVariables = (newConfig: MenuThemeConfig) => {
  if (!menuRef.value) return;

  const menuEl = menuRef.value.$el as HTMLElement;
  if (!menuEl) return;

  // 关键：使用双重 requestAnimationFrame 确保在浏览器渲染之后设置
  // 这样可以确保在全局 CSS 规则应用之后再设置内联样式
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 强制更新 Element Plus 的 CSS 变量
      // 注意：CSS 变量不支持 !important，但内联样式的优先级通常高于外部样式表
      // 通过延迟设置确保在全局样式之后应用
      menuEl.style.setProperty('--el-menu-text-color', newConfig.textColor);
      menuEl.style.setProperty('--el-menu-active-text-color', newConfig.textActiveColor);
      menuEl.style.setProperty('--el-menu-hover-text-color', newConfig.textColor);

    });
  });
};

// 监听 menuThemeConfig 变化，确保 Element Plus 的 CSS 变量立即更新
watch(
  () => menuThemeConfig.value,
  (newConfig) => {
    // 确保 newConfig 存在且有效
    if (!newConfig || !newConfig.background) {
      return;
    }
    // 使用 nextTick 确保 DOM 更新完成后再强制更新 CSS 变量
    nextTick(() => {
      updateMenuCSSVariables(newConfig);
    });
  },
  { immediate: false, deep: true }
);

// 监听 HTML dark 类变化，确保在主题切换时重新设置 CSS 变量
// 因为全局 CSS 规则可能在主题切换后重新应用
watch(
  () => document.documentElement.classList.contains('dark'),
  () => {
    nextTick(() => {
      // 确保 menuThemeConfig 已初始化
      if (menuThemeConfig.value && menuThemeConfig.value.background) {
      updateMenuCSSVariables(menuThemeConfig.value);
      }
    });
  }
);

// 关键：搜索关键词变化时，defaultOpeneds computed 会自动重新计算
// Element Plus 的菜单组件会自动响应 default-openeds 的变化
// 不需要强制重新渲染整个菜单，避免搜索时的闪烁
// 如果确实需要强制展开/收起，可以通过 syncMenuOpenState 函数处理

// 关键：监听路由变化，只更新 activeMenu，不触发菜单重绘
// Element Plus 的 default-active 是响应式的，会自动更新激活状态
// 不需要手动操作 DOM，避免菜单重绘闪烁
watch(
  () => route.path,
  (newPath) => {
    // 关键：在生产环境子域名模式下，路径直接是子应用路由（如 /platform/modules）
    // 在开发环境下，路径可能包含应用前缀（如 /admin/platform/modules）
    const isLayoutApp = typeof window !== 'undefined' && !!(window as any).__IS_LAYOUT_APP__;
    const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
    const env = getCurrentEnvironment();
    const isProductionOrTestSubdomain = env === 'production' || env === 'test';

    let targetPath: string;

    // 关键：检查是否是主应用路由（使用统一的 isMainApp 函数判断）
    // 如果是主应用路由，直接使用路径，不进行应用前缀处理
    const locationPath = typeof window !== 'undefined' ? window.location.pathname : newPath;
    const isStandalone = typeof window !== 'undefined' && !(window as any).__POWERED_BY_QIANKUN__;
    const isMainAppFn = getIsMainAppFn();
    const isMainAppRoute = isMainAppFn ? isMainAppFn(newPath, locationPath, isStandalone) : false;

    // 关键：如果是主应用路由，需要根据当前应用统一处理路径格式
    // 在 system-app 环境下，菜单项的 index 包含 /system 前缀，所以 targetPath 也需要添加前缀以保持一致性
    if (isMainAppRoute) {
      const app = currentApp.value;
      // 特殊处理：主应用的首页路由（/workbench/overview）不作为菜单激活项
      // 类似于其他应用的首页，只展开对应的菜单组，不激活具体菜单项
      const normalizedPath = normalizeActivePath(newPath);
      if (normalizedPath === '/workbench/overview' || normalizedPath === '/overview') {
        // 首页路由，清除菜单激活状态，确保没有菜单项被激活
        if (activeMenu.value) {
          activeMenu.value = '';
        }
        // 确保工作台菜单展开
        nextTick(() => {
          syncMenuOpenState();
        });
        return;
      }
      
      // 特殊处理：根路径 `/` 没有对应的菜单项
      // 但是，如果访问根路径时，路由会重定向到首页（如 /workbench/overview）
      // 此时应该使用 location.pathname 获取重定向后的实际路径
      if (newPath === '/' || newPath === '') {
        // 检查 location.pathname 是否是重定向后的路径（不是根路径）
        const actualPath = typeof window !== 'undefined' ? window.location.pathname : newPath;
        if (actualPath && actualPath !== '/' && actualPath !== '') {
          const normalizedActualPath = normalizeActivePath(actualPath);
          // 如果重定向到首页，不激活菜单项
          if (normalizedActualPath === '/workbench/overview' || normalizedActualPath === '/overview') {
            return;
          }
          // 如果实际路径不是根路径，说明已经重定向，使用实际路径激活菜单
          if (normalizedActualPath && normalizedActualPath !== '/') {
            // 检查实际路径是否也是主应用路由
            const isActualPathMainAppRoute = isMainAppFn ? isMainAppFn(normalizedActualPath, actualPath, isStandalone) : false;
            if (isActualPathMainAppRoute) {
              if (app === 'system' && !normalizedActualPath.startsWith('/system')) {
                targetPath = normalizeActivePath(`/system${normalizedActualPath}`);
              } else if (app === 'main') {
                // 对于主应用，检查菜单项的 index 是否包含 /main 前缀
                targetPath = getActiveMenuPathForMainApp(normalizedActualPath);
              } else {
                targetPath = normalizeActivePath(normalizedActualPath);
              }
            } else {
              // 实际路径不是主应用路由，跳过
              return;
            }
          } else {
            // 实际路径还是根路径，跳过
            return;
          }
        } else {
          // 实际路径也是根路径，跳过
          if (import.meta.env.DEV) {
            console.info('[DynamicMenu] 根路径，跳过菜单激活:', {
              originalPath: newPath,
              actualPath,
              currentApp: app,
            });
          }
          return;
        }
      } else if (app === 'system' && !newPath.startsWith('/system')) {
        // 如果当前应用是 system，菜单项的 index 包含 /system 前缀，所以 targetPath 也需要添加前缀
        targetPath = normalizeActivePath(`/system${newPath}`);
      } else if (app === 'main') {
        // 对于主应用，检查菜单项的 index 是否包含 /main 前缀
        targetPath = getActiveMenuPathForMainApp(normalizedPath);
      } else {
        targetPath = normalizeActivePath(newPath);
      }
    } else if (isLayoutApp || isUsingLayoutApp) {
      // 在 layout-app 环境下，尝试从子应用的路由路径中提取正确的路径
      // 在生产环境子域名模式下，路径直接是子应用路由（如 /org/departments）
      // 在开发环境下，路径可能包含应用前缀（如 /admin/org/departments）
      const app = currentApp.value;

      if (isProductionOrTestSubdomain) {
        // 生产环境子域名模式：路径直接是子应用路由
        // 特殊处理：根路径 `/` 没有对应的菜单项，直接返回
        if (newPath === '/' || newPath === '') {
          if (import.meta.env.DEV) {
            console.info('[DynamicMenu] 子应用根路径（生产环境），跳过菜单激活:', {
              originalPath: newPath,
              currentApp: app,
            });
          }
          return;
        }
        targetPath = normalizeActivePath(newPath);
      } else if (app && newPath.startsWith(`/${app}`)) {
        // 开发环境：去掉应用前缀，获取子应用内部路径
        const subAppPath = newPath.slice(`/${app}`.length) || '/';
        // 特殊处理：子应用根路径（如 `/admin` -> `/`）没有对应的菜单项，直接返回
        if (subAppPath === '/' || subAppPath === '') {
          if (import.meta.env.DEV) {
            console.info('[DynamicMenu] 子应用根路径（开发环境），跳过菜单激活:', {
              originalPath: newPath,
              subAppPath,
              currentApp: app,
            });
          }
          return;
        }
        targetPath = normalizeActivePath(subAppPath);
      } else {
        targetPath = normalizeActivePath(newPath);
      }
    } else if (isProductionOrTestSubdomain) {
      // 独立运行模式 + 生产环境子域名：路径直接是子应用路由
      // 特殊处理：根路径 `/` 没有对应的菜单项，直接返回
      if (newPath === '/' || newPath === '') {
        if (import.meta.env.DEV) {
          console.info('[DynamicMenu] 子应用根路径（独立运行+生产环境），跳过菜单激活:', {
            originalPath: newPath,
            currentApp: currentApp.value,
          });
        }
        return;
      }
      targetPath = normalizeActivePath(newPath);
    } else {
      // 其他情况：直接使用路由路径
      // 特殊处理：子应用根路径（如 `/admin`、`/logistics` 等）没有对应的菜单项
      // 这些路径是占位路由，实际的菜单项是它们的子路由
      const subAppRootPaths = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/dashboard', '/personnel', '/monitor'];
      if (subAppRootPaths.includes(newPath)) {
        // 子应用根路径，跳过菜单激活
        return;
      }
      targetPath = normalizeActivePath(newPath);
    }

    // 关键：只更新 activeMenu，让 Element Plus 的 default-active 自动处理激活状态
    // 避免手动操作 DOM，减少菜单重绘闪烁
    if (activeMenu.value !== targetPath) {
      activeMenu.value = targetPath;
      // 关键：立即同步菜单展开状态，确保菜单能够立即激活
      // 使用 nextTick 确保 DOM 更新完成后再同步
      nextTick(() => {
        syncMenuOpenState();
      });
    } else {
      // 即使路径相同，也确保菜单展开状态同步（处理重定向后的情况）
      nextTick(() => {
        syncMenuOpenState();
      });
    }
  },
  { immediate: true }
);

// 关键：在 layout-app 环境下，监听子应用的路由变化事件，更新菜单激活状态
// 子应用通过 window.dispatchEvent(new CustomEvent('subapp:route-change', {detail: {...}})) 上报路由
onMounted(() => {
  if (typeof window !== 'undefined' && (window as any).__IS_LAYOUT_APP__) {
    const updateActiveMenu = (path: string) => {
      // 从子应用的路由路径中提取子应用内部路径
      // path 可能是完整路径（如 /admin/org/departments）或子应用内部路径（如 /org/departments）
      let subAppPath = normalizeActivePath(path);
      if (!subAppPath) return;

      // 关键：在 layout-app 环境下，路径应该直接是子应用路由（不包含应用前缀）
      // 但如果 path 包含应用前缀，需要去掉前缀
      const isUsingLayoutApp = typeof window !== 'undefined' && !!(window as any).__USE_LAYOUT_APP__;
      const app = currentApp.value;

      if (app && subAppPath.startsWith(`/${app}`)) {
        // 如果路径包含应用前缀，去掉前缀
        subAppPath = subAppPath.slice(`/${app}`.length) || '/';
      }

      subAppPath = normalizeActivePath(subAppPath);
      if (!subAppPath) return;

      // 关键优化：如果目标路径与当前激活菜单相同，不需要更新，避免闪烁
      if (activeMenu.value === subAppPath) {
        return;
      }

      // 更新菜单激活状态
      activeMenu.value = subAppPath;

      // 关键：确保父级展开（Element Plus 有时不会因 defaultOpeneds 的变化自动展开）
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          syncMenuOpenState();
        });
      });

    };

    // 关键：在组件挂载时，主动检查当前路由并设置菜单激活状态
    // 这解决了刷新浏览器后菜单激活状态丢失的问题
    const initActiveMenu = () => {
      const app = currentApp.value;
      if (!app) {
        return;
      }

      // 如果是主应用，确保工作台菜单展开
      if (app === 'main') {
        nextTick(() => {
          syncMenuOpenState();
        });
      }

      // 优先从 window.location 获取路径（更准确，不受路由初始化时机影响）
      // 关键：对于重定向的情况，window.location.pathname 可能已经更新，但 route.path 可能还没有
      const locationPath = normalizeActivePath(window.location.pathname);
      if (!locationPath) return;
      let subAppPath = locationPath;

      // 关键：检查是否是主应用路由（使用统一的 isMainApp 函数判断）
      // 如果是主应用路由，需要根据当前应用统一处理路径格式
      // 关键：优先使用 locationPath 判断，因为它可能已经包含重定向后的路径
      const isStandalone = typeof window !== 'undefined' && !(window as any).__POWERED_BY_QIANKUN__;
      const isMainAppFn = getIsMainAppFn();
      // 关键：同时检查 locationPath 和 route.path，优先使用 locationPath（重定向后可能已更新）
      const currentRoutePath = route.path || locationPath;
      const isMainAppRoute = isMainAppFn ? isMainAppFn(currentRoutePath, locationPath, isStandalone) : false;

      // 关键：如果是主应用路由，需要根据当前应用统一处理路径格式
      // 在 system-app 环境下，菜单项的 index 包含 /system 前缀，所以路径也需要添加前缀以保持一致性
      if (isMainAppRoute) {
        let normalizedPath = normalizeActivePath(locationPath);
        // 特殊处理：主应用的首页路由（/workbench/overview）不作为菜单激活项
        if (normalizedPath === '/workbench/overview' || normalizedPath === '/overview') {
          // 首页路由，清除菜单激活状态，确保没有菜单项被激活
          if (activeMenu.value) {
            activeMenu.value = '';
          }
          // 确保工作台菜单展开
          nextTick(() => {
            syncMenuOpenState();
          });
          return;
        }
        
        // 特殊处理：根路径 `/` 没有对应的菜单项
        // 但是，如果访问根路径时，路由会重定向到首页（如 /workbench/overview）
        // 此时 locationPath 应该已经是重定向后的路径
        if (normalizedPath === '/' || normalizedPath === '') {
          // 如果 locationPath 是根路径，检查 route.path 是否是重定向后的路径
          const routePath = normalizeActivePath(route.path || '');
          if (routePath && routePath !== '/' && routePath !== '') {
            // 如果重定向到首页，不激活菜单项
            if (routePath === '/workbench/overview' || routePath === '/overview') {
              return;
            }
            // route.path 不是根路径，说明已经重定向，使用 route.path
            normalizedPath = routePath;
          } else {
            // 都是根路径，不尝试激活菜单项，直接返回
            return;
          }
        }
        
        if (normalizedPath && normalizedPath !== '/' && normalizedPath !== '') {
          if (app === 'system' && normalizedPath && !normalizedPath.startsWith('/system')) {
            // 如果当前应用是 system，菜单项的 index 包含 /system 前缀，所以路径也需要添加前缀
            normalizedPath = normalizeActivePath(`/system${normalizedPath}`);
          }
          if (normalizedPath) {
            updateActiveMenu(normalizedPath);
          }
        }
        return;
      }

      // 检查是否在子域名环境下（生产环境）
      const env = getCurrentEnvironment();
      const isProductionOrTestSubdomainLocal = env === 'production' || env === 'test';

      if (isProductionOrTestSubdomainLocal) {
        // 子域名环境下，路径直接是子应用路由（如 / 或 /xxx）
        // 如果路径是 /finance/xxx，需要去掉 /finance 前缀
        if (locationPath.startsWith(`/${app}`)) {
          const subAppPathRaw = locationPath.slice(`/${app}`.length) || '/';
          // 特殊处理：子应用根路径（如 `/admin` -> `/`）没有对应的菜单项，直接返回
          if (subAppPathRaw === '/' || subAppPathRaw === '') {
            return;
          }
          subAppPath = subAppPathRaw;
        } else {
          // 否则直接使用当前路径
          // 特殊处理：根路径 `/` 没有对应的菜单项，直接返回
          if (locationPath === '/' || locationPath === '') {
            return;
          }
          subAppPath = locationPath;
        }
      } else {
        // 路径前缀环境下（如 /finance/xxx）
        if (locationPath.startsWith(`/${app}`)) {
          const subAppPathRaw = locationPath.slice(`/${app}`.length) || '/';
          // 特殊处理：子应用根路径（如 `/admin` -> `/`）没有对应的菜单项，直接返回
          if (subAppPathRaw === '/' || subAppPathRaw === '') {
            return;
          }
          subAppPath = subAppPathRaw;
        } else {
          // 如果没有应用前缀，尝试从 route.path 获取
          const currentPath = route.path;
          if (currentPath.startsWith(`/${app}`)) {
            const subAppPathRaw = currentPath.slice(`/${app}`.length) || '/';
            // 特殊处理：子应用根路径（如 `/admin` -> `/`）没有对应的菜单项，直接返回
            if (subAppPathRaw === '/' || subAppPathRaw === '') {
              return;
            }
            subAppPath = subAppPathRaw;
          } else {
            // 其他情况：可能是子应用根路径（如 `/admin`、`/logistics` 等）
            // 这些路径是占位路由，没有对应的菜单项
            const subAppRootPaths = ['/admin', '/logistics', '/engineering', '/quality', '/production', '/finance', '/operations', '/dashboard', '/personnel', '/monitor'];
            if (subAppRootPaths.includes(currentPath) || subAppRootPaths.includes(locationPath)) {
              return;
            }
            subAppPath = currentPath;
          }
        }
      }

      // 确保路径以 / 开头
      if (!subAppPath || !subAppPath.startsWith('/')) {
        subAppPath = subAppPath ? `/${subAppPath}` : '/';
      }

      const normalizedSubAppPath = normalizeActivePath(subAppPath);
      if (normalizedSubAppPath) {
        updateActiveMenu(normalizedSubAppPath);
      }
    };

    // 立即初始化一次（处理刷新浏览器的情况）
    initActiveMenu();

    // 关键：对于主应用，立即再次检查路由（处理重定向的情况）
    // 使用 nextTick 确保在 Vue 应用完全挂载后再检查
    import('vue').then(({ nextTick }) => {
      nextTick(() => {
        // 立即检查一次，处理路由重定向的情况
        initActiveMenu();
        // 关键：对于主应用路由重定向，需要立即再次检查（因为重定向是同步的）
        // 检查是否是主应用，如果是，立即再次检查路由
        const app = currentApp.value;
        if (app === 'main') {
          // 主应用：立即再次检查，确保重定向后的路由被正确激活
          nextTick(() => {
            initActiveMenu();
          });
        }
        // 再次检查，确保路由已初始化（延迟较短，用于子应用）
        setTimeout(() => {
          initActiveMenu();
        }, 50);
        // 再延迟一次，确保子应用路由完全初始化（仅用于子应用）
        setTimeout(() => {
          initActiveMenu();
        }, 200);
      });
    });

    const handleSubAppRouteChange = ((event: CustomEvent) => {
      const detail = event.detail;
      if (!detail || typeof detail !== 'object' || !detail.path) {
        return;
      }

      // 使用统一的更新函数
      updateActiveMenu(detail.path);
      // eslint-disable-next-line no-undef
    }) as EventListener;

    window.addEventListener('subapp:route-change', handleSubAppRouteChange);

    // 在组件卸载时移除监听器
    onUnmounted(() => {
      window.removeEventListener('subapp:route-change', handleSubAppRouteChange);
    });
  }
});

const isExternalLink = (value: string) => /^(https?:|mailto:|tel:)/.test(value);

const linkHandler = (index: string) => {
  if (!index) return false;

  if (isExternalLink(index)) {
    window.open(index, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
};

const handleMenuSelect = (index: string) => {
    // 动态菜单跳转处理
    if (!index) return;

    if (!currentApp.value) {
      throw new Error('动态菜单未找到所属应用');
    }

    // 如果点击的是外链，直接打开新窗口
    if (linkHandler(index)) {
      return;
    }

    // 关键：检查 index 是否为分组节点（只有 children 没有实际路由的节点）
    // 分组节点的 index 通常是虚拟路径（如 "access-config"），在路由表中不存在
    // 判断方法：在当前菜单树中查找匹配的菜单项，如果它有 children，说明是分组节点，不应该导航
    const absolutePath = index.startsWith('/') ? index : `/${index}`;

    // 递归查找菜单项
    const findMenuItem = (items: typeof currentMenuItems.value, targetIndex: string): typeof items[0] | null => {
      for (const item of items) {
        // 检查 index 是否匹配（支持带/和不带/的格式）
        if (item.index === targetIndex || item.index === absolutePath) {
          return item;
        }
        // 递归检查子菜单
        if (item.children && item.children.length > 0) {
          const found = findMenuItem(item.children, targetIndex);
          if (found) return found;
        }
      }
      return null;
    };

    const matchedItem = findMenuItem(currentMenuItems.value, index);

    // 如果找到的菜单项有 children，需要判断是否是分组节点
    // 分组节点的 index 通常是虚拟路径（如 "access-config"），在路由表中不存在
    // 但如果菜单项的 index 是真实路由路径（以 / 开头），即使有 children 也应该允许导航
    // 或者，如果菜单项的 index 和它的第一个子菜单的 index 相同，说明这个菜单项本身就是一个可导航的路由
    if (matchedItem && matchedItem.children && matchedItem.children.length > 0) {
      // 特殊处理：主应用的 /workbench 是分组节点，不应该导航
      if (currentApp.value === 'main' && (absolutePath === '/workbench' || index === '/workbench')) {
        if (import.meta.env.DEV) {
          console.info('[dynamic-menu] 主应用工作台分组节点，跳过导航:', index);
        }
        return;
      }
      
      // 检查是否是真实路由路径（以 / 开头）
      const isRealRoute = matchedItem.index && matchedItem.index.startsWith('/');
      // 检查菜单项的 index 是否和第一个子菜单的 index 相同
      const firstChild = matchedItem.children[0];
      const isSameAsFirstChild = firstChild && matchedItem.index === firstChild.index;
      
      // 如果是真实路由路径，或者和第一个子菜单相同，允许导航
      if (isRealRoute || isSameAsFirstChild) {
        if (import.meta.env.DEV) {
          console.info('[dynamic-menu] 菜单项有 children 但允许导航（真实路由路径）:', index, matchedItem);
        }
        // 继续执行导航逻辑，不返回
      } else {
        // 否则是分组节点，跳过导航
        if (import.meta.env.DEV) {
          console.info('[dynamic-menu] 跳过分组节点导航:', index, matchedItem);
        }
        return;
      }
    }

    // 关键：统一处理路由跳转路径
    // 菜单项的 index 可能包含应用前缀（如 /system/inventory/check），但路由配置使用的是相对路径（如 inventory/check）
    // 需要根据当前应用和路由配置，统一处理路径格式
    const app = currentApp.value;
    let routePath = absolutePath;

    // 检查是否在 qiankun 模式下
    const isQiankun = typeof window !== 'undefined' && (window as any).__POWERED_BY_QIANKUN__;
    
    // 特殊处理：主应用的菜单项不应该包含 /main 前缀
    // 如果菜单项的 index 包含 /main 前缀，需要去掉
    if (app === 'main' && routePath.startsWith('/main')) {
      routePath = routePath.slice('/main'.length) || '/';
    }
    
    // 如果当前应用是 system，菜单项的 index 包含 /system 前缀
    // 在 qiankun 模式下，系统应用的路由器使用 createMemoryHistory()，路径应该是相对于子应用的
    // 所以需要去掉 /system 前缀，得到子应用内部路径（如 /data/files/list）
    // 在独立运行模式下，路径应该保持 /system 前缀
    if (app === 'system' && routePath.startsWith('/system')) {
      if (isQiankun) {
        // qiankun 模式：去掉 /system 前缀，使用子应用内部路径
        routePath = routePath.slice('/system'.length) || '/';
      }
      // 独立运行模式：保持 /system 前缀，不做处理
    }

    // 关键：立即更新菜单激活状态
    // 注意：Element Plus 的菜单组件使用 default-active 来匹配菜单项的 index
    // 如果菜单项的 index 包含 /main 前缀（如 /main/workbench/todo），activeMenu 也需要使用相同的格式
    // 这样才能正确匹配并激活菜单项
    // 但是，路由跳转时应该使用处理后的 routePath（不包含 /main 前缀）
    let activeMenuPath = absolutePath;
    if (app === 'main' && activeMenuPath.startsWith('/main')) {
      // 对于主应用，如果菜单项的 index 包含 /main 前缀，activeMenu 也应该使用包含前缀的路径
      // 这样 Element Plus 才能正确匹配菜单项
      // 但是，我们需要检查菜单项的实际 index 格式
      if (matchedItem && matchedItem.index && matchedItem.index.startsWith('/main')) {
        // 菜单项的 index 包含 /main 前缀，使用包含前缀的路径
        activeMenuPath = matchedItem.index;
      } else {
        // 菜单项的 index 不包含 /main 前缀，使用处理后的路径
        activeMenuPath = normalizeActivePath(routePath);
      }
    } else {
      // 其他应用，使用处理后的路径
      activeMenuPath = normalizeActivePath(routePath);
    }
    
    activeMenu.value = normalizeActivePath(activeMenuPath);

    // 确保父级菜单展开（同步执行，不等待异步）
    syncMenuOpenState();

    
    router.push(routePath).catch((err: unknown) => {
      // 路由跳转失败（通常是路由未匹配），记录错误但不抛出
      // 这通常发生在点击分组节点时，虽然我们已经过滤了，但作为兜底处理
      logger.error('[dynamic-menu] 路由跳转失败:', {
        absolutePath,
        routePath,
        error: err,
        currentApp: app,
        matchedItem,
        menuItems: currentMenuItems.value,
      });
      // 如果是主应用路由跳转失败，尝试使用 router.resolve 检查路由是否存在
      if (app === 'main') {
        try {
          const resolved = router.resolve(routePath);
          console.warn('[dynamic-menu] 路由解析结果:', {
            routePath,
            resolved,
            matched: resolved.matched,
            matchedLength: resolved.matched.length,
          });
          if (resolved && resolved.matched.length === 0) {
            console.warn('[dynamic-menu] 主应用路由未匹配，可能路由配置有问题:', routePath);
          }
        } catch (resolveErr) {
          logger.error('[dynamic-menu] 路由解析异常:', resolveErr);
        }
      }
    });
};
</script>

<style lang="scss" scoped>
.sidebar__menu {
  // 只保留基础布局样式，菜单风格样式已移至全局样式文件
  // 关键：作为 sidebar 的剩余高度区域，需要能在 flex 容器中占满并可滚动
  // flex 场景下必须配合 min-height: 0，否则会按内容高度收缩，表现为“菜单没占满剩余高度”
  flex: 1 1 0;
  min-height: 0;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
