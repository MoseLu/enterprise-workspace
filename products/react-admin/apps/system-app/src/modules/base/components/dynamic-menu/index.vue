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

import { useI18n } from '@btc/shared-core';
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

const activeMenu = ref(route.path);

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

// 监听菜单注册表变化，强制重新渲染菜单
watch(
  () => menuRegistry.value[currentApp.value],
  () => {
    menuKey.value++;
  },
  { deep: true }
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

  // 无搜索时的默认展开
  switch (currentApp.value) {
    case 'main':
      return ['platform', 'org', 'access', 'navigation', 'ops', 'test-features'];
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
    menuKey.value++;
  }
);

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
    activeMenu.value = newPath;
  },
  { immediate: true }
);

const isExternalLink = (value: string) => /^(https?:|mailto:|tel:)/.test(value);

// 查找菜单项（递归查找）
const findMenuItem = (items: any[], targetIndex: string): any | null => {
  for (const item of items) {
    if (item.index === targetIndex) {
      return item;
    }
    if (item.children && item.children.length > 0) {
      const found = findMenuItem(item.children, targetIndex);
      if (found) return found;
    }
  }
  return null;
};

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

    // 查找对应的菜单项，检查是否有 externalUrl
    const menuItem = findMenuItem(currentMenuItems.value, index);

    // 如果菜单项有 externalUrl，跳转到子域名（保留主应用布局）
    if (menuItem?.externalUrl) {
      // 使用 target="_self" 在当前窗口跳转，乾坤会自动识别并挂载子应用
      window.location.href = menuItem.externalUrl;
      return;
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
