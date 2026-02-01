<template>
  <el-menu
    :key="menuKey"
    ref="menuRef"
    :default-active="activeMenu"
    :default-openeds="defaultOpeneds"
    :collapse="isCollapse"
    :collapse-transition="false"
    :unique-opened="uniqueOpened"
    :class="[menuThemeClass, 'sidebar__menu']"
    :text-color="menuThemeConfig.textColor"
    :active-text-color="menuThemeConfig.textActiveColor"
    @select="handleMenuSelect"
  >
    <!-- 使用配置文件动态渲染菜单 -->
    <MenuRenderer
      :menu-items="currentMenuItems"
      :search-keyword="searchKeyword"
      :is-collapse="isCollapse"
    />
  </el-menu>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutDynamicMenu',
});

import { useI18n, getMainAppId } from '@btc/shared-core';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { useSettingsConfig } from '@/plugins/user-setting/composables/useSettingsConfig';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';
import { useCurrentApp } from '@/composables/useCurrentApp';
import { getMenusForApp, getMenuRegistry } from '@/store/menuRegistry';
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
const { uniqueOpened, menuThemeType, isDark } = useSettingsState();
const { menuStyleList } = useSettingsConfig();

// 路径规范化函数
const normalizeActivePath = (value: string) => {
  const raw = (value || '/').trim();
  const noHash = raw.split('#')[0] ?? raw;
  const noQuery = noHash.split('?')[0] ?? noHash;
  const ensured = noQuery.startsWith('/') ? noQuery : `/${noQuery}`;
  return ensured === '' ? '/' : ensured;
};

// 获取初始激活菜单（优先使用 window.location.pathname，更准确）
const getInitialActiveMenu = () => {
  try {
    if (typeof window !== 'undefined' && window.location.pathname) {
      return normalizeActivePath(window.location.pathname);
    }
  } catch {
    // 静默失败
  }
  return normalizeActivePath(route.path || '/');
};

const activeMenu = ref(getInitialActiveMenu());

// 菜单 ref
const menuRef = ref();
const menuKey = ref(0); // 用于强制重新渲染菜单

// 获取菜单注册表的响应式引用
const menuRegistry = getMenuRegistry();

// 获取当前应用的菜单项（从注册表读取，响应式）
const currentMenuItems = computed(() => {
  const app = currentApp.value;
  const menus = getMenusForApp(app);
  // 触发响应式更新
  void menuRegistry.value;
  return menus;
});

// 监听菜单数据加载完成，确保激活状态正确设置
watch(
  () => currentMenuItems.value,
  (newMenus) => {
    // 只有当菜单数据存在且不为空时才更新激活状态
    if (newMenus && Array.isArray(newMenus) && newMenus.length > 0) {
      nextTick(() => {
        const locationPath = typeof window !== 'undefined' ? window.location.pathname : route.path;
        const normalizedPath = normalizeActivePath(locationPath || route.path || '/');
        if (activeMenu.value !== normalizedPath) {
          activeMenu.value = normalizedPath;
          // 强制更新菜单 key，确保 Element Plus 重新渲染并应用激活状态
          menuKey.value++;
        }
      });
    }
  },
  { immediate: true }
);

// 监听菜单注册表变化，强制重新渲染菜单
watch(
  () => menuRegistry.value[currentApp.value],
  (newMenus) => {
    // 只有当菜单数据存在且不为空时才更新
    if (newMenus && Array.isArray(newMenus) && newMenus.length > 0) {
      menuKey.value++;
      
      // 菜单数据加载完成后，确保激活状态正确
      nextTick(() => {
        const locationPath = typeof window !== 'undefined' ? window.location.pathname : route.path;
        const normalizedPath = normalizeActivePath(locationPath || route.path || '/');
        if (activeMenu.value !== normalizedPath) {
          activeMenu.value = normalizedPath;
        }
      });
    }
  },
  { deep: true, immediate: true }
);

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

