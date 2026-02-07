<template>
  <div class="sidebar" :class="{ 'is-dark-menu': isDarkMenuStyle }">
    <!-- 搜索框 -->
    <div 
      v-if="!isCollapse" 
      class="sidebar__search"
    >
      <el-input
        v-model="searchKeyword"
        :placeholder="t('common.search_menu')"
        clearable
        @focus="handleSearchFocus"
      >
        <template #prefix>
          <btc-svg name="search" :size="16" />
        </template>
      </el-input>
    </div>

    <!-- 动态菜单 -->
    <DynamicMenu :is-collapse="isCollapse" :search-keyword="searchKeyword" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutSidebar'
});

import DynamicMenu from '../dynamic-menu/index.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsState } from '@/plugins/user-setting/composables/useSettingsState';
import { useSettingsConfig } from '@/plugins/user-setting/composables/useSettingsConfig';
import { MenuThemeEnum } from '@/plugins/user-setting/config/enums';

const { t } = useI18n();
const { menuThemeType, isDark } = useSettingsState();
const { menuStyleList } = useSettingsConfig();

// 搜索关键词
const searchKeyword = ref('');

// 判断是否为深色菜单风格（展示层逻辑）
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

// 获取当前菜单主题配置（类似 art-design-pro 的 getMenuTheme）
const menuThemeConfig = computed(() => {
  // 深色主题下强制使用深色菜单配置（展示层逻辑）
  if (isDark?.value === true) {
    return {
      background: 'var(--el-bg-color)',
      systemNameColor: '#BABBBD',
      rightLineColor: '#EDEEF0',
    };
  }
  
  // 浅色主题下，根据用户选择的菜单风格类型返回对应的配置
  const theme = menuThemeType?.value || MenuThemeEnum.DESIGN;
  const themeConfig = menuStyleList.value.find(item => item.theme === theme);
  
  if (themeConfig) {
    return {
      background: themeConfig.background,
      systemNameColor: themeConfig.systemNameColor,
      rightLineColor: themeConfig.rightLineColor,
    };
  }
  
  // 默认配置
  return {
    background: '#FFFFFF',
    systemNameColor: 'var(--el-text-color-primary)',
    rightLineColor: '#EDEEF0',
  };
});

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
}

const _props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
});

// 搜索框聚焦时的处理（现在不需要做任何事，因为搜索框只在非折叠时显示）
const handleSearchFocus = () => {
  // 不再需要展开侧边栏逻辑，因为搜索框只在非折叠时显示
};
</script>

<style lang="scss" scoped>
.sidebar {
  // 只保留基础布局样式，菜单风格样式已移至全局样式文件
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;

  // 搜索框基础样式
  &__search {
    padding: 6px 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light); // 与侧边栏右侧边框保持一致
    height: 39px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background-color: transparent;
    // 确保边框不会因为子元素而变粗
    position: relative;

    :deep(.el-input__wrapper) {
      background-color: var(--el-fill-color-light);
      // 移除 Element Plus 默认的 inset box-shadow，避免视觉上叠加
      box-shadow: none !important;
      height: 27px;
      padding: 0 12px;
      border-radius: 6px;
      // 确保没有额外的边框
      border: none !important;

      .el-input__inner {
        font-size: 13px;
      }
    }

    :deep(.el-input__prefix) {
      display: flex;
      align-items: center;
    }
  }
  
  // 深色菜单风格下的搜索框样式由全局样式 menu-themes.scss 控制
  // 这里不再定义，避免 scoped 样式覆盖全局样式
}
</style>

