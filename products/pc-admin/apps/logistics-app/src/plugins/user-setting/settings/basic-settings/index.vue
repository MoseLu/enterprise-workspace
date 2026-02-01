<template>
  <div class="basic-settings">
    <SectionTitle :title="t('setting.basics.title') || 'Basic Settings'" :style="{ marginTop: '40px' }" />
    <div class="basic-box">
      <SettingItem
        v-for="(config, index) in basicSettingsConfig"
        :key="config?.key || `basic-setting-${index}`"
        :config="config"
        :model-value="getSettingValueComputed(config?.key).value"
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

// 创建设置值映射（直接使用 ref 对象，与 art-design-pro 保持一致）
const settingValueMap = {
  showWorkTab,
  uniqueOpened,
  showGlobalSearch,
  showCrumbs,
  colorWeak,
  menuOpenWidth,
  tabStyle,
  pageTransition,
  customRadius,
};

// 预先创建所有设置项的 computed，确保响应式追踪
const settingValuesComputed = {
  showWorkTab: computed(() => settingValueMap.showWorkTab.value),
  uniqueOpened: computed(() => settingValueMap.uniqueOpened.value),
  showGlobalSearch: computed(() => settingValueMap.showGlobalSearch.value),
  showCrumbs: computed(() => settingValueMap.showCrumbs.value),
  colorWeak: computed(() => settingValueMap.colorWeak.value),
  menuOpenWidth: computed(() => settingValueMap.menuOpenWidth.value),
  tabStyle: computed(() => settingValueMap.tabStyle.value),
  pageTransition: computed(() => settingValueMap.pageTransition.value),
  customRadius: computed(() => settingValueMap.customRadius.value),
};

// 获取设置值的方法（从预先创建的 computed 中获取）
const getSettingValueComputed = (key: string | undefined) => {
  if (!key) return computed(() => null);
  const computedRef = settingValuesComputed[key as keyof typeof settingValuesComputed];
  return computedRef ?? computed(() => null);
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

