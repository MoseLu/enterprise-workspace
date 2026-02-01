<template>
  <div v-if="width > 1000">
    <SectionTitle :title="t('setting.menuType.title') || 'Menu Layout'" />
    <div class="setting-box-wrap">
      <div
        class="setting-item"
        v-for="(item, index) in configOptions.menuLayoutList"
        :key="item.value"
        @click="menuLayoutHandlers?.switchLayout(item.value)"
      >
        <div class="box" :class="{ 'is-active': item.value === (settingsState?.menuType?.value ?? ''), 'mt-16': index > 2 }">
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
  </div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig } from '../../composables/useSettingsConfig';
import { useSettingsHandlers } from '../../composables/useSettingsHandlers';
import { useSettingsState } from '../../composables/useSettingsState';
import '../../settings/menu-layout/styles/index.scss';

const { width } = useWindowSize();
const { t } = useI18n();
const { configOptions } = useSettingsConfig();
const { menuLayoutHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.warn('Image failed to load:', img.src);
  // 可以在这里添加占位符或错误处理逻辑
};
</script>

