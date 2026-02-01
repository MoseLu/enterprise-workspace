<template>
  <div class="loading-style-settings">
    <SectionTitle :title="t('theme.loadingStyles.title') || 'Loading Style'" :style="{ marginTop: '40px' }" />
    <div class="setting-box-wrap">
      <button
        v-for="item in loadingStyleOptions"
        :key="item.value"
        class="setting-item"
        :class="{ 'is-active': item.value === currentLoadingStyle }"
        type="button"
        :aria-pressed="item.value === currentLoadingStyle"
        @click="handleLoadingStyleClick(item.value)"
      >
        <div
          class="box loading-style-preview"
          :class="`loading-style-${item.value}`"
        >
          <div class="loading-preview__inner">
            <div v-if="item.value === 'circle'" class="loading-preview-circle"></div>
            <div v-else-if="item.value === 'dots'" class="loading-preview-dots">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <g class="spinner">
                  <circle class="dot dot-1" cx="20" cy="8" r="4"/>
                  <circle class="dot dot-2" cx="32" cy="20" r="4"/>
                  <circle class="dot dot-3" cx="20" cy="32" r="4"/>
                  <circle class="dot dot-4" cx="8" cy="20" r="4"/>
                </g>
              </svg>
            </div>
            <div v-else-if="item.value === 'gradient'" class="loading-preview-gradient">
              <div class="loading-preview-gradient-circle"></div>
            </div>
            <div v-else-if="item.value === 'progress'" class="loading-preview-progress">
              <div class="progress-bar-container">
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" style="width: 65%">
                    <div class="progress-bar-shine"></div>
                  </div>
                </div>
                <div class="progress-percentage">65%</div>
              </div>
            </div>
            <div v-else-if="item.value === 'flower'" class="loading-preview-flower">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-18 -18 36 36" style="display: block; overflow: visible;">
                <g class="flower-preview-group">
                  <!-- 等比缩放：原始 r=75 → 缩放后 r=12 (比例 0.16) -->
                  <circle cx="0" cy="0" r="12" fill="none" stroke="color-mix(in srgb, var(--el-text-color-primary) 8%, transparent)" stroke-width="0.3"/>
                  <!-- 原始 r=53.03 → 缩放后 r=8.48 (比例 0.16) -->
                  <!-- 原始圆心 (37.5, -37.5) → 缩放后 (6, -6) -->
                  <!-- 彩虹色顺序：桃色→橙→黄→绿→青→蓝→紫→粉红 -->
                  <circle cx="6" cy="-6" r="8.48" class="petal petal-1" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (0, -53.03) → 缩放后 (0, -8.48) -->
                  <circle cx="0" cy="-8.48" r="8.48" class="petal petal-2" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (-37.5, -37.5) → 缩放后 (-6, -6) -->
                  <circle cx="-6" cy="-6" r="8.48" class="petal petal-3" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (-53.03, 0) → 缩放后 (-8.48, 0) -->
                  <circle cx="-8.48" cy="0" r="8.48" class="petal petal-4" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (-37.5, 37.5) → 缩放后 (-6, 6) -->
                  <circle cx="-6" cy="6" r="8.48" class="petal petal-5" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (0, 53.03) → 缩放后 (0, 8.48) -->
                  <circle cx="0" cy="8.48" r="8.48" class="petal petal-6" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (37.5, 37.5) → 缩放后 (6, 6) -->
                  <circle cx="6" cy="6" r="8.48" class="petal petal-7" fill-opacity="0.85" stroke-width="1.2"/>
                  <!-- 原始圆心 (53.03, 0) → 缩放后 (8.48, 0) -->
                  <circle cx="8.48" cy="0" r="8.48" class="petal petal-8" fill-opacity="0.85" stroke-width="1.2"/>
                </g>
              </svg>
            </div>
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
import { useI18n } from '@btc/shared-core';
import { useSettingsHandlers, useSettingsState } from '../../composables';
import './styles/index.scss';

type LoadingStyle = 'circle' | 'dots' | 'gradient' | 'progress' | 'flower';

const { t } = useI18n();
const settingsState = useSettingsState();
const { loadingStyleHandlers } = useSettingsHandlers();

const currentLoadingStyle = computed<LoadingStyle>(() => settingsState.loadingStyle?.value || 'circle');

const loadingStyleOptions = computed(() => [
  {
    value: 'circle' as LoadingStyle,
    label: t('theme.loadingStyles.circle'),
  },
  {
    value: 'dots' as LoadingStyle,
    label: t('theme.loadingStyles.dots'),
  },
  {
    value: 'gradient' as LoadingStyle,
    label: t('theme.loadingStyles.gradient'),
  },
  {
    value: 'progress' as LoadingStyle,
    label: t('theme.loadingStyles.progress'),
  },
  {
    value: 'flower' as LoadingStyle,
    label: t('theme.loadingStyles.flower'),
  },
]);

const handleLoadingStyleClick = (style: LoadingStyle) => {
  if (style === currentLoadingStyle.value) return;
  loadingStyleHandlers?.setStyle(style);
};
</script>