const defaultOpeneds = computed(() => {
  if (props.isCollapse) return [];

  // 如果有搜索关键词，根据匹配结果精确展开菜单
  if (props.searchKeyword) {
    const keyword = props.searchKeyword.toLowerCase().trim();
    if (!keyword) {
      // 空搜索，恢复默认展开
      return currentApp.value === getMainAppId()
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

  // 无搜索时的默认展开
  // 根据当前激活的菜单项，自动展开其父级菜单
  const findParentIndexes = (items: any[], targetPath: string, parents: string[] = []): string[] => {
    for (const item of items) {
      if (item.index === targetPath) {
        return parents;
      }
      if (item.children && item.children.length > 0) {
        const found = findParentIndexes(item.children, targetPath, [...parents, item.index]);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  };

  const parentIndexes = findParentIndexes(currentMenuItems.value, activeMenu.value);
  if (parentIndexes.length > 0) {
    return parentIndexes;
  }

  // 如果没有找到父级，返回默认展开项
  switch (currentApp.value) {
    case 'main':
      // 主应用的菜单结构是 /workbench/overview 作为父级
      return ['/workbench/overview'];
    default:
      return [];
  }
});

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
      textColor: '#BABBBD',
      textActiveColor: '#FFFFFF',
    };
  }

  // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
  const theme = menuThemeType?.value || MenuThemeEnum.DESIGN;
  const themeConfig = menuStyleList.value.find(item => item.theme === theme);

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

// 监听菜单主题和系统主题变化，强制重新渲染菜单
watch(
  () => [menuThemeType?.value, isDark?.value],
  () => {
    // 立即增加 menuKey 强制重新渲染菜单
    menuKey.value++;
    // 使用 nextTick 确保 DOM 更新完成后再触发样式重新计算
    nextTick(() => {
      // 强制触发 Element Plus 菜单组件的样式重新计算
      if (menuRef.value) {
        const menuEl = menuRef.value.$el;
        if (menuEl) {
          // 强制浏览器重新计算菜单样式
          void menuEl.offsetHeight;
        }
      }
    });
  },
  { immediate: false }
);

// 监听主题切换事件，强制重新渲染菜单
// 确保在主题切换后立即更新菜单样式
const handleThemeChanged = () => {
  menuKey.value++;
  nextTick(() => {
    if (menuRef.value) {
      const menuEl = menuRef.value.$el;
      if (menuEl) {
        void menuEl.offsetHeight;
      }
    }
  });
};
window.addEventListener('theme-changed', handleThemeChanged);

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('theme-changed', handleThemeChanged);
});

// 监听搜索关键词变化，强制重新渲染菜单以应用新的 defaultOpeneds
watch(
  () => props.searchKeyword,
  () => {
    menuKey.value++;
  }
);

watch(
  () => route.path,
  (newPath) => {
    const normalizedPath = normalizeActivePath(newPath || '/');
    if (activeMenu.value !== normalizedPath) {
      activeMenu.value = normalizedPath;
    }
  },
  { immediate: true }
);

// 在组件挂载时，确保菜单激活状态正确设置
// 这解决了直接访问页面（刷新或直接输入 URL）时菜单激活状态丢失的问题
onMounted(() => {
  const initActiveMenu = () => {
    // 检查菜单数据是否已加载
    const menus = currentMenuItems.value;
    if (!menus || !Array.isArray(menus) || menus.length === 0) {
      return; // 菜单数据未加载，等待下次调用
    }
    
    const locationPath = typeof window !== 'undefined' ? window.location.pathname : route.path;
    const normalizedPath = normalizeActivePath(locationPath || route.path || '/');
    
    // 如果当前激活菜单与路径不一致，更新它
    if (activeMenu.value !== normalizedPath) {
      activeMenu.value = normalizedPath;
      // 强制更新菜单 key，确保 Element Plus 重新渲染并应用激活状态
      menuKey.value++;
    }
    
    // 确保父级菜单展开
    nextTick(() => {
      if (menuRef.value) {
        try {
          const inst: any = menuRef.value;
          if (inst && typeof inst.open === 'function') {
            // 获取需要展开的父级菜单
            const findParentIndexes = (items: any[], targetPath: string, parents: string[] = []): string[] => {
              for (const item of items) {
                if (item.index === targetPath) {
                  return parents;
                }
                if (item.children && item.children.length > 0) {
                  const found = findParentIndexes(item.children, targetPath, [...parents, item.index]);
                  if (found.length > 0) {
                    return found;
                  }
                }
              }
              return [];
            };
            
            const parentIndexes = findParentIndexes(menus, normalizedPath);
            parentIndexes.forEach(index => {
              if (index && inst.open) {
                inst.open(index);
              }
            });
          }
        } catch (error) {
          // 静默失败
        }
      }
    });
  };
  
  // 立即初始化一次（处理刷新浏览器的情况）
  initActiveMenu();
  
  // 延迟初始化（等待路由和菜单数据完全初始化）
  nextTick(() => {
    // 再次检查，确保路由已初始化
    setTimeout(() => {
      initActiveMenu();
    }, 100);
    // 再延迟一次，确保菜单数据完全加载
    setTimeout(() => {
      initActiveMenu();
    }, 500);
  });
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

    // 菜单路径已经在加载时被规范化了（manifest 中没有前缀，开发环境会自动添加，生产环境保持原样）
    // 所以这里直接使用 index，不需要再次规范化
    const absolutePath = index.startsWith('/') ? index : `/${index}`;
    router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.sidebar__menu {
  // 只保留基础布局样式，菜单风格样式已移至全局样式文件
  flex: 1;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
