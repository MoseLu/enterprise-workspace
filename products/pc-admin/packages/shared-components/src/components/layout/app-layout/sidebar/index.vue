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
    <DynamicMenu :is-collapse="isCollapse ?? undefined" :search-keyword="searchKeyword" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LayoutSidebar'
});

import DynamicMenu from '../dynamic-menu/index.vue';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsState, useSettingsConfig } from '../../../others/btc-user-setting/composables';
import { MenuThemeEnum } from '../../../others/btc-user-setting/config/enums';

const { t } = useI18n();
const { menuThemeType, isDark } = useSettingsState();
// menuStyleList 暂时未使用，保留用于未来扩展
void useSettingsConfig();

// 搜索关键词
const searchKeyword = ref('');

// 判断是否为深色菜单风格（展示层逻辑）
const isDarkMenuStyle = computed(() => {
  return isDark?.value === true || menuThemeType?.value === MenuThemeEnum.DARK;
});

interface Props {
  isCollapse?: boolean;
  drawerVisible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isCollapse: false,
  drawerVisible: false,
});

const { isCollapse } = props;

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
  // 关键：允许子元素（菜单）在 flex 中正确计算剩余高度
  min-height: 0;
  // 关键：CSS 优化，减少菜单重绘时的浏览器回流
  contain: layout paint; // 浏览器优化：仅重绘菜单自身，不影响全局
  will-change: auto; // 告诉浏览器无需提前优化，避免过度渲染

  // 搜索框基础样式
  &__search {
    padding: 6px 10px;
    border-bottom: 1px solid var(--el-border-color-extra-light); // 与侧边栏右侧边框保持一致
    height: 39px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background-color: transparent;
    flex-shrink: 0;
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

