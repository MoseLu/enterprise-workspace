<template>
  <SectionTitle :title="t('setting.theme.title') || 'Theme Style'" />
  <div class="setting-box-wrap">
    <div
      class="setting-item"
      v-for="(item, index) in themeList"
      :key="item?.theme || `theme-${index}`"
      @click="themeStyleHandlers?.switchTheme(item?.theme)"
    >
      <div class="box" :class="{ 'is-active': item?.theme === (settingsState?.systemThemeMode?.value ?? '') }">
        <img
          v-if="item?.img"
          :src="item.img"
          :alt="item?.name || ''"
          @error="handleImageError($event)"
        />
      </div>
      <p class="name">{{ item?.name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig, useSettingsHandlers, useSettingsState } from '../../composables';
import '../../settings/theme-style/styles/index.scss';

const { t } = useI18n();
const { themeStyleHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();
const { themeList: themeListConfig } = useSettingsConfig();

// 安全地获取 themeList，确保返回数组并过滤掉无效项
const themeList = computed(() => {
  if (!themeListConfig || !Array.isArray(themeListConfig.value)) return [];
  // 过滤掉 undefined、null 或没有 theme 属性的项（不要求 img 必须存在）
  return themeListConfig.value.filter((item) => item && item.theme != null);
});

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.warn('Image failed to load:', img.src);
  // 可以在这里添加占位符或错误处理逻辑
};
</script>

