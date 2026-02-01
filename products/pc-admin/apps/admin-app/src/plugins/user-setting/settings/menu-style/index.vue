<template>
  <SectionTitle :title="t('setting.menu.title') || 'Menu Style'" />
  <div class="setting-box-wrap">
    <div
      class="setting-item"
      v-for="(item, index) in configOptions.menuStyleList"
      :key="item.theme"
      @click="handleMenuStyleClick(item.theme)"
    >
      <div
        class="box"
        :class="{ 'is-active': isActiveStyle(item.theme) }"
        :style="{
          cursor: isItemDisabled(item.theme) ? 'no-drop' : 'pointer',
          opacity: isItemDisabled(item.theme) ? 0.5 : 1,
        }"
      >
        <img
          v-if="item?.img"
          :src="item.img"
          alt=""
          @error="handleImageError($event)"
        />
      </div>
      <p class="name">{{ t(`setting.menu.list[${index}]`) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig, useSettingsHandlers, useSettingsState } from '../../composables';
import { MenuTypeEnum, MenuThemeEnum } from '../../config/enums';
import '../../settings/menu-style/styles/index.scss';

const { t } = useI18n();
const { configOptions } = useSettingsConfig();
const { menuStyleHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();

// 判断某个菜单风格是否被禁用
const isItemDisabled = (theme: MenuThemeEnum) => {
  if (!settingsState) return true;
  
  // 顶部菜单或双菜单时，所有风格都禁用
  if (
    settingsState.menuType?.value === MenuTypeEnum.TOP ||
    settingsState.menuType?.value === MenuTypeEnum.DUAL_MENU
  ) {
    return true;
  }
  
  // 暗色主题下，只禁用 DESIGN 和 LIGHT 风格，保留 DARK 风格可用
  if (settingsState.isDark?.value === true) {
    return theme !== MenuThemeEnum.DARK;
  }
  
  return false;
};

// 判断某个菜单风格是否为激活状态
const isActiveStyle = (theme: MenuThemeEnum) => {
  if (!settingsState) return false;
  
  // 深色主题下，DARK 风格始终为激活状态
  if (settingsState.isDark?.value === true) {
    return theme === MenuThemeEnum.DARK;
  }
  
  // 浅色主题下，根据 menuThemeType 判断
  return theme === (settingsState?.menuThemeType?.value ?? MenuThemeEnum.DESIGN);
};

function handleMenuStyleClick(theme: MenuThemeEnum) {
  if (isItemDisabled(theme) || !theme || !menuStyleHandlers) {
    return;
  }
  menuStyleHandlers.switchStyle(theme);
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.warn('Image failed to load:', img.src);
  // 可以在这里添加占位符或错误处理逻辑
};
</script>

