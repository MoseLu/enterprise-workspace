<template>
  <div class="button-style-settings">
    <SectionTitle :title="t('setting.buttonStyle.title') || 'Button Style'" :style="{ marginTop: '40px' }" />
    <div class="setting-box-wrap">
      <button
        v-for="item in buttonStyleOptions"
        :key="item.value"
        class="setting-item"
        :class="{ 'is-active': item.value === currentButtonStyle }"
        type="button"
        :aria-pressed="item.value === currentButtonStyle"
        @click="handleButtonStyleClick(item.value)"
      >
        <div
          class="box btn-style-preview"
          :class="[
            `btn-style-${item.value}`,
            { 'is-active': item.value === currentButtonStyle }
          ]"
        >
          <div class="btn-preview__inner">
            <template v-if="item.value === 'default'">
              <span class="btn-preview primary with-text">
                <BtcSvg class="btn-icon" name="search" :size="14" />
                <span class="btn-text">{{ t('setting.buttonStyle.primary') }}</span>
              </span>
              <span class="btn-preview secondary with-text">
                <span class="btn-text">{{ t('setting.buttonStyle.secondary') }}</span>
              </span>
            </template>
            <template v-else>
              <span class="btn-preview primary icon-only">
                <BtcSvg class="btn-icon" name="search" :size="14" />
              </span>
              <span class="btn-preview secondary icon-only">
                <BtcSvg class="btn-icon" name="set" :size="14" />
              </span>
            </template>
          </div>
        </div>
        <p class="name">{{ item.label }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SectionTitle from '../../components/shared/SectionTitle.vue';
import { useI18n, type ButtonStyle } from '@btc/shared-core';
import { useSettingsHandlers, useSettingsState } from '../../composables';
import './styles/index.scss';

const { t } = useI18n();
const settingsState = useSettingsState();
const { buttonStyleHandlers } = useSettingsHandlers();

const currentButtonStyle = computed<ButtonStyle>(() => settingsState.buttonStyle?.value || 'default');

const buttonStyleOptions = computed(() => [
  {
    value: 'default' as ButtonStyle,
    label: t('setting.buttonStyle.default'),
  },
  {
    value: 'minimal' as ButtonStyle,
    label: t('setting.buttonStyle.minimal'),
  },
]);

const handleButtonStyleClick = (style: ButtonStyle) => {
  if (style === currentButtonStyle.value) return;
  buttonStyleHandlers?.setStyle(style);
};
</script>


