<template>
  <SectionTitle :title="t('setting.menu.title') || 'Menu Style'" />
  <div class="setting-box-wrap">
    <div
      class="setting-item"
      v-for="item in configOptions.menuStyleList"
      :key="item.theme"
      @click="handleMenuStyleClick(item.theme)"
    >
      <div
        class="box"
        :class="{ 'is-active': item.theme === (settingsState?.menuThemeType?.value ?? '') }"
        :style="{
          cursor: disabled ? 'no-drop' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }"
      >
        <img
          v-if="item?.img"
          :src="item.img"
          alt=""
          @error="handleImageError($event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig, useSettingsHandlers, useSettingsState } from '../../composables';
import { MenuTypeEnum } from '../../config/enums';
import '../../settings/menu-style/styles/index.scss';

const { t } = useI18n();
const { configOptions } = useSettingsConfig();
const { menuStyleHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();

// 判断是否禁用菜单风格切换（顶部菜单或双菜单时禁用）
const disabled = computed(() => {
  if (!settingsState) return true;
  return (
    settingsState.menuType?.value === MenuTypeEnum.TOP ||
    settingsState.menuType?.value === MenuTypeEnum.DUAL_MENU ||
    settingsState.isDark?.value === true
  );
});

function handleMenuStyleClick(theme: any) {
  if (disabled.value || !theme || !menuStyleHandlers) {
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

