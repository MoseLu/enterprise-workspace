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
    @click="handleClick"
  >
    <BtcSvg class="btc-crud-btn__icon" name="batch-unbind" />
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
import { computed, inject, useSlots, useAttrs } from 'vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
import type { UseCrudReturn } from '@btc/shared-core';
import BtcSvg from '@btc-components/basic/btc-svg/index.vue';
import BtcTableButton from '@btc-components/basic/btc-table-button/index.vue';
import type { BtcTableButtonConfig } from '@btc-components/basic/btc-table-button/types';

export interface Props {
  text?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'click', rows: any[]): void;
}>();

const { t } = useI18n();
const theme = useThemePlugin();
const slots = useSlots();
const attrs = useAttrs();

const crud = inject<UseCrudReturn<any>>('btc-crud');

if (!crud) {
  throw new Error('[BtcMultiUnbindBtn] Must be used inside <BtcCrud>');
}

const selectionCount = computed(() => crud.selection.value.length);
const buttonLabel = computed(() => props.text || t('org.user_role_assign.actions.multi_unbind'));
const accessibleLabel = computed(() => {
  const base = buttonLabel.value;
  return selectionCount.value > 0 ? `${base} (${selectionCount.value})` : base;
});
const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');
const hasDefaultSlot = computed(() => Boolean(slots.default));

const isDisabled = computed(() => {
  const value = attrs.disabled;
  if (value === '' || value === true || value === 'true') return true;
  return selectionCount.value === 0;
});

function handleClick() {
  if (!isDisabled.value && selectionCount.value > 0 && crud) {
    emit('click', crud.selection.value as any[]);
  }
}

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'batch-unbind',
  tooltip: accessibleLabel.value,
  ...(selectionCount.value > 0 ? { badge: selectionCount.value } : {}),
  type: 'danger',
  ariaLabel: accessibleLabel.value,
  onClick: () => {
    if (!isDisabled.value && selectionCount.value > 0) {
      handleClick();
    }
  },
  disabled: isDisabled.value,
}));

</script>

