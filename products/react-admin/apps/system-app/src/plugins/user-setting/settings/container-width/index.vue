<template>
  <div class="container-settings">
    <SectionTitle :title="t('setting.container.title') || 'Container Width'" :style="{ marginTop: '50px' }" />
    <div class="container-width">
      <div
        v-for="option in containerWidthOptions"
        :key="option?.value"
        class="item"
        :class="{ 'is-active': (settingsState?.containerWidth?.value ?? '') === option?.value }"
        @click="containerHandlers?.setWidth(option?.value)"
      >
        <i class="iconfont-sys" v-html="option?.icon"></i>
        <span>{{ option?.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig } from '../../composables/useSettingsConfig';
import { useSettingsHandlers } from '../../composables/useSettingsHandlers';
import { useSettingsState } from '../../composables/useSettingsState';
import '../../settings/container-width/styles/index.scss';

const { t } = useI18n();
const { containerWidthOptions } = useSettingsConfig();
const { containerHandlers } = useSettingsHandlers();
const settingsState = useSettingsState();
</script>

