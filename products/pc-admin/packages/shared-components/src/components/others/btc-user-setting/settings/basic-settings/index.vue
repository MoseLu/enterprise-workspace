<template>
  <div class="basic-settings">
    <SectionTitle :title="t('setting.basics.title') || 'Basic Settings'" :style="{ marginTop: '40px' }" />
    <div class="basic-box">
      <SettingItem
        v-for="(config, index) in basicSettingsConfig"
        :key="config?.key || `basic-setting-${index}`"
        :config="config"
        :model-value="getSettingValue(config?.key)"
        @change="handleSettingChange(config?.handler, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import SettingItem from '../../components/shared/SettingItem.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig, useSettingsHandlers, useSettingsState } from '../../composables';
import '../../settings/basic-settings/styles/index.scss';

const { t } = useI18n();
const { basicSettingsConfig } = useSettingsConfig();
const { basicHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();

// 解构所有需要的 ref，确保响应式追踪
const {
  showWorkTab,
  uniqueOpened,
  showGlobalSearch,
  showCrumbs,
  colorWeak,
  menuOpenWidth,
  tabStyle,
  pageTransition,
  customRadius,
} = settingsState;

// 创建设置值映射（使用 computed 确保响应式）
const settingValues = computed(() => ({
  showWorkTab: showWorkTab.value,
  uniqueOpened: uniqueOpened.value,
  showGlobalSearch: showGlobalSearch.value,
  showCrumbs: showCrumbs.value,
  colorWeak: colorWeak.value,
  menuOpenWidth: menuOpenWidth.value,
  tabStyle: tabStyle.value,
  pageTransition: pageTransition.value,
  customRadius: customRadius.value,
}));

// 获取设置值的方法（从 computed 中获取）
const getSettingValue = (key: string | undefined) => {
  if (!key) return null;
  return settingValues.value[key as keyof typeof settingValues.value] ?? null;
};

// 统一的设置变更处理（参考 art-design-pro 的实现）
const handleSettingChange = (handlerName: string | undefined, value: any) => {
  if (!handlerName || !basicHandlers) {
    return;
  }
  const handler = (basicHandlers as any)[handlerName];
  if (typeof handler === 'function') {
      handler(value);
  } else {
    console.warn(`Handler "${handlerName}" not found in basicHandlers`);
  }
};
</script>

