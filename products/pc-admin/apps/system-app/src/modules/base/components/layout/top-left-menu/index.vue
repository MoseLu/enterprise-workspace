<template>
  <div class="top-left-menu">
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      :unique-opened="uniqueOpened"
      class="top-left-menu__menu"
      @select="handleMenuSelect"
    >
      <MenuRenderer
        :menu-items="firstLevelMenuItems"
        :search-keyword="''"
        :is-collapse="false"
      />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopLeftMenu',
});

import { useI18n } from '@btc/shared-core';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { useCurrentApp } from '@/composables/useCurrentApp';
import { getMenusForApp } from '@/store/menuRegistry';
import MenuRenderer from '../menu-renderer/index.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();
const { uniqueOpened } = useSettingsState();

const activeMenu = ref(route.path);

// 完整的菜单项（用于查找子菜单）
const allMenuItemsWithChildren = computed(() => {
  return getMenusForApp(currentApp.value);
});

// 只显示一级菜单（混合菜单的顶部只显示一级，移除子菜单信息以便 MenuRenderer 只渲染一级）
const firstLevelMenuItems = computed(() => {
  return allMenuItemsWithChildren.value.map(item => ({
    ...item,
    children: undefined, // 移除子菜单，只显示一级
  }));
});

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true }
);

// 递归查找第一个可见的叶子节点菜单
const findFirstLeafMenu = (items: typeof allMenuItemsWithChildren.value): typeof allMenuItemsWithChildren.value[0] | null => {
  for (const item of items) {
    // 跳过隐藏的菜单项
    if (item.hidden) {
      continue;
    }
    // 如果有子菜单，递归查找
    if (item.children && item.children.length > 0) {
      const found = findFirstLeafMenu(item.children);
      if (found) {
        return found;
      }
    } else {
      // 没有子菜单，返回当前项
      return item;
    }
  }
  return null;
};

const handleMenuSelect = (index: string) => {
  // 查找对应的一级菜单项（使用完整的菜单数据，包含 children）
  const menuItem = allMenuItemsWithChildren.value.find(item => item.index === index);

  // 立即通知 TopLeftSidebar 更新选中的一级菜单（通过事件总线）
  const emitter = (window as any).__APP_EMITTER__;
  if (emitter && index) {
    emitter.emit('top-left-menu.select', { firstLevelIndex: index });
  }

  // 如果找到菜单项且有子菜单，跳转到第一个子菜单（参考 art-design-pro 的实现）
  if (menuItem && menuItem.children && menuItem.children.length > 0) {
    const firstChild = findFirstLeafMenu(menuItem.children);
    if (firstChild && firstChild.index) {
      const absolutePath = firstChild.index.startsWith('/') ? firstChild.index : `/${firstChild.index}`;
      router.push(absolutePath).catch((err) => {
        if (import.meta.env.DEV) {
          console.warn('[top-left-menu] 跳转到第一个子菜单失败:', absolutePath, err);
        }
      });
      return;
    }
  }

  // 否则直接跳转到当前路径
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath).catch((err) => {
    if (import.meta.env.DEV) {
      console.warn('[top-left-menu] 跳转失败:', absolutePath, err);
    }
  });
};
</script>

<style lang="scss" scoped>
.top-left-menu {
  height: 47px; // 与顶栏高度一致
  background-color: transparent;
  overflow: hidden;
  flex: 1; // 占据剩余空间
  margin-left: 10px; // 与搜索框的间距

  &__menu {
    border: none;
    height: 100%;
    background-color: transparent;

    :deep(.el-menu-item) {
      height: 47px;
      line-height: 47px;
      font-size: 14px;
      color: var(--el-text-color-primary);
      border-bottom: 2px solid transparent;

      &:hover {
        background-color: var(--el-fill-color-light);
        border-bottom-color: var(--el-color-primary);
      }

      &.is-active {
        color: var(--el-color-primary);
        border-bottom-color: var(--el-color-primary);
        background-color: transparent;
      }
    }
  }
}
</style>

