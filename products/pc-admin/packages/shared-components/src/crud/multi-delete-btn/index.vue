<template>
  <BtcTableButton
    class="btc-crud-action-icon"
    v-if="isMinimal"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    type="danger"
    class="btc-crud-btn"
    :disabled="selectionCount === 0"
    @click="handleMultiDeleteClick"
  >
    <BtcSvg class="btc-crud-btn__icon" name="delete-batch" />
    <span class="btc-crud-btn__text">
      <slot v-if="hasDefaultSlot" />
      <template v-else>
        {{ buttonLabel }}
        <span class="btc-crud-btn__count"> ({{ selectionCount }})</span>
      </template>
    </span>
    <span v-if="selectionCount" class="btc-crud-btn__badge">
      {{ selectionCount }}
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed, inject, useSlots } from 'vue';
import { useI18n, useThemePlugin, logger } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';

export interface Props {
  text?: string;
}

const props = defineProps<Props>();

const { t } = useI18n();
const theme = useThemePlugin();
const slots = useSlots();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  // 关键：在生产环境下，这个错误必须可见，不能被静默处理
  const error = new Error('[BtcMultiDeleteBtn] Must be used inside <BtcCrud>. This usually means BtcCrud component is not properly rendered or provide/inject context is broken.');
  logger.error('[BtcMultiDeleteBtn] CRITICAL ERROR:', error.message, {
    componentName: 'BtcMultiDeleteBtn',
    injectKey: 'btc-crud',
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  throw error;
}

const selectionCount = computed(() => crud.selection.value.length);
const buttonLabel = computed(() => props.text || t('crud.button.multi_delete'));
const accessibleLabel = computed(() => {
  const base = buttonLabel.value;
  return selectionCount.value > 0 ? `${base} (${selectionCount.value})` : base;
});
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');
const hasDefaultSlot = computed(() => Boolean(slots.default));

// 处理批量删除按钮点击
const handleMultiDeleteClick = () => {
  if (selectionCount.value === 0) {
    return;
  }

  // 关键：在生产环境下，这些错误必须可见
  if (!crud) {
    const errorMsg = '[BtcMultiDeleteBtn] crud is not available - inject failed or BtcCrud not rendered';
    logger.error(errorMsg, {
      componentName: 'BtcMultiDeleteBtn',
      injectKey: 'btc-crud',
      timestamp: new Date().toISOString(),
    });
    throw new Error(errorMsg);
  }

  if (typeof crud.handleMultiDelete !== 'function') {
    const errorMsg = '[BtcMultiDeleteBtn] crud.handleMultiDelete is not a function';
    logger.error(errorMsg, {
      crud,
      handleMultiDelete: crud.handleMultiDelete,
      type: typeof crud.handleMultiDelete,
      crudKeys: crud ? Object.keys(crud) : [],
      timestamp: new Date().toISOString(),
    });
    throw new Error(errorMsg);
  }

  try {
    crud.handleMultiDelete(crud.selection.value as any[]);
  } catch (error) {
    logger.error('[BtcMultiDeleteBtn] Error calling crud.handleMultiDelete:', error, {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'delete-batch',
  tooltip: accessibleLabel.value,
  ...(selectionCount.value > 0 ? { badge: selectionCount.value } : {}),
  type: 'danger',
  ariaLabel: accessibleLabel.value,
  onClick: handleMultiDeleteClick,
  disabled: selectionCount.value === 0,
}));

</script>

