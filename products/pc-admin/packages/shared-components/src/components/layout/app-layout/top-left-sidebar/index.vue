<template>
  <div class="top-left-sidebar">
    <div class="top-left-sidebar__search">
      <el-input
        v-model="searchKeyword"
        :placeholder="t('common.search_menu')"
        clearable
      >
        <template #prefix>
          <btc-svg name="search" :size="16" />
        </template>
      </el-input>
    </div>

    <el-menu
      :key="menuKey"
      ref="menuRef"
      :default-active="activeMenu"
      :default-openeds="defaultOpeneds"
      :unique-opened="uniqueOpened"
      class="top-left-sidebar__menu"
      @select="handleMenuSelect"
    >
      <MenuRenderer
        :menu-items="currentSubMenuItems"
        :search-keyword="searchKeyword"
        :is-collapse="false"
      />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopLeftSidebar',
});

import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@btc/shared-core';
import { useSettingsState } from '../../../others/btc-user-setting/composables';
import { useCurrentApp } from '../../../../composables/useCurrentApp';
import { getMenusForApp } from '../../../../store/menuRegistry';
import MenuRenderer from '../menu-renderer/index.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();
const { uniqueOpened } = useSettingsState();

const activeMenu = ref(route.path);
const searchKeyword = ref('');
const menuRef = ref();
const menuKey = ref(0);

// 获取当前应用的菜单项（从 menuRegistry 获取）
const allMenuItems = computed(() => {
  return getMenusForApp(currentApp.value);
});

// 根据当前路由找到对应的一级菜单，显示其子菜单
const currentSubMenuItems = computed(() => {
  const path = route.path;
  
  // 查找匹配的一级菜单
  for (const item of allMenuItems.value) {
    if (item.index && path.startsWith(item.index)) {
      return item.children || [];
    }
  }
  
  // 如果没有匹配的，返回第一个有子菜单的项的子菜单
  const firstWithChildren = allMenuItems.value.find(item => item.children && item.children.length > 0);
  return firstWithChildren?.children || [];
});

const defaultOpeneds = computed(() => {
  return currentSubMenuItems.value
    .filter(item => item.children && item.children.length > 0)
    .map(item => item.index)
    .filter(Boolean) as string[];
});

watch(
  () => searchKeyword.value,
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

const handleMenuSelect = (index: string) => {
  if (import.meta.env.DEV) {
    console.info('[main-app] top-left-sidebar select', { index, currentApp: currentApp.value });
  }
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.top-left-sidebar {
  width: 255px;
  height: 100%;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-extra-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__search {
    padding: 6px 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light);
    height: 39px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      box-shadow: none;
      height: 27px;
      padding: 0 12px;
      border-radius: 6px;

      .el-input__inner {
        font-size: 13px;
      }
    }
  }

  &__menu {
    flex: 1;
    border: none;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: var(--el-bg-color) !important;

    :deep(.el-sub-menu__title) {
      height: 50px;
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    :deep(.el-menu-item) {
      height: 50px;
      font-size: 14px;
      color: var(--el-text-color-primary);

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-active {
        background-color: var(--el-color-primary) !important;
        color: #fff !important;
      }
    }

    :deep(.el-icon) {
      margin-right: 16px;
    }
  }
}
</style>

