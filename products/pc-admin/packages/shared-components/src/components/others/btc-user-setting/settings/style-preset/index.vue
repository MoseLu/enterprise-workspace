<template>
  <div class="style-preset-settings">
    <SectionTitle :title="t('setting.style.title') || 'Style Preset'" :style="{ marginTop: '40px' }" />
    <div class="setting-box-wrap">
      <button
        v-for="item in stylePresetList"
        :key="item.value"
        class="setting-item"
        :class="{ 'is-active': item.value === currentStylePreset }"
        type="button"
        :aria-pressed="item.value === currentStylePreset"
        @click="handleStylePresetClick(item.value)"
      >
        <div
          class="box style-preset-preview"
          :class="`style-preview--${item.value}`"
        >
          <div class="style-preview__frame">
            <div class="style-preview__header">
              <span class="style-preview__dot"></span>
              <span class="style-preview__dot"></span>
              <span class="style-preview__dot"></span>
            </div>
            <div class="style-preview__body">
              <div class="style-preview__card"></div>
              <div class="style-preview__card is-small"></div>
            </div>
            <div class="style-preview__footer">
              <span class="style-preview__chip"></span>
              <span class="style-preview__button"></span>
            </div>
          </div>
        </div>
        <p class="style-preview__label">{{ item.name }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n } from '@btc/shared-core';
import { useSettingsConfig, useSettingsHandlers, useSettingsState } from '../../composables';
import { StylePresetEnum } from '../../config/enums';
import './styles/index.scss';

const { t } = useI18n();
const settingsState = useSettingsState();
const { stylePresetHandlers } = useSettingsHandlers();
const { stylePresetList: stylePresetListConfig } = useSettingsConfig();

const currentStylePreset = computed<StylePresetEnum>(() => settingsState.stylePreset?.value || StylePresetEnum.MINIMAL);
const stylePresetList = computed(() => stylePresetListConfig.value || []);

const handleStylePresetClick = (preset: StylePresetEnum) => {
  if (preset === currentStylePreset.value) return;
  stylePresetHandlers?.setPreset(preset);
};
</script>
