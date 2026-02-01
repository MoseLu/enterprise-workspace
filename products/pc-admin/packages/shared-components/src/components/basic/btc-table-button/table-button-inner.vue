<template>
  <div class="btc-table-button-wrapper">
    <el-tooltip
      v-if="tooltipText"
      :content="tooltipText"
      placement="bottom"
      teleported
    >
      <button
        class="btc-table-button"
        :class="buttonClasses"
        type="button"
        :disabled="isDisabled"
        :aria-label="ariaLabel"
        :title="ariaLabel"
        @click="handleClick"
      >
        <BtcSvg v-if="iconName" :name="iconName" :size="config.size || 16" />
        <span v-if="hasLabel" class="btc-table-button__label">
          {{ labelText }}
        </span>
        <span v-if="hasBadge" class="btc-table-button__badge">
          {{ badgeText }}
        </span>
      </button>
    </el-tooltip>
    <button
      v-else
      class="btc-table-button"
      :class="buttonClasses"
      type="button"
      :disabled="isDisabled"
      :aria-label="ariaLabel"
      :title="ariaLabel"
      @click="handleClick"
    >
      <BtcSvg v-if="iconName" :name="iconName" :size="config.size || 16" />
      <span v-if="hasLabel" class="btc-table-button__label">
        {{ labelText }}
      </span>
      <span v-if="hasBadge" class="btc-table-button__badge">
        {{ badgeText }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import type { BtcTableButtonConfig } from './types';

defineOptions({
  name: 'BtcTableButtonInner',
});

const props = defineProps<{
  config: BtcTableButtonConfig;
}>();

const iconName = computed(() => {
  if (typeof props.config.icon === 'function') {
    return props.config.icon();
  }
  return props.config.icon;
});

const tooltipText = computed(() => {
  if (!props.config.tooltip) return undefined;
  if (typeof props.config.tooltip === 'function') {
    return props.config.tooltip();
  }
  return props.config.tooltip;
});

const ariaLabel = computed(() => {
  if (props.config.ariaLabel) {
    return typeof props.config.ariaLabel === 'function'
      ? props.config.ariaLabel()
      : props.config.ariaLabel;
  }
  if (tooltipText.value) return tooltipText.value;
  return undefined;
});

const isDisabled = computed(() => Boolean(props.config.disabled));

const labelText = computed(() => {
  const value = props.config.label;
  if (!value) return '';
  return typeof value === 'function' ? value() : value;
});

const shouldShowLabel = computed(() => {
  if (!labelText.value) return false;
  return props.config.showLabel ?? false;
});

const hasLabel = computed(() => shouldShowLabel.value);

const buttonClasses = computed(() => {
  const classes: Array<string | Record<string, boolean>> = [
    `is-${props.config.type || 'default'}`,
  ];
  const extraClass = props.config.class;
  if (Array.isArray(extraClass)) {
    classes.push(...extraClass);
  } else if (extraClass) {
    classes.push(extraClass);
  }
  if (hasLabel.value) {
    classes.push('has-label');
  }
  classes.push({ 'is-disabled': isDisabled.value });
  return classes;
});

const hasBadge = computed(() => typeof props.config.badge === 'number' && props.config.badge > 0);
const badgeText = computed(() => {
  if (!hasBadge.value) return '';
  const value = props.config.badge as number;
  return value > 99 ? '99+' : String(value);
});

const handleClick = (event: MouseEvent) => {
  if (isDisabled.value) {
    event.preventDefault();
    return;
  }
  props.config.onClick?.(event);
};
</script>

<style scoped lang="scss">
.btc-table-button-wrapper {
  display: inline-flex;
}

.btc-table-button {
  --btc-table-button-color: var(--el-color-primary);

  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  position: relative;
  border: 1px solid color-mix(in srgb, var(--btc-table-button-color) 35%, transparent);
  background-color: color-mix(in srgb, var(--btc-table-button-color) 6%, transparent);
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  padding: 0;

  .btc-svg {
    color: var(--btc-table-button-color);
  }

  &:hover,
  &:focus-visible {
    border-color: var(--btc-table-button-color);
    background-color: color-mix(in srgb, var(--btc-table-button-color) 12%, transparent);
    box-shadow: none;
    outline: none;
  }

  // has-label 时的 hover 效果
  &.has-label:hover,
  &.has-label:focus-visible {
    border-color: var(--btc-table-button-color);
    background-color: color-mix(in srgb, var(--btc-table-button-color) 12%, transparent);
    box-shadow: none;
    outline: none;
  }

  // 按钮类型样式（需要在 is-disabled 之前定义，以便在禁用状态下也能使用）
  &.is-primary {
    --btc-table-button-color: var(--el-color-primary);
  }

  &.is-success {
    --btc-table-button-color: var(--el-color-success);
  }

  &.is-warning {
    --btc-table-button-color: var(--el-color-warning);
  }

  &.is-danger {
    --btc-table-button-color: var(--el-color-danger);
  }

  &.is-info {
    --btc-table-button-color: var(--el-color-info);
  }

  &.is-default {
    --btc-table-button-color: var(--el-text-color-primary);
  }

  &:disabled,
  &.is-disabled {
    // 禁用状态下仍然使用按钮类型的颜色，只是降低透明度
    border-color: color-mix(in srgb, var(--btc-table-button-color) 20%, transparent);
    background-color: color-mix(in srgb, var(--btc-table-button-color) 3%, transparent);
    cursor: not-allowed;
    pointer-events: none;

    .btc-svg {
      color: color-mix(in srgb, var(--btc-table-button-color) 40%, transparent);
    }

    .btc-table-button__label {
      color: color-mix(in srgb, var(--btc-table-button-color) 50%, transparent);
    }
  }

  &.has-label {
    padding: 0 10px;
    min-width: 32px;
    gap: 4px;
    width: auto;
    height: 32px; // 与 btc-crud-btn 保持一致
    // 完全匹配 btc-crud-btn 的样式
    color: var(--btc-table-button-color); // 文字颜色与边框颜色一致
    border-color: color-mix(in srgb, var(--btc-table-button-color) 35%, transparent);
    background-color: color-mix(in srgb, var(--btc-table-button-color) 6%, transparent);
  }

  &__label {
    font-size: 14px; // 与 el-button 默认字体大小一致
    line-height: 1; // 与 el-button 一致
    color: var(--btc-table-button-color); // 文字颜色与按钮类型颜色一致
    white-space: nowrap;
  }

  &__badge {
    position: absolute;
    top: -6px;
    right: -6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 50%;
    background-color: var(--el-color-danger);
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    box-sizing: border-box;
    white-space: nowrap;
  }
}
</style>

