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

import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSettingsState } from '../../../others/btc-user-setting/composables';
import { useCurrentApp } from '../../../../composables/useCurrentApp';
import { getMenusForApp } from '../../../../store/menuRegistry';
import MenuRenderer from '../menu-renderer/index.vue';
;


const route = useRoute();
const router = useRouter();
const { currentApp } = useCurrentApp();
const { uniqueOpened } = useSettingsState();

const activeMenu = ref(route.path);

// 获取当前应用的菜单项（从 menuRegistry 获取）
const currentMenuItems = computed(() => {
  return getMenusForApp(currentApp.value);
});

// 关键：顶部菜单模式下 Sidebar/DynamicMenu 可能不挂载，不能依赖其 onMounted 去触发“菜单注册兜底”
// 因此 TopMenu 自己也需要做一次 ensure，避免出现“布局切换为顶部/混合后顶部菜单为空”
onMounted(() => {
  let retrying = false;

  const ensureMenusForCurrentApp = () => {
    const app = currentApp.value;
    const menus = getMenusForApp(app) || [];
    if (menus.length > 0) return true;

    const registerMenusFn = (window as any).__REGISTER_MENUS_FOR_APP__;
    if (typeof registerMenusFn === 'function') {
      try {
        registerMenusFn(app);
      } catch (_e) {
        // 静默失败
      }
    }

    // 如果仍为空，做一次轻量重试（最多 3 秒）
    if (!retrying) {
      retrying = true;
      let retryCount = 0;
      const maxRetries = 30;
      const timer = window.setInterval(() => {
        retryCount++;
        const retryMenus = getMenusForApp(app) || [];
        if (retryMenus.length > 0) {
          window.clearInterval(timer);
          retrying = false;
        } else if (retryCount >= maxRetries) {
          window.clearInterval(timer);
          retrying = false;
        }
      }, 100);
    }

    return false;
  };

  ensureMenusForCurrentApp();

  // 应用切换时也做一次 ensure（例如从系统域切到财务域）
  watch(
    () => currentApp.value,
    () => {
      ensureMenusForCurrentApp();
    }
  );
});

watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
  },
  { immediate: true }
);

/**
 * 递归查找第一个可见的叶子节点菜单
 * 参考 art-design-pro 的实现，确保只跳转到有实际路由的菜单项
 * @param items 菜单项数组
 * @returns 第一个可见的叶子节点菜单项，如果没有找到则返回 null
 */
const findFirstLeafMenu = (items: any[]): any => {
  for (const child of items) {
    // 跳过隐藏的菜单项
    if (child.meta?.isHide) {
      continue;
    }
    // 如果有子菜单，递归查找
    if (child.children && child.children.length > 0) {
      const found = findFirstLeafMenu(child.children);
      if (found) {
        return found;
      }
    } else {
      // 没有子菜单，说明是叶子节点，返回它
      return child;
    }
  }
  return null;
};

const handleMenuSelect = (index: string) => {
  if (import.meta.env.DEV) {
    console.info('[main-app] top-menu select', { index, currentApp: currentApp.value });
  }
  const absolutePath = index.startsWith('/') ? index : `/${index}`;

  // 关键：参考 art-design-pro 的实现，如果点击的菜单项有子菜单，自动跳转到第一个可见的叶子节点菜单
  // 这样可以避免点击分组节点时出现 404 错误
  const findMenuItem = (items: typeof currentMenuItems.value, targetIndex: string): typeof items[0] | null => {
    for (const item of items) {
      if (item.index === targetIndex || item.index === absolutePath) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findMenuItem(item.children, targetIndex);
        if (found) return found;
      }
    }
    return null;
  };

  const matchedItem = findMenuItem(currentMenuItems.value, index);

  // 如果找到的菜单项有子菜单，说明是分组节点，跳转到第一个子菜单
  if (matchedItem && matchedItem.children && matchedItem.children.length > 0) {
    const firstChild = findFirstLeafMenu(matchedItem.children);
    if (firstChild && firstChild.index) {
      const firstChildPath = firstChild.index.startsWith('/')
        ? firstChild.index
        : `/${firstChild.index}`;
      router.push(firstChildPath).catch((err: unknown) => {
        if (import.meta.env.DEV) {
          console.warn('[top-menu] 跳转到第一个子菜单失败:', firstChildPath, err);
        }
      });
      return;
    }
  }

  // 如果没有子菜单或找不到第一个子菜单，直接跳转到当前路径
  router.push(absolutePath).catch((err: unknown) => {
    if (import.meta.env.DEV) {
      console.warn('[top-menu] 路由跳转失败:', absolutePath, err);
    }
  });
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

