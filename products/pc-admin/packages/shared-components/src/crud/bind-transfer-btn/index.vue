<template>
  <BtcTableButton
    v-if="isMinimal"
    class="btc-crud-action-icon"
    :config="iconButtonConfig"
  />
  <el-button
    v-else
    v-bind="$attrs"
    :type="type"
    class="btc-crud-btn"
    @click="handleClick"
  >
    <BtcSvg class="btc-crud-btn__icon" name="auth" />
    <span class="btc-crud-btn__text">
      <slot>{{ buttonLabel }}</slot>
    </span>
  </el-button>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { useI18n, useThemePlugin } from '@btc/shared-core';
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

const emit = defineEmits<{
  (event: 'click', evt: MouseEvent): void;
}>();

const { t } = useI18n();
const theme = useThemePlugin();
const attrs = useAttrs();

const isMinimal = computed(() => theme.buttonStyle?.value === 'minimal');
const buttonLabel = computed(() => props.text || t('common.button.authorize'));

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

function handleClick(evt: MouseEvent) {
  if (!isDisabled.value) {
    emit('click', evt);
  }
}

const iconButtonConfig = computed<BtcTableButtonConfig>(() => ({
  icon: 'auth',
  tooltip: buttonLabel.value,
  ariaLabel: buttonLabel.value,
  type: iconType.value,
  onClick: () => {
    if (!isDisabled.value) {
      handleClick(new MouseEvent('click'));
    }
  },
  disabled: isDisabled.value,
}));
</script>


