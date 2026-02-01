<template>
  <div class="box-style-settings">
    <SectionTitle :title="t('setting.box.title') || 'Box Style'" :style="{ marginTop: '40px' }" />
    <div class="box-style">
      <div
        v-for="option in boxStyleOptions"
        :key="option?.value"
        class="button"
        :class="{ 'is-active': isActive(option?.type) }"
        @click="handleBoxModeClick(option?.type)"
      >
        {{ option?.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// computed 未使用，已移除导入
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig, useSettingsHandlers, useSettingsState } from '../../composables';
import { BoxStyleType } from '../../config/enums';
import '../../settings/box-style/styles/index.scss';

const { t } = useI18n();
const { boxStyleOptions } = useSettingsConfig();
const { boxStyleHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();

// 判断当前选项是否激活
const isActive = (type: BoxStyleType | undefined) => {
  if (!type || !settingsState?.boxBorderMode) return false;
  return type === BoxStyleType.BORDER ? settingsState.boxBorderMode.value : !settingsState.boxBorderMode.value;
};

// 处理盒子模式点击
const handleBoxModeClick = (type: BoxStyleType | undefined) => {
  if (type && boxStyleHandlers?.setBoxMode) {
    boxStyleHandlers.setBoxMode(type);
  }
};
</script>

