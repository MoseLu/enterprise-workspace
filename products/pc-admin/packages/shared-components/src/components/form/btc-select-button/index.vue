<template>
  <el-segmented
    v-model="internalValue"
    :options="options"
    :class="['btc-select-button', { 'is-small': small }]"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'BtcSelectButton'
});

import { watch, shallowRef } from 'vue';

interface Props {
  modelValue?: string | number | any[];
  options?: Array<{ label: string; value: any }>;
  prop?: string;
  small?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  small: false,
});

const emit = defineEmits(['update:modelValue', 'change']);

// 使用 shallowRef 避免深层响应式
const internalValue = shallowRef(props.modelValue);

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue;
});

// 监听内部值变化
watch(internalValue, (newValue) => {
  // 确保不会emit null值，使用空字符串替代
  emit('update:modelValue', newValue === null ? '' : newValue);
});

const handleChange = (val: any) => {
  // 确保不会emit null值，使用空字符串替代
  emit('change', val === null ? '' : val);
};
</script>

<style lang="scss" scoped>
.btc-select-button {
  padding: 5px;
  border-radius: var(--btc-select-button-radius);
  user-select: none;

  --btc-select-button-radius: 6px;
  --btc-select-button-padding: 5px 15px;

  :deep(.el-segmented__item-selected) {
    border-radius: var(--btc-select-button-radius) !important;
  }

  :deep(.el-segmented__item) {
    padding: var(--btc-select-button-padding) !important;
    border-radius: var(--btc-select-button-radius) !important;
  }

  :deep(.el-segmented__item-label) {
    line-height: unset;
  }

  &.is-small {
    --btc-select-button-radius: 4px;
    --btc-select-button-padding: 3px 10px;

    :deep(.el-segmented__item) {
      padding: var(--btc-select-button-padding) !important;
      font-size: 12px;
    }
  }
}
</style>

