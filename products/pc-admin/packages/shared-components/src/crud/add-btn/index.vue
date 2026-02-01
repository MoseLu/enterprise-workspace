<template>
  <BtcTableButton
    class="btc-crud-action-icon"
    v-if="isMinimal"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    :type="type"
    class="btc-crud-btn"
    @click="handleAddClick"
  >
    <BtcSvg class="btc-crud-btn__icon" name="plus" />
    <span class="btc-crud-btn__text">
      <slot>{{ buttonLabel }}</slot>
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed, inject, useAttrs } from 'vue';
import { useI18n, useThemePlugin, logger } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';

export interface Props {
  type?: string;
  text?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
});

const { t } = useI18n();
const theme = useThemePlugin();
const attrs = useAttrs();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  // 关键：在生产环境下，这个错误必须可见，不能被静默处理
  const error = new Error('[BtcAddBtn] Must be used inside <BtcCrud>. This usually means BtcCrud component is not properly rendered or provide/inject context is broken.');
  // 确保错误在控制台可见
  logger.error('[BtcAddBtn] CRITICAL ERROR:', error.message, {
    componentName: 'BtcAddBtn',
    injectKey: 'btc-crud',
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  // 在生产环境下也抛出错误，确保问题可见
  throw error;
}

const buttonLabel = computed(() => props.text || t('crud.button.add'));
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');

const isDisabled = computed(() => {
  const value = attrs.disabled;
  if (value === '' || value === true || value === 'true') return true;
  return false;
});

const allowedTypes = ['primary', 'success', 'warning', 'danger', 'info', 'default'] as const;
type AllowedButtonType = typeof allowedTypes[number];

const iconType = computed<AllowedButtonType>(() => {
  const value = (props.type || 'primary') as string;
  if (allowedTypes.includes(value as AllowedButtonType)) {
    return value as AllowedButtonType;
  }
  if (value === 'text') return 'default';
  return 'primary';
});

// 处理新增按钮点击
const handleAddClick = (event?: MouseEvent) => {
  // 阻止事件冒泡，避免被其他处理器拦截
  if (event) {
    event.stopPropagation();
  }

  if (isDisabled.value) {
    return;
  }

  // 关键：在生产环境下，这些错误必须可见
  if (!crud) {
    const errorMsg = '[BtcAddBtn] crud is not available - inject failed or BtcCrud not rendered';
    logger.error(errorMsg, {
      componentName: 'BtcAddBtn',
      injectKey: 'btc-crud',
      timestamp: new Date().toISOString(),
    });
    // 在生产环境下也抛出错误，确保问题可见
    throw new Error(errorMsg);
  }

  if (typeof crud.handleAdd !== 'function') {
    const errorMsg = '[BtcAddBtn] crud.handleAdd is not a function';
    logger.error(errorMsg, {
      crud,
      handleAdd: crud.handleAdd,
      type: typeof crud.handleAdd,
      crudKeys: crud ? Object.keys(crud) : [],
      timestamp: new Date().toISOString(),
    });
    // 在生产环境下也抛出错误，确保问题可见
    throw new Error(errorMsg);
  }

  crud.handleAdd();
};

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'plus',
  tooltip: buttonLabel.value,
  ariaLabel: buttonLabel.value,
  type: iconType.value,
  onClick: handleAddClick,
  disabled: isDisabled.value,
}));
</script>

