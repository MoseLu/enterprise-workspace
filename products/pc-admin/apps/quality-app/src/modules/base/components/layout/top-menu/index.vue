<template>
  <div class="top-menu">
    <el-menu
      mode="horizontal"
      :default-active="activeMenu"
      :unique-opened="uniqueOpened"
      class="top-menu__menu"
      @select="handleMenuSelect"
    >
      <MenuRenderer
        :menu-items="currentMenuItems"
        :search-keyword="''"
        :is-collapse="false"
      />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutTopMenu',
});

import { useI18n } from '@btc/shared-core';
import { useSettingsState } from '@/plugins/user-setting/composables';
import { useCurrentApp } from '@/composables/useCurrentApp';
import { getMenusForApp } from '@/store/menuRegistry';
import MenuRenderer from '../menu-renderer/index.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { currentApp } = useCurrentApp();
const { uniqueOpened } = useSettingsState();

const activeMenu = ref(route.path);

// 获取当前应用的菜单项（从 menuRegistry 获取）
const currentMenuItems = computed(() => {
  return getMenusForApp(currentApp.value);
});

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true }
);

const handleMenuSelect = (index: string) => {
  if (import.meta.env.DEV) {
    console.info('[main-app] top-menu select', { index, currentApp: currentApp.value });
  }
  const absolutePath = index.startsWith('/') ? index : `/${index}`;
  router.push(absolutePath);
};
</script>

<style lang="scss" scoped>
.top-menu {
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

    :deep(.el-sub-menu) {
      .el-sub-menu__title {
        height: 47px;
        line-height: 47px;
        font-size: 14px;
        color: var(--el-text-color-primary);
        border-bottom: 2px solid transparent;

        &:hover {
          background-color: var(--el-fill-color-light);
          border-bottom-color: var(--el-color-primary);
        }
      }

      &.is-active {
        .el-sub-menu__title {
          color: var(--el-color-primary);
          border-bottom-color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>

